import type { ReactNode } from "react"

import type { NComponentStyleProps } from "../styling"

export interface NDocumentField<TDocument> {
  id: string
  label: ReactNode
  getValue: (document: TDocument) => ReactNode
  colSpan?: 1 | 2 | 3 | "full"
}

export interface NDocumentSection<TDocument> {
  id: string
  title?: ReactNode
  description?: ReactNode
  render: (document: TDocument) => ReactNode
}

export interface NDocumentAction<TDocument> {
  id: string
  label: ReactNode
  icon?: ReactNode
  colorPalette?: string
  variant?: "solid" | "outline" | "subtle" | "ghost"
  onAction: (document: TDocument) => void | boolean | NDocumentActionResult | Promise<void | boolean | NDocumentActionResult>
}

export interface NDocumentActionResult {
  success: boolean
  message?: ReactNode
}

export interface NDocumentViewContext<TDocument> {
  document: TDocument
  documentId: string
  busyActionId?: string
  disabled: boolean
}

export interface NDocumentViewLabels {
  documentLabel: string
  metadataLabel: string
  actionsLabel: string
  processing: string
  actionFailed: string
  print: string
  loading: string
  errorTitle: string
  emptyTitle: string
  emptyDescription: string
}

export type NDocumentViewSlot =
  | "root"
  | "actions"
  | "error"
  | "loading"
  | "empty"
  | "document"
  | "documentHeader"
  | "title"
  | "metadata"
  | "section"
  | "documentFooter"

export interface NDocumentViewProps<TDocument> extends NComponentStyleProps<NDocumentViewSlot> {
  document?: TDocument | null
  getDocumentId: (document: TDocument) => string
  getDocumentTitle: (document: TDocument) => ReactNode
  getDocumentSubtitle?: (document: TDocument) => ReactNode
  getDocumentStatus?: (document: TDocument) => ReactNode
  getStatusColorPalette?: (document: TDocument) => string
  fields?: readonly NDocumentField<TDocument>[]
  sections?: readonly NDocumentSection<TDocument>[]
  actions?: readonly NDocumentAction<TDocument>[]
  canPerformAction?: (document: TDocument, action: NDocumentAction<TDocument>) => boolean
  renderHeader?: (context: NDocumentViewContext<TDocument>) => ReactNode
  renderBody?: (context: NDocumentViewContext<TDocument>) => ReactNode
  renderFooter?: (context: NDocumentViewContext<TDocument>) => ReactNode
  showPrint?: boolean
  onPrint?: (document: TDocument) => void
  variant?: "paper" | "plain"
  columns?: 1 | 2 | 3
  disabled?: boolean
  loading?: boolean
  error?: ReactNode
  emptyState?: ReactNode
  header?: ReactNode
  footer?: ReactNode
  colorPalette?: string
  labels?: Partial<NDocumentViewLabels>
}
