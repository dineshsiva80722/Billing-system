import { type NextRequest, NextResponse } from "next/server"
import { getCustomers, createCustomer } from "@/lib/services/customer-service"
import type { Customer } from "@/lib/models/types"
import { withErrorHandler } from "@/middleware/error-handler"
import { validateCustomer } from "@/lib/utils/validation"

export const GET = withErrorHandler(async () => {
  const customers = await getCustomers()
  return NextResponse.json(customers)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const data = await request.json()

    // Validate customer data
    const validation = validateCustomer(data)
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 },
      )
    }

    // Create new customer
    const newCustomer: Omit<Customer, "_id"> = {
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      address: data.address || "",
      totalSpent: 0,
      lastPurchase: null,
      status: data.status || "active",
    }

    const customer = await createCustomer(newCustomer)
    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    // Check if it's a duplicate email error from our service
    if (error instanceof Error && error.message === "Customer with this email already exists") {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    // Re-throw for the error handler middleware
    throw error
  }
})
