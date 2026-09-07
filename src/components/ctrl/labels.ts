import type { NCtrlLabels } from "./types"

export const defaultNCtrlLabels: NCtrlLabels = {
  title: "Atajos de teclado",
  description: "Combinaciones disponibles en la vista actual.",
  openPanel: "Ver atajos de teclado",
  searchLabel: "Buscar atajos",
  searchPlaceholder: "Buscar por función, tecla o grupo",
  empty: "No hay atajos disponibles para esta vista.",
  noHandler: "Este atajo es informativo.",
  unavailable: "No disponible",
  executing: "Ejecutando",
  executionFailed: "No fue posible ejecutar el atajo.",
  shortcutHint: (keys) => `Atajo: ${keys}`,
  defaultGroup: "General",
}

export function resolveNCtrlLabels(labels?: Partial<NCtrlLabels>): NCtrlLabels {
  return { ...defaultNCtrlLabels, ...labels }
}
