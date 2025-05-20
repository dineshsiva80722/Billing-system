import { type NextRequest, NextResponse } from "next/server"
import { getBillById, updateBillStatus } from "@/lib/services/bill-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bill = await getBillById(params.id)

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json(bill)
  } catch (error) {
    console.error(`Error in GET /api/bills/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch bill" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()

    // Validate status
    if (!data.status || !["completed", "pending", "cancelled"].includes(data.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const updatedBill = await updateBillStatus(params.id, data.status as "completed" | "pending" | "cancelled")

    if (!updatedBill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json(updatedBill)
  } catch (error) {
    console.error(`Error in PATCH /api/bills/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update bill status" }, { status: 500 })
  }
}
