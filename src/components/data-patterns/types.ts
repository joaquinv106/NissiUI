import type { ReactNode } from "react"

import type { NPanelProps } from "../panel"

export interface NFilterDescriptor {
  id: string
  label: string
  value: string
  onRemove?: () => void
}

export interface NFilterBarLabels {
  region: string
  activeFilters: string
  clearAll: string
  removeFilter: (label: string) => string
  toggle: string
}

export interface NFilterBarProps {
  children: ReactNode
  filters?: NFilterDescriptor[]
  actions?: ReactNode
  onClear?: () => void
  collapsible?: boolean
  defaultExpanded?: boolean
  labels?: Partial<NFilterBarLabels>
}

export interface NDateRangeValue { start: string; end: string }
export interface NDateRangePickerLabels { start: string; end: string; group: string; invalidRange: string }
export interface NDateRangePickerProps {
  value?: NDateRangeValue
  defaultValue?: NDateRangeValue
  onChange?: (value: NDateRangeValue) => void
  min?: string
  max?: string
  disabled?: boolean
  required?: boolean
  labels?: Partial<NDateRangePickerLabels>
}

export interface NDescriptionItem {
  id: string
  label: ReactNode
  value: ReactNode
  span?: 1 | 2 | 3 | 4
}
export interface NDescriptionListProps {
  items: NDescriptionItem[]
  columns?: 1 | 2 | 3 | 4
  orientation?: "stacked" | "inline"
  dividers?: boolean
}

export interface NDetailPanelProps extends Omit<NPanelProps, "children"> {
  summary?: ReactNode
  items?: NDescriptionItem[]
  columns?: 1 | 2 | 3
  children?: ReactNode
}
