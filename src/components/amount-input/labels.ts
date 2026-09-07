import type { NAmountInputLabels } from "./types"

export const defaultNAmountInputLabels: NAmountInputLabels = {
  amountAriaLabel: "Valor",
  increment: "Incrementar valor",
  decrement: "Disminuir valor",
  quickValuesLabel: "Valores rápidos",
  quickValue: (value) => `Usar ${value}`,
}

export function resolveNAmountInputLabels(labels?: Partial<NAmountInputLabels>): NAmountInputLabels {
  return { ...defaultNAmountInputLabels, ...labels }
}
