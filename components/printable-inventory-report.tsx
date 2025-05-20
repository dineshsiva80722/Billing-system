import type { Product } from "@/lib/models/types"

interface PrintableInventoryReportProps {
  products: Product[]
  title?: string
  date?: string
}

export function PrintableInventoryReport({
  products,
  title = "Inventory Report",
  date = new Date().toLocaleDateString(),
}: PrintableInventoryReportProps) {
  const lowStockCount = products.filter((product) => product.stock < product.minStock).length
  const outOfStockCount = products.filter((product) => product.stock <= 0).length

  // Calculate totals
  const totalItems = products.length
  const totalValue = products.reduce((sum, product) => sum + product.price * product.stock, 0)

  return (
    <div className="bg-black p-8 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground pdf-text">Generated on {date}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="border rounded-md p-4 text-center">
          <div className="text-3xl font-bold">{totalItems}</div>
          <div className="text-sm text-muted-foreground pdf-text">Total Products</div>
        </div>
        <div className="border rounded-md p-4 text-center">
          <div className="text-3xl font-bold">${totalValue.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground pdf-text">Inventory Value</div>
        </div>
        <div className="border rounded-md p-4 text-center">
          <div className="text-3xl font-bold pdf-text">{lowStockCount}</div>
          <div className="text-sm text-muted-foreground pdf-text">Low Stock Items</div>
        </div>
        <div className="border rounded-md p-4 text-center">
          <div className="text-3xl font-bold pdf-text">{outOfStockCount}</div>
          <div className="text-sm text-muted-foreground pdf-text">Out of Stock</div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="p-2 text-left border">Product</th>
            <th className="p-2 text-left border">Category</th>
            <th className="p-2 text-right border">Price</th>
            <th className="p-2 text-right border">Stock</th>
            <th className="p-2 text-right border">Min Stock</th>
            <th className="p-2 text-center border">Status</th>
            <th className="p-2 text-right border">Value</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            // Determine stock status
            let status = "In Stock"
            let statusClass = "text-green-600"

            if (product.stock <= 0) {
              status = "Out of Stock"
              statusClass = "text-destructive"
            } else if (product.stock < product.minStock) {
              status = "Low Stock"
              statusClass = "text-orange-500"
            }

            return (
              <tr key={product._id?.toString()} className="border-b">
                <td className="p-2 border">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-muted-foreground pdf-text">{product.barcode}</div>
                </td>
                <td className="p-2 border">{product.category}</td>
                <td className="p-2 text-right border">${product.price.toFixed(2)}</td>
                <td className="p-2 text-right border">{product.stock}</td>
                <td className="p-2 text-right border">{product.minStock}</td>
                <td className={`p-2 text-center border ${statusClass} pdf-text`}>
                  {status}
                </td>
                <td className="p-2 text-right border">${(product.price * product.stock).toFixed(2)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pdf-text mt-8 pt-4 border-t">
        <p>SuperMarket POS - Internal Document</p>
      </div>
    </div>
  )
}
