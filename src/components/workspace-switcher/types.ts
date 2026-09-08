import type { ReactNode } from "react"
import type { NComponentStyleProps } from "../styling"
export type NWorkspaceSwitcherSlot = "root" | "trigger" | "content" | "workspace" | "empty"

export interface NWorkspace<TData = unknown> {
  id: string
  name: string
  description?: string
  avatarSrc?: string
  icon?: ReactNode
  badge?: ReactNode
  disabled?: boolean
  data?: TData
}

export interface NWorkspaceSwitcherLabels {
  selectorLabel: string
  menuLabel: string
  noWorkspaces: string
  selected: string
}

export interface NWorkspaceSwitcherProps<TData = unknown> extends NComponentStyleProps<NWorkspaceSwitcherSlot> {
  workspaces: NWorkspace<TData>[]
  value?: string
  defaultValue?: string
  onValueChange?: (workspace: NWorkspace<TData>) => void
  compact?: boolean
  colorPalette?: string
  labels?: Partial<NWorkspaceSwitcherLabels>
}
