import type { ReactNode } from "react"

import type { NPermissionCapability, NPermissionMode } from "../permissions/types"
import type { NComponentStyleProps } from "../styling"

export type NTableRow = Record<string, unknown>

export type NTableDataType =
  | "text"
  | "number"
  | "currency"
  | "boolean"
  | "date"
  | "datetime"
  | "email"
  | "url"
  | "select"

export type NTablePresentation = "text" | "avatar" | "icon" | "badge"

export interface NTableSelectOption {
  label: string
  value: string
}

export interface NTableColumn<T extends NTableRow = NTableRow> {
  key: Extract<keyof T, string>
  header: string
  type?: NTableDataType
  presentation?: NTablePresentation
  group?: string
  sortable?: boolean
  filterable?: boolean
  hideable?: boolean
  hidden?: boolean
  editable?: boolean
  required?: boolean
  width?: string
  align?: "start" | "center" | "end"
  currency?: string
  locale?: string
  options?: NTableSelectOption[]
  avatarNameKey?: Extract<keyof T, string>
  badgeColorPalette?: string
  format?: (value: unknown, row: T) => ReactNode
}

export interface NTableConfig<T extends NTableRow = NTableRow> {
  headers: NTableColumn<T>[]
  data: T[]
}

export interface NTableActionPayload<T extends NTableRow = NTableRow> {
  /** JSON serializado de la definición de columnas. */
  headers: string
  /** JSON serializado de la primera fila seleccionada. */
  data: string
  /** Identificador estable de la primera fila seleccionada. */
  rowId: string
  row: T
  selectedRowIds: string[]
  selectedRows: T[]
}

export interface NTableLabels {
  searchPlaceholder: string
  searchAriaLabel: string
  filterColumnPlaceholder: string
  filterColumnAriaLabel: string
  filterValuePlaceholder: string
  filterValueAriaLabel: string
  showHideColumns: string
  copyTable: string
  copiedToClipboard: string
  copyToClipboardError: string
  downloadExcel: string
  downloadPdf: string
  printTable: string
  defaultTitle: string
  selectVisibleRows: string
  selectRow: (rowNumber: number) => string
  selectedCount: (count: number) => string
  selectionActionsAriaLabel: string
  rowsPerPage: string
  pageStatus: (page: number, totalPages: number) => string
  previousPage: string
  nextPage: string
  emptyMessage: string
  stackViewLabel: string
  sortColumn: (column: string, direction: false | "asc" | "desc") => string
  moveColumn: (column: string) => string
  reorderRowsColumn: string
  moveRow: (rowNumber: number) => string
  edit: string
  delete: string
  deleteConfirm: (count: number) => string
  editDialogTitle: string
  editDialogDescription: string
  cancel: string
  saveChanges: string
  closeEdit: string
  yes: string
  no: string
  selectOption: string
}

export interface NTableAction<T extends NTableRow = NTableRow> {
  id: string
  label: string
  icon?: ReactNode
  colorPalette?: string
  /** Limita cuándo aparece la acción según la cantidad de filas seleccionadas. */
  selectionRequirement?: "single" | "multiple" | "any"
  /** Oculta la acción cuando el usuario no tiene esta capacidad (rol o microservicio contratado). */
  requiredPermission?: NPermissionCapability | NPermissionCapability[]
  permissionMode?: NPermissionMode
  onClick: (payload: NTableActionPayload<T>) => void | Promise<void>
}

export interface NTablePaginationOptions {
  pageSize?: number
  pageSizeOptions?: number[]
}

export interface NTableSort {
  id: string
  desc: boolean
}

/** Estado serializable para consultar una tabla paginada en API, RPC o almacenamiento local. */
export interface NTableServerQuery {
  pageIndex: number
  pageSize: number
  sorting: NTableSort[]
  search: string
  filterColumn: string
  filterValue: string
}

export interface NTableServerOptions {
  /** Total de registros en el origen, no sólo los incluidos en `config.data`. */
  rowCount: number
  query: NTableServerQuery
  loading?: boolean
  onQueryChange: (query: NTableServerQuery) => void
}

export interface NTableExportOptions {
  fileName?: string
  pdf?: boolean
  excel?: boolean
  copy?: boolean
  print?: boolean
}

export type NTableSlot = "root" | "surface" | "header" | "content"

export interface NTableProps<T extends NTableRow = NTableRow> extends NComponentStyleProps<NTableSlot> {
  config: NTableConfig<T>
  /** Envuelve la tabla en un Card de Chakra UI. Activo por defecto. */
  card?: boolean
  title?: string
  subtitle?: string
  caption?: string
  captionSide?: "top" | "bottom"
  size?: "sm" | "md" | "lg"
  variant?: "line" | "outline"
  colorPalette?: string
  striped?: boolean
  interactive?: boolean
  showColumnBorder?: boolean
  /** Grosor del contorno exterior de la tabla, por ejemplo "1px", "2px" o 0. */
  borderWidth?: string | number
  overflow?: "auto" | "hidden" | "visible"
  maxHeight?: string
  stickyHeader?: boolean
  stickyColumn?: boolean | string
  native?: boolean
  responsive?: "scroll" | "stack"
  useTanStack?: boolean
  columnGroups?: boolean
  pagination?: boolean | NTablePaginationOptions
  /** Activa paginación, búsqueda, filtro y orden remotos controlados. */
  server?: NTableServerOptions
  selectable?: boolean
  selectionMode?: "single" | "multiple"
  actions?: NTableAction<T>[]
  searchable?: boolean
  filterable?: boolean
  columnVisibility?: boolean
  /** Permite reordenar columnas con arrastrar y soltar o Alt + flechas. */
  reorderableColumns?: boolean
  /** Permite reordenar filas con arrastrar y soltar o Alt + flechas. */
  reorderableRows?: boolean
  exportOptions?: boolean | NTableExportOptions
  emptyMessage?: string
  labels?: Partial<NTableLabels>
  getRowId?: (row: T, index: number) => string
  iconMap?: Record<string, ReactNode>
  onSelectionChange?: (rows: T[]) => void
  /** Recibe el conjunto completo de filas en su nuevo orden. */
  onRowOrderChange?: (rows: T[]) => void
}

export interface NDataTableProps<T extends NTableRow = NTableRow>
  extends Omit<
    NTableProps<T>,
    | "pagination"
    | "selectable"
    | "actions"
    | "searchable"
    | "filterable"
    | "columnVisibility"
    | "exportOptions"
    | "useTanStack"
  > {
  pagination?: boolean | NTablePaginationOptions
  selectable?: boolean
  actions?: NTableAction<T>[]
  searchable?: boolean
  filterable?: boolean
  columnVisibility?: boolean
  exportOptions?: boolean | NTableExportOptions
  defaultActions?: boolean
  /** Si es false, elimina sin mostrar la confirmación nativa de respaldo. */
  confirmDelete?: boolean
  /** Permite aprobar, cancelar o reemplazar la confirmación antes de eliminar. */
  onBeforeDelete?: (rows: T[]) => boolean | Promise<boolean>
  onDataChange?: (rows: T[]) => void
  onEdit?: (row: T) => void | Promise<void>
  onDelete?: (rows: T[]) => void | Promise<void>
}
