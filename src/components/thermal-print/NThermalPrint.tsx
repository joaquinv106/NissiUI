"use client"

import { Box, Button, Stack } from "@chakra-ui/react"
import { Printer } from "lucide-react"
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react"

import { resolveNThermalPrintLabels } from "./labels"
import type {
  NThermalPrintHandle,
  NThermalPrintProps,
  NThermalPrintResult,
} from "./types"
import {
  cloneThermalPrintContent,
  createThermalPrintStyles,
  resolveNThermalPrintConfiguration,
} from "./utils"

/** Aísla contenido y prepara trabajos de impresión para rollos térmicos. */
export const NThermalPrint = forwardRef<NThermalPrintHandle, NThermalPrintProps>(function NThermalPrint({
  children,
  paperWidthMm = 80,
  contentWidthMm,
  marginMm = 3,
  fontSizePt = 9,
  fontFamily,
  printBackground = false,
  documentTitle,
  job,
  adapter,
  showTrigger = true,
  disabled = false,
  colorPalette = "blue",
  labels: labelsProp,
  onBeforePrint,
  onAfterPrint,
  onPrintError,
  unstyled = false,
  classNames,
  styles,
}, ref) {
  const labels = useMemo(() => resolveNThermalPrintLabels(labelsProp), [labelsProp])
  const configuration = useMemo(() => resolveNThermalPrintConfiguration({
    paperWidthMm,
    contentWidthMm,
    marginMm,
    fontSizePt,
    fontFamily,
    printBackground,
    job,
  }), [contentWidthMm, fontFamily, fontSizePt, job, marginMm, paperWidthMm, printBackground])
  const sourceRef = useRef<HTMLDivElement>(null)
  const activePrint = useRef(false)
  const [printing, setPrinting] = useState(false)
  const [error, setError] = useState<string>()

  const print = useCallback(async (): Promise<NThermalPrintResult> => {
    if (activePrint.current || disabled) return { success: false, reason: "busy" }
    const sourceElement = sourceRef.current
    if (!sourceElement || typeof document === "undefined" || typeof window === "undefined") {
      const result: NThermalPrintResult = { success: false, reason: "unavailable" }
      setError(labels.printError)
      return result
    }
    if (document.body.hasAttribute("data-nissi-thermal-printing")) return { success: false, reason: "busy" }

    activePrint.current = true
    document.body.dataset.nissiThermalPrinting = ""
    setPrinting(true)
    setError(undefined)
    let result: NThermalPrintResult = { success: true }
    let host: HTMLDivElement | undefined
    let style: HTMLStyleElement | undefined
    const previousTitle = document.title

    try {
      await onBeforePrint?.()
      const printableElement = cloneThermalPrintContent(sourceElement)
      host = document.createElement("div")
      host.dataset.nissiThermalPrintHost = ""
      host.style.fontFamily = configuration.fontFamily
      host.style.fontSize = `${configuration.fontSizePt}pt`
      host.append(printableElement)
      style = document.createElement("style")
      style.dataset.nissiThermalPrintStyle = ""
      style.textContent = createThermalPrintStyles(configuration)
      document.body.append(style, host)
      if (documentTitle) document.title = documentTitle

      const context = {
        sourceElement,
        printableElement,
        html: host.outerHTML,
        documentTitle,
        configuration,
      }
      if (adapter) await adapter(context)
      else window.print()
    } catch (caughtError) {
      result = { success: false, reason: "failed", error: caughtError }
      setError(labels.printError)
      onPrintError?.(caughtError)
    } finally {
      host?.remove()
      style?.remove()
      delete document.body.dataset.nissiThermalPrinting
      if (documentTitle) document.title = previousTitle
      activePrint.current = false
      setPrinting(false)
      onAfterPrint?.(result)
    }

    return result
  }, [adapter, configuration, disabled, documentTitle, labels.printError, onAfterPrint, onBeforePrint, onPrintError])

  useImperativeHandle(ref, () => ({ print }), [print])

  const context = useMemo(() => ({
    print,
    printing,
    error,
    clearError: () => setError(undefined),
  }), [error, print, printing])

  return <Stack className={classNames?.root} css={styles?.root} data-scope="n-thermal-print" data-part="root" gap="3" colorPalette={colorPalette}>
    {showTrigger ? <Button
      unstyled={unstyled}
      className={classNames?.trigger}
      css={styles?.trigger}
      data-scope="n-thermal-print"
      data-part="trigger"
      type="button"
      alignSelf="start"
      variant={unstyled ? undefined : "outline"}
      disabled={disabled || printing}
      loading={printing}
      loadingText={labels.printing}
      onClick={() => { void print() }}
      data-nissi-print-hidden
    ><Printer aria-hidden size={16} />{labels.print}</Button> : null}
    {error ? <Box role="alert" className={classNames?.error} css={styles?.error} data-scope="n-thermal-print" data-part="error" color={unstyled ? undefined : "fg.error"} fontSize="sm" data-nissi-print-hidden>{error}</Box> : null}
    <Box ref={sourceRef} className={classNames?.source} css={styles?.source} data-scope="n-thermal-print" data-part="source" minW="0" data-nissi-thermal-print-source>
      {typeof children === "function" ? children(context) : children}
    </Box>
  </Stack>
})
