export type ThemeColor = {
  name: string
  label: string
  primaryColor: string
  primaryForeground: string
  accentColor: string
  accentForeground: string
  background: string
  foreground: string
}

export const themes: ThemeColor[] = [
  {
    name: "default",
    label: "Default Blue",
    primaryColor: "hsl(221.2 83.2% 53.3%)",
    primaryForeground: "hsl(210 40% 98%)",
    accentColor: "hsl(210 40% 96.1%)",
    accentForeground: "hsl(222.2 47.4% 11.2%)",
    background: "hsl(0 0% 100%)",
    foreground: "hsl(222.2 47.4% 11.2%)",
  },
  {
    name: "green",
    label: "Emerald Green",
    primaryColor: "hsl(142.1 76.2% 36.3%)",
    primaryForeground: "hsl(355.7 100% 97.3%)",
    accentColor: "hsl(143 76% 96%)",
    accentForeground: "hsl(140 100% 10%)",
    background: "hsl(0 0% 100%)",
    foreground: "hsl(222.2 47.4% 11.2%)",
  },
  {
    name: "purple",
    label: "Royal Purple",
    primaryColor: "hsl(262.1 83.3% 57.8%)",
    primaryForeground: "hsl(210 40% 98%)",
    accentColor: "hsl(260 40% 96%)",
    accentForeground: "hsl(260 50% 20%)",
    background: "hsl(0 0% 100%)",
    foreground: "hsl(222.2 47.4% 11.2%)",
  },
  {
    name: "orange",
    label: "Vibrant Orange",
    primaryColor: "hsl(24.6 95% 53.1%)",
    primaryForeground: "hsl(60 9.1% 97.8%)",
    accentColor: "hsl(25 95% 97%)",
    accentForeground: "hsl(24 100% 20%)",
    background: "hsl(0 0% 100%)",
    foreground: "hsl(222.2 47.4% 11.2%)",
  },
  {
    name: "red",
    label: "Ruby Red",
    primaryColor: "hsl(0 72.2% 50.6%)",
    primaryForeground: "hsl(60 9.1% 97.8%)",
    accentColor: "hsl(0 72% 95%)",
    accentForeground: "hsl(0 72% 20%)",
    background: "hsl(0 0% 100%)",
    foreground: "hsl(222.2 47.4% 11.2%)",
  },
]

export function getThemeByName(name: string): ThemeColor {
  return themes.find((theme) => theme.name === name) || themes[0]
}
