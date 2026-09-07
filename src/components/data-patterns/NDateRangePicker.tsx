"use client"

import { Field, Flex, Input } from "@chakra-ui/react"
import { useMemo, useState } from "react"

import { defaultNDateRangePickerLabels, resolveLabels } from "./labels"
import type { NDateRangePickerProps, NDateRangeValue } from "./types"

const emptyRange: NDateRangeValue = { start: "", end: "" }
export function NDateRangePicker({ value, defaultValue = emptyRange, onChange, min, max, disabled, required, labels: custom }: NDateRangePickerProps) {
  const labels = useMemo(() => resolveLabels(defaultNDateRangePickerLabels, custom), [custom])
  const [internal, setInternal] = useState(defaultValue)
  const current = value ?? internal
  const invalid = Boolean(current.start && current.end && current.end < current.start)
  const update = (next: NDateRangeValue) => { if (value === undefined) setInternal(next); onChange?.(next) }
  return (
    <Field.Root invalid={invalid} disabled={disabled} required={required}>
      <Field.Label>{labels.group}<Field.RequiredIndicator /></Field.Label>
      <Flex gap="2" direction={{ base: "column", sm: "row" }}>
        <Input type="date" aria-label={labels.start} value={current.start} min={min} max={current.end || max} onChange={(event) => update({ ...current, start: event.target.value })} />
        <Input type="date" aria-label={labels.end} value={current.end} min={current.start || min} max={max} onChange={(event) => update({ ...current, end: event.target.value })} />
      </Flex>
      {invalid ? <Field.ErrorText>{labels.invalidRange}</Field.ErrorText> : null}
    </Field.Root>
  )
}
