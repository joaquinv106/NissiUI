import type { ReactNode } from "react"

import type { NBalanceSessionResult, NBalanceSessionStatus, NBalanceSessionSummary } from "./types"

export function createBalanceSummary(
  openingAmount: number,
  movementAmount: number,
  countedAmount: number | null,
  tolerance: number,
  forcedStatus?: NBalanceSessionStatus,
): NBalanceSessionSummary {
  const expectedAmount = openingAmount + movementAmount
  const difference = countedAmount === null ? null : countedAmount - expectedAmount
  const status = forcedStatus ?? (countedAmount === null ? "open" : Math.abs(difference ?? 0) <= Math.max(0, tolerance) ? "balanced" : "variance")
  return { openingAmount, movementAmount, expectedAmount, countedAmount, difference, status }
}

export function balanceResultSucceeded(result: void | boolean | NBalanceSessionResult): boolean {
  return result !== false && !(typeof result === "object" && result !== null && !result.success)
}

export function balanceResultMessage(result: void | boolean | NBalanceSessionResult): ReactNode {
  return typeof result === "object" && result !== null ? result.message : undefined
}
