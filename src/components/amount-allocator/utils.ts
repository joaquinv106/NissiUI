import type { NAmountAllocationStatus, NAmountAllocationSummary } from "./types"

export function roundAmount(value: number, precision = 2): number {
  const safePrecision = Math.max(0, Math.min(12, Math.trunc(precision)))
  const factor = 10 ** safePrecision
  const rounded = Math.round((value + Number.EPSILON) * factor) / factor
  return Object.is(rounded, -0) ? 0 : rounded
}

export function summarizeAmounts(total: number, amounts: readonly number[], precision = 2): NAmountAllocationSummary {
  const safeTotal = roundAmount(total, precision)
  const allocated = roundAmount(amounts.reduce((sum, amount) => sum + amount, 0), precision)
  const remaining = roundAmount(safeTotal - allocated, precision)
  const threshold = 0.5 / (10 ** Math.max(0, Math.min(12, Math.trunc(precision))))
  const status: NAmountAllocationStatus = Math.abs(remaining) < threshold ? "balanced" : remaining > 0 ? "under" : "over"
  return { total: safeTotal, allocated, remaining: status === "balanced" ? 0 : remaining, status }
}

export function distributeAmountEvenly(total: number, count: number, precision = 2): number[] {
  if (count <= 0) return []
  const safePrecision = Math.max(0, Math.min(12, Math.trunc(precision)))
  const factor = 10 ** safePrecision
  const totalUnits = Math.round(total * factor)
  const baseUnits = Math.trunc(totalUnits / count)
  let remainder = totalUnits - (baseUnits * count)
  return Array.from({ length: count }, () => {
    const adjustment = remainder === 0 ? 0 : remainder > 0 ? 1 : -1
    remainder -= adjustment
    return (baseUnits + adjustment) / factor
  })
}
