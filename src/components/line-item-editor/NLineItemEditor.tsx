"use client"

import { Badge, Box, Button, Center, Grid, Heading, HStack, IconButton, Input, NativeSelect, Spinner, Stack, Text } from "@chakra-ui/react"
import { ArrowDown, ArrowUp, ClipboardList, Plus, Trash2, X } from "lucide-react"
import { type ChangeEvent, useEffect, useId, useMemo, useRef, useState } from "react"

import { NItemPicker } from "../item-picker"
import { resolveNLineItemEditorLabels } from "./labels"
import type { NLineItemChange, NLineItemEditorProps, NLineItemField, NLineItemValue } from "./types"
import { moveLineItem, parseLineItemValue } from "./utils"

/** Editor gen\u00e9rico de partidas para documentos y flujos operativos de cualquier dominio. */
export function NLineItemEditor<TItem, TLine>({
  items,
  getItemId,
  getItemLabel,
  createLine,
  getLineId,
  getLineLabel,
  getLineDescription,
  fields = [],
  lines,
  defaultLines = [],
  onLinesChange,
  resolveAdd,
  pickerProps,
  pickerOpen,
  defaultPickerOpen = false,
  onPickerOpenChange,
  isItemDisabled,
  isLineDisabled,
  canRemoveLine,
  canReorderLine,
  renderLineLeading,
  renderLineActions,
  reorderable = true,
  removable = true,
  readOnly = false,
  disabled = false,
  loading = false,
  error,
  header,
  footer,
  emptyState,
  colorPalette = "blue",
  labels: labelsProp,
  unstyled = false,
  classNames,
  styles,
}: NLineItemEditorProps<TItem, TLine>) {
  const labels = useMemo(() => resolveNLineItemEditorLabels(labelsProp), [labelsProp])
  const [internalLines, setInternalLines] = useState<TLine[]>(() => [...defaultLines])
  const [internalPickerOpen, setInternalPickerOpen] = useState(defaultPickerOpen)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const activeLines = lines ?? internalLines
  const isPickerOpen = pickerOpen ?? internalPickerOpen
  const pickerRegionId = useId()
  const rowRefs = useRef(new Map<string, HTMLElement>())
  const pendingFocusId = useRef<string | undefined>(undefined)
  const warnedAboutDuplicateIds = useRef(false)

  const resolvedLines = useMemo(() => activeLines.map((line, index) => ({
    id: getLineId(line, index),
    index,
    line,
    label: getLineLabel(line),
    description: getLineDescription?.(line),
    disabled: disabled || Boolean(isLineDisabled?.(line)),
  })), [activeLines, disabled, getLineDescription, getLineId, getLineLabel, isLineDisabled])

  useEffect(() => {
    const ids = resolvedLines.map((line) => line.id)
    const isDevelopment = typeof process === "undefined" || process.env.NODE_ENV !== "production"
    if (isDevelopment && !warnedAboutDuplicateIds.current && new Set(ids).size !== ids.length) {
      warnedAboutDuplicateIds.current = true
      console.warn("[NissiUI] NLineItemEditor recibi\u00f3 identificadores duplicados mediante getLineId.")
    }
  }, [resolvedLines])

  useEffect(() => {
    const id = pendingFocusId.current
    if (!id) return
    const row = rowRefs.current.get(id)
    if (row) {
      row.focus()
      pendingFocusId.current = undefined
    }
  }, [resolvedLines])

  const publishLines = (nextLines: readonly TLine[], change: NLineItemChange<TItem, TLine>) => {
    const copy = [...nextLines]
    if (lines === undefined) setInternalLines(copy)
    onLinesChange?.(copy, change)
  }

  const changePickerOpen = (open: boolean) => {
    if (pickerOpen === undefined) setInternalPickerOpen(open)
    onPickerOpenChange?.(open)
  }

  const addItem = (item: TItem) => {
    if (disabled || readOnly) return
    const line = createLine(item, { lines: activeLines })
    const nextLines = resolveAdd ? resolveAdd({ item, line, lines: activeLines }) : [...activeLines, line]
    pendingFocusId.current = getLineId(line, nextLines.indexOf(line))
    publishLines(nextLines, { reason: "add", item, line })
  }

  const updateLine = (index: number, nextLine: TLine, fieldId?: string) => {
    const nextLines = [...activeLines]
    nextLines[index] = nextLine
    publishLines(nextLines, { reason: "update", line: nextLine, fieldId, fromIndex: index, toIndex: index })
  }

  const updateField = (field: NLineItemField<TLine>, index: number, value: NLineItemValue) => {
    const resolved = resolvedLines[index]
    if (!resolved || !field.setValue || resolved.disabled || readOnly) return
    const nextLine = field.setValue(resolved.line, value)
    const errorMessage = field.validate?.(value, nextLine)
    const errorKey = `${resolved.id}:${field.id}`
    setFieldErrors((current) => {
      if (errorMessage) return { ...current, [errorKey]: errorMessage }
      if (!(errorKey in current)) return current
      const next = { ...current }
      delete next[errorKey]
      return next
    })
    updateLine(index, nextLine, field.id)
  }

  const removeLine = (index: number) => {
    const resolved = resolvedLines[index]
    if (!resolved || resolved.disabled || readOnly || !removable || canRemoveLine?.(resolved.line) === false) return
    const nextLines = activeLines.filter((_, lineIndex) => lineIndex !== index)
    const focusTarget = resolvedLines[index + 1]?.id ?? resolvedLines[index - 1]?.id
    if (focusTarget) pendingFocusId.current = focusTarget
    publishLines(nextLines, { reason: "remove", line: resolved.line, fromIndex: index })
  }

  const reorderLine = (fromIndex: number, toIndex: number) => {
    const resolved = resolvedLines[fromIndex]
    if (!resolved || resolved.disabled || readOnly || !reorderable || canReorderLine?.(resolved.line) === false) return
    pendingFocusId.current = resolved.id
    publishLines(moveLineItem(activeLines, fromIndex, toIndex), {
      reason: "reorder",
      line: resolved.line,
      fromIndex,
      toIndex,
    })
  }

  const actionColumnVisible = !readOnly && (reorderable || removable || Boolean(renderLineActions))
  const gridTemplateColumns = {
    base: "minmax(0, 1fr)",
    md: ["minmax(12rem, 2fr)", ...fields.map((field) => field.width ?? "minmax(7rem, 1fr)"), actionColumnVisible ? "auto" : ""].filter(Boolean).join(" "),
  }

  const renderField = (field: NLineItemField<TLine>, index: number) => {
    const resolved = resolvedLines[index]
    const value = field.getValue(resolved.line)
    const errorKey = `${resolved.id}:${field.id}`
    const fieldError = fieldErrors[errorKey]
    const fieldDisabled = resolved.disabled || readOnly || !field.setValue
    const updateValue = (nextValue: NLineItemValue) => updateField(field, index, nextValue)

    if (field.render) {
      return field.render({
        line: resolved.line,
        lineId: resolved.id,
        index,
        value,
        disabled: fieldDisabled,
        error: fieldError,
        updateValue,
        updateLine: (nextLine) => updateLine(index, nextLine, field.id),
      })
    }

    if (!field.setValue || readOnly) {
      return <Box textAlign={field.align}>{field.formatValue?.(value, resolved.line) ?? String(value)}</Box>
    }

    const accessibleLabel = labels.editField(field.header, resolved.label)
    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      updateValue(parseLineItemValue(field, event.target.value, resolved.line))
    }

    return (
      <Stack gap="1">
        {field.inputType === "select" ? (
          <NativeSelect.Root disabled={fieldDisabled} invalid={Boolean(fieldError)}>
            <NativeSelect.Field aria-label={accessibleLabel} value={String(value)} onChange={handleChange}>
              {field.options?.map((option) => <option key={String(option.value)} value={option.value} disabled={option.disabled}>{option.label}</option>)}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        ) : (
          <Input
            aria-label={accessibleLabel}
            aria-invalid={Boolean(fieldError)}
            type={field.inputType === "number" ? "number" : "text"}
            value={value}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            disabled={fieldDisabled}
            textAlign={field.align}
            onChange={handleChange}
          />
        )}
        {fieldError ? <Text role="alert" color="fg.error" fontSize="xs">{fieldError}</Text> : null}
      </Stack>
    )
  }

  return (
    <Stack as="section" aria-label={labels.editorLabel} gap="4" minW="0" colorPalette={colorPalette} className={classNames?.root} css={styles?.root} data-scope="n-line-item-editor" data-part="root">
      {header}

      <HStack justify="space-between" align="center" gap="3" flexWrap="wrap">
        <Badge colorPalette={colorPalette}>{labels.lineCount(activeLines.length)}</Badge>
        {!readOnly ? (
          <Button
            type="button"
            size="sm"
            variant={isPickerOpen ? "subtle" : "outline"}
            aria-expanded={isPickerOpen}
            aria-controls={pickerRegionId}
            disabled={disabled}
            onClick={() => changePickerOpen(!isPickerOpen)}
          >
            {isPickerOpen ? <X aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {isPickerOpen ? labels.closeItems : labels.addItems}
          </Button>
        ) : null}
      </HStack>

      {isPickerOpen && !readOnly ? (
        <Box id={pickerRegionId} p={unstyled ? undefined : { base: "3", md: "4" }} borderWidth={unstyled ? undefined : "1px"} borderColor="border" rounded={unstyled ? undefined : "lg"} bg={unstyled ? undefined : "bg.subtle"} className={classNames?.picker} css={styles?.picker} data-part="picker">
          <NItemPicker
            {...pickerProps}
            items={items}
            getItemId={getItemId}
            getItemLabel={getItemLabel}
            selectionMode="none"
            disabled={disabled}
            loading={loading}
            colorPalette={colorPalette}
            isItemDisabled={(item) => Boolean(isItemDisabled?.(item, activeLines))}
            onItemSelect={addItem}
          />
        </Box>
      ) : null}

      {error ? (
        <Stack role="alert" gap="1" p="4" borderWidth="1px" borderColor="border.error" rounded="lg" bg="bg.error">
          <Text fontWeight="semibold" color="fg.error">{labels.errorTitle}</Text>
          <Box color="fg.error">{error}</Box>
        </Stack>
      ) : loading && !isPickerOpen ? (
        <Center role="status" minH="10rem" gap="3" color="fg.muted">
          <Spinner size="sm" />
          <Text>{labels.loading}</Text>
        </Center>
      ) : resolvedLines.length === 0 ? (
        emptyState ?? (
          <Center role="status" minH="11rem" flexDirection="column" gap="2" p="6" textAlign="center" borderWidth="1px" borderColor="border" rounded="lg" bg="bg.panel">
            <Box color="fg.muted"><ClipboardList aria-hidden="true" size={28} /></Box>
            <Heading as="h3" size="sm">{labels.emptyTitle}</Heading>
            <Text color="fg.muted" fontSize="sm">{labels.emptyDescription}</Text>
          </Center>
        )
      ) : (
        <Stack gap="2">
          <Grid display={{ base: "none", md: "grid" }} gridTemplateColumns={gridTemplateColumns} gap="3" px="4" color="fg.muted" fontSize="sm" fontWeight="medium">
            <Text>{labels.itemColumn}</Text>
            {fields.map((field) => <Text key={field.id} textAlign={field.align}>{field.header}</Text>)}
            {actionColumnVisible ? <Box /> : null}
          </Grid>
          <Stack as="ul" gap="2" p="0" m="0">
            {resolvedLines.map((resolved) => {
              const allowReorder = reorderable && canReorderLine?.(resolved.line) !== false
              const allowRemove = removable && canRemoveLine?.(resolved.line) !== false
              const state = { id: resolved.id, index: resolved.index, disabled: resolved.disabled, line: resolved.line }
              return (
                <Grid
                  as="li"
                  key={resolved.id}
                  ref={(element: HTMLDivElement | null) => {
                    if (element) rowRefs.current.set(resolved.id, element)
                    else rowRefs.current.delete(resolved.id)
                  }}
                  tabIndex={-1}
                  listStyleType="none"
                  gridTemplateColumns={gridTemplateColumns}
                  alignItems={{ base: "stretch", md: "center" }}
                  gap={{ base: "3", md: "3" }}
                  p="4"
                  borderWidth="1px"
                  borderColor="border"
                  rounded="lg"
                  bg="bg.panel"
                  opacity={resolved.disabled ? 0.6 : 1}
                  _focusVisible={{ outline: "2px solid", outlineColor: "colorPalette.focusRing", outlineOffset: "2px" }}
                >
                  <HStack minW="0" align="start" gap="3">
                    {renderLineLeading ? <Box flexShrink="0">{renderLineLeading(resolved.line, state)}</Box> : null}
                    <Stack gap="0.5" minW="0">
                      <Text fontWeight="semibold" lineClamp="1">{resolved.label}</Text>
                      {resolved.description ? <Text color="fg.muted" fontSize="sm" lineClamp="2">{resolved.description}</Text> : null}
                    </Stack>
                  </HStack>

                  {fields.map((field) => (
                    <Stack key={field.id} gap="1">
                      <Text display={{ base: "block", md: "none" }} color="fg.muted" fontSize="xs" fontWeight="medium">{field.header}</Text>
                      {renderField(field, resolved.index)}
                    </Stack>
                  ))}

                  {actionColumnVisible ? (
                    <HStack justify={{ base: "flex-end", md: "start" }} gap="1">
                      {renderLineActions?.(resolved.line, state)}
                      {allowReorder ? (
                        <>
                          <IconButton aria-label={labels.moveLineUp(resolved.label)} size="sm" variant="ghost" disabled={resolved.disabled || resolved.index === 0} onClick={() => reorderLine(resolved.index, resolved.index - 1)}><ArrowUp aria-hidden="true" /></IconButton>
                          <IconButton aria-label={labels.moveLineDown(resolved.label)} size="sm" variant="ghost" disabled={resolved.disabled || resolved.index === resolvedLines.length - 1} onClick={() => reorderLine(resolved.index, resolved.index + 1)}><ArrowDown aria-hidden="true" /></IconButton>
                        </>
                      ) : null}
                      {allowRemove ? <IconButton aria-label={labels.removeLine(resolved.label)} size="sm" variant="ghost" colorPalette="red" disabled={resolved.disabled} onClick={() => removeLine(resolved.index)}><Trash2 aria-hidden="true" /></IconButton> : null}
                    </HStack>
                  ) : null}
                </Grid>
              )
            })}
          </Stack>
        </Stack>
      )}

      {footer}
    </Stack>
  )
}
