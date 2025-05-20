import type { ObjectId } from "mongodb"

export interface Product {
  _id?: ObjectId
  barcode: string
  name: string
  category: string
  price: number
  stock: number
  minStock: number
  createdAt?: Date
  updatedAt?: Date
}

export interface Customer {
  _id?: ObjectId
  name: string
  email: string
  phone: string
  address: string
  totalSpent: number
  lastPurchase?: Date | null
  status: "active" | "inactive"
  createdAt?: Date
  updatedAt?: Date
}

export interface BillItem {
  productId: ObjectId | string
  barcode: string
  name: string
  price: number
  quantity: number
}

export interface Bill {
  _id?: ObjectId
  billNumber: string
  customerId?: ObjectId | string | null
  customerName?: string | null
  items: BillItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: "cash" | "card" | "mobile" | string
  status: "completed" | "pending" | "cancelled"
  createdAt: Date
  updatedAt?: Date
}
