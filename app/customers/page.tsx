"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Trash2, FileBarChart, ShoppingCart, Search, Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { CustomerForm } from "@/components/customer-form"
import type { Customer } from "@/lib/models/types"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null)

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true)
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
          description: "Failed to load customer data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm),
  )

  const handleAddCustomer = async (customerData: Omit<Customer, "_id">) => {
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      })

      const contentType = response.headers.get("content-type")

      // Check if response is JSON
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response. Status: " + response.status)
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add customer")
      }

      setCustomers([...customers, data])
      setIsAddDialogOpen(false)

      toast({
        title: "Success",
        description: "Customer added successfully",
      })
    } catch (error) {
      console.error("Error adding customer:", error)

      // Check for specific error messages
      const errorMessage = error instanceof Error ? error.message : "Failed to add customer"

      if (errorMessage.includes("already exists")) {
        toast({
          title: "Duplicate Email",
          description: "A customer with this email already exists.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }

      // Don't close the dialog so user can correct the error
      throw error
    }
  }

  const handleEditCustomer = async (customerData: Omit<Customer, "_id">) => {
    if (!currentCustomer || !currentCustomer._id) return

    try {
      const response = await fetch(`/api/customers/${currentCustomer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update customer")
      }

      const updatedCustomer = await response.json()

      const updatedCustomers = customers.map((customer) =>
        customer._id === updatedCustomer._id ? updatedCustomer : customer,
      )

      setCustomers(updatedCustomers)
      setIsEditDialogOpen(false)
      setCurrentCustomer(null)

      toast({
        title: "Success",
        description: "Customer updated successfully",
      })
    } catch (error) {
      console.error("Error updating customer:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update customer",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        const response = await fetch(`/api/customers/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to delete customer")
        }

        const updatedCustomers = customers.filter((customer) => customer._id?.toString() !== id)
        setCustomers(updatedCustomers)

        toast({
          title: "Success",
          description: "Customer deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting customer:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete customer",
          variant: "destructive",
        })
      }
    }
  }

  const openEditDialog = (customer: Customer) => {
    setCurrentCustomer(customer)
    setIsEditDialogOpen(true)
  }

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "-"

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Customer Management" text="Manage your customer database and purchase history.">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </DashboardHeader>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 w-full max-w-sm">
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileBarChart className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" /> Email All
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead>Last Purchase</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer._id?.toString()}>
                  <TableCell>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{customer.address}</div>
                  </TableCell>
                  <TableCell>
                    <div>{customer.email}</div>
                    <div className="text-xs text-muted-foreground">{customer.phone}</div>
                  </TableCell>
                  <TableCell className="text-right">${customer.totalSpent.toFixed(2)}</TableCell>
                  <TableCell>{formatDate(customer.lastPurchase)}</TableCell>
                  <TableCell>
                    <Badge variant={customer.status === "active" ? "outline" : "secondary"}>
                      {customer.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteCustomer(customer._id?.toString() || "")}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ShoppingCart className="mr-2 h-4 w-4" /> New Bill
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileBarChart className="mr-2 h-4 w-4" /> View History
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Add a new customer to your database.</DialogDescription>
          </DialogHeader>
          <CustomerForm
            onSubmit={handleAddCustomer}
            submitLabel="Add Customer"
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer information.</DialogDescription>
          </DialogHeader>
          {currentCustomer && (
            <CustomerForm
              initialData={currentCustomer}
              onSubmit={handleEditCustomer}
              submitLabel="Save Changes"
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
