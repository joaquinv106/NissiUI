import { createContext, useContext } from "react"

import type { NThemeContextValue } from "./types"

export const NThemeContext = createContext<NThemeContextValue | undefined>(undefined)

/** Acceso al tema efectivo y a la preferencia compartida por toda la aplicación. */
export function useNTheme(): NThemeContextValue {
  const context = useContext(NThemeContext)
  if (!context) throw new Error("[NissiUI] useNTheme debe usarse dentro de NThemeProvider.")
  return context
}

/** Uso interno para integrar componentes sin volver obligatorio el proveedor. */
export function useOptionalNTheme(): NThemeContextValue | undefined {
  return useContext(NThemeContext)
}
