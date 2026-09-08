"use client"

import { Box, Button, Dialog, IconButton, Portal, Stack } from "@chakra-ui/react"
import { X } from "lucide-react"
import { type ReactNode, useMemo, useRef, useState } from "react"

import { defaultNConfirmDialogLabels, resolveLabels } from "./labels"
import type { NConfirmDialogProps, NConfirmDialogResult } from "./types"

const succeeded = (result: void | boolean | NConfirmDialogResult) => result === undefined || result === true || (typeof result === "object" && result.success)
const resultMessage = (result: void | boolean | NConfirmDialogResult): ReactNode => typeof result === "object" ? result.message : undefined

export function NConfirmDialog({ open, defaultOpen = false, onOpenChange, trigger, title, description, children, confirmLabel, cancelLabel, confirmColorPalette = "blue", destructive = false, disabled = false, closeOnEscape = true, closeOnInteractOutside = true, returnFocusRef, onConfirm, labels: labelsProp, unstyled = false, classNames, styles }: NConfirmDialogProps) {
  const labels = useMemo(() => resolveLabels(defaultNConfirmDialogLabels, labelsProp), [labelsProp])
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ReactNode>()
  const sequence = useRef(0)
  const activeOpen = open ?? internalOpen
  const changeOpen = (next: boolean) => { if (open === undefined) setInternalOpen(next); if (!next) { sequence.current += 1; setBusy(false); setError(undefined) }; onOpenChange?.(next) }
  const confirm = async () => {
    if (busy || disabled) return
    const request = ++sequence.current
    setBusy(true); setError(undefined)
    try {
      const result = await onConfirm() as void | boolean | NConfirmDialogResult
      if (request !== sequence.current) return
      if (succeeded(result)) changeOpen(false)
      else { setError(resultMessage(result) ?? labels.failed); setBusy(false) }
    } catch { if (request === sequence.current) { setError(labels.failed); setBusy(false) } }
  }

  return (
    <Dialog.Root open={activeOpen} onOpenChange={(details) => changeOpen(details.open)} closeOnEscape={closeOnEscape && !busy} closeOnInteractOutside={closeOnInteractOutside && !busy} finalFocusEl={returnFocusRef ? () => returnFocusRef.current : undefined} role={destructive ? "alertdialog" : "dialog"} lazyMount unmountOnExit>
      {trigger ? <Dialog.Trigger asChild className={classNames?.trigger}>{trigger}</Dialog.Trigger> : null}
      <Portal><Dialog.Backdrop unstyled={unstyled} className={classNames?.backdrop} css={styles?.backdrop} data-scope="n-confirm-dialog" data-part="backdrop" /><Dialog.Positioner p={unstyled ? undefined : "4"} className={classNames?.positioner} css={styles?.positioner} data-scope="n-confirm-dialog" data-part="positioner"><Dialog.Content unstyled={unstyled} maxW="md" bg={unstyled ? undefined : "bg.panel"} className={classNames?.content} css={styles?.content} data-part="content"><Dialog.Header unstyled={unstyled} pe={unstyled ? undefined : "12"} className={classNames?.header} css={styles?.header} data-part="header"><Stack gap="1"><Dialog.Title>{title ?? labels.defaultTitle}</Dialog.Title><Dialog.Description>{description ?? labels.defaultDescription}</Dialog.Description></Stack></Dialog.Header><Dialog.Body unstyled={unstyled} className={classNames?.body} css={styles?.body} data-part="body">{children}{error ? <Box role="alert" mt="3" p={unstyled ? undefined : "3"} rounded={unstyled ? undefined : "md"} bg={unstyled ? undefined : "bg.error"} color="fg.error" className={classNames?.error} css={styles?.error} data-part="error">{error}</Box> : null}</Dialog.Body><Dialog.Footer unstyled={unstyled} className={classNames?.footer} css={styles?.footer} data-part="footer"><Dialog.ActionTrigger asChild><Button variant="outline" disabled={busy}>{cancelLabel ?? labels.cancel}</Button></Dialog.ActionTrigger><Button colorPalette={destructive ? "red" : confirmColorPalette} disabled={disabled} loading={busy} loadingText={labels.confirming} onClick={() => void confirm()}>{confirmLabel ?? labels.confirm}</Button></Dialog.Footer><Dialog.CloseTrigger asChild><IconButton unstyled={unstyled} aria-label={labels.close} variant={unstyled ? undefined : "ghost"} size="sm" position="absolute" top="3" insetInlineEnd="3" disabled={busy} className={classNames?.close} css={styles?.close} data-part="close"><X aria-hidden="true" size={18} /></IconButton></Dialog.CloseTrigger></Dialog.Content></Dialog.Positioner></Portal>
    </Dialog.Root>
  )
}
