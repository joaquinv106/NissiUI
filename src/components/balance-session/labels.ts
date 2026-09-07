import type { NBalanceSessionLabels } from "./types"

export const defaultNBalanceSessionLabels: NBalanceSessionLabels = {
  sessionLabel: "Sesión de balance",
  openingAmount: "Saldo inicial",
  movements: "Movimientos",
  expectedAmount: "Saldo esperado",
  countedAmount: "Saldo contado",
  difference: "Diferencia",
  open: "Abierta",
  balanced: "Balanceada",
  variance: "Con diferencia",
  closed: "Cerrada",
  entriesTitle: "Detalle de movimientos",
  noEntries: "No hay movimientos en esta sesión.",
  countedRequired: "Captura el saldo contado antes de cerrar.",
  varianceBlocked: "La diferencia debe resolverse antes de cerrar.",
  close: "Cerrar sesión",
  processing: "Procesando cierre",
  closeFailed: "No fue posible cerrar la sesión.",
  loading: "Cargando sesión",
  errorTitle: "No se pudo mostrar la sesión",
  emptyTitle: "No hay una sesión disponible",
  emptyDescription: "Selecciona o inicia una sesión para continuar.",
}

export function resolveNBalanceSessionLabels(labels?: Partial<NBalanceSessionLabels>): NBalanceSessionLabels {
  return { ...defaultNBalanceSessionLabels, ...labels }
}
