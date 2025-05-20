import { type NextRequest, NextResponse } from "next/server"
import { getCustomerById, updateCustomer, deleteCustomer } from "@/lib/services/customer-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customer = await getCustomerById(params.id)

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error(`Error in GET /api/customers/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedCustomer = await updateCustomer(params.id, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      status: data.status,
    })

    if (!updatedCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(updatedCustomer)
  } catch (error) {
    console.error(`Error in PUT /api/customers/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await deleteCustomer(params.id)

    if (!success) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error in DELETE /api/customers/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}
