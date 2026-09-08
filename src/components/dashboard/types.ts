import type { ReactNode } from "react"
import type { NComponentStyleProps } from "../styling"

export type NStatCardSlot = "root" | "header" | "value" | "trend"
export type NDashboardGridSlot = "root"
export type NDashboardGridItemSlot = "root"
export type NChartFrameSlot = "root" | "header" | "plot" | "dataTable" | "empty"

export interface NStatCardProps extends NComponentStyleProps<NStatCardSlot> {
  label: ReactNode
  value: ReactNode
  helperText?: ReactNode
  trend?: number
  trendLabel?: string
  icon?: ReactNode
  action?: ReactNode
  colorPalette?: string
  loading?: boolean
}

export interface NDashboardGridProps extends NComponentStyleProps<NDashboardGridSlot> { children: ReactNode; columns?: 1 | 2 | 3 | 4 | 6; minItemWidth?: string; gap?: string | number }
export interface NDashboardGridItemProps extends NComponentStyleProps<NDashboardGridItemSlot> { children: ReactNode; colSpan?: 1 | 2 | 3 | 4 | 5 | 6; rowSpan?: number }

export interface NChartDatum { label: string; value: number; [key: string]: unknown }
export interface NChartSeries { key: string; label: string; color?: string }
export interface NChartRenderContext { data: NChartDatum[]; series: NChartSeries[] }
export interface NChartFrameLabels { empty: string; dataTable: string; category: string; value: string }
export interface NChartFrameProps extends NComponentStyleProps<NChartFrameSlot> {
  title: ReactNode
  description?: ReactNode
  data: NChartDatum[]
  series?: NChartSeries[]
  renderer?: (context: NChartRenderContext) => ReactNode
  actions?: ReactNode
  height?: string
  colorPalette?: string
  labels?: Partial<NChartFrameLabels>
}
