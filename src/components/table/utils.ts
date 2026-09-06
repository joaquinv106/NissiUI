import type { NTableColumn, NTableRow } from "./types"

/** Identidad por defecto: usa `id`/`key` de la fila o, en último caso, el índice. */
export function defaultRowId<T extends NTableRow>(row: T, index: number): string {
  const candidate = row.id ?? row.key
  if (typeof candidate === "string" || typeof candidate === "number") return String(candidate)
  return String(index)
}

/** Indica si la fila trae un `id`/`key` propio, para advertir cuando falta identidad estable. */
export function hasStableDefaultRowId(row: NTableRow): boolean {
  const candidate = row.id ?? row.key
  return typeof candidate === "string" || typeof candidate === "number"
}

/** Convierte cualquier valor de celda a texto plano, para búsqueda y exportaciones. */
export function valueToText(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "boolean") return value ? "Sí" : "No"
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

/** Formatea un valor según el tipo de dato de la columna (moneda, fecha, booleano, etc.). */
export function formatTableValue<T extends NTableRow>(
  value: unknown,
  column: NTableColumn<T>,
): string {
  if (value === null || value === undefined || value === "") return "—"

  if (column.type === "boolean") return Boolean(value) ? "Sí" : "No"

  if (column.type === "number" || column.type === "currency") {
    const numericValue = Number(value)
    if (Number.isNaN(numericValue)) return valueToText(value)
    return new Intl.NumberFormat(column.locale ?? "es-MX", {
      style: column.type === "currency" ? "currency" : "decimal",
      currency: column.currency ?? "MXN",
    }).format(numericValue)
  }

  if (column.type === "date" || column.type === "datetime") {
    const date = value instanceof Date ? value : new Date(String(value))
    if (Number.isNaN(date.getTime())) return valueToText(value)
    return new Intl.DateTimeFormat(column.locale ?? "es-MX", {
      dateStyle: "medium",
      ...(column.type === "datetime" ? { timeStyle: "short" as const } : {}),
    }).format(date)
  }

  return valueToText(value)
}

/** Evalúa si la fila coincide con el término de búsqueda en cualquiera de sus columnas. */
export function rowMatchesSearch<T extends NTableRow>(
  row: T,
  columns: NTableColumn<T>[],
  search: string,
): boolean {
  const term = search.trim().toLocaleLowerCase()
  if (!term) return true
  return columns.some((column) =>
    valueToText(row[column.key]).toLocaleLowerCase().includes(term),
  )
}

/** Serializa las columnas visibles a JSON, usado en el payload de las acciones de tabla. */
export function serializeHeaders<T extends NTableRow>(columns: NTableColumn<T>[]): string {
  return JSON.stringify(
    columns.map(({ key, header, type }) => ({ key, header, type: type ?? "text" })),
  )
}

/** Reordena una lista moviendo `source` justo antes o después de `target` según su posición. */
export function moveItem<T>(items: T[], source: T, target: T): T[] {
  const sourceIndex = items.indexOf(source)
  const targetIndex = items.indexOf(target)
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return items

  const next = items.filter((item) => item !== source)
  const insertionIndex = next.indexOf(target) + (sourceIndex < targetIndex ? 1 : 0)
  next.splice(insertionIndex, 0, source)
  return next
}
