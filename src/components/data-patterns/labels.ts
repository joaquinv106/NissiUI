import type { NDateRangePickerLabels, NFilterBarLabels } from "./types"

export const defaultNFilterBarLabels: NFilterBarLabels = {
  region: "Filtros",
  activeFilters: "Filtros activos",
  clearAll: "Limpiar filtros",
  removeFilter: (label) => `Quitar filtro ${label}`,
  toggle: "Mostrar u ocultar filtros",
}
export const defaultNDateRangePickerLabels: NDateRangePickerLabels = {
  start: "Desde",
  end: "Hasta",
  group: "Rango de fechas",
  invalidRange: "La fecha final debe ser igual o posterior a la inicial.",
}
export const resolveLabels = <T extends object>(base: T, custom?: Partial<T>): T => ({ ...base, ...custom })
