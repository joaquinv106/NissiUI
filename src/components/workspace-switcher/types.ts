import type { ReactNode } from "react"

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

export interface NWorkspaceSwitcherProps<TData = unknown> {
  workspaces: NWorkspace<TData>[]
  value?: string
  defaultValue?: string
  onValueChange?: (workspace: NWorkspace<TData>) => void
  compact?: boolean
  colorPalette?: string
  labels?: Partial<NWorkspaceSwitcherLabels>
}
