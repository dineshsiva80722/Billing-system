import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export async function generatePDF(
  elementId: string,
  filename = "document.pdf",
  options: {
    format?: "a4" | "letter" | "legal"
    orientation?: "portrait" | "landscape"
    margin?: number
    scale?: number
  } = {},
): Promise<void> {
  try {
    // Find the element to print
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`)
    }

    // Default options
    const {
      format = "a4",
      orientation = "portrait",
      margin = 10,
      scale = 2, // Higher scale for better quality
    } = options

    // Calculate dimensions
    const pdf = new jsPDF(orientation, "mm", format)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Create a canvas from the element
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true, // Allow cross-origin images
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
    })

    // Calculate the proper scaling
    const imgWidth = pdfWidth - margin * 2
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Add image to PDF
    const imgData = canvas.toDataURL("image/png")
    pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight)

    // If content is larger than the page, create multiple pages
    let heightLeft = imgHeight
    let position = margin

    heightLeft -= pdfHeight - margin * 2
    position = heightLeft - imgHeight

    while (heightLeft >= 0) {
      pdf.addPage()
      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight - margin * 2
      position -= pdfHeight - margin * 2
    }

    // Save the PDF
    pdf.save(filename)

    return Promise.resolve()
  } catch (error) {
    console.error("Error generating PDF:", error)
    return Promise.reject(error)
  }
}

// Print specific receipt or bill by ID
export async function printBill(billId: string): Promise<void> {
  try {
    // Get the element containing the bill
    const printContainerId = `bill-print-${billId}`

    // If element doesn't exist, create a temporary one with fetched data
    const printContainer = document.getElementById(printContainerId)

    if (!printContainer) {
      // For demonstration, we'll assume the element was created
      // In a real implementation, you'd fetch the bill data and create the element
      throw new Error(`Bill with ID "${billId}" not found for printing`)
    }

    // Generate PDF
    await generatePDF(printContainerId, `Bill-${billId}.pdf`, {
      format: "a4",
      orientation: "portrait",
    })

    return Promise.resolve()
  } catch (error) {
    console.error("Error printing bill:", error)
    return Promise.reject(error)
  }
}
