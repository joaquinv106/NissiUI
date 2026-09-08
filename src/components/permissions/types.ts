import type { ReactNode } from "react"
import type { NComponentStyleProps } from "../styling"
export type NPermissionGateSlot = "root" | "fallback"

export type NPermissionMode = "any" | "all"

/**
 * Identificador de capacidad, p. ej. "facturacion:editar" o "facturacion:*".
 * Debe incluir tanto permisos por rol como microservicios contratados por el cliente.
 */
export type NPermissionCapability = string

export interface NPermissionContextValue {
  permissions: NPermissionCapability[]
  can: (required: NPermissionCapability | NPermissionCapability[], mode?: NPermissionMode) => boolean
}

export interface NPermissionsProviderProps {
  /** Lista de capacidades otorgadas al usuario/cliente actual (roles + microservicios contratados). */
  permissions: NPermissionCapability[]
  children: ReactNode
}

export interface NPermissionLabels {
  deniedTooltip: string
}

export interface NPermissionGateProps extends NComponentStyleProps<NPermissionGateSlot> {
  /** Capacidad o capacidades requeridas para mostrar el contenido. */
  requires: NPermissionCapability | NPermissionCapability[]
  mode?: NPermissionMode
  /** `hide` (por defecto) omite el contenido; `disable` lo muestra deshabilitado con un tooltip. */
  behavior?: "hide" | "disable"
  fallback?: ReactNode
  children: ReactNode
  labels?: Partial<NPermissionLabels>
}
