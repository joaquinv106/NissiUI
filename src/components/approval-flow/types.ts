import type { ReactNode } from "react"

export type NApprovalStatus = "pending" | "approved" | "rejected" | "changes-requested"

export interface NApprovalAction {
  id: string
  label: ReactNode
  status: NApprovalStatus
  colorPalette?: string
  variant?: "solid" | "outline" | "subtle" | "ghost"
  requiresComment?: boolean
}

export interface NApprovalHistoryEntry {
  id: string
  status: NApprovalStatus
  title?: ReactNode
  actor?: ReactNode
  comment?: ReactNode
  timestamp?: Date | string | number
}

export interface NApprovalDecisionDetails {
  requestId: string
  actionId: string
  status: NApprovalStatus
  comment: string
}

export interface NApprovalDecisionResult {
  success: boolean
  message?: ReactNode
}

export interface NApprovalFlowContext<TRequest> {
  request: TRequest
  requestId: string
  status: NApprovalStatus
  busy: boolean
  disabled: boolean
}

export interface NApprovalFlowLabels {
  flowLabel: string
  statusLabel: string
  pending: string
  approved: string
  rejected: string
  changesRequested: string
  approve: string
  reject: string
  requestChanges: string
  commentLabel: string
  commentPlaceholder: string
  commentHelp: string
  commentRequired: string
  processing: string
  decisionFailed: string
  historyTitle: string
  noHistory: string
  actorFallback: string
  loading: string
  errorTitle: string
  emptyTitle: string
  emptyDescription: string
}

export interface NApprovalFlowProps<TRequest> {
  request?: TRequest | null
  getRequestId: (request: TRequest) => string
  getRequestTitle: (request: TRequest) => ReactNode
  getRequestDescription?: (request: TRequest) => ReactNode
  status?: NApprovalStatus
  defaultStatus?: NApprovalStatus
  onStatusChange?: (status: NApprovalStatus, details: NApprovalDecisionDetails) => void
  onDecision?: (
    request: TRequest,
    details: NApprovalDecisionDetails,
  ) => void | boolean | NApprovalDecisionResult | Promise<void | boolean | NApprovalDecisionResult>
  actions?: readonly NApprovalAction[]
  history?: readonly NApprovalHistoryEntry[]
  canPerformAction?: (request: TRequest, action: NApprovalAction) => boolean
  renderRequest?: (request: TRequest, context: NApprovalFlowContext<TRequest>) => ReactNode
  renderHistoryEntry?: (entry: NApprovalHistoryEntry, index: number) => ReactNode
  formatTimestamp?: (timestamp: Date | string | number) => ReactNode
  allowRepeatDecisions?: boolean
  showHistory?: boolean
  defaultComment?: string
  disabled?: boolean
  readOnly?: boolean
  loading?: boolean
  error?: ReactNode
  emptyState?: ReactNode
  header?: ReactNode
  footer?: ReactNode
  locale?: string
  colorPalette?: string
  labels?: Partial<NApprovalFlowLabels>
}
