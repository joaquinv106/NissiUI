import type { NCheckoutLabels } from "./types"

export const defaultNCheckoutLabels: NCheckoutLabels = {
  checkoutLabel: "Finalización de compra",
  title: "Finalizar operación",
  reviewLabel: "Resumen de la operación",
  paymentLabel: "Distribución del pago",
  complete: "Completar operación",
  processing: "Procesando operación",
  incomplete: "Distribuye el total completo antes de continuar.",
  failed: "No fue posible completar la operación.",
  completed: "Operación completada.",
}

export function resolveNCheckoutLabels(labels?: Partial<NCheckoutLabels>): NCheckoutLabels {
  return { ...defaultNCheckoutLabels, ...labels }
}
