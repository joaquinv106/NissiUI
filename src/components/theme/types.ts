import type { SystemContext } from "@chakra-ui/react"
import type { PropsWithChildren } from "react"
import type { NComponentStyleProps } from "../styling"
export type NThemeSlot = "root" | "trigger" | "menu" | "item"

/** Temas visuales mantenidos por Nissi UI. */
export type NThemeName = "light" | "dark" | "navy" | "nissi"

/** Preferencia persistible; `system` sigue claro u oscuro según el sistema operativo. */
export type NThemePreference = NThemeName | "system"

export type NThemePresentation = "icon" | "button"

export interface NThemeLabels {
  selectorLabel: string
  menuLabel: string
  lightTheme: string
  darkTheme: string
  navyTheme: string
  /** Etiqueta de la variante oscura de marca. Se conserva el nombre por compatibilidad. */
  nissiTheme: string
  systemTheme: string
  currentTheme: (theme: string) => string
}

export interface NThemeProviderProps extends PropsWithChildren {
  /** Sistema Chakra sustituible; conserva `nissiSystem` como valor predeterminado. */
  system?: SystemContext
  /** Tema controlado. Si se omite, NTheme administra y persiste la preferencia. */
  theme?: NThemePreference
  defaultTheme?: NThemePreference
  onThemeChange?: (theme: NThemePreference) => void
  storageKey?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export interface NThemeProps extends NComponentStyleProps<NThemeSlot> {
  presentation?: NThemePresentation
  /** Limita las opciones visibles sin alterar los temas registrados por el proveedor. */
  themes?: readonly NThemePreference[]
  colorPalette?: string
  labels?: Partial<NThemeLabels>
}

export interface NThemeContextValue {
  /** `true` después de hidratar; útil para UI propia que dependa de localStorage. */
  mounted: boolean
  /** Preferencia seleccionada por el usuario; puede ser `system`. */
  theme: NThemePreference
  /** Tema visual efectivo. `system` siempre se resuelve a claro u oscuro. */
  resolvedTheme: NThemeName
  themes: readonly NThemePreference[]
  setTheme: (theme: NThemePreference) => void
}
