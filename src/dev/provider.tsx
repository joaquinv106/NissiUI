import type { PropsWithChildren } from "react"

import { NThemeProvider, type NThemePreference } from "../components/theme"

export function DemoProvider({ children }: PropsWithChildren) {
  const requestedTheme = new URLSearchParams(window.location.search).get("theme")
  const defaultTheme: NThemePreference = requestedTheme === "light" || requestedTheme === "dark" || requestedTheme === "navy" || requestedTheme === "nissi"
    ? requestedTheme
    : "system"
  return (
    <NThemeProvider defaultTheme={defaultTheme}>
      {children}
    </NThemeProvider>
  )
}
