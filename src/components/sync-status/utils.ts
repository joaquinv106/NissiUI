import type { ReactNode } from "react"
import type { NSyncRetryResult } from "./types"

export function syncRetrySucceeded(result: void | boolean | NSyncRetryResult): boolean {
  return result !== false && !(typeof result === "object" && result !== null && !result.success)
}

export function syncRetryMessage(result: void | boolean | NSyncRetryResult): ReactNode {
  return typeof result === "object" && result !== null ? result.message : undefined
}

export function toValidSyncDate(value?: Date | string | number): Date | undefined {
  if (value === undefined) return undefined
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}
