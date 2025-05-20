"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { generatePDF } from "@/lib/utils/pdf-generator"
import { toast } from "@/components/ui/use-toast"
import type { ButtonProps } from "@/components/ui/button"

interface PrintButtonProps extends Omit<ButtonProps, "onClick"> {
  targetId: string
  filename?: string
  label?: string
  orientation?: "portrait" | "landscape"
}

export function PrintButton({
  targetId,
  filename = "document.pdf",
  label = "Print",
  orientation = "portrait",
  ...props
}: PrintButtonProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = async () => {
    setIsPrinting(true)

    try {
      await generatePDF(targetId, filename, { orientation })

      toast({
        title: "Success",
        description: "PDF generated successfully",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate PDF",
        variant: "destructive",
      })
    } finally {
      setIsPrinting(false)
    }
  }

  return (
    <Button onClick={handlePrint} disabled={isPrinting} {...props}>
      {isPrinting ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
          Generating...
        </>
      ) : (
        <>
          <Printer className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  )
}
