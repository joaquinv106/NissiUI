import type { InputHTMLAttributes, ReactNode } from "react"

export type NCodeCaptureSource = "manual" | "keyboard" | "paste" | "external" | "hid" | "camera" | "handheld"

export type NCodeCaptureFormat =
  | "qr_code" | "data_matrix" | "aztec" | "pdf417"
  | "code_128" | "code_39" | "code_93" | "codabar"
  | "ean_13" | "ean_8" | "upc_a" | "upc_e" | "itf"
  | "unknown" | (string & {})

export type NCodeCaptureDeviceType = "keyboard-wedge" | "camera" | "handheld" | "native-bridge" | "unknown"

export interface NCodeCaptureDevice {
  id?: string
  label?: string
  type: NCodeCaptureDeviceType
}

export interface NCodeCaptureInput {
  code: string
  rawCode?: string
  source?: NCodeCaptureSource
  format?: NCodeCaptureFormat
  device?: NCodeCaptureDevice
  metadata?: Readonly<Record<string, unknown>>
  detectedAt?: Date
}

export interface NCodeCaptureDetails<TParsed = unknown> {
  code: string
  rawCode: string
  source: NCodeCaptureSource
  format?: NCodeCaptureFormat
  device?: NCodeCaptureDevice
  metadata?: Readonly<Record<string, unknown>>
  detectedAt?: Date
  parsed?: TParsed
}

export interface NCodeCaptureResult {
  success: boolean
  message?: ReactNode
}

export type NCodeCaptureScannerState = "idle" | "starting" | "active" | "stopping" | "unsupported" | "permission-denied" | "disconnected" | "error"

export type NCodeCaptureScannerErrorCode = "permission-denied" | "device-disconnected" | "cancelled" | "unknown"

export interface NCodeCaptureScannerError {
  code: NCodeCaptureScannerErrorCode
  message?: string
  cause?: unknown
}

export interface NCodeCaptureScannerContext {
  signal: AbortSignal
  continuous: boolean
  onScan: (input: string | NCodeCaptureInput) => Promise<boolean>
  onError: (error: NCodeCaptureScannerError | unknown) => void
}

/** Adaptador neutral para SDKs de cámara, intents de handhelds y bridges nativos. */
export interface NCodeCaptureScannerAdapter {
  id: string
  label?: string
  source?: Extract<NCodeCaptureSource, "external" | "camera" | "handheld">
  isSupported?: () => boolean | Promise<boolean>
  capabilities?: { continuous?: boolean; camera?: boolean; torch?: boolean }
  start: (context: NCodeCaptureScannerContext) => void | (() => void) | Promise<void | (() => void)>
  stop?: () => void | Promise<void>
  setTorch?: (enabled: boolean) => void | Promise<void>
}

export interface NCodeCaptureKeyboardWedgeOptions {
  captureGlobally?: boolean
  minLength?: number
  maxInterKeyDelayMs?: number
  terminatorKeys?: readonly string[]
  preventDefault?: boolean
  ignoreEditableTargets?: boolean
}

export interface NCodeCaptureLabels {
  captureLabel: string
  inputLabel: string
  placeholder: string
  helperText: string
  submit: string
  requestScan: string
  requestingScan: string
  startScanner: string
  stopScanner: string
  scannerIdle: string
  scannerStarting: string
  scannerActive: string
  scannerStopping: string
  scannerUnsupported: string
  scannerPermissionDenied: string
  scannerDisconnected: string
  scannerError: string
  enableTorch: string
  disableTorch: string
  processing: string
  clear: string
  required: string
  invalid: string
  duplicate: string
  captured: string
  captureFailed: string
  scannerFailed: string
  queueFull: string
}

export interface NCodeCaptureProps<TParsed = unknown> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onCapture: (code: string, details: NCodeCaptureDetails<TParsed>) => void | boolean | NCodeCaptureResult | Promise<void | boolean | NCodeCaptureResult>
  /** Lectura puntual compatible con la API original. */
  onRequestScan?: () => string | NCodeCaptureInput | undefined | Promise<string | NCodeCaptureInput | undefined>
  /** Sesión push para cámara, handheld o bridge nativo. */
  scannerAdapter?: NCodeCaptureScannerAdapter
  scannerPreview?: ReactNode
  continuousScan?: boolean
  autoStartScanner?: boolean
  onScannerStateChange?: (state: NCodeCaptureScannerState) => void
  onScannerError?: (error: NCodeCaptureScannerError) => void
  maxQueuedScans?: number
  keyboardWedge?: boolean | NCodeCaptureKeyboardWedgeOptions
  normalize?: (rawCode: string) => string
  parse?: (code: string, input: NCodeCaptureInput) => TParsed | Promise<TParsed>
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
