import { ObjectId } from "mongodb"
import clientPromise from "../mongodb"
import type { Product } from "../models/types"

export async function getProducts(): Promise<Product[]> {
  try {
    const client = await clientPromise
    const collection = client.db().collection("products")

    const products = await collection.find({}).sort({ name: 1 }).toArray()
    return products as Product[]
  } catch (error) {
    console.error("Error fetching products:", error)
    throw new Error("Failed to fetch products")
  }
}

export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  try {
    const client = await clientPromise
    const collection = client.db().collection("products")

    const product = await collection.findOne({ barcode })
    return product as Product | null
  } catch (error) {
    console.error("Error fetching product by barcode:", error)
    throw new Error("Failed to fetch product")
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const client = await clientPromise
    const collection = client.db().collection("products")

    const product = await collection.findOne({ _id: new ObjectId(id) })
    return product as Product | null
  } catch (error) {
    console.error("Error fetching product by ID:", error)
    throw new Error("Failed to fetch product")
  }
}

export async function createProduct(product: Omit<Product, "_id">): Promise<Product> {
  try {
    const client = await clientPromise
    const collection = client.db().collection("products")

    const now = new Date()
    const newProduct = {
      ...product,
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection.insertOne(newProduct)

    return {
      ...newProduct,
      _id: result.insertedId,
    } as Product
  } catch (error) {
    console.error("Error creating product:", error)
    throw new Error("Failed to create product")
  }
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
  try {
    const client = await clientPromise
    const collection = client.db().collection("products")

    const updatedProduct = {
      ...product,
      updatedAt: new Date(),
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedProduct },
      { returnDocument: "after" },
    )

    return result as unknown as Product | null
  } catch (error) {
    console.error("Error updating product:", error)
    throw new Error("Failed to update product")
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const client = await clientPromise
    const collection = client.db().collection("products")

    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    return result.deletedCount === 1
  } catch (error) {
    console.error("Error deleting product:", error)
    throw new Error("Failed to delete product")
  }
}

export async function updateProductStock(id: string, quantity: number): Promise<boolean> {
  try {
    const client = await clientPromise
    const collection = client.db().collection("products")

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { stock: -quantity },
        $set: { updatedAt: new Date() },
      },
    )

    return result.modifiedCount === 1
  } catch (error) {
    console.error("Error updating product stock:", error)
    throw new Error("Failed to update product stock")
  }
}
