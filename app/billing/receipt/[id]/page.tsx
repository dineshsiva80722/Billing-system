"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { PrintableReceipt } from "@/components/printable-receipt"
import { PrintButton } from "@/components/print-button"
import { toast } from "@/components/ui/use-toast"
import type { Bill } from "@/lib/models/types"

export default function ReceiptPage() {
  const params = useParams()
  const router = useRouter()
  const [bill, setBill] = useState<Bill | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setIsLoading(true)

        if (!params.id) {
          toast({
            title: "Error",
            description: "Bill ID is required",
            variant: "destructive",
          })
          router.push("/billing")
          return
        }

        const response = await fetch(`/api/bills/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch bill")
        }

        const data = await response.json()
        setBill(data)
      } catch (error) {
        console.error("Error fetching bill:", error)
        toast({
          title: "Error",
          description: "Failed to load bill. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBill()
  }, [params.id, router])

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {bill && (
          <PrintButton targetId="printable-receipt" filename={`Receipt-${bill.billNumber}.pdf`} label="Print Receipt" />
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : bill ? (
        <div id="printable-receipt">
          <PrintableReceipt bill={bill} />
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Receipt not found</h2>
          <p className="text-muted-foreground mt-2">The requested receipt could not be found.</p>
        </div>
      )}
    </div>
  )
}
