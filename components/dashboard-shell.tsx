import type React from "react"
import { cn } from "@/lib/utils"
import { DashboardNav } from "@/components/dashboard-nav"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardNav />
      <main className="flex w-full flex-col overflow-hidden">
        <div className={cn("container flex-1 space-y-4 p-8 pt-6", className)} {...props}>
          {children}
        </div>
      </main>
    </div>
  )
}
