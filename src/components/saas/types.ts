import type { ReactNode } from "react"
import type { NComponentStyleProps } from "../styling"
export type NSubscriptionGateSlot = "root" | "content" | "actions"
export type NPlanComparisonSlot = "root" | "grid" | "plan" | "feature" | "value"
export type NAuditLogSlot = "root" | "header" | "list" | "entry" | "empty"
export type NImpersonationBannerSlot = "root" | "content" | "action"

export interface NSubscriptionGateLabels { title: string; description: string; upgrade: string }
export interface NSubscriptionGateProps extends NComponentStyleProps<NSubscriptionGateSlot> { allowed: boolean; children: ReactNode; feature?: string; fallback?: ReactNode; onUpgrade?: () => void; labels?: Partial<NSubscriptionGateLabels> }

export interface NPlanFeature { id: string; label: ReactNode; description?: ReactNode }
export interface NPlan { id: string; name: ReactNode; description?: ReactNode; price?: ReactNode; badge?: ReactNode; features: Record<string, boolean | ReactNode>; action?: ReactNode; highlighted?: boolean }
export interface NPlanComparisonLabels { included: (feature: string, plan: string) => string; notIncluded: (feature: string, plan: string) => string; feature: string }
export interface NPlanComparisonProps extends NComponentStyleProps<NPlanComparisonSlot> { plans: NPlan[]; features: NPlanFeature[]; labels?: Partial<NPlanComparisonLabels> }

export interface NAuditEntry { id: string; action: ReactNode; actor: ReactNode; target?: ReactNode; timestamp: ReactNode; metadata?: ReactNode; severity?: "info" | "warning" | "critical" }
export interface NAuditLogLabels { region: string; empty: string; severity: Record<NonNullable<NAuditEntry["severity"]>, string> }
export interface NAuditLogProps extends NComponentStyleProps<NAuditLogSlot> { entries: NAuditEntry[]; title?: ReactNode; labels?: Omit<Partial<NAuditLogLabels>, "severity"> & { severity?: Partial<NAuditLogLabels["severity"]> }; "aria-label"?: string }

export interface NImpersonationBannerLabels { prefix: string; actorPrefix: string; exit: string; exiting: string }
export interface NImpersonationBannerProps extends NComponentStyleProps<NImpersonationBannerSlot> { subject: ReactNode; actor?: ReactNode; onExit: () => void | Promise<void>; labels?: Partial<NImpersonationBannerLabels>; sticky?: boolean }
