import type { ReactNode } from "react"

export type NSyncState = "synced" | "syncing" | "pending" | "offline" | "error"

export interface NSyncRetryResult {
  success: boolean
  message?: ReactNode
}

export interface NSyncStatusLabels {
  regionLabel: string
  synced: string
  syncing: string
  pending: string
  offline: string
  error: string
  pendingCount: (count: number) => string
  lastSynced: string
  neverSynced: string
  retry: string
  retrying: string
  retryFailed: string
  details: string
}

export interface NSyncStatusProps {
  status: NSyncState
  syncKey?: string
  pendingCount?: number
  lastSyncedAt?: Date | string | number
  message?: ReactNode
  error?: ReactNode
  onRetry?: () => void | boolean | NSyncRetryResult | Promise<void | boolean | NSyncRetryResult>
  formatTimestamp?: (value: Date) => string
  variant?: "compact" | "panel"
  showDetails?: boolean
  details?: ReactNode
  disabled?: boolean
  colorPalette?: string
  labels?: Partial<NSyncStatusLabels>
}
