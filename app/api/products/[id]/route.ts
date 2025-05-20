import { type NextRequest, NextResponse } from "next/server"
import { getProductById, updateProduct, deleteProduct } from "@/lib/services/product-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await getProductById(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error(`Error in GET /api/products/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedProduct = await updateProduct(params.id, {
      barcode: data.barcode,
      name: data.name,
      category: data.category,
      price: Number(data.price),
      stock: Number(data.stock),
      minStock: Number(data.minStock),
    })

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error(`Error in PUT /api/products/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await deleteProduct(params.id)

    if (!success) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error in DELETE /api/products/${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
