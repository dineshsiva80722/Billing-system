"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { themes, getThemeByName } from "@/lib/themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

type ColorThemeContextType = {
  theme: string
  setTheme: (theme: string) => void
  availableThemes: typeof themes
}

const ColorThemeContext = React.createContext<ColorThemeContextType | undefined>(undefined)

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<string>("default")

  // Load theme from localStorage on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("color-theme")
    if (savedTheme) {
      setThemeState(savedTheme)
      applyTheme(savedTheme)
    }
  }, [])

  const setTheme = React.useCallback((newTheme: string) => {
    setThemeState(newTheme)
    localStorage.setItem("color-theme", newTheme)
    applyTheme(newTheme)
  }, [])

  const applyTheme = (themeName: string) => {
    const theme = getThemeByName(themeName)
    const root = document.documentElement

    root.style.setProperty("--primary", theme.primaryColor)
    root.style.setProperty("--primary-foreground", theme.primaryForeground)
    root.style.setProperty("--accent", theme.accentColor)
    root.style.setProperty("--accent-foreground", theme.accentForeground)
    root.style.setProperty("--background", theme.background)
    root.style.setProperty("--foreground", theme.foreground)
  }

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      availableThemes: themes,
    }),
    [theme, setTheme],
  )

  return <ColorThemeContext.Provider value={value}>{children}</ColorThemeContext.Provider>
}

export const useColorTheme = () => {
  const context = React.useContext(ColorThemeContext)
  if (context === undefined) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider")
  }
  return context
}
