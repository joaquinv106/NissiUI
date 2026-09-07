import type { ReactNode } from "react"

export interface NStatCardProps {
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

export interface NDashboardGridProps { children: ReactNode; columns?: 1 | 2 | 3 | 4 | 6; minItemWidth?: string; gap?: string | number }
export interface NDashboardGridItemProps { children: ReactNode; colSpan?: 1 | 2 | 3 | 4 | 5 | 6; rowSpan?: number }

export interface NChartDatum { label: string; value: number; [key: string]: unknown }
export interface NChartSeries { key: string; label: string; color?: string }
export interface NChartRenderContext { data: NChartDatum[]; series: NChartSeries[] }
export interface NChartFrameLabels { empty: string; dataTable: string; category: string; value: string }
export interface NChartFrameProps {
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
