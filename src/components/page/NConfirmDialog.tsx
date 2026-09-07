"use client"

import { Box, Button, Dialog, IconButton, Portal, Stack } from "@chakra-ui/react"
import { X } from "lucide-react"
import { type ReactNode, useMemo, useRef, useState } from "react"

import { defaultNConfirmDialogLabels, resolveLabels } from "./labels"
import type { NConfirmDialogProps, NConfirmDialogResult } from "./types"

const succeeded = (result: void | boolean | NConfirmDialogResult) => result === undefined || result === true || (typeof result === "object" && result.success)
const resultMessage = (result: void | boolean | NConfirmDialogResult): ReactNode => typeof result === "object" ? result.message : undefined

export function NConfirmDialog({ open, defaultOpen = false, onOpenChange, trigger, title, description, children, confirmLabel, cancelLabel, confirmColorPalette = "blue", destructive = false, disabled = false, closeOnEscape = true, closeOnInteractOutside = true, returnFocusRef, onConfirm, labels: labelsProp }: NConfirmDialogProps) {
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
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Portal><Dialog.Backdrop /><Dialog.Positioner p="4"><Dialog.Content maxW="md" bg="bg.panel"><Dialog.Header pe="12"><Stack gap="1"><Dialog.Title>{title ?? labels.defaultTitle}</Dialog.Title><Dialog.Description>{description ?? labels.defaultDescription}</Dialog.Description></Stack></Dialog.Header><Dialog.Body>{children}{error ? <Box role="alert" mt="3" p="3" rounded="md" bg="bg.error" color="fg.error">{error}</Box> : null}</Dialog.Body><Dialog.Footer><Dialog.ActionTrigger asChild><Button variant="outline" disabled={busy}>{cancelLabel ?? labels.cancel}</Button></Dialog.ActionTrigger><Button colorPalette={destructive ? "red" : confirmColorPalette} disabled={disabled} loading={busy} loadingText={labels.confirming} onClick={() => void confirm()}>{confirmLabel ?? labels.confirm}</Button></Dialog.Footer><Dialog.CloseTrigger asChild><IconButton aria-label={labels.close} variant="ghost" size="sm" position="absolute" top="3" insetInlineEnd="3" disabled={busy}><X aria-hidden="true" size={18} /></IconButton></Dialog.CloseTrigger></Dialog.Content></Dialog.Positioner></Portal>
    </Dialog.Root>
  )
}
