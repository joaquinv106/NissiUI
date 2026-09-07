import type { ReactNode } from "react"

import type { NAmountAllocation, NAmountAllocationChange, NAmountAllocationSummary, NAmountAllocatorLabels, NAmountAllocatorProps } from "../amount-allocator"

export interface NCheckoutDetails<TMethod> {
  total: number
  allocations: readonly NAmountAllocation<TMethod>[]
  summary: NAmountAllocationSummary
}

export interface NCheckoutResult {
  success: boolean
  message?: ReactNode
}

export interface NCheckoutLabels {
  checkoutLabel: string
  title: string
  reviewLabel: string
  paymentLabel: string
  complete: string
  processing: string
  incomplete: string
  failed: string
  completed: string
}

export interface NCheckoutProps<TMethod> extends Omit<
  NAmountAllocatorProps<TMethod>,
  "allocations" | "defaultAllocations" | "onAllocationsChange" | "header" | "footer" | "labels"
> {
  checkoutKey?: string
  allocations?: readonly NAmountAllocation<TMethod>[]
  defaultAllocations?: readonly NAmountAllocation<TMethod>[]
  onAllocationsChange?: (
    allocations: readonly NAmountAllocation<TMethod>[],
    summary: NAmountAllocationSummary,
    change: NAmountAllocationChange<TMethod>,
  ) => void
  onComplete: (details: NCheckoutDetails<TMethod>) => void | boolean | NCheckoutResult | Promise<void | boolean | NCheckoutResult>
  validate?: (details: NCheckoutDetails<TMethod>) => ReactNode | undefined | Promise<ReactNode | undefined>
  canComplete?: (details: NCheckoutDetails<TMethod>) => boolean
  review?: ReactNode
  header?: ReactNode
  footer?: ReactNode
  allocatorHeader?: ReactNode
  allocatorFooter?: ReactNode
  labels?: Partial<NCheckoutLabels>
  allocatorLabels?: Partial<NAmountAllocatorLabels>
}
