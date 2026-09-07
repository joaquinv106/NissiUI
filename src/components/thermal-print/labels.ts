import type { NThermalPrintLabels } from "./types"

export const defaultNThermalPrintLabels: NThermalPrintLabels = {
  print: "Imprimir ticket",
  printing: "Preparando impresión",
  printError: "No se pudo imprimir el ticket.",
}

export function resolveNThermalPrintLabels(labels?: Partial<NThermalPrintLabels>): NThermalPrintLabels {
  return { ...defaultNThermalPrintLabels, ...labels }
}
