"use client"

import { Badge, Box, Button, Field, Flex, IconButton, Input, InputGroup, Stack } from "@chakra-ui/react"
import { Flashlight, FlashlightOff, ScanLine, Square, X } from "lucide-react"
import {
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { resolveNCodeCaptureLabels } from "./labels"
import type {
  NCodeCaptureDetails,
  NCodeCaptureInput,
  NCodeCaptureKeyboardWedgeOptions,
  NCodeCaptureProps,
  NCodeCaptureResult,
  NCodeCaptureScannerError,
  NCodeCaptureScannerState,
  NCodeCaptureSource,
} from "./types"
import { codeCaptureMessage, codeCaptureSucceeded } from "./utils"

const defaultWedgeOptions: Required<NCodeCaptureKeyboardWedgeOptions> = {
  captureGlobally: false,
  minLength: 3,
  maxInterKeyDelayMs: 80,
  terminatorKeys: ["Enter"],
  preventDefault: true,
  ignoreEditableTargets: true,
}

function toInput(value: string | NCodeCaptureInput, source: NCodeCaptureSource): NCodeCaptureInput {
  return typeof value === "string" ? { code: value, source } : { ...value, source: value.source ?? source }
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.matches("input, textarea, select, [contenteditable='true']")
}

/** Captura códigos desde entrada humana, lectores HID, cámara o bridges nativos mediante adaptadores. */
export function NCodeCapture<TParsed = unknown>({
  value, defaultValue = "", onValueChange, onCapture, onRequestScan, scannerAdapter, scannerPreview,
  continuousScan = false, autoStartScanner = false, onScannerStateChange, onScannerError, maxQueuedScans = 10,
  keyboardWedge = false, normalize = (code) => code.trim(), parse, validate,
  submitOnEnter = true, clearOnSuccess = true, allowDuplicate = false, duplicateWindowMs = 1000,
  autoFocus = false, inputMode = "text", disabled = false, readOnly = false, header, footer,
  colorPalette = "blue", labels: labelsProp, unstyled = false, classNames, styles,
}: NCodeCaptureProps<TParsed>) {
  const labels = useMemo(() => resolveNCodeCaptureLabels(labelsProp), [labelsProp])
  const wedgeOptions = useMemo(() => ({
    ...defaultWedgeOptions,
    ...(typeof keyboardWedge === "object" ? keyboardWedge : {}),
    captureGlobally: typeof keyboardWedge === "object" ? (keyboardWedge.captureGlobally ?? true) : keyboardWedge,
  }), [keyboardWedge])
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [busy, setBusy] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scannerState, setScannerState] = useState<NCodeCaptureScannerState>("idle")
  const [torchEnabled, setTorchEnabled] = useState(false)
  const [message, setMessage] = useState<ReactNode>()
  const [messageKind, setMessageKind] = useState<"error" | "success">()
  const source = useRef<NCodeCaptureSource>("manual")
  const sequence = useRef(0)
  const mounted = useRef(true)
  const busyRef = useRef(false)
  const scannerStateRef = useRef<NCodeCaptureScannerState>("idle")
  const scannerAbort = useRef<AbortController | undefined>(undefined)
  const scannerCleanup = useRef<(() => void) | undefined>(undefined)
  const queue = useRef<Promise<boolean>>(Promise.resolve(true))
  const queuedCount = useRef(0)
  const lastCapture = useRef<{ code: string; at: number } | undefined>(undefined)
  const activeValue = value ?? internalValue

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => () => {
    scannerAbort.current?.abort()
    scannerCleanup.current?.()
    void scannerAdapter?.stop?.()
  }, [scannerAdapter])

  const publishScannerState = useCallback((next: NCodeCaptureScannerState) => {
    scannerStateRef.current = next
    if (mounted.current) setScannerState(next)
    onScannerStateChange?.(next)
  }, [onScannerStateChange])

  const reportScannerError = useCallback((error: unknown) => {
    const scannerError: NCodeCaptureScannerError = typeof error === "object" && error !== null && "code" in error
      ? error as NCodeCaptureScannerError
      : { code: "unknown", cause: error }
    onScannerError?.(scannerError)
    if (scannerError.code === "cancelled") { publishScannerState("idle"); return }
    const nextState = scannerError.code === "permission-denied"
      ? "permission-denied"
      : scannerError.code === "device-disconnected" ? "disconnected" : "error"
    publishScannerState(nextState)
    setMessage(scannerError.message ?? (nextState === "permission-denied" ? labels.scannerPermissionDenied : nextState === "disconnected" ? labels.scannerDisconnected : labels.scannerFailed))
    setMessageKind("error")
  }, [labels.scannerDisconnected, labels.scannerFailed, labels.scannerPermissionDenied, onScannerError, publishScannerState])

  const changeValue = useCallback((next: string) => {
    if (value === undefined) setInternalValue(next)
    setMessage(undefined)
    setMessageKind(undefined)
    onValueChange?.(next)
  }, [onValueChange, value])

  const captureInput = useCallback(async (inputValue: string | NCodeCaptureInput, fallbackSource: NCodeCaptureSource) => {
    if (disabled || readOnly || busyRef.current) return false
    const input = toInput(inputValue, fallbackSource)
    const rawCode = input.rawCode ?? input.code
    const code = normalize(rawCode)
    if (!code) { setMessage(labels.required); setMessageKind("error"); return false }
    const now = Date.now()
    if (!allowDuplicate && lastCapture.current?.code === code && now - lastCapture.current.at < Math.max(0, duplicateWindowMs)) {
      setMessage(labels.duplicate); setMessageKind("error"); return false
    }
    busyRef.current = true
    setBusy(true)
    setMessage(undefined)
    const request = ++sequence.current
    try {
      const validationMessage = await validate?.(code)
      if (request !== sequence.current || !mounted.current) return false
      if (validationMessage) { setMessage(validationMessage || labels.invalid); setMessageKind("error"); return false }
      const parsed = await parse?.(code, { ...input, code, rawCode })
      if (request !== sequence.current || !mounted.current) return false
      const details: NCodeCaptureDetails<TParsed> = {
        code,
        rawCode,
        source: input.source ?? fallbackSource,
        ...(input.format ? { format: input.format } : {}),
        ...(input.device ? { device: input.device } : {}),
        ...(input.metadata ? { metadata: input.metadata } : {}),
        ...(input.detectedAt ? { detectedAt: input.detectedAt } : {}),
        ...(parse ? { parsed: parsed as TParsed } : {}),
      }
      const result = await onCapture(code, details) as void | boolean | NCodeCaptureResult
      if (request !== sequence.current || !mounted.current) return false
      if (!codeCaptureSucceeded(result)) { setMessage(codeCaptureMessage(result) ?? labels.captureFailed); setMessageKind("error"); return false }
      lastCapture.current = { code, at: now }
      setMessage(codeCaptureMessage(result) ?? labels.captured)
      setMessageKind("success")
      if (clearOnSuccess) {
        if (value === undefined) setInternalValue("")
        onValueChange?.("")
      }
      source.current = "manual"
      return true
    } catch {
      if (request === sequence.current && mounted.current) {
        setMessage(labels.captureFailed)
        setMessageKind("error")
      }
      return false
    } finally {
      if (request === sequence.current && mounted.current) {
        busyRef.current = false
        setBusy(false)
      }
    }
  }, [allowDuplicate, clearOnSuccess, disabled, duplicateWindowMs, labels, normalize, onCapture, onValueChange, parse, readOnly, validate, value])

  const enqueueCapture = useCallback((input: string | NCodeCaptureInput, fallbackSource: NCodeCaptureSource) => {
    if (queuedCount.current >= Math.max(1, maxQueuedScans)) {
      setMessage(labels.queueFull)
      setMessageKind("error")
      return Promise.resolve(false)
    }
    queuedCount.current += 1
    const next = queue.current.then(() => captureInput(input, fallbackSource))
    queue.current = next.catch(() => false).finally(() => { queuedCount.current = Math.max(0, queuedCount.current - 1) })
    return next
  }, [captureInput, labels.queueFull, maxQueuedScans])

  const stopScanner = useCallback(async () => {
    if (!scannerAdapter || scannerStateRef.current === "idle" || scannerStateRef.current === "stopping") return
    publishScannerState("stopping")
    scannerAbort.current?.abort()
    scannerCleanup.current?.()
    scannerCleanup.current = undefined
    setTorchEnabled(false)
    try { await scannerAdapter.stop?.() } catch { /* El adaptador ya se está cerrando. */ }
    if (mounted.current) publishScannerState("idle")
  }, [publishScannerState, scannerAdapter])

  const startScanner = useCallback(async () => {
    if (!scannerAdapter || disabled || readOnly || scannerStateRef.current === "starting" || scannerStateRef.current === "active") return
    publishScannerState("starting")
    setMessage(undefined)
    try {
      if (scannerAdapter.isSupported && !(await scannerAdapter.isSupported())) {
        publishScannerState("unsupported")
        setMessage(labels.scannerUnsupported)
        setMessageKind("error")
        return
      }
      const controller = new AbortController()
      scannerAbort.current = controller
      const cleanup = await scannerAdapter.start({
        signal: controller.signal,
        continuous: continuousScan,
        onScan: async (input) => {
          const succeeded = await enqueueCapture(input, scannerAdapter.source ?? "external")
          if (succeeded && !continuousScan) await stopScanner()
          return succeeded
        },
        onError: (error) => {
          if (!mounted.current || controller.signal.aborted) return
          controller.abort()
          scannerCleanup.current?.()
          scannerCleanup.current = undefined
          setTorchEnabled(false)
          void scannerAdapter.stop?.()
          reportScannerError(error)
        },
      })
      if (controller.signal.aborted) { if (typeof cleanup === "function") cleanup(); return }
      scannerCleanup.current = typeof cleanup === "function" ? cleanup : undefined
      publishScannerState("active")
    } catch {
      reportScannerError({ code: "unknown" })
    }
  }, [continuousScan, disabled, enqueueCapture, labels.scannerUnsupported, publishScannerState, readOnly, reportScannerError, scannerAdapter, stopScanner])

  const toggleTorch = async () => {
    if (!scannerAdapter?.setTorch || scannerState !== "active") return
    const next = !torchEnabled
    try { await scannerAdapter.setTorch(next); setTorchEnabled(next) } catch {
      await stopScanner()
      reportScannerError({ code: "unknown" })
    }
  }

  useEffect(() => {
    if (autoStartScanner && scannerAdapter && !disabled && !readOnly) void startScanner()
  }, [autoStartScanner, disabled, readOnly, scannerAdapter, startScanner])

  useEffect(() => {
    if (!wedgeOptions.captureGlobally || disabled || readOnly) return
    let buffer = ""
    let lastKeyAt = 0
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (wedgeOptions.ignoreEditableTargets && isEditableTarget(event.target)) return
      const now = Date.now()
      if (now - lastKeyAt > Math.max(0, wedgeOptions.maxInterKeyDelayMs)) buffer = ""
      lastKeyAt = now
      if (wedgeOptions.terminatorKeys.includes(event.key)) {
        if (buffer.length >= Math.max(1, wedgeOptions.minLength)) {
          if (wedgeOptions.preventDefault) event.preventDefault()
          const code = buffer
          buffer = ""
          void enqueueCapture({ code, source: "hid", device: { type: "keyboard-wedge" }, detectedAt: new Date() }, "hid")
        } else buffer = ""
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        buffer += event.key
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [disabled, enqueueCapture, readOnly, wedgeOptions])

  const requestScan = async () => {
    if (!onRequestScan || disabled || readOnly || busyRef.current || scanning) return
    setScanning(true)
    setMessage(undefined)
    try {
      const input = await onRequestScan()
      if (!mounted.current) return
      if (input === undefined) return
      const scan = toInput(input, "external")
      changeValue(scan.rawCode ?? scan.code)
      await enqueueCapture(scan, "external")
    } catch {
      if (mounted.current) { setMessage(labels.scannerFailed); setMessageKind("error") }
    } finally {
      if (mounted.current) setScanning(false)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (submitOnEnter && event.key === "Enter") { event.preventDefault(); void enqueueCapture(activeValue, "keyboard") }
    else source.current = "manual"
  }
  const handlePaste = (_event: ClipboardEvent<HTMLInputElement>) => { source.current = "paste" }
  const scannerStateLabels: Record<NCodeCaptureScannerState, string> = {
    idle: labels.scannerIdle,
    starting: labels.scannerStarting,
    active: labels.scannerActive,
    stopping: labels.scannerStopping,
    unsupported: labels.scannerUnsupported,
    "permission-denied": labels.scannerPermissionDenied,
    disconnected: labels.scannerDisconnected,
    error: labels.scannerError,
  }

  return <Stack as="section" aria-label={labels.captureLabel} gap={unstyled ? undefined : "3"} colorPalette={colorPalette} minW="0" className={classNames?.root} css={styles?.root} data-scope="n-code-capture" data-part="root">
    {header}
    {scannerAdapter ? <Flex align="center" justify="space-between" gap="3" wrap="wrap">
      <Badge variant="subtle" colorPalette={scannerState === "active" ? "green" : scannerState === "error" || scannerState === "unsupported" || scannerState === "permission-denied" || scannerState === "disconnected" ? "red" : "gray"} role="status">{scannerAdapter.label ? `${scannerAdapter.label} · ` : ""}{scannerStateLabels[scannerState]}</Badge>
      <Flex gap="2">
        {scannerAdapter.capabilities?.torch && scannerAdapter.setTorch && scannerState === "active" ? <IconButton type="button" size="sm" variant="ghost" aria-label={torchEnabled ? labels.disableTorch : labels.enableTorch} onClick={() => void toggleTorch()}>{torchEnabled ? <FlashlightOff aria-hidden size={16} /> : <Flashlight aria-hidden size={16} />}</IconButton> : null}
        <Button type="button" size="sm" variant="outline" disabled={disabled || readOnly || scannerState === "starting" || scannerState === "stopping"} onClick={() => void (scannerState === "active" ? stopScanner() : startScanner())}>
          {scannerState === "active" ? <Square aria-hidden size={15} /> : <ScanLine aria-hidden size={16} />}
          {scannerState === "active" ? labels.stopScanner : labels.startScanner}
        </Button>
      </Flex>
    </Flex> : null}
    {scannerAdapter && scannerPreview && (scannerState === "starting" || scannerState === "active") ? <Box rounded="md" overflow="hidden" bg="bg.muted">{scannerPreview}</Box> : null}
    <Field.Root invalid={messageKind === "error"} disabled={disabled || busy || scanning}>
      <Field.Label>{labels.inputLabel}</Field.Label>
      <Flex gap="2" direction={{ base: "column", sm: "row" }}>
        <InputGroup flex="1" endElement={activeValue && !readOnly ? <IconButton aria-label={labels.clear} size="xs" variant="ghost" disabled={disabled || busy || scanning} onClick={() => changeValue("")}><X aria-hidden size={14} /></IconButton> : undefined}>
          <Input value={activeValue} placeholder={labels.placeholder} inputMode={inputMode} autoFocus={autoFocus} readOnly={readOnly} onChange={(event) => changeValue(event.target.value)} onKeyDown={handleKeyDown} onPaste={handlePaste} />
        </InputGroup>
        {onRequestScan ? <Button type="button" variant="outline" width={{ base: "full", sm: "auto" }} disabled={disabled || readOnly || busy} loading={scanning} loadingText={labels.requestingScan} onClick={() => void requestScan()}><ScanLine aria-hidden size={17} />{labels.requestScan}</Button> : null}
        <Button type="button" colorPalette={colorPalette} width={{ base: "full", sm: "auto" }} disabled={disabled || readOnly || scanning} loading={busy} loadingText={labels.processing} onClick={() => void enqueueCapture(activeValue, source.current)}>{labels.submit}</Button>
      </Flex>
      <Field.HelperText>{labels.helperText}</Field.HelperText>
    </Field.Root>
    {message ? <Box role={messageKind === "error" ? "alert" : "status"} aria-live="polite" p="3" rounded="md" borderWidth="1px" borderColor={messageKind === "error" ? "border.error" : "border.success"} bg={messageKind === "error" ? "bg.error" : "bg.success"} color={messageKind === "error" ? "fg.error" : "fg.success"} fontSize="sm">{message}</Box> : null}
    {footer}
  </Stack>
}
