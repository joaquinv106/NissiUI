"use client"

import { usePermissions } from "./NPermissionsProvider"
import type { NPermissionCapability, NPermissionMode } from "./types"

/** Hook para verificar si el usuario/cliente actual tiene la(s) capacidad(es) indicada(s). */
export function useCanAccess(
  required?: NPermissionCapability | NPermissionCapability[],
  mode: NPermissionMode = "any",
): boolean {
  const { can } = usePermissions()
  if (!required || (Array.isArray(required) && required.length === 0)) return true
  return can(required, mode)
}
