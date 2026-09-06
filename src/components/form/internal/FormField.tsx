"use client"

import {
  Checkbox,
  Field,
  GridItem,
  Input,
  NativeSelect,
  RadioGroup,
  Switch,
  Textarea,
} from "@chakra-ui/react"
import type { ReactNode } from "react"

import type { NFormField, NFormFieldRenderProps, NFormLabels, NFormRow } from "../types"
import { coerceFieldValue, colSpanStyle } from "../utils"

interface FormFieldProps<T extends NFormRow> {
  field: NFormField<T>
  value: unknown
  values: Partial<T>
  error?: string
  disabled: boolean
  labels: NFormLabels
  colorPalette: string
  onChange: (value: unknown) => void
  onBlur: () => void
}

/** Resuelve el `type` de `<input>` HTML según el tipo de campo del formulario. */
function inputType(type: NFormField["type"]) {
  if (type === "email") return "email"
  if (type === "password") return "password"
  if (type === "tel") return "tel"
  if (type === "url") return "url"
  if (type === "number" || type === "currency") return "number"
  if (type === "date") return "date"
  if (type === "datetime") return "datetime-local"
  return "text"
}

/** Convierte el valor del campo al texto que espera un `<input>`/`<select>` controlado. */
function toInputValue(value: unknown) {
  return value === undefined || value === null ? "" : String(value)
}

/** Renderiza el control adecuado según `field.type` (o `field.render` si es personalizado). */
export function FormField<T extends NFormRow>({
  field,
  value,
  values,
  error,
  disabled,
  labels,
  colorPalette,
  onChange,
  onBlur,
}: FormFieldProps<T>) {
  if (field.type === "hidden") return null

  const isDisabled = disabled || field.disabled
  const renderProps: NFormFieldRenderProps<T> = { field, value, values, error, disabled: Boolean(isDisabled), onChange, onBlur }

  let control: ReactNode
  if (field.render) {
    control = field.render(renderProps)
  } else if (field.type === "checkbox") {
    control = (
      <Checkbox.Root
        checked={Boolean(value)}
        disabled={isDisabled}
        colorPalette={colorPalette}
        onCheckedChange={(details) => onChange(Boolean(details.checked))}
        onBlur={onBlur}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>{Boolean(value) ? labels.yes : labels.no}</Checkbox.Label>
      </Checkbox.Root>
    )
  } else if (field.type === "switch") {
    control = (
      <Switch.Root
        checked={Boolean(value)}
        disabled={isDisabled}
        colorPalette={colorPalette}
        onCheckedChange={(details) => onChange(Boolean(details.checked))}
        onBlur={onBlur}
      >
        <Switch.HiddenInput />
        <Switch.Control />
        <Switch.Label>{Boolean(value) ? labels.yes : labels.no}</Switch.Label>
      </Switch.Root>
    )
  } else if (field.type === "radio") {
    control = (
      <RadioGroup.Root
        value={value === undefined || value === null ? "" : String(value)}
        disabled={isDisabled}
        colorPalette={colorPalette}
        onValueChange={(details) => onChange(details.value)}
      >
        <Field.RequiredIndicator />
        {(field.options ?? []).map((option) => (
          <RadioGroup.Item key={option.value} value={option.value} onBlur={onBlur}>
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>{option.label}</RadioGroup.ItemText>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    )
  } else if (field.type === "select" || field.type === "multiselect") {
    control = (
      <NativeSelect.Root disabled={isDisabled}>
        <NativeSelect.Field
          multiple={field.type === "multiselect"}
          value={field.type === "multiselect"
            ? (Array.isArray(value) ? value.map(String) : [])
            : toInputValue(value)}
          onChange={(event) => {
            if (field.type === "multiselect") {
              const selected = Array.from(event.target.selectedOptions).map((option) => option.value)
              onChange(selected)
            } else {
              onChange(event.target.value)
            }
          }}
          onBlur={onBlur}
        >
          {field.type === "select" ? <option value="">{labels.selectPlaceholder}</option> : null}
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    )
  } else if (field.type === "textarea") {
    control = (
      <Textarea
        placeholder={field.placeholder}
        disabled={isDisabled}
        value={toInputValue(value)}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
    )
  } else {
    control = (
      <Input
        type={inputType(field.type)}
        placeholder={field.placeholder}
        disabled={isDisabled}
        value={toInputValue(value)}
        onChange={(event) => onChange(coerceFieldValue(field, event.target.value))}
        onBlur={onBlur}
      />
    )
  }

  return (
    <GridItem colSpan={colSpanStyle(field.colSpan)}>
      <Field.Root invalid={Boolean(error)} required={Boolean(field.validation?.required)}>
        <Field.Label>{field.label}</Field.Label>
        {control}
        {field.helperText && !error ? <Field.HelperText>{field.helperText}</Field.HelperText> : null}
        {error ? <Field.ErrorText>{error}</Field.ErrorText> : null}
      </Field.Root>
    </GridItem>
  )
}
