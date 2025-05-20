"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { BarcodeScanner } from "@/components/barcode-scanner"
import { CustomerSelector } from "@/components/customer-selector"
import { Barcode, Trash2, Plus, Minus, CreditCard, Printer, Save, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import type { Product, Customer } from "@/lib/models/types"
import { useRouter } from "next/navigation"

interface CartItem {
  productId: string
  barcode: string
  name: string
  price: number
  quantity: number
}

interface SelectedCustomer {
  id: string
  name: string
}

export default function BillingPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [barcodeInput, setBarcodeInput] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile">("cash")
  const [isProcessing, setIsProcessing] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true)

  const barcodeInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Focus on barcode input when page loads or when scanning is toggled off
  useEffect(() => {
    if (!isScanning && barcodeInputRef.current) {
      barcodeInputRef.current.focus()
    }
  }, [isScanning])

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoadingCustomers(true)
        const response = await fetch("/api/customers")

        if (!response.ok) {
          throw new Error("Failed to fetch customers")
        }

        const data = await response.json()
        setCustomers(data)
      } catch (error) {
        console.error("Error fetching customers:", error)
        toast({
          title: "Error",
          description: "Failed to load customers. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCustomers(false)
      }
    }

    fetchCustomers()
  }, [])

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (barcodeInput.trim()) {
      addProductByBarcode(barcodeInput)
      setBarcodeInput("")
    }
  }

  const addProductByBarcode = async (barcode: string) => {
    try {
      const response = await fetch(`/api/products?barcode=${barcode}`)

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Product Not Found",
            description: `No product found with barcode: ${barcode}`,
            variant: "destructive",
          })
          return
        }
        throw new Error("Failed to fetch product")
      }

      const product: Product = await response.json()

      if (product.stock <= 0) {
        toast({
          title: "Out of Stock",
          description: `${product.name} is out of stock.`,
          variant: "destructive",
        })
        return
      }

      const existingItemIndex = cartItems.findIndex((item) => item.barcode === barcode)

      if (existingItemIndex >= 0) {
        // Product already in cart, increase quantity
        const updatedCart = [...cartItems]
        updatedCart[existingItemIndex].quantity += 1
        setCartItems(updatedCart)
      } else {
        // Add new product to cart
        setCartItems([
          ...cartItems,
          {
            productId: product._id?.toString() || "",
            barcode: product.barcode,
            name: product.name,
            price: product.price,
            quantity: 1,
          },
        ])
      }

      toast({
        title: "Product Added",
        description: `${product.name} added to cart.`,
      })
    } catch (error) {
      console.error("Error adding product by barcode:", error)
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBarcodeDetected = (barcode: string) => {
    addProductByBarcode(barcode)
    setIsScanning(false)
  }

  const toggleScanner = () => {
    setIsScanning(!isScanning)
  }

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      const updatedCart = cartItems.filter((_, i) => i !== index)
      setCartItems(updatedCart)
    } else {
      // Update quantity
      const updatedCart = [...cartItems]
      updatedCart[index].quantity = newQuantity
      setCartItems(updatedCart)
    }
  }

  const removeItem = (index: number) => {
    const updatedCart = cartItems.filter((_, i) => i !== index)
    setCartItems(updatedCart)
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.1 // 10% tax
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleCheckout = () => {
    setPaymentDialogOpen(true)
  }

  const handleCustomerSelect = (customerId: string | null) => {
    if (!customerId) {
      setSelectedCustomer(null)
      return
    }

    const customer = customers.find((c) => c._id?.toString() === customerId)
    if (customer) {
      setSelectedCustomer({
        id: customer._id?.toString() || "",
        name: customer.name,
      })
    }
  }

  const completeTransaction = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Cannot complete transaction with empty cart.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch("/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: selectedCustomer?.id || null,
          customerName: selectedCustomer?.name || null,
          items: cartItems,
          subtotal: calculateSubtotal(),
          tax: calculateTax(),
          total: calculateTotal(),
          paymentMethod: paymentMethod,
          status: "completed",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create bill")
      }

      const bill = await response.json()

      toast({
        title: "Success",
        description: `Transaction completed successfully! Bill #${bill.billNumber}`,
      })

      // Inside the completeTransaction function, after the toast success
      // Add this code:
      const billId = bill._id?.toString()
      if (billId) {
        // Add a "View Receipt" button
        toast({
          title: "Receipt Ready",
          description: (
            <div className="flex flex-col gap-2">
              <p>Transaction completed successfully!</p>
              <Button size="sm" onClick={() => router.push(`/billing/receipt/${billId}`)}>
                View & Print Receipt
              </Button>
            </div>
          ),
          duration: 5000,
        })
      }

      // Reset the cart and customer selection
      setCartItems([])
      setSelectedCustomer(null)
      setPaymentDialogOpen(false)
    } catch (error) {
      console.error("Error completing transaction:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete transaction",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleProductSearch = () => {
    // In a real app, this would open a product search dialog
    alert("Product search functionality would open here")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Billing" text="Create and manage customer bills with barcode scanning.">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={toggleScanner} className="flex items-center gap-2">
            <Barcode className="h-4 w-4" />
            {isScanning ? "Stop Scanning" : "Scan Barcode"}
          </Button>
          <Button variant="outline" onClick={handleProductSearch} className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Products
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Left Column - Billing Form */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Current Bill</CardTitle>
                <CustomerSelector
                  customers={customers}
                  isLoading={isLoadingCustomers}
                  selectedCustomerId={selectedCustomer?.id || null}
                  onSelectCustomer={handleCustomerSelect}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isScanning ? (
                <div className="mb-4">
                  <BarcodeScanner onDetected={handleBarcodeDetected} />
                </div>
              ) : (
                <form onSubmit={handleBarcodeSubmit} className="mb-4 flex gap-2">
                  <Input
                    ref={barcodeInputRef}
                    type="text"
                    placeholder="Scan or enter barcode"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="flex-1"
                    autoComplete="off"
                  />
                  <Button type="submit">Add Item</Button>
                </form>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          No items in cart. Scan a barcode or search for products.
                        </TableCell>
                      </TableRow>
                    ) : (
                      cartItems.map((item, index) => (
                        <TableRow key={`${item.barcode}-${index}`}>
                          <TableCell>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.barcode}</div>
                          </TableCell>
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(index, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(index, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Bill Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCustomer && (
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-sm font-medium">Customer</div>
                  <div className="text-sm">{selectedCustomer.name}</div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (10%)</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Items</span>
                  <Badge variant="outline">{cartItems.reduce((sum, item) => sum + item.quantity, 0)} items</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full flex items-center gap-2"
                size="lg"
                disabled={cartItems.length === 0}
                onClick={handleCheckout}
              >
                <CreditCard className="h-4 w-4" />
                Checkout
              </Button>
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1 flex items-center gap-2" disabled={cartItems.length === 0}>
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" className="flex-1 flex items-center gap-2" disabled={cartItems.length === 0}>
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>Select a payment method to complete the transaction.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount Due</Label>
              <Input id="amount" value={`$${calculateTotal().toFixed(2)}`} readOnly />
            </div>
            <div className="grid gap-2">
              <Label>Payment Method</Label>
              <div className="flex gap-2">
                <Button
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setPaymentMethod("cash")}
                >
                  Cash
                </Button>
                <Button
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setPaymentMethod("card")}
                >
                  Card
                </Button>
                <Button
                  variant={paymentMethod === "mobile" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setPaymentMethod("mobile")}
                >
                  Mobile
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={completeTransaction} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                "Complete Transaction"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
