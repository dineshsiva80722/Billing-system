"use client"
import { Check, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useColorTheme } from "@/components/theme-provider"

export function ThemeSelector() {
  const { theme, setTheme, availableThemes } = useColorTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableThemes.map((colorTheme) => (
          <DropdownMenuItem
            key={colorTheme.name}
            onClick={() => setTheme(colorTheme.name)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: colorTheme.primaryColor }} />
              {colorTheme.label}
            </div>
            {theme === colorTheme.name && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
