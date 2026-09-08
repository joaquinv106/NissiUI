import type { ReactNode } from "react"
import type { NComponentStyleProps } from "../styling"
export type NAppShellSlot = "root" | "skipLink" | "sidebar" | "header" | "content" | "footer"

export interface NAppShellLabels {
  skipToContent: string
  sidebarRegion: string
  contentRegion: string
}

export interface NAppShellProps extends NComponentStyleProps<NAppShellSlot> {
  /** Barra superior, normalmente un `NHeader`. */
  header?: ReactNode
  /** Navegación lateral, normalmente un `NSidebar`. */
  sidebar?: ReactNode
  footer?: ReactNode
  children: ReactNode
  sidebarPosition?: "start" | "end"
  /** Limita el contenido sin limitar header ni sidebar. `full` ocupa todo el ancho. */
  contentMaxWidth?: string
  /** Espaciado responsive preconfigurado del contenido principal. */
  contentPadding?: "none" | "compact" | "comfortable"
  /** Altura mínima del shell; `100dvh` por defecto. Útil para previews embebidos. */
  minHeight?: string
  colorPalette?: string
  labels?: Partial<NAppShellLabels>
}
