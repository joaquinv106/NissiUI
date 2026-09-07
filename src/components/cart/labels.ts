import type { NCartLabels } from "./types"

export const defaultNCartLabels: NCartLabels = {
  cartLabel: "Carrito",
  title: "Carrito",
  summaryLabel: "Resumen del carrito",
  subtotal: "Subtotal",
  total: "Total",
  clear: "Vaciar carrito",
}

export function resolveNCartLabels(labels?: Partial<NCartLabels>): NCartLabels {
  return { ...defaultNCartLabels, ...labels }
}
