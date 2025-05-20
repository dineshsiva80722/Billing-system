import type { Customer, Product, Bill } from "@/lib/models/types"

export function validateCustomer(data: Partial<Customer>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.name || data.name.trim() === "") {
    errors.push("Customer name is required")
  }

  if (!data.email || data.email.trim() === "") {
    errors.push("Email is required")
  } else if (!isValidEmail(data.email)) {
    errors.push("Email format is invalid")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function validateProduct(data: Partial<Product>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.name || data.name.trim() === "") {
    errors.push("Product name is required")
  }

  if (!data.barcode || data.barcode.trim() === "") {
    errors.push("Barcode is required")
  }

  if (data.price === undefined || data.price < 0) {
    errors.push("Price must be a positive number")
  }

  if (data.stock === undefined || data.stock < 0) {
    errors.push("Stock must be a non-negative number")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function validateBill(data: Partial<Bill>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push("Bill must contain at least one item")
  }

  if (data.subtotal === undefined || data.subtotal < 0) {
    errors.push("Subtotal must be a positive number")
  }

  if (data.total === undefined || data.total < 0) {
    errors.push("Total must be a positive number")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
