import type { ReactElement, ReactNode } from "react"

export type NCtrlShortcutKeys = string | readonly string[]

export interface NCtrlShortcut {
  id: string
  /** Una combinación (`Ctrl+S`) o varias alternativas (`["F4", "Ctrl+Enter"]`). */
  keys: NCtrlShortcutKeys
  label: string
  description?: string
  group?: string
  icon?: ReactNode
  handler?: () => void | Promise<void>
  disabled?: boolean
  hidden?: boolean
  allowInEditable?: boolean
  preventDefault?: boolean
  repeat?: boolean
  priority?: number
}

export interface NCtrlInvokeDetails {
  shortcut: NCtrlShortcut
  keys: string
  source: "keyboard" | "panel"
}

export interface NCtrlLabels {
  title: string
  description: string
  openPanel: string
  searchLabel: string
  searchPlaceholder: string
  empty: string
  noHandler: string
  unavailable: string
  executing: string
  executionFailed: string
  shortcutHint: (keys: string) => string
  defaultGroup: string
}

export interface NCtrlProps {
  /** Atajos declarados por la vista activa; se combinan con los registrados mediante hooks. */
  shortcuts?: readonly NCtrlShortcut[]
  viewId?: string
  viewLabel?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  toggleShortcut?: string
  enabled?: boolean
  executeShortcuts?: boolean
  disableShortcutsWhileOpen?: boolean
  showTrigger?: boolean
  trigger?: ReactElement
  placement?: "auto" | "start" | "end"
  desktopWidth?: string
  colorPalette?: string
  onShortcutInvoke?: (details: NCtrlInvokeDetails) => void
  onShortcutError?: (error: unknown, details: NCtrlInvokeDetails) => void
  onShortcutConflict?: (keys: string, shortcuts: readonly NCtrlShortcut[]) => void
  labels?: Partial<NCtrlLabels>
}

export interface NCtrlProviderProps {
  children: ReactNode
}
