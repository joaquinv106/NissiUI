import type { ReactNode } from "react"

import type { NItemPickerProps } from "../item-picker"

export type NLineItemValue = string | number
export type NLineItemInputType = "text" | "number" | "select"
export type NLineItemChangeReason = "add" | "update" | "remove" | "reorder"

export interface NLineItemOption {
  label: string
  value: NLineItemValue
  disabled?: boolean
}

export interface NLineItemFieldRenderState<TLine> {
  line: TLine
  lineId: string
  index: number
  value: NLineItemValue
  disabled: boolean
  error?: string
  updateValue: (value: NLineItemValue) => void
  updateLine: (line: TLine) => void
}

export interface NLineItemField<TLine> {
  id: string
  header: string
  getValue: (line: TLine) => NLineItemValue
  /** Si se omite, el campo se presenta como s\u00f3lo lectura. */
  setValue?: (line: TLine, value: NLineItemValue) => TLine
  inputType?: NLineItemInputType
  options?: readonly NLineItemOption[]
  placeholder?: string
  width?: string
  align?: "start" | "center" | "end"
  min?: number
  max?: number
  step?: number
  parseValue?: (rawValue: string, line: TLine) => NLineItemValue
  formatValue?: (value: NLineItemValue, line: TLine) => ReactNode
  validate?: (value: NLineItemValue, line: TLine) => string | undefined
  render?: (state: NLineItemFieldRenderState<TLine>) => ReactNode
}

export interface NLineItemChange<TItem, TLine> {
  reason: NLineItemChangeReason
  line?: TLine
  item?: TItem
  fieldId?: string
  fromIndex?: number
  toIndex?: number
}

export interface NLineItemAddContext<TLine> {
  lines: readonly TLine[]
}

export interface NLineItemResolveAddContext<TItem, TLine> {
  item: TItem
  line: TLine
  lines: readonly TLine[]
}

export interface NLineItemRenderState<TLine> {
  id: string
  index: number
  disabled: boolean
  line: TLine
}

export interface NLineItemEditorLabels {
  editorLabel: string
  itemColumn: string
  addItems: string
  closeItems: string
  loading: string
  errorTitle: string
  emptyTitle: string
  emptyDescription: string
  lineCount: (count: number) => string
  removeLine: (lineLabel: string) => string
  moveLineUp: (lineLabel: string) => string
  moveLineDown: (lineLabel: string) => string
  editField: (fieldLabel: string, lineLabel: string) => string
}

export type NLineItemPickerProps<TItem> = Omit<
  NItemPickerProps<TItem>,
  | "items"
  | "getItemId"
  | "getItemLabel"
  | "selectionMode"
  | "selectedIds"
  | "defaultSelectedIds"
  | "onSelectionChange"
  | "onItemSelect"
  | "disabled"
  | "isItemDisabled"
  | "loading"
  | "colorPalette"
>

export interface NLineItemEditorProps<TItem, TLine> {
  items: readonly TItem[]
  getItemId: (item: TItem, index: number) => string
  getItemLabel: (item: TItem) => string
  createLine: (item: TItem, context: NLineItemAddContext<TLine>) => TLine
  /** Identidad estable de cada partida. */
  getLineId: (line: TLine, index: number) => string
  getLineLabel: (line: TLine) => string
  getLineDescription?: (line: TLine) => string | undefined
  fields?: readonly NLineItemField<TLine>[]
  lines?: readonly TLine[]
  defaultLines?: readonly TLine[]
  onLinesChange?: (lines: readonly TLine[], change: NLineItemChange<TItem, TLine>) => void
  /** Permite fusionar, reemplazar o rechazar duplicados. Por defecto agrega la nueva partida al final. */
  resolveAdd?: (context: NLineItemResolveAddContext<TItem, TLine>) => readonly TLine[]
  pickerProps?: NLineItemPickerProps<TItem>
  pickerOpen?: boolean
  defaultPickerOpen?: boolean
  onPickerOpenChange?: (open: boolean) => void
  isItemDisabled?: (item: TItem, lines: readonly TLine[]) => boolean
  isLineDisabled?: (line: TLine) => boolean
  canRemoveLine?: (line: TLine) => boolean
  canReorderLine?: (line: TLine) => boolean
  renderLineLeading?: (line: TLine, state: NLineItemRenderState<TLine>) => ReactNode
  renderLineActions?: (line: TLine, state: NLineItemRenderState<TLine>) => ReactNode
  reorderable?: boolean
  removable?: boolean
  readOnly?: boolean
  disabled?: boolean
  loading?: boolean
  error?: ReactNode
  header?: ReactNode
  footer?: ReactNode
  emptyState?: ReactNode
  colorPalette?: string
  labels?: Partial<NLineItemEditorLabels>
}
