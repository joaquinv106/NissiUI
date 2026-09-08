"use client"

import { Field, Flex, Input } from "@chakra-ui/react"
import { useMemo, useState } from "react"

import { defaultNDateRangePickerLabels, resolveLabels } from "./labels"
import type { NDateRangePickerProps, NDateRangeValue } from "./types"

const emptyRange: NDateRangeValue = { start: "", end: "" }
export function NDateRangePicker({ value, defaultValue = emptyRange, onChange, min, max, disabled, required, labels: custom, unstyled = false, classNames, styles }: NDateRangePickerProps) {
  const labels = useMemo(() => resolveLabels(defaultNDateRangePickerLabels, custom), [custom])
  const [internal, setInternal] = useState(defaultValue)
  const current = value ?? internal
  const invalid = Boolean(current.start && current.end && current.end < current.start)
  const update = (next: NDateRangeValue) => { if (value === undefined) setInternal(next); onChange?.(next) }
  return (
    <Field.Root invalid={invalid} disabled={disabled} required={required} className={classNames?.root} css={styles?.root} data-scope="n-date-range-picker" data-part="root">
      <Field.Label unstyled={unstyled} className={classNames?.label} css={styles?.label} data-part="label">{labels.group}<Field.RequiredIndicator /></Field.Label>
      <Flex gap="2" direction={{ base: "column", sm: "row" }} className={classNames?.fields} css={styles?.fields} data-part="fields">
        <Input unstyled={unstyled} type="date" aria-label={labels.start} value={current.start} min={min} max={current.end || max} onChange={(event) => update({ ...current, start: event.target.value })} className={classNames?.start} css={styles?.start} data-part="start" />
        <Input unstyled={unstyled} type="date" aria-label={labels.end} value={current.end} min={current.start || min} max={max} onChange={(event) => update({ ...current, end: event.target.value })} className={classNames?.end} css={styles?.end} data-part="end" />
      </Flex>
      {invalid ? <Field.ErrorText className={classNames?.error} css={styles?.error} data-part="error">{labels.invalidRange}</Field.ErrorText> : null}
    </Field.Root>
  )
}
