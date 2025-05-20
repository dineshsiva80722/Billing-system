import type { Bill, BillItem } from "@/lib/models/types"

interface PrintableReceiptProps {
  bill: Bill
  logoUrl?: string
  showPrices?: boolean
  companyInfo?: {
    name: string
    address: string
    phone: string
    email: string
    website?: string
    taxId?: string
  }
}

export function PrintableReceipt({
  bill,
  logoUrl,
  showPrices = true,
  companyInfo = {
    name: "SuperMarket POS",
    address: "123 Main Street, City, Country",
    phone: "+1 (555) 123-4567",
    email: "info@supermarketpos.com",
  },
}: PrintableReceiptProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="bg-white p-8 max-w-[800px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          {logoUrl ? (
            <img src={logoUrl || "/placeholder.svg"} alt="Company Logo" className="h-16" />
          ) : (
            <div className="text-2xl font-bold text-primary">{companyInfo.name}</div>
          )}
          <div className="text-sm text-muted-foreground mt-1">{companyInfo.address}</div>
          <div className="text-sm text-muted-foreground">{companyInfo.phone}</div>
          <div className="text-sm text-muted-foreground">{companyInfo.email}</div>
          {companyInfo.website && <div className="text-sm text-muted-foreground">{companyInfo.website}</div>}
          {companyInfo.taxId && <div className="text-sm font-medium">Tax ID: {companyInfo.taxId}</div>}
        </div>
        <div className="text-right">
          <div className="font-bold">RECEIPT</div>
          <div className="text-sm mt-1">Bill #: {bill.billNumber}</div>
          <div className="text-sm">Date: {formatDate(bill.createdAt)}</div>
          {bill.customerName && <div className="text-sm">Customer: {bill.customerName}</div>}
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 text-left">Item</th>
            {showPrices && (
              <>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Total</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item: BillItem, index: number) => (
            <tr key={index} className="border-b border-border">
              <td className="py-2">
                <div>{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.barcode}</div>
              </td>
              {showPrices && (
                <>
                  <td className="py-2 text-right">${item.price.toFixed(2)}</td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      {showPrices && (
        <div className="w-full flex justify-end mb-8">
          <div className="w-40">
            <div className="flex justify-between py-1">
              <span>Subtotal:</span>
              <span>${bill.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Tax:</span>
              <span>${bill.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-t border-border font-bold">
              <span>Total:</span>
              <span>${bill.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span>Payment Method:</span>
              <span>{bill.paymentMethod}</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground mt-8 pt-4 border-t border-border">
        <p>Thank you for your purchase!</p>
        <p className="mt-1">Visit us again soon.</p>
      </div>
    </div>
  )
}
