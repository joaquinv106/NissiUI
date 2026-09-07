import type { ReactNode } from "react"

import type { NLineItemChangeReason, NLineItemEditorLabels, NLineItemEditorProps } from "../line-item-editor"

export interface NCartSummaryRow {
  id: string
  label: ReactNode
  amount: number
}

export interface NCartSummary {
  subtotal: number
  rows: readonly NCartSummaryRow[]
  total: number
}

export type NCartChangeReason = NLineItemChangeReason | "clear"

export interface NCartChange<TItem, TLine> {
  reason: NCartChangeReason
  line?: TLine
  item?: TItem
  fieldId?: string
  fromIndex?: number
  toIndex?: number
}

export interface NCartLabels {
  cartLabel: string
  title: string
  summaryLabel: string
  subtotal: string
  total: string
  clear: string
}

export interface NCartProps<TItem, TLine> extends Omit<
  NLineItemEditorProps<TItem, TLine>,
  "lines" | "defaultLines" | "onLinesChange" | "header" | "footer" | "labels"
> {
  lines?: readonly TLine[]
  defaultLines?: readonly TLine[]
  cartKey?: string
  onLinesChange?: (lines: readonly TLine[], change: NCartChange<TItem, TLine>) => void
  getLineAmount: (line: TLine, index: number) => number
  calculateSummary?: (lines: readonly TLine[]) => NCartSummary
  formatAmount?: (amount: number) => ReactNode
  locale?: string
  formatOptions?: Intl.NumberFormatOptions
  showClear?: boolean
  renderSummary?: (summary: NCartSummary, lines: readonly TLine[]) => ReactNode
  header?: ReactNode
  footer?: ReactNode
  editorHeader?: ReactNode
  editorFooter?: ReactNode
  labels?: Partial<NCartLabels>
  editorLabels?: Partial<NLineItemEditorLabels>
}
