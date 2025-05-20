import { type NextRequest, NextResponse } from "next/server"
import { getBills, createBill } from "@/lib/services/bill-service"
import type { Bill, BillItem } from "@/lib/models/types"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customerId")

    // If customerId is provided, get bills for that customer
    if (customerId) {
      // This would need to be implemented in the bill service
      // For now, we'll just return all bills
      const bills = await getBills()
      return NextResponse.json(bills)
    }

    const bills = await getBills()
    return NextResponse.json(bills)
  } catch (error) {
    console.error("Error in GET /api/bills:", error)
    return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: "Bill must contain at least one item" }, { status: 400 })
    }

    // Create bill items
    const billItems: BillItem[] = data.items.map((item: any) => ({
      productId: item.productId,
      barcode: item.barcode,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
    }))

    // Create new bill
    const newBill: Omit<Bill, "_id"> = {
      billNumber: "", // Will be generated in the service
      customerId: data.customerId ? new ObjectId(data.customerId) : null,
      customerName: data.customerName || null,
      items: billItems,
      subtotal: Number(data.subtotal),
      tax: Number(data.tax),
      total: Number(data.total),
      paymentMethod: data.paymentMethod || "cash",
      status: "completed",
      createdAt: new Date(),
    }

    const bill = await createBill(newBill)

    return NextResponse.json(bill, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/bills:", error)
    return NextResponse.json({ error: "Failed to create bill" }, { status: 500 })
  }
}
