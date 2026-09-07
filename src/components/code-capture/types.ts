import type { InputHTMLAttributes, ReactNode } from "react"

export type NCodeCaptureSource = "manual" | "keyboard" | "paste" | "external"

export interface NCodeCaptureDetails {
  code: string
  rawCode: string
  source: NCodeCaptureSource
}

export interface NCodeCaptureResult {
  success: boolean
  message?: ReactNode
}

export interface NCodeCaptureLabels {
  captureLabel: string
  inputLabel: string
  placeholder: string
  helperText: string
  submit: string
  requestScan: string
  requestingScan: string
  processing: string
  clear: string
  required: string
  invalid: string
  duplicate: string
  captured: string
  captureFailed: string
  scannerFailed: string
}

export interface NCodeCaptureProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onCapture: (code: string, details: NCodeCaptureDetails) => void | boolean | NCodeCaptureResult | Promise<void | boolean | NCodeCaptureResult>
  onRequestScan?: () => string | undefined | Promise<string | undefined>
  normalize?: (rawCode: string) => string
  validate?: (code: string) => string | undefined | Promise<string | undefined>
  submitOnEnter?: boolean
  clearOnSuccess?: boolean
  allowDuplicate?: boolean
  duplicateWindowMs?: number
  autoFocus?: boolean
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"]
  disabled?: boolean
  readOnly?: boolean
  header?: ReactNode
  footer?: ReactNode
  colorPalette?: string
  labels?: Partial<NCodeCaptureLabels>
}
