import type { ReactNode } from "react"

import type { NAmountInputProps } from "../amount-input"

export type NAmountAllocationStatus = "under" | "balanced" | "over"
export type NAmountAllocationChangeReason = "update" | "remaining" | "equal" | "reset"

export interface NAmountAllocation<TMethod> {
  method: TMethod
  amount: number
}

export interface NAmountAllocationSummary {
  total: number
  allocated: number
  remaining: number
  status: NAmountAllocationStatus
}

export interface NAmountAllocationChange<TMethod> {
  reason: NAmountAllocationChangeReason
  method?: TMethod
}

export interface NAmountAllocatorMethodState<TMethod> {
  id: string
  index: number
  method: TMethod
  amount: number
  disabled: boolean
  error?: string
  summary: NAmountAllocationSummary
}

export interface NAmountAllocatorLabels {
  allocatorLabel: string
  methodsLabel: string
  total: string
  allocated: string
  remaining: string
  balanced: string
  underAllocated: string
  overAllocated: string
  progressLabel: string
  distributeEvenly: string
  reset: string
  assignRemaining: (methodLabel: string) => string
  amountFor: (methodLabel: string) => string
  loading: string
  errorTitle: string
  emptyTitle: string
  emptyDescription: string
}

export type NAmountAllocatorInputProps = Omit<
  NAmountInputProps,
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "label"
  | "helperText"
  | "errorText"
  | "min"
  | "max"
  | "locale"
  | "formatOptions"
  | "disabled"
  | "readOnly"
  | "invalid"
  | "name"
  | "colorPalette"
  | "labels"
>

export interface NAmountAllocatorProps<TMethod> {
  total: number
  methods: readonly TMethod[]
  getMethodId: (method: TMethod, index: number) => string
  getMethodLabel: (method: TMethod) => string
  getMethodDescription?: (method: TMethod) => string | undefined
  allocations?: readonly NAmountAllocation<TMethod>[]
  defaultAllocations?: readonly NAmountAllocation<TMethod>[]
  onAllocationsChange?: (
    allocations: readonly NAmountAllocation<TMethod>[],
    summary: NAmountAllocationSummary,
    change: NAmountAllocationChange<TMethod>,
  ) => void
  precision?: number
  locale?: string
  formatOptions?: Intl.NumberFormatOptions
  formatAmount?: (amount: number) => ReactNode
  amountInputProps?: NAmountAllocatorInputProps
  allowOverAllocation?: boolean
  allowNegative?: boolean
  showDistributeEvenly?: boolean
  showReset?: boolean
  showAssignRemaining?: boolean
  /** Distribución de cada método. `stacked` evita compresión dentro de paneles estrechos. */
  methodLayout?: "responsive" | "stacked"
  getMethodMin?: (method: TMethod) => number | undefined
  getMethodMax?: (method: TMethod) => number | undefined
  isMethodDisabled?: (method: TMethod) => boolean
  validateAllocation?: (allocation: NAmountAllocation<TMethod>, summary: NAmountAllocationSummary) => string | undefined
  renderMethodLeading?: (method: TMethod, state: NAmountAllocatorMethodState<TMethod>) => ReactNode
  renderMethodTrailing?: (method: TMethod, state: NAmountAllocatorMethodState<TMethod>) => ReactNode
  name?: string
  disabled?: boolean
  readOnly?: boolean
  loading?: boolean
  error?: ReactNode
  header?: ReactNode
  footer?: ReactNode
  emptyState?: ReactNode
  colorPalette?: string
  labels?: Partial<NAmountAllocatorLabels>
}
