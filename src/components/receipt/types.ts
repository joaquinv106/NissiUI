import type { ReactNode } from "react"

import type { NDocumentField, NDocumentSection, NDocumentViewLabels, NDocumentViewProps } from "../document-view"

export interface NReceiptSummaryRow {
  id: string
  label: ReactNode
  amount: number
}

export interface NReceiptLabels {
  receiptLabel: string
  title: string
  number: string
  date: string
  linesLabel: string
  item: string
  quantity: string
  unitAmount: string
  lineTotal: string
  summaryLabel: string
  total: string
  emptyLines: string
}

export interface NReceiptProps<TReceipt, TLine> extends Omit<
  NDocumentViewProps<TReceipt>,
  | "document"
  | "getDocumentId"
  | "getDocumentTitle"
  | "getDocumentSubtitle"
  | "getDocumentStatus"
  | "getStatusColorPalette"
  | "fields"
  | "sections"
  | "renderHeader"
  | "renderBody"
  | "renderFooter"
  | "labels"
> {
  receipt?: TReceipt | null
  getReceiptId: (receipt: TReceipt) => string
  getReceiptNumber: (receipt: TReceipt) => ReactNode
  getReceiptTitle?: (receipt: TReceipt) => ReactNode
  getReceiptDate?: (receipt: TReceipt) => Date | string | number | undefined
  getReceiptStatus?: (receipt: TReceipt) => ReactNode
  getStatusColorPalette?: (receipt: TReceipt) => string
  getLines: (receipt: TReceipt) => readonly TLine[]
  getLineId: (line: TLine, index: number) => string
  getLineLabel: (line: TLine) => ReactNode
  getLineDescription?: (line: TLine) => ReactNode
  getLineQuantity?: (line: TLine) => ReactNode
  getLineUnitAmount?: (line: TLine) => number
  getLineTotal: (line: TLine) => number
  getSummaryRows?: (receipt: TReceipt) => readonly NReceiptSummaryRow[]
  getTotal: (receipt: TReceipt) => number
  metadata?: readonly NDocumentField<TReceipt>[]
  sections?: readonly NDocumentSection<TReceipt>[]
  formatAmount?: (amount: number) => ReactNode
  formatDate?: (date: Date) => ReactNode
  locale?: string
  formatOptions?: Intl.NumberFormatOptions
  beforeLines?: ReactNode
  afterLines?: ReactNode
  renderReceiptHeader?: (receipt: TReceipt) => ReactNode
  renderReceiptFooter?: (receipt: TReceipt) => ReactNode
  labels?: Partial<NReceiptLabels>
  documentLabels?: Partial<NDocumentViewLabels>
}
