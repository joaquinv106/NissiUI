"use client"

import {
  Button,
  Checkbox,
  Dialog,
  Field,
  IconButton,
  Input,
  NativeSelect,
  Portal,
  SimpleGrid,
} from "@chakra-ui/react"
import { X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import type { NTableColumn, NTableLabels, NTableRow } from "./types"
import { NTooltip } from "../internal/NTooltip"

interface EditRowDialogProps<T extends NTableRow> {
  open: boolean
  row: T | null
  columns: NTableColumn<T>[]
  labels: NTableLabels
  onOpenChange: (open: boolean) => void
  onSave: (row: T) => void | Promise<void>
}

/** Resuelve el `type` de `<input>` HTML según el tipo de dato de la columna. */
function inputType(type: NTableColumn["type"]) {
  if (type === "number" || type === "currency") return "number"
  if (type === "date") return "date"
  if (type === "datetime") return "datetime-local"
  if (type === "email") return "email"
  if (type === "url") return "url"
  return "text"
}

/** Convierte el valor de la fila al formato de texto que espera el `<input>` según su tipo. */
function inputValue(value: unknown, type: NTableColumn["type"]) {
  if (value === null || value === undefined) return ""
  if (type === "datetime") return String(value).slice(0, 16)
  if (type === "date") return String(value).slice(0, 10)
  return String(value)
}

/** Diálogo de edición de una fila: genera el control por tipo de columna y guarda al confirmar. */
export function EditRowDialog<T extends NTableRow>({
  open,
  row,
  columns,
  labels,
  onOpenChange,
  onSave,
}: EditRowDialogProps<T>) {
  const [draft, setDraft] = useState<T | null>(row)
  const [saving, setSaving] = useState(false)
  const initialFocusRef = useRef<HTMLElement | null>(null)
  const editableColumns = useMemo(
    () => columns.filter((column) => column.editable !== false),
    [columns],
  )

  useEffect(() => setDraft(row ? { ...row } : null), [row])

  const setValue = (column: NTableColumn<T>, value: unknown) => {
    setDraft((current) => current ? { ...current, [column.key]: value } : current)
  }

  const save = async () => {
    if (!draft) return
    setSaving(true)
    try {
      await onSave(draft)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      initialFocusEl={() => initialFocusRef.current}
      size="lg"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{labels.editDialogTitle}</Dialog.Title>
              <Dialog.Description>{labels.editDialogDescription}</Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                {draft ? editableColumns.map((column, index) => (
                  <Field.Root key={column.key} required={column.required}>
                    <Field.Label>{column.header}</Field.Label>
                    {column.type === "boolean" ? (
                      <Checkbox.Root
                        checked={Boolean(draft[column.key])}
                        onCheckedChange={(details) => setValue(column, Boolean(details.checked))}
                      >
                        <Checkbox.HiddenInput
                          autoFocus={index === 0}
                          ref={index === 0 ? (element) => { initialFocusRef.current = element } : undefined}
                        />
                        <Checkbox.Control />
                        <Checkbox.Label>{Boolean(draft[column.key]) ? labels.yes : labels.no}</Checkbox.Label>
                      </Checkbox.Root>
                    ) : column.type === "select" ? (
                      <NativeSelect.Root>
                        <NativeSelect.Field
                          autoFocus={index === 0}
                          ref={index === 0 ? (element) => { initialFocusRef.current = element } : undefined}
                          value={inputValue(draft[column.key], column.type)}
                          onChange={(event) => setValue(column, event.target.value)}
                        >
                          <option value="">{labels.selectOption}</option>
                          {column.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    ) : (
                      <Input
                        autoFocus={index === 0}
                        ref={index === 0 ? (element) => { initialFocusRef.current = element } : undefined}
                        type={inputType(column.type)}
                        value={inputValue(draft[column.key], column.type)}
                        onChange={(event) => setValue(
                          column,
                          column.type === "number" || column.type === "currency"
                            ? event.target.value === "" ? "" : Number(event.target.value)
                            : event.target.value,
                        )}
                      />
                    )}
                  </Field.Root>
                )) : null}
              </SimpleGrid>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">{labels.cancel}</Button>
              </Dialog.ActionTrigger>
              <Button colorPalette="blue" loading={saving} onClick={() => void save()}>{labels.saveChanges}</Button>
            </Dialog.Footer>
            <NTooltip content={labels.closeEdit}>
              <Dialog.CloseTrigger asChild>
                <IconButton position="absolute" top="2" right="2" variant="ghost" size="sm" aria-label={labels.closeEdit}>
                  <X size={16} />
                </IconButton>
              </Dialog.CloseTrigger>
            </NTooltip>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
