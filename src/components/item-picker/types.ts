import type { ReactNode } from "react"

export type NItemPickerSelectionMode = "none" | "single" | "multiple"
export type NItemPickerLayout = "grid" | "list"

export type NItemPickerColumns = number | Partial<Record<"base" | "sm" | "md" | "lg" | "xl" | "2xl", number>>

export interface NItemPickerRenderState {
  id: string
  index: number
  selected: boolean
  disabled: boolean
}

export interface NItemPickerLabels {
  itemsLabel: string
  searchPlaceholder: string
  searchAriaLabel: string
  clearSearch: string
  loading: string
  emptyTitle: string
  emptyDescription: string
  resultsCount: (count: number) => string
  selectionCount: (count: number) => string
}

export interface NItemPickerProps<TItem> {
  items: readonly TItem[]
  /** Identidad estable utilizada para selección, foco y renderizado. */
  getItemId: (item: TItem, index: number) => string
  getItemLabel: (item: TItem) => string
  getItemDescription?: (item: TItem) => string | undefined
  /** Texto adicional indexable: código, correo, SKU, alias, etc. */
  getSearchText?: (item: TItem) => string
  groupBy?: (item: TItem) => string | undefined
  renderItem?: (item: TItem, state: NItemPickerRenderState) => ReactNode
  renderLeading?: (item: TItem, state: NItemPickerRenderState) => ReactNode
  renderTrailing?: (item: TItem, state: NItemPickerRenderState) => ReactNode
  selectionMode?: NItemPickerSelectionMode
  selectedIds?: readonly string[]
  defaultSelectedIds?: readonly string[]
  onSelectionChange?: (items: readonly TItem[], ids: readonly string[]) => void
  /** Se ejecuta en cada activación, incluso con `selectionMode="none"`. */
  onItemSelect?: (item: TItem) => void
  searchable?: boolean
  searchValue?: string
  defaultSearchValue?: string
  onSearchValueChange?: (value: string) => void
  filterItem?: (item: TItem, query: string) => boolean
  /** Desactiva el filtrado local para búsquedas remotas controladas. */
  shouldFilter?: boolean
  layout?: NItemPickerLayout
  columns?: NItemPickerColumns
  disabled?: boolean
  isItemDisabled?: (item: TItem) => boolean
  loading?: boolean
  maxHeight?: string | number
  header?: ReactNode
  footer?: ReactNode
  emptyState?: ReactNode
  colorPalette?: string
  labels?: Partial<NItemPickerLabels>
}
