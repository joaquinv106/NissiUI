import type { NReceiptLabels } from "./types"

export const defaultNReceiptLabels: NReceiptLabels = {
  receiptLabel: "Recibo",
  title: "Recibo",
  number: "Folio",
  date: "Fecha",
  linesLabel: "Partidas del recibo",
  item: "Concepto",
  quantity: "Cantidad",
  unitAmount: "Precio unitario",
  lineTotal: "Importe",
  summaryLabel: "Totales del recibo",
  total: "Total",
  emptyLines: "Este recibo no contiene partidas.",
}

export function resolveNReceiptLabels(labels?: Partial<NReceiptLabels>): NReceiptLabels {
  return { ...defaultNReceiptLabels, ...labels }
}
