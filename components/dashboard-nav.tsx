"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, BarChart, LogOut } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeSelector } from "@/components/theme-selector"

export function DashboardNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      title: "Dashboard",
    },
    {
      href: "/billing",
      icon: ShoppingCart,
      title: "Billing",
    },
    {
      href: "/inventory",
      icon: Package,
      title: "Inventory",
    },
    {
      href: "/customers",
      icon: Users,
      title: "Customers",
    },
    {
      href: "/reports",
      icon: BarChart,
      title: "Reports",
    },
    {
      href: "/settings",
      icon: Settings,
      title: "Settings",
    },
  ]

  return (
    <div className="flex h-full w-full flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="text-primary">SuperMarket</span>
          <span>POS</span>
        </Link>
        <ThemeSelector />
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <span
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === route.href ? "bg-accent" : "transparent",
                )}
              >
                <route.icon className="mr-2 h-4 w-4" />
                <span>{route.title}</span>
              </span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Link>
        </Button>
      </div>
    </div>
  )
}
