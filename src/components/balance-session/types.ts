import type { ReactNode } from "react"
import type { NComponentStyleProps } from "../styling"
export type NBalanceSessionSlot = "root" | "error" | "loading"

export type NBalanceSessionStatus = "open" | "balanced" | "variance" | "closed"

export interface NBalanceSessionSummary {
  openingAmount: number
  movementAmount: number
  expectedAmount: number
  countedAmount: number | null
  difference: number | null
  status: NBalanceSessionStatus
}

export interface NBalanceSessionCloseDetails {
  sessionId: string
  countedAmount: number
  summary: NBalanceSessionSummary
}

export interface NBalanceSessionResult {
  success: boolean
  message?: ReactNode
}

export interface NBalanceSessionLabels {
  sessionLabel: string
  openingAmount: string
  movements: string
  expectedAmount: string
  countedAmount: string
  difference: string
  open: string
  balanced: string
  variance: string
  closed: string
  entriesTitle: string
  noEntries: string
  countedRequired: string
  varianceBlocked: string
  close: string
  processing: string
  closeFailed: string
  loading: string
  errorTitle: string
  emptyTitle: string
  emptyDescription: string
}

export interface NBalanceSessionProps<TEntry> extends NComponentStyleProps<NBalanceSessionSlot> {
  sessionId: string
  entries: readonly TEntry[]
  openingAmount?: number
  getEntryId: (entry: TEntry, index: number) => string
  getEntryLabel: (entry: TEntry) => ReactNode
  getEntryAmount: (entry: TEntry) => number
  getEntryDescription?: (entry: TEntry) => ReactNode
  countedAmount?: number | null
  defaultCountedAmount?: number | null
  onCountedAmountChange?: (amount: number | null, summary: NBalanceSessionSummary) => void
  status?: NBalanceSessionStatus
  tolerance?: number
  allowCloseWithVariance?: boolean
  onClose?: (details: NBalanceSessionCloseDetails) => void | boolean | NBalanceSessionResult | Promise<void | boolean | NBalanceSessionResult>
  formatAmount?: (amount: number) => ReactNode
  locale?: string
  formatOptions?: Intl.NumberFormatOptions
  renderEntry?: (entry: TEntry, index: number) => ReactNode
  renderSummary?: (summary: NBalanceSessionSummary) => ReactNode
  showEntries?: boolean
  disabled?: boolean
  readOnly?: boolean
  loading?: boolean
  error?: ReactNode
  emptyState?: ReactNode
  header?: ReactNode
  footer?: ReactNode
  colorPalette?: string
  labels?: Partial<NBalanceSessionLabels>
}
