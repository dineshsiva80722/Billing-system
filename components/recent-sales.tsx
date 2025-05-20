import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Bill } from "@/lib/models/types"

interface RecentSalesProps {
  bills: Bill[]
}

export function RecentSales({ bills }: RecentSalesProps) {
  // If no bills are provided, show a message
  if (!bills || bills.length === 0) {
    return (
      <div className="flex justify-center items-center h-[200px] text-muted-foreground">
        No recent sales to display.
      </div>
    )
  }

  // Format date to a readable string
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get initials from a name
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "NA"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-8">
      {bills.map((bill) => (
        <div key={bill._id?.toString()} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder.svg" alt="Avatar" />
            <AvatarFallback>{getInitials(bill.customerName)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{bill.customerName || "Guest Customer"}</p>
            <p className="text-xs text-muted-foreground">{formatDate(bill.createdAt)}</p>
          </div>
          <div className="ml-auto font-medium">+${bill.total.toFixed(2)}</div>
        </div>
      ))}
    </div>
  )
}
