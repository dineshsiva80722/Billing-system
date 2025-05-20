"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useColorTheme } from "@/components/theme-provider"
import { themes } from "@/lib/themes"

export default function SettingsPage() {
  const { theme, setTheme } = useColorTheme()
  const [selectedTheme, setSelectedTheme] = useState(theme)

  const handleThemeChange = (value: string) => {
    setSelectedTheme(value)
    setTheme(value)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Manage your application preferences and settings." />

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Color Theme</h3>
                <p className="text-sm text-muted-foreground">Choose a color theme for the application interface.</p>
              </div>
              <RadioGroup
                value={selectedTheme}
                onValueChange={handleThemeChange}
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5"
              >
                {themes.map((colorTheme) => (
                  <div key={colorTheme.name} className="flex items-center space-x-2">
                    <RadioGroupItem value={colorTheme.name} id={`theme-${colorTheme.name}`} className="peer sr-only" />
                    <Label
                      htmlFor={`theme-${colorTheme.name}`}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div
                        className="mb-3 h-10 w-10 rounded-full"
                        style={{ backgroundColor: colorTheme.primaryColor }}
                      />
                      <div className="text-center font-medium">{colorTheme.label}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
