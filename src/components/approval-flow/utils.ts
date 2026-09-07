import type { NApprovalDecisionResult, NApprovalFlowLabels, NApprovalStatus } from "./types"

export function approvalStatusLabel(status: NApprovalStatus, labels: NApprovalFlowLabels): string {
  if (status === "approved") return labels.approved
  if (status === "rejected") return labels.rejected
  if (status === "changes-requested") return labels.changesRequested
  return labels.pending
}

export function approvalStatusPalette(status: NApprovalStatus): string {
  if (status === "approved") return "green"
  if (status === "rejected") return "red"
  if (status === "changes-requested") return "orange"
  return "blue"
}

export function formatApprovalTimestamp(timestamp: Date | string | number, locale?: string): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date)
}

export function approvalTimestampDateTime(timestamp: Date | string | number): string | undefined {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

export function decisionSucceeded(result: void | boolean | NApprovalDecisionResult): boolean {
  if (result === false) return false
  if (typeof result === "object" && result !== null) return result.success
  return true
}

export function decisionMessage(result: void | boolean | NApprovalDecisionResult): NApprovalDecisionResult["message"] {
  return typeof result === "object" && result !== null ? result.message : undefined
}
