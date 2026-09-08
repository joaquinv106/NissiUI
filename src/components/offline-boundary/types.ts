import type { ReactNode } from "react"
import type { NComponentStyleProps } from "../styling"
export type NOfflineBoundarySlot = "root" | "banner"

export type NOfflineBoundaryBehavior = "banner" | "fallback"

export interface NConnectivityCheckResult {
  online: boolean
  message?: ReactNode
}

export interface NOfflineBoundaryLabels {
  regionLabel: string
  offlineTitle: string
  offlineDescription: string
  onlineRestored: string
  queuedChanges: (count: number) => string
  retry: string
  checking: string
  retryFailed: string
}

export interface NOfflineBoundaryProps extends NComponentStyleProps<NOfflineBoundarySlot> {
  children: ReactNode
  online?: boolean
  defaultOnline?: boolean
  onOnlineChange?: (online: boolean) => void
  detectBrowserEvents?: boolean
  behavior?: NOfflineBoundaryBehavior
  fallback?: ReactNode
  queuedCount?: number
  onCheckConnectivity?: () => boolean | NConnectivityCheckResult | Promise<boolean | NConnectivityCheckResult>
  showOnlineStatus?: boolean
  disabled?: boolean
  colorPalette?: string
  labels?: Partial<NOfflineBoundaryLabels>
}
