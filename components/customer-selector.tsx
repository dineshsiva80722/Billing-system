"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Customer } from "@/lib/models/types"

interface CustomerSelectorProps {
  customers: Customer[]
  isLoading: boolean
  selectedCustomerId: string | null
  onSelectCustomer: (customerId: string | null) => void
}

export function CustomerSelector({
  customers,
  isLoading,
  selectedCustomerId,
  onSelectCustomer,
}: CustomerSelectorProps) {
  const [open, setOpen] = useState(false)

  const selectedCustomer = customers.find((customer) => customer._id?.toString() === selectedCustomerId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
          {selectedCustomer ? selectedCustomer.name : "Select customer..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search customer..." />
          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <p className="text-sm text-muted-foreground">No customer found.</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {isLoading ? (
                <div className="flex justify-center items-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                customers.map((customer) => (
                  <CommandItem
                    key={customer._id?.toString()}
                    value={customer._id?.toString() || ""}
                    onSelect={(currentValue) => {
                      onSelectCustomer(currentValue === selectedCustomerId ? null : currentValue)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCustomerId === customer._id?.toString() ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {customer.name}
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
