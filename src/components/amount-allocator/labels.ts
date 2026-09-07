import type { NAmountAllocatorLabels } from "./types"

export const defaultNAmountAllocatorLabels: NAmountAllocatorLabels = {
  allocatorLabel: "Distribución de valores",
  methodsLabel: "Opciones de distribución",
  total: "Total",
  allocated: "Asignado",
  remaining: "Restante",
  balanced: "Distribución completa",
  underAllocated: "Valor pendiente por distribuir",
  overAllocated: "La distribución supera el total",
  progressLabel: "Progreso de la distribución",
  distributeEvenly: "Distribuir equitativamente",
  reset: "Reiniciar distribución",
  assignRemaining: (methodLabel) => `Asignar el restante a ${methodLabel}`,
  amountFor: (methodLabel) => `Valor asignado a ${methodLabel}`,
  loading: "Cargando opciones de distribución",
  errorTitle: "No fue posible cargar la distribución",
  emptyTitle: "No hay opciones de distribución",
  emptyDescription: "Agrega al menos una opción para distribuir el valor.",
}

export function resolveNAmountAllocatorLabels(labels?: Partial<NAmountAllocatorLabels>): NAmountAllocatorLabels {
  return { ...defaultNAmountAllocatorLabels, ...labels }
}
