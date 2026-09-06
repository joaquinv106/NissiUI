"use client"

import { createContext, useContext, useMemo } from "react"

import type { NPermissionContextValue, NPermissionsProviderProps } from "./types"
import { canAccess } from "./utils"

const PermissionContext = createContext<NPermissionContextValue | undefined>(undefined)

/** Referencia estable: evita recalcular resolvedItems/actions/campos en cada render cuando no hay proveedor. */
const allowAllPermissions: NPermissionContextValue = { permissions: ["*"], can: () => true }

/** Expone al árbol la lista de capacidades otorgadas (roles + microservicios contratados). */
export function NPermissionsProvider({ permissions, children }: NPermissionsProviderProps) {
  const value = useMemo<NPermissionContextValue>(() => ({
    permissions,
    can: (required, mode) => canAccess(permissions, required, mode),
  }), [permissions])

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
}

/** Sin `NPermissionsProvider` en el árbol, se permite todo para no romper NSidebar/NTable/NForm existentes. */
export function usePermissions(): NPermissionContextValue {
  const context = useContext(PermissionContext)
  return context ?? allowAllPermissions
}
