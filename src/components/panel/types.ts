import type { Key, ReactElement, ReactNode, RefObject } from "react"

import type { NComponentStyleProps } from "../styling"

export type NPanelPlacement = "auto" | "start" | "end"

export interface NPanelLabels {
  defaultTitle: string
  closePanel: string
}

export type NPanelSlot =
  | "root"
  | "trigger"
  | "backdrop"
  | "positioner"
  | "content"
  | "header"
  | "title"
  | "description"
  | "headerActions"
  | "body"
  | "footer"
  | "closeTrigger"

export interface NPanelProps extends NComponentStyleProps<NPanelSlot> {
  /** Señal controlada que muestra u oculta el panel. */
  open?: boolean
  /** Estado inicial para uso no controlado. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** `auto` usa el lado opuesto al sidebar de NAppShell. */
  placement?: NPanelPlacement
  /** Permite resolver `auto` fuera de NAppShell. */
  sidebarPosition?: "start" | "end"
  /** Ancho del panel desde `md`; en móvil siempre ocupa el viewport completo. */
  desktopWidth?: string
  title?: ReactNode
  description?: ReactNode
  headerActions?: ReactNode
  footer?: ReactNode
  children: ReactNode
  /** Reinicia el subárbol cuando la aplicación cambia la vista activa. */
  contentKey?: Key
  /** Disparador opcional para uso no controlado. Debe ser un elemento interactivo. */
  trigger?: ReactElement
  closeOnEscape?: boolean
  closeOnInteractOutside?: boolean
  preventScroll?: boolean
  modal?: boolean
  trapFocus?: boolean
  restoreFocus?: boolean
  initialFocusRef?: RefObject<HTMLElement | null>
  returnFocusRef?: RefObject<HTMLElement | null>
  lazyMount?: boolean
  unmountOnExit?: boolean
  role?: "dialog" | "alertdialog"
  colorPalette?: string
  labels?: Partial<NPanelLabels>
}
