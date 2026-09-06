import type { NPermissionCapability, NPermissionMode } from "./types"

/** Coincide "facturacion:*" con "facturacion:editar", y "*" con cualquier capacidad. */
export function matchesCapability(granted: NPermissionCapability, required: NPermissionCapability): boolean {
  if (granted === "*" || granted === required) return true
  if (granted.endsWith(":*")) return required.startsWith(granted.slice(0, -1))
  return false
}

export function canAccess(
  granted: NPermissionCapability[],
  required: NPermissionCapability | NPermissionCapability[],
  mode: NPermissionMode = "any",
): boolean {
  const requiredList = Array.isArray(required) ? required : [required]
  if (requiredList.length === 0) return true
  const results = requiredList.map((capability) => granted.some((item) => matchesCapability(item, capability)))
  return mode === "all" ? results.every(Boolean) : results.some(Boolean)
}
