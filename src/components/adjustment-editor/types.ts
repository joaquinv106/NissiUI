import type { ReactNode } from "react"
import type { NComponentStyleProps } from "../styling"
export type NAdjustmentEditorSlot = "root" | "error" | "loading"

export type NAdjustmentValue = string | number | boolean | null
export type NAdjustmentInputType = "text" | "number" | "textarea" | "select"

export interface NAdjustmentOption {
  label: ReactNode
  value: string | number
  disabled?: boolean
}

export interface NAdjustmentField<T> {
  id: string
  label: ReactNode
  getValue: (value: T) => NAdjustmentValue
  setValue: (value: T, fieldValue: NAdjustmentValue) => T
  inputType?: NAdjustmentInputType
  options?: readonly NAdjustmentOption[]
  placeholder?: string
  helperText?: ReactNode
  formatValue?: (value: NAdjustmentValue, item: T) => ReactNode
  parseValue?: (rawValue: string, item: T) => NAdjustmentValue
  validate?: (value: NAdjustmentValue, item: T) => string | undefined
  isEqual?: (original: NAdjustmentValue, adjusted: NAdjustmentValue) => boolean
  disabled?: boolean
}

export interface NAdjustmentChangeDetails<T> {
  itemId: string
  fieldId?: string
  reason: "field" | "reset"
  changedFieldIds: readonly string[]
  original: T
}

export interface NAdjustmentSubmitDetails<T> {
  itemId: string
  original: T
  adjustment: T
  reason: string
  changedFieldIds: readonly string[]
}

export interface NAdjustmentResult {
  success: boolean
  message?: ReactNode
}

export interface NAdjustmentRenderContext<T> {
  original: T
  adjustment: T
  update: (next: T | ((current: T) => T), fieldId?: string) => void
  disabled: boolean
  busy: boolean
  changedFieldIds: readonly string[]
  errors: Readonly<Record<string, string>>
}

export interface NAdjustmentEditorLabels {
  editorLabel: string
  originalTitle: string
  adjustmentTitle: string
  originalValue: string
  adjustedValue: string
  changed: string
  reasonLabel: string
  reasonPlaceholder: string
  reasonHelp: string
  reasonRequired: string
  noChanges: string
  reset: string
  submit: string
  processing: string
  validationFailed: string
  submitFailed: string
  loading: string
  errorTitle: string
  emptyTitle: string
  emptyDescription: string
}

export interface NAdjustmentEditorProps<T> extends NComponentStyleProps<NAdjustmentEditorSlot> {
  item?: T | null
  getItemId: (item: T) => string
  getItemTitle: (item: T) => ReactNode
  getItemDescription?: (item: T) => ReactNode
  createAdjustment: (item: T) => T
  fields?: readonly NAdjustmentField<T>[]
  value?: T
  onValueChange?: (value: T, details: NAdjustmentChangeDetails<T>) => void
  reason?: string
  defaultReason?: string
  onReasonChange?: (reason: string) => void
  requireReason?: boolean
  validate?: (details: NAdjustmentSubmitDetails<T>) => string | undefined | Promise<string | undefined>
  onSubmit?: (details: NAdjustmentSubmitDetails<T>) => void | boolean | NAdjustmentResult | Promise<void | boolean | NAdjustmentResult>
  renderOriginal?: (item: T) => ReactNode
  renderEditor?: (context: NAdjustmentRenderContext<T>) => ReactNode
  disabled?: boolean
  readOnly?: boolean
  loading?: boolean
  error?: ReactNode
  emptyState?: ReactNode
  header?: ReactNode
  footer?: ReactNode
  colorPalette?: string
  labels?: Partial<NAdjustmentEditorLabels>
}
