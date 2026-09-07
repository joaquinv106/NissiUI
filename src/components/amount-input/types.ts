import type { ReactNode } from "react"

export interface NAmountInputQuickValue {
  value: number
  label?: string
}

export type NAmountInputChangeReason = "input" | "quick-value"

export interface NAmountInputChangeDetails {
  value: number | null
  valueText: string
  reason: NAmountInputChangeReason
}

export interface NAmountInputLabels {
  amountAriaLabel: string
  increment: string
  decrement: string
  quickValuesLabel: string
  quickValue: (value: number) => string
}

export interface NAmountInputProps {
  value?: number | null
  defaultValue?: number | null
  onValueChange?: (value: number | null, details: NAmountInputChangeDetails) => void
  label?: ReactNode
  helperText?: ReactNode
  errorText?: ReactNode
  min?: number
  max?: number
  step?: number
  locale?: string
  formatOptions?: Intl.NumberFormatOptions
  quickValues?: readonly NAmountInputQuickValue[]
  showControls?: boolean
  allowOverflow?: boolean
  clampValueOnBlur?: boolean
  allowMouseWheel?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  id?: string
  name?: string
  placeholder?: string
  size?: "xs" | "sm" | "md" | "lg"
  variant?: "outline" | "subtle" | "flushed"
  textAlign?: "start" | "center" | "end"
  width?: string | number
  colorPalette?: string
  labels?: Partial<NAmountInputLabels>
}
