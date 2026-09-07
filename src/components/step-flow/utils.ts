import type { NStepFlowStateUpdater, NStepFlowStep } from "./types"

export function resolveStepState<TState>(current: TState, updater: NStepFlowStateUpdater<TState>): TState {
  return typeof updater === "function" ? (updater as (state: TState) => TState)(current) : updater
}

export function findStepIndex<TState>(steps: readonly NStepFlowStep<TState>[], stepId: string | undefined): number {
  const requestedIndex = stepId ? steps.findIndex((step) => step.id === stepId) : -1
  if (requestedIndex >= 0 && !steps[requestedIndex]?.disabled) return requestedIndex
  return steps.findIndex((step) => !step.disabled)
}

export function stepTitleText(title: unknown, fallback: string): string {
  return typeof title === "string" || typeof title === "number" ? String(title) : fallback
}
