import type { ReactElement, ReactNode } from "react"
import type { NComponentStyleProps } from "../styling"

export type NFileUploadSlot = "root" | "label" | "dropzone" | "fileList" | "file" | "error"
export type NActivityTimelineSlot = "root" | "item" | "marker" | "content"
export type NNotificationCenterSlot = "root" | "trigger" | "content" | "header" | "list" | "item" | "empty"

export interface NFileUploadLabels { label: string; description: string; browse: string; remove: (name: string) => string; rejected: string }
export interface NFileUploadProps extends NComponentStyleProps<NFileUploadSlot> {
  files?: File[]
  defaultFiles?: File[]
  onFilesChange?: (files: File[]) => void
  onRejected?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
  labels?: Partial<NFileUploadLabels>
}

export interface NActivityItem {
  id: string
  title: ReactNode
  description?: ReactNode
  timestamp?: ReactNode
  icon?: ReactNode
  colorPalette?: string
  content?: ReactNode
}
export interface NActivityTimelineProps extends NComponentStyleProps<NActivityTimelineSlot> { items: NActivityItem[]; compact?: boolean; "aria-label"?: string }

export interface NNotification {
  id: string
  title: ReactNode
  description?: ReactNode
  timestamp?: ReactNode
  read?: boolean
  icon?: ReactNode
}
export interface NNotificationCenterLabels { trigger: string; title: string; markAllRead: string; empty: string; unreadCount: (count: number) => string }
export interface NNotificationCenterProps extends NComponentStyleProps<NNotificationCenterSlot> {
  notifications: NNotification[]
  trigger?: ReactElement
  onSelect?: (notification: NNotification) => void
  onMarkRead?: (id: string) => void
  onMarkAllRead?: () => void
  labels?: Partial<NNotificationCenterLabels>
}
