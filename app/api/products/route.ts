import { type NextRequest, NextResponse } from "next/server"
import { getProducts, createProduct, getProductByBarcode } from "@/lib/services/product-service"
import type { Product } from "@/lib/models/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const barcode = searchParams.get("barcode")

    if (barcode) {
      const product = await getProductByBarcode(barcode)

      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }

      return NextResponse.json(product)
    }

    const products = await getProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error in GET /api/products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.barcode || !data.name || !data.price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if product with barcode already exists
    const existingProduct = await getProductByBarcode(data.barcode)
    if (existingProduct) {
      return NextResponse.json({ error: "Product with this barcode already exists" }, { status: 409 })
    }

    // Create new product
    const newProduct: Omit<Product, "_id"> = {
      barcode: data.barcode,
      name: data.name,
      category: data.category || "Uncategorized",
      price: Number(data.price),
      stock: Number(data.stock) || 0,
      minStock: Number(data.minStock) || 0,
    }

    const product = await createProduct(newProduct)

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/products:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
