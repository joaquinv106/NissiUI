import type { ReactNode } from "react"

import type { NPermissionCapability, NPermissionMode } from "../permissions/types"

export type NFormRow = Record<string, unknown>

export type NFormFieldType =
  | "text"
  | "email"
  | "password"
  | "tel"
  | "url"
  | "number"
  | "currency"
  | "textarea"
  | "select"
  | "multiselect"
  | "checkbox"
  | "switch"
  | "radio"
  | "date"
  | "datetime"
  | "hidden"
  | "custom"

export type NFormMode = "create" | "edit"

export interface NFormOption {
  label: string
  value: string
}

export interface NFormFieldValidation<T extends NFormRow = NFormRow> {
  /** `true` usa el mensaje predeterminado; una cadena reemplaza el mensaje. */
  required?: boolean | string
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  patternMessage?: string
  /** Validación asíncrona o síncrona adicional; retorna el mensaje de error o `undefined`. */
  validate?: (value: unknown, values: Partial<T>) => string | undefined | Promise<string | undefined>
}

export interface NFormFieldRenderProps<T extends NFormRow = NFormRow> {
  field: NFormField<T>
  value: unknown
  values: Partial<T>
  error?: string
  disabled: boolean
  onChange: (value: unknown) => void
  onBlur: () => void
}

export interface NFormField<T extends NFormRow = NFormRow> {
  key: Extract<keyof T, string>
  label: string
  type?: NFormFieldType
  placeholder?: string
  helperText?: string
  /** Agrupa el campo bajo un `NFormSection.id`. */
  section?: string
  /** Columnas ocupadas dentro de la rejilla responsive (1, 2, 3 o "full"). */
  colSpan?: 1 | 2 | 3 | "full"
  options?: NFormOption[]
  disabled?: boolean
  hidden?: boolean | ((values: Partial<T>) => boolean)
  defaultValue?: unknown
  validation?: NFormFieldValidation<T>
  currency?: string
  locale?: string
  /** Oculta el campo cuando el usuario no tiene esta capacidad (rol o microservicio contratado). */
  requiredPermission?: NPermissionCapability | NPermissionCapability[]
  permissionMode?: NPermissionMode
  /** Reemplaza el control por defecto para el campo. */
  render?: (props: NFormFieldRenderProps<T>) => ReactNode
}

export interface NFormSection {
  id: string
  title?: string
  description?: string
  columns?: 1 | 2 | 3
}

export interface NFormConfig<T extends NFormRow = NFormRow> {
  fields: NFormField<T>[]
  sections?: NFormSection[]
}

export interface NFormSubmitResult {
  success: boolean
  message?: string
  /** Errores de campo devueltos por el backend, indexados por `key`. */
  errors?: Record<string, string>
}

export interface NFormLabels {
  requiredError: string
  minError: (min: number) => string
  maxError: (max: number) => string
  minLengthError: (min: number) => string
  maxLengthError: (max: number) => string
  patternError: string
  selectPlaceholder: string
  create: string
  save: string
  cancel: string
  reset: string
  yes: string
  no: string
  submitSuccess: string
  submitError: string
  requiredFieldsNote: string
}

export interface NFormProps<T extends NFormRow = NFormRow> {
  config: NFormConfig<T>
  mode?: NFormMode
  /** Valores iniciales; su presencia infiere `mode="edit"` cuando `mode` no se especifica. */
  data?: Partial<T>
  title?: string
  subtitle?: string
  card?: boolean
  variant?: "outline" | "elevated" | "plain"
  colorPalette?: string
  /** Columnas de la rejilla responsive en escritorio; móvil siempre usa 1. */
  columns?: 1 | 2 | 3
  onSubmit: (values: T, mode: NFormMode) => NFormSubmitResult | Promise<NFormSubmitResult>
  onCancel?: () => void
  onChange?: (values: Partial<T>) => void
  /** Limpia el formulario a los valores iniciales tras un envío exitoso en modo `create`. */
  resetOnSuccess?: boolean
  actions?: ReactNode
  labels?: Partial<NFormLabels>
}
