import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { ThemeProvider } from "next-themes"
import type { PropsWithChildren } from "react"

export function DemoProvider({ children }: PropsWithChildren) {
  const requestedTheme = new URLSearchParams(window.location.search).get("theme")
  const defaultTheme = requestedTheme === "light" || requestedTheme === "dark" ? requestedTheme : "system"
  return (
    <ChakraProvider value={defaultSystem}>
      <ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </ChakraProvider>
  )
}
