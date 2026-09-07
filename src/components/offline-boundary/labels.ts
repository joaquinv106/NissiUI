import type { NOfflineBoundaryLabels } from "./types"

export const defaultNOfflineBoundaryLabels: NOfflineBoundaryLabels = {
  regionLabel: "Estado de conectividad",
  offlineTitle: "Trabajando sin conexión",
  offlineDescription: "Los cambios compatibles pueden conservarse localmente hasta recuperar la conexión.",
  onlineRestored: "Conexión restablecida.",
  queuedChanges: (count) => `${count} ${count === 1 ? "cambio en cola" : "cambios en cola"}`,
  retry: "Comprobar conexión",
  checking: "Comprobando",
  retryFailed: "La conexión aún no está disponible.",
}

export function resolveNOfflineBoundaryLabels(labels?: Partial<NOfflineBoundaryLabels>): NOfflineBoundaryLabels {
  return { ...defaultNOfflineBoundaryLabels, ...labels }
}
