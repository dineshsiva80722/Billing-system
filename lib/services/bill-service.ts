import { ObjectId } from "mongodb"
import clientPromise from "../mongodb"
import type { Bill } from "../models/types"
import { updateProductStock } from "./product-service"
import { updateCustomerPurchase } from "./customer-service"

export async function getBills(): Promise<Bill[]> {
  try {
    const client = await clientPromise
    const collection = client.db().collection("bills")

    const bills = await collection.find({}).sort({ createdAt: -1 }).toArray()
    return bills as Bill[]
  } catch (error) {
    console.error("Error fetching bills:", error)
    throw new Error("Failed to fetch bills")
  }
}

export async function getBillById(id: string): Promise<Bill | null> {
  try {
    const client = await clientPromise
    const collection = client.db().collection("bills")

    const bill = await collection.findOne({ _id: new ObjectId(id) })
    return bill as Bill | null
  } catch (error) {
    console.error("Error fetching bill by ID:", error)
    throw new Error("Failed to fetch bill")
  }
}

export async function getCustomerBills(customerId: string): Promise<Bill[]> {
  try {
    const client = await clientPromise
    const collection = client.db().collection("bills")

    const bills = await collection
      .find({ customerId: new ObjectId(customerId) })
      .sort({ createdAt: -1 })
      .toArray()

    return bills as Bill[]
  } catch (error) {
    console.error("Error fetching customer bills:", error)
    throw new Error("Failed to fetch customer bills")
  }
}

export async function createBill(bill: Omit<Bill, "_id">): Promise<Bill> {
  const session = (await clientPromise).startSession()

  try {
    session.startTransaction()
    const client = await clientPromise
    const collection = client.db().collection("bills")

    // Generate bill number (e.g., BILL-20230601-001)
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")

    // Get count of bills for today to generate sequential number
    const todayBillsCount = await collection.countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    })

    const billNumber = `BILL-${dateStr}-${(todayBillsCount + 1).toString().padStart(3, "0")}`

    const newBill = {
      ...bill,
      billNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert the bill
    const result = await collection.insertOne(newBill, { session })

    // Update product stock for each item
    for (const item of bill.items) {
      await updateProductStock(item.productId.toString(), item.quantity)
    }

    // Update customer purchase history if customer is specified
    if (bill.customerId) {
      await updateCustomerPurchase(bill.customerId.toString(), bill.total)
    }

    await session.commitTransaction()

    return {
      ...newBill,
      _id: result.insertedId,
    } as Bill
  } catch (error) {
    await session.abortTransaction()
    console.error("Error creating bill:", error)
    throw new Error("Failed to create bill")
  } finally {
    await session.endSession()
  }
}

export async function updateBillStatus(
  id: string,
  status: "completed" | "pending" | "cancelled",
): Promise<Bill | null> {
  try {
    const client = await clientPromise
    const collection = client.db().collection("bills")

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    return result as unknown as Bill | null
  } catch (error) {
    console.error("Error updating bill status:", error)
    throw new Error("Failed to update bill status")
  }
}
