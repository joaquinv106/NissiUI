"use client"

import { Box, Button, Field, Flex, IconButton, Input, InputGroup, Stack } from "@chakra-ui/react"
import { ScanLine, X } from "lucide-react"
import { type ClipboardEvent, type KeyboardEvent, type ReactNode, useMemo, useRef, useState } from "react"

import { resolveNCodeCaptureLabels } from "./labels"
import type { NCodeCaptureProps, NCodeCaptureResult, NCodeCaptureSource } from "./types"
import { codeCaptureMessage, codeCaptureSucceeded } from "./utils"

/** Captura códigos desde teclado, pegado o un proveedor externo sin acoplarse a una cámara concreta. */
export function NCodeCapture({
  value, defaultValue = "", onValueChange, onCapture, onRequestScan, normalize = (code) => code.trim(), validate,
  submitOnEnter = true, clearOnSuccess = true, allowDuplicate = false, duplicateWindowMs = 1000,
  autoFocus = false, inputMode = "text", disabled = false, readOnly = false, header, footer,
  colorPalette = "blue", labels: labelsProp,
}: NCodeCaptureProps) {
  const labels = useMemo(() => resolveNCodeCaptureLabels(labelsProp), [labelsProp])
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [busy, setBusy] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState<ReactNode>()
  const [messageKind, setMessageKind] = useState<"error" | "success">()
  const source = useRef<NCodeCaptureSource>("manual")
  const sequence = useRef(0)
  const lastCapture = useRef<{ code: string; at: number } | undefined>(undefined)
  const activeValue = value ?? internalValue

  const changeValue = (next: string) => {
    if (value === undefined) setInternalValue(next)
    setMessage(undefined)
    setMessageKind(undefined)
    onValueChange?.(next)
  }

  const capture = async (
    rawCode = activeValue,
    captureSource: NCodeCaptureSource = source.current,
    ignoreScanning = false,
  ) => {
    if (disabled || readOnly || busy || (!ignoreScanning && scanning)) return false
    const code = normalize(rawCode)
    if (!code) { setMessage(labels.required); setMessageKind("error"); return false }
    const now = Date.now()
    if (!allowDuplicate && lastCapture.current?.code === code && now - lastCapture.current.at < Math.max(0, duplicateWindowMs)) {
      setMessage(labels.duplicate); setMessageKind("error"); return false
    }
    setBusy(true)
    setMessage(undefined)
    const request = ++sequence.current
    try {
      const validationMessage = await validate?.(code)
      if (request !== sequence.current) return false
      if (validationMessage) { setMessage(validationMessage || labels.invalid); setMessageKind("error"); setBusy(false); return false }
      const details = { code, rawCode, source: captureSource }
      const result = await onCapture(code, details) as void | boolean | NCodeCaptureResult
      if (request !== sequence.current) return false
      if (!codeCaptureSucceeded(result)) { setMessage(codeCaptureMessage(result) ?? labels.captureFailed); setMessageKind("error"); setBusy(false); return false }
      lastCapture.current = { code, at: now }
      setMessage(codeCaptureMessage(result) ?? labels.captured)
      setMessageKind("success")
      if (clearOnSuccess) {
        if (value === undefined) setInternalValue("")
        onValueChange?.("")
      }
      setBusy(false)
      source.current = "manual"
      return true
    } catch {
      if (request !== sequence.current) return false
      setMessage(labels.captureFailed)
      setMessageKind("error")
      setBusy(false)
      return false
    }
  }

  const requestScan = async () => {
    if (!onRequestScan || disabled || readOnly || busy || scanning) return
    setScanning(true)
    setMessage(undefined)
    const request = ++sequence.current
    try {
      const code = await onRequestScan()
      if (request !== sequence.current) return
      setScanning(false)
      if (code === undefined) return
      changeValue(code)
      await capture(code, "external", true)
    } catch {
      if (request !== sequence.current) return
      setScanning(false)
      setMessage(labels.scannerFailed)
      setMessageKind("error")
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (submitOnEnter && event.key === "Enter") { event.preventDefault(); void capture(activeValue, "keyboard") }
    else source.current = "manual"
  }
  const handlePaste = (_event: ClipboardEvent<HTMLInputElement>) => { source.current = "paste" }

  return <Stack as="section" aria-label={labels.captureLabel} gap="3" colorPalette={colorPalette} minW="0">
    {header}
    <Field.Root invalid={messageKind === "error"} disabled={disabled || busy || scanning}>
      <Field.Label>{labels.inputLabel}</Field.Label>
      <Flex gap="2" direction={{ base: "column", sm: "row" }}>
        <InputGroup flex="1" endElement={activeValue && !readOnly ? <IconButton aria-label={labels.clear} size="xs" variant="ghost" disabled={disabled || busy || scanning} onClick={() => changeValue("")}><X aria-hidden size={14} /></IconButton> : undefined}>
          <Input value={activeValue} placeholder={labels.placeholder} inputMode={inputMode} autoFocus={autoFocus} readOnly={readOnly} onChange={(event) => changeValue(event.target.value)} onKeyDown={handleKeyDown} onPaste={handlePaste} />
        </InputGroup>
        {onRequestScan ? <Button type="button" variant="outline" width={{ base: "full", sm: "auto" }} disabled={disabled || readOnly || busy} loading={scanning} loadingText={labels.requestingScan} onClick={() => void requestScan()}><ScanLine aria-hidden size={17} />{labels.requestScan}</Button> : null}
        <Button type="button" colorPalette={colorPalette} width={{ base: "full", sm: "auto" }} disabled={disabled || readOnly || scanning} loading={busy} loadingText={labels.processing} onClick={() => void capture()}>{labels.submit}</Button>
      </Flex>
      <Field.HelperText>{labels.helperText}</Field.HelperText>
    </Field.Root>
    {message ? <Box role={messageKind === "error" ? "alert" : "status"} aria-live="polite" p="3" rounded="md" borderWidth="1px" borderColor={messageKind === "error" ? "border.error" : "border.success"} bg={messageKind === "error" ? "bg.error" : "bg.success"} color={messageKind === "error" ? "fg.error" : "fg.success"} fontSize="sm">{message}</Box> : null}
    {footer}
  </Stack>
}
