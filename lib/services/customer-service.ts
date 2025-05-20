import { ObjectId } from "mongodb"
import clientPromise from "../mongodb"
import type { Customer } from "../models/types"

export async function getCustomers(): Promise<Customer[]> {
  try {
    const client = await clientPromise
    const collection = client.db().collection("customers")

    const customers = await collection.find({}).sort({ name: 1 }).toArray()
    return customers as Customer[]
  } catch (error) {
    console.error("Error fetching customers:", error)
    throw new Error("Failed to fetch customers")
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const client = await clientPromise
    const collection = client.db().collection("customers")

    const customer = await collection.findOne({ _id: new ObjectId(id) })
    return customer as Customer | null
  } catch (error) {
    console.error("Error fetching customer by ID:", error)
    throw new Error("Failed to fetch customer")
  }
}

export async function createCustomer(customer: Omit<Customer, "_id">): Promise<Customer> {
  try {
    const client = await clientPromise
    const collection = client.db().collection("customers")

    // Check if customer with this email already exists
    const existingCustomer = await collection.findOne({ email: customer.email })
    if (existingCustomer) {
      throw new Error("Customer with this email already exists")
    }

    const now = new Date()
    const newCustomer = {
      ...customer,
      totalSpent: customer.totalSpent || 0,
      lastPurchase: customer.lastPurchase || null,
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection.insertOne(newCustomer)

    if (!result.acknowledged) {
      throw new Error("Failed to insert customer into database")
    }

    return {
      ...newCustomer,
      _id: result.insertedId,
    } as Customer
  } catch (error) {
    console.error("Error creating customer in database:", error)
    throw error
  }
}

export async function updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | null> {
  try {
    const client = await clientPromise
    const collection = client.db().collection("customers")

    const updatedCustomer = {
      ...customer,
      updatedAt: new Date(),
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedCustomer },
      { returnDocument: "after" },
    )

    return result as unknown as Customer | null
  } catch (error) {
    console.error("Error updating customer:", error)
    throw new Error("Failed to update customer")
  }
}

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    const client = await clientPromise
    const collection = client.db().collection("customers")

    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    return result.deletedCount === 1
  } catch (error) {
    console.error("Error deleting customer:", error)
    throw new Error("Failed to delete customer")
  }
}

export async function updateCustomerPurchase(id: string, amount: number): Promise<boolean> {
  try {
    const client = await clientPromise
    const collection = client.db().collection("customers")

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { totalSpent: amount },
        $set: {
          lastPurchase: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    return result.modifiedCount === 1
  } catch (error) {
    console.error("Error updating customer purchase:", error)
    throw new Error("Failed to update customer purchase")
  }
}
