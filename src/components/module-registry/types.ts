import type { ReactNode } from "react"

import type { NPermissionCapability, NPermissionMode } from "../permissions"

export type NModuleRegistryLayout = "grid" | "list" | "compact"

export interface NModuleDefinition<TData = unknown> {
  id: string
  label: string
  description?: string
  icon?: ReactNode
  badge?: ReactNode
  /** `false` representa un módulo visible en catálogo pero no contratado. */
  purchased?: boolean
  disabled?: boolean
  requiredPermission?: NPermissionCapability | NPermissionCapability[]
  permissionMode?: NPermissionMode
  data?: TData
}

export interface NModuleRegistryLabels {
  navigationLabel: string
  unavailable: string
  empty: string
}

export interface NModuleRegistryProps<TData = unknown> {
  modules: NModuleDefinition<TData>[]
  activeModuleId?: string
  defaultActiveModuleId?: string
  onModuleSelect?: (module: NModuleDefinition<TData>) => void
  layout?: NModuleRegistryLayout
  /** Muestra módulos no contratados como bloqueados. Los no autorizados siempre se ocultan. */
  showUnavailable?: boolean
  colorPalette?: string
  labels?: Partial<NModuleRegistryLabels>
}
