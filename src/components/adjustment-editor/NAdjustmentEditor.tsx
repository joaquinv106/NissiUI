"use client"

import { Badge, Box, Button, Card, Center, Field, Flex, Grid, Heading, Input, NativeSelect, Spinner, Stack, Text, Textarea } from "@chakra-ui/react"
import { RotateCcw } from "lucide-react"
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"

import { resolveNAdjustmentEditorLabels } from "./labels"
import type { NAdjustmentEditorProps, NAdjustmentResult, NAdjustmentValue } from "./types"
import { adjustmentChangedFieldIds, adjustmentResultMessage, adjustmentResultSucceeded, parseAdjustmentValue } from "./utils"

/** Propone correcciones auditables conservando visible el valor original. */
export function NAdjustmentEditor<T>({
  item, getItemId, getItemTitle, getItemDescription, createAdjustment, fields = [], value, onValueChange,
  reason, defaultReason = "", onReasonChange, requireReason = true, validate, onSubmit, renderOriginal, renderEditor,
  disabled = false, readOnly = false, loading = false, error, emptyState, header, footer, colorPalette = "blue", labels: labelsProp, unstyled = false, classNames, styles,
}: NAdjustmentEditorProps<T>) {
  const labels = useMemo(() => resolveNAdjustmentEditorLabels(labelsProp), [labelsProp])
  const itemId = item ? getItemId(item) : undefined
  const [internalValue, setInternalValue] = useState<{ itemId?: string; value?: T }>(() => ({ itemId, value: item ? createAdjustment(item) : undefined }))
  const [internalReason, setInternalReason] = useState({ itemId, reason: defaultReason })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<ReactNode>()
  const [busy, setBusy] = useState(false)
  const previousItemId = useRef(itemId)
  const currentItemId = useRef(itemId)
  const sequence = useRef(0)
  currentItemId.current = itemId
  const adjustment = value ?? (internalValue.itemId === itemId ? internalValue.value : item ? createAdjustment(item) : undefined)
  const activeReason = reason ?? (internalReason.itemId === itemId ? internalReason.reason : defaultReason)
  const changedFieldIds = item && adjustment ? adjustmentChangedFieldIds(item, adjustment, fields) : []

  useEffect(() => {
    if (previousItemId.current === itemId) return
    previousItemId.current = itemId
    sequence.current += 1
    setInternalValue({ itemId, value: item ? createAdjustment(item) : undefined })
    setInternalReason({ itemId, reason: defaultReason })
    setErrors({})
    setMessage(undefined)
    setBusy(false)
  }, [createAdjustment, defaultReason, item, itemId])

  if (error) return <Stack as="section" aria-label={labels.editorLabel} role="alert" gap="1" p={unstyled ? undefined : "4"} borderWidth={unstyled ? undefined : "1px"} borderColor="border.error" rounded={unstyled ? undefined : "lg"} bg={unstyled ? undefined : "bg.error"} className={classNames?.error} css={styles?.error ?? styles?.root} data-scope="n-adjustment-editor" data-part="error"><Text color="fg.error" fontWeight="semibold">{labels.errorTitle}</Text><Box color="fg.error">{error}</Box></Stack>
  if (loading) return <Center as="section" aria-label={labels.editorLabel} role="status" minH="12rem" gap="3" className={classNames?.loading} css={styles?.loading ?? styles?.root} data-scope="n-adjustment-editor" data-part="loading"><Spinner size="sm" /><Text color="fg.muted">{labels.loading}</Text></Center>
  if (!item || !adjustment || !itemId) return emptyState ?? <Center as="section" aria-label={labels.editorLabel} role="status" minH="12rem" flexDirection="column" gap="2" p="6" borderWidth="1px" borderColor="border" rounded="lg"><Text fontWeight="semibold">{labels.emptyTitle}</Text><Text color="fg.muted" fontSize="sm">{labels.emptyDescription}</Text></Center>

  const update = (next: T | ((current: T) => T), fieldId?: string) => {
    const resolved = typeof next === "function" ? (next as (current: T) => T)(adjustment) : next
    const nextChanged = adjustmentChangedFieldIds(item, resolved, fields)
    if (value === undefined) setInternalValue({ itemId, value: resolved })
    setMessage(undefined)
    onValueChange?.(resolved, { itemId, fieldId, reason: "field", changedFieldIds: nextChanged, original: item })
  }

  const reset = () => {
    const next = createAdjustment(item)
    if (value === undefined) setInternalValue({ itemId, value: next })
    setErrors({})
    setMessage(undefined)
    onValueChange?.(next, { itemId, reason: "reset", changedFieldIds: [], original: item })
  }

  const changeReason = (next: string) => {
    if (reason === undefined) setInternalReason({ itemId, reason: next })
    setMessage(undefined)
    onReasonChange?.(next)
  }

  const submit = async () => {
    if (disabled || readOnly || busy) return
    const fieldErrors: Record<string, string> = {}
    for (const field of fields) {
      const fieldMessage = field.validate?.(field.getValue(adjustment), adjustment)
      if (fieldMessage) fieldErrors[field.id] = fieldMessage
    }
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length) { setMessage(labels.validationFailed); return }
    if (!changedFieldIds.length && fields.length) { setMessage(labels.noChanges); return }
    if (requireReason && !activeReason.trim()) { setMessage(labels.reasonRequired); return }
    const details = { itemId, original: item, adjustment, reason: activeReason.trim(), changedFieldIds }
    setBusy(true)
    setMessage(undefined)
    const request = ++sequence.current
    try {
      const validationMessage = await validate?.(details)
      if (request !== sequence.current || currentItemId.current !== itemId) return
      if (validationMessage) { setMessage(validationMessage); setBusy(false); return }
      const result = await onSubmit?.(details) as void | boolean | NAdjustmentResult
      if (request !== sequence.current || currentItemId.current !== itemId) return
      if (!adjustmentResultSucceeded(result)) setMessage(adjustmentResultMessage(result) ?? labels.submitFailed)
      setBusy(false)
    } catch {
      if (request !== sequence.current || currentItemId.current !== itemId) return
      setMessage(labels.submitFailed)
      setBusy(false)
    }
  }

  const context = { original: item, adjustment, update, disabled, busy, changedFieldIds, errors }

  return (
    <Stack as="section" aria-label={labels.editorLabel} gap="5" minW="0" colorPalette={colorPalette} data-item-id={itemId} className={classNames?.root} css={styles?.root} data-scope="n-adjustment-editor" data-part="root">
      {header}
      <Box><Heading as="h3" size="md">{getItemTitle(item)}</Heading>{getItemDescription ? <Box color="fg.muted" fontSize="sm">{getItemDescription(item)}</Box> : null}</Box>
      {renderEditor ? <Grid templateColumns={{ base: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr)" }} gap="4"><Card.Root variant="outline"><Card.Header><Card.Title>{labels.originalTitle}</Card.Title></Card.Header><Card.Body>{renderOriginal?.(item) ?? null}</Card.Body></Card.Root><Card.Root variant="outline"><Card.Header><Card.Title>{labels.adjustmentTitle}</Card.Title></Card.Header><Card.Body>{renderEditor(context)}</Card.Body></Card.Root></Grid> : (
        <Stack gap="3">{fields.map((field) => {
          const originalValue = field.getValue(item)
          const adjustedValue = field.getValue(adjustment)
          const changed = changedFieldIds.includes(field.id)
          const fieldDisabled = disabled || busy || readOnly || field.disabled
          const setRaw = (raw: string) => update(field.setValue(adjustment, parseAdjustmentValue(field, raw, adjustment)), field.id)
          return <Grid key={field.id} templateColumns={{ base: "1fr", md: "minmax(8rem, .7fr) minmax(0, 1fr) minmax(0, 1fr)" }} gap="3" alignItems="start" p="4" borderWidth="1px" borderColor={changed ? "colorPalette.muted" : "border"} rounded="lg" bg="bg.panel">
            <Flex gap="2" align="center" minH="10"><Box fontWeight="medium">{field.label}</Box>{changed ? <Badge colorPalette={colorPalette}>{labels.changed}</Badge> : null}</Flex>
            <Box><Text color="fg.muted" fontSize="xs" mb="1">{labels.originalValue}</Text><Box minH="10" py="2">{field.formatValue?.(originalValue, item) ?? String(originalValue ?? "—")}</Box></Box>
            <Field.Root invalid={Boolean(errors[field.id])} disabled={fieldDisabled}><Field.Label fontSize="xs" color="fg.muted">{labels.adjustedValue}</Field.Label>
              {field.inputType === "select" ? <NativeSelect.Root disabled={fieldDisabled}><NativeSelect.Field value={String(adjustedValue ?? "")} onChange={(event) => setRaw(event.target.value)}>{field.options?.map((option) => <option key={String(option.value)} value={option.value} disabled={option.disabled}>{option.label}</option>)}</NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root> : field.inputType === "textarea" ? <Textarea value={String(adjustedValue ?? "")} placeholder={field.placeholder} onChange={(event) => setRaw(event.target.value)} /> : <Input type={field.inputType === "number" ? "number" : "text"} value={adjustedValue === null ? "" : String(adjustedValue)} placeholder={field.placeholder} onChange={(event) => setRaw(event.target.value)} />}
              {field.helperText ? <Field.HelperText>{field.helperText}</Field.HelperText> : null}{errors[field.id] ? <Field.ErrorText>{errors[field.id]}</Field.ErrorText> : null}
            </Field.Root>
          </Grid>
        })}</Stack>
      )}
      {!readOnly ? <Field.Root invalid={requireReason && Boolean(message === labels.reasonRequired)} disabled={disabled || busy} required={requireReason}><Field.Label>{labels.reasonLabel}</Field.Label><Textarea value={activeReason} placeholder={labels.reasonPlaceholder} autoresize onChange={(event) => changeReason(event.target.value)} /><Field.HelperText>{labels.reasonHelp}</Field.HelperText></Field.Root> : null}
      {message ? <Box role="alert" p="3" rounded="md" borderWidth="1px" borderColor="border.error" bg="bg.error" color="fg.error">{message}</Box> : null}
      {!readOnly ? <Flex justify="space-between" gap="2" direction={{ base: "column-reverse", sm: "row" }}><Button type="button" variant="ghost" disabled={disabled || busy || !changedFieldIds.length} onClick={reset}><RotateCcw aria-hidden size={16} />{labels.reset}</Button><Button type="button" colorPalette={colorPalette} disabled={disabled} loading={busy} loadingText={labels.processing} onClick={() => void submit()}>{labels.submit}</Button></Flex> : null}
      {footer}
    </Stack>
  )
}
