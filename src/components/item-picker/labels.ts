import type { NItemPickerLabels } from "./types"

export const defaultNItemPickerLabels: NItemPickerLabels = {
  itemsLabel: "Elementos disponibles",
  searchPlaceholder: "Buscar elementos",
  searchAriaLabel: "Buscar entre los elementos disponibles",
  clearSearch: "Limpiar búsqueda",
  loading: "Cargando elementos",
  emptyTitle: "No hay elementos disponibles",
  emptyDescription: "Prueba con otra búsqueda o revisa los filtros aplicados.",
  resultsCount: (count) => `${count} ${count === 1 ? "resultado" : "resultados"}`,
  selectionCount: (count) => `${count} ${count === 1 ? "seleccionado" : "seleccionados"}`,
}

export function resolveNItemPickerLabels(labels?: Partial<NItemPickerLabels>): NItemPickerLabels {
  return { ...defaultNItemPickerLabels, ...labels }
}
