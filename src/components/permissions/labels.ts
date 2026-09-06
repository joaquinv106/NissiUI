import type { NPermissionLabels } from "./types"

export const defaultNPermissionLabels: NPermissionLabels = {
  deniedTooltip: "No tienes permiso para esta acción.",
}

/** Combina los textos predeterminados con los que el consumidor sobreescriba. */
export function resolveNPermissionLabels(labels?: Partial<NPermissionLabels>): NPermissionLabels {
  return { ...defaultNPermissionLabels, ...labels }
}
