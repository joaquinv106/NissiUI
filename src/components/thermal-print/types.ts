import type { ReactNode } from "react"

import type { NComponentStyleProps } from "../styling"

export type NThermalPaperWidth = 58 | 80 | number
export type NThermalCutMode = "none" | "partial" | "full"

export interface NThermalPrintJob {
  copies?: number
  cut?: NThermalCutMode
  openCashDrawer?: boolean
}

export interface NThermalPrintConfiguration {
  paperWidthMm: number
  contentWidthMm: number
  marginMm: number
  fontSizePt: number
  fontFamily: string
  printBackground: boolean
  job: Required<NThermalPrintJob>
}

export interface NThermalPrintAdapterContext {
  sourceElement: HTMLElement
  printableElement: HTMLElement
  html: string
  documentTitle?: string
  configuration: NThermalPrintConfiguration
}

export type NThermalPrintAdapter = (
  context: NThermalPrintAdapterContext,
) => void | Promise<void>

export type NThermalPrintFailureReason = "busy" | "unavailable" | "failed"

export interface NThermalPrintResult {
  success: boolean
  reason?: NThermalPrintFailureReason
  error?: unknown
}

export interface NThermalPrintRenderContext {
  print: () => Promise<NThermalPrintResult>
  printing: boolean
  error?: ReactNode
  clearError: () => void
}

export interface NThermalPrintHandle {
  print: () => Promise<NThermalPrintResult>
}

export interface NThermalPrintLabels {
  print: string
  printing: string
  printError: string
}

export type NThermalPrintSlot = "root" | "trigger" | "error" | "source"

export interface NThermalPrintProps extends NComponentStyleProps<NThermalPrintSlot> {
  children: ReactNode | ((context: NThermalPrintRenderContext) => ReactNode)
  paperWidthMm?: NThermalPaperWidth
  contentWidthMm?: number
  marginMm?: number
  fontSizePt?: number
  fontFamily?: string
  printBackground?: boolean
  documentTitle?: string
  job?: NThermalPrintJob
  adapter?: NThermalPrintAdapter
  showTrigger?: boolean
  disabled?: boolean
  colorPalette?: string
  labels?: Partial<NThermalPrintLabels>
  onBeforePrint?: () => void | Promise<void>
  onAfterPrint?: (result: NThermalPrintResult) => void
  onPrintError?: (error: unknown) => void
}
