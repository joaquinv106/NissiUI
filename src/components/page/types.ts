import type { ReactElement, ReactNode, RefObject } from "react"
import type { NComponentStyleProps } from "../styling"

export type NBreadcrumbsSlot = "root" | "list" | "item" | "separator" | "menu"
export type NPageHeaderSlot = "root" | "breadcrumbs" | "backAction" | "content" | "title" | "subtitle" | "metadata" | "actions"
export type NEmptyStateSlot = "root" | "icon" | "title" | "description" | "actions"
export type NAsyncStateSlot = "root" | "loading" | "error" | "empty" | "content"
export type NConfirmDialogSlot = "trigger" | "backdrop" | "positioner" | "content" | "header" | "body" | "error" | "footer" | "close"

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

export interface NBreadcrumbsProps extends NComponentStyleProps<NBreadcrumbsSlot> {
  items: readonly NBreadcrumbItem[]
  maxItems?: number
  separator?: ReactNode
  labels?: Partial<NBreadcrumbsLabels>
}

export interface NPageHeaderProps extends NComponentStyleProps<NPageHeaderSlot> {
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

export interface NEmptyStateProps extends NComponentStyleProps<NEmptyStateSlot> {
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

export interface NAsyncStateProps extends NComponentStyleProps<NAsyncStateSlot> {
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

export interface NConfirmDialogProps extends NComponentStyleProps<NConfirmDialogSlot> {
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
