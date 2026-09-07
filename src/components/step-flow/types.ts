import type { ReactNode } from "react"

export type NStepFlowStateUpdater<TState> = TState | ((current: TState) => TState)
export type NStepFlowNavigationReason = "next" | "previous" | "select"
export type NStepFlowStateChangeReason = "step"

export interface NStepFlowStateChangeDetails {
  reason: NStepFlowStateChangeReason
  stepId: string
}

export interface NStepFlowStepChangeDetails<TState> {
  reason: NStepFlowNavigationReason
  previousStepId: string
  stepId: string
  previousIndex: number
  index: number
  state: TState
}

export interface NStepFlowStepContext<TState> {
  state: TState
  setState: (updater: NStepFlowStateUpdater<TState>) => void
  stepId: string
  index: number
  count: number
  first: boolean
  last: boolean
  busy: boolean
  disabled: boolean
  goNext: () => Promise<boolean>
  goBack: () => Promise<boolean>
  goTo: (stepId: string) => Promise<boolean>
}

export interface NStepFlowStep<TState> {
  id: string
  title: ReactNode
  description?: ReactNode
  optional?: boolean
  skippable?: boolean
  disabled?: boolean
  validate?: (state: TState, context: { stepId: string; index: number }) => string | undefined | Promise<string | undefined>
  render: (context: NStepFlowStepContext<TState>) => ReactNode
}

export interface NStepFlowLabels {
  flowLabel: string
  stepsLabel: string
  optional: string
  previous: string
  next: string
  complete: string
  working: string
  loading: string
  errorTitle: string
  emptyTitle: string
  emptyDescription: string
  validationError: string
  stepAriaLabel: (title: string, index: number, count: number) => string
}

export interface NStepFlowActionContext<TState> extends NStepFlowStepContext<TState> {
  validationMessage?: string
}

export interface NStepFlowProps<TState> {
  steps: readonly NStepFlowStep<TState>[]
  state?: TState
  defaultState: TState
  onStateChange?: (state: TState, details: NStepFlowStateChangeDetails) => void
  stepId?: string
  defaultStepId?: string
  onStepChange?: (stepId: string, details: NStepFlowStepChangeDetails<TState>) => void
  onComplete?: (state: TState) => void | boolean | Promise<void | boolean>
  linear?: boolean
  allowStepSelection?: boolean
  orientation?: "horizontal" | "vertical"
  validateOnBack?: boolean
  renderActions?: (context: NStepFlowActionContext<TState>) => ReactNode
  header?: ReactNode
  footer?: ReactNode
  loading?: boolean
  error?: ReactNode
  emptyState?: ReactNode
  disabled?: boolean
  colorPalette?: string
  labels?: Partial<NStepFlowLabels>
}
