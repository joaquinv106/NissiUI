"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { ThemeProvider, useTheme as useNextTheme } from "next-themes"
import { useCallback, useEffect, useMemo, useState } from "react"

import { NThemeContext } from "./context"
import { nissiSystem } from "./system"
import type { NThemeContextValue, NThemeName, NThemePreference, NThemeProviderProps } from "./types"

const visualThemes: NThemeName[] = ["light", "dark", "navy", "nissi"]

function isThemePreference(theme: string | undefined): theme is NThemePreference {
  return theme === "light" || theme === "dark" || theme === "navy" || theme === "nissi" || theme === "system"
}

function NThemeBridge({
  children,
  controlledTheme,
  enableSystem,
  onThemeChange,
}: Pick<NThemeProviderProps, "children" | "enableSystem" | "onThemeChange"> & {
  controlledTheme?: NThemePreference
}) {
  const { theme: nextThemeValue, resolvedTheme: nextResolvedTheme, setTheme: setNextTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)
  const preference = controlledTheme ?? (isThemePreference(nextThemeValue) ? nextThemeValue : "system")
  const effectiveTheme = controlledTheme && controlledTheme !== "system" ? controlledTheme : nextResolvedTheme
  const resolvedTheme: NThemeName = effectiveTheme === "dark" || effectiveTheme === "navy" || effectiveTheme === "nissi"
    ? effectiveTheme
    : "light"

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    document.documentElement.style.colorScheme = resolvedTheme === "light" ? "light" : "dark"
  }, [resolvedTheme])

  const setTheme = useCallback((theme: NThemePreference) => {
    if (controlledTheme === undefined) setNextTheme(theme)
    onThemeChange?.(theme)
  }, [controlledTheme, onThemeChange, setNextTheme])

  const value = useMemo<NThemeContextValue>(() => ({
    mounted,
    theme: preference,
    resolvedTheme,
    themes: enableSystem ? [...visualThemes, "system"] : visualThemes,
    setTheme,
  }), [enableSystem, mounted, preference, resolvedTheme, setTheme])

  return <NThemeContext.Provider value={value}>{children}</NThemeContext.Provider>
}

/** Proveedor raíz que sincroniza Chakra, persistencia, preferencia del sistema y controles NTheme. */
export function NThemeProvider({
  children,
  system = nissiSystem,
  theme,
  defaultTheme = "system",
  onThemeChange,
  storageKey = "nissi-ui-theme",
  enableSystem = true,
  disableTransitionOnChange = true,
}: NThemeProviderProps) {
  const effectiveTheme = !enableSystem && theme === "system" ? "light" : theme
  const effectiveDefaultTheme = !enableSystem && defaultTheme === "system" ? "light" : defaultTheme

  return (
    <ChakraProvider value={system}>
      <ThemeProvider
        attribute="class"
        themes={visualThemes}
        forcedTheme={effectiveTheme}
        defaultTheme={effectiveDefaultTheme}
        storageKey={storageKey}
        enableSystem={enableSystem}
        enableColorScheme={false}
        disableTransitionOnChange={disableTransitionOnChange}
      >
        <NThemeBridge controlledTheme={effectiveTheme} enableSystem={enableSystem} onThemeChange={onThemeChange}>
          {children}
        </NThemeBridge>
      </ThemeProvider>
    </ChakraProvider>
  )
}
