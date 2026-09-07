import type { NCartSummary } from "./types"

function finiteAmount(value: number): number {
  return Number.isFinite(value) ? value : 0
}

export function summarizeCart<TLine>(lines: readonly TLine[], getLineAmount: (line: TLine, index: number) => number): NCartSummary {
  const subtotal = lines.reduce((sum, line, index) => sum + finiteAmount(getLineAmount(line, index)), 0)
  return { subtotal, rows: [], total: subtotal }
}

export function normalizeCartSummary(summary: NCartSummary): NCartSummary {
  return {
    subtotal: finiteAmount(summary.subtotal),
    rows: summary.rows.map((row) => ({ ...row, amount: finiteAmount(row.amount) })),
    total: finiteAmount(summary.total),
  }
}
