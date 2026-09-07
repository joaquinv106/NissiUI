import type { ReactElement, ReactNode, RefObject } from "react"

export interface NBreadcrumbItem {
  id: string
  label: ReactNode
  href?: string
  icon?: ReactNode
  current?: boolean
  disabled?: boolean
  onClick?: () => void
}

export interface NBreadcrumbsLabels {
  navigationLabel: string
  overflowLabel: string
}

export interface NBreadcrumbsProps {
  items: readonly NBreadcrumbItem[]
  maxItems?: number
  separator?: ReactNode
  labels?: Partial<NBreadcrumbsLabels>
}

export interface NPageHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  eyebrow?: ReactNode
  breadcrumbs?: ReactNode
  leading?: ReactNode
  actions?: ReactNode
  metadata?: ReactNode
  backAction?: { label: string; onClick: () => void }
  level?: 1 | 2
  colorPalette?: string
}

export interface NEmptyStateLabels {
  defaultTitle: string
  defaultDescription: string
}

export interface NEmptyStateProps {
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
  compact?: boolean
  colorPalette?: string
  labels?: Partial<NEmptyStateLabels>
}

export type NAsyncStatus = "idle" | "loading" | "error" | "empty" | "success"

export interface NAsyncStateLabels {
  loading: string
  errorTitle: string
  errorDescription: string
  retry: string
  emptyTitle: string
  emptyDescription: string
}

export interface NAsyncStateProps {
  status: NAsyncStatus
  children?: ReactNode
  error?: ReactNode
  onRetry?: () => void | Promise<void>
  loadingFallback?: ReactNode
  errorFallback?: ReactNode
  emptyFallback?: ReactNode
  skeletonLines?: number
  minHeight?: string
  labels?: Partial<NAsyncStateLabels>
}

export interface NConfirmDialogLabels {
  defaultTitle: string
  defaultDescription: string
  confirm: string
  confirming: string
  cancel: string
  close: string
  failed: string
}

export interface NConfirmDialogResult {
  success: boolean
  message?: ReactNode
}

export interface NConfirmDialogProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactElement
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  confirmColorPalette?: string
  destructive?: boolean
  disabled?: boolean
  closeOnEscape?: boolean
  closeOnInteractOutside?: boolean
  returnFocusRef?: RefObject<HTMLElement | null>
  onConfirm: () => void | boolean | NConfirmDialogResult | Promise<void | boolean | NConfirmDialogResult>
  labels?: Partial<NConfirmDialogLabels>
}
