"use client"

import { Button, Field, HStack, NumberInput } from "@chakra-ui/react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { type ChangeEvent, type ComponentPropsWithoutRef, forwardRef, useId, useMemo, useRef, useState } from "react"

import { resolveNAmountInputLabels } from "./labels"
import type { NAmountInputProps } from "./types"
import { amountFromNumber, amountToEditableText, amountToText, parseAmountText } from "./utils"

const ControlledNumberInputField = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input">>(
  function ControlledNumberInputField({ defaultValue: _defaultValue, ...props }, ref) {
    return <input ref={ref} {...props} />
  },
)

/** Captura numérica neutral para cantidades, importes, porcentajes, horas o cualquier valor medible. */
export function NAmountInput({
  value,
  defaultValue = null,
  onValueChange,
  label,
  helperText,
  errorText,
  min,
  max,
  step = 1,
  locale,
  formatOptions,
  quickValues = [],
  showControls = false,
  allowOverflow = false,
  clampValueOnBlur = true,
  allowMouseWheel = false,
  disabled = false,
  readOnly = false,
  required = false,
  invalid = false,
  id,
  name,
  placeholder,
  size = "md",
  variant = "outline",
  textAlign = "end",
  width = "full",
  colorPalette = "blue",
  labels: labelsProp,
  unstyled = false,
  classNames,
  styles,
}: NAmountInputProps) {
  const labels = useMemo(() => resolveNAmountInputLabels(labelsProp), [labelsProp])
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [internalValue, setInternalValue] = useState<number | null>(defaultValue)
  const [editing, setEditing] = useState(false)
  const [draftText, setDraftText] = useState(() => amountToEditableText(defaultValue, locale, formatOptions))
  const currentEmission = useRef<{ value: number | null; valueText: string } | undefined>(undefined)
  const currentValue = value === undefined ? internalValue : value
  const valueText = editing ? draftText : amountToText(currentValue, locale, formatOptions)
  const isInvalid = invalid || Boolean(errorText)

  const publishValue = (nextValue: number | null, nextValueText: string, reason: "input" | "quick-value") => {
    if (reason === "input" && currentEmission.current && (
      currentEmission.current.valueText === nextValueText || Object.is(currentEmission.current.value, nextValue)
    )) return
    const emission = { value: nextValue, valueText: nextValueText }
    currentEmission.current = emission
    queueMicrotask(() => {
      if (currentEmission.current === emission) currentEmission.current = undefined
    })
    if (reason === "input") setDraftText(nextValueText)
    else setDraftText(amountToEditableText(nextValue, locale, formatOptions))
    if (value === undefined) setInternalValue(nextValue)
    onValueChange?.(nextValue, { value: nextValue, valueText: nextValueText, reason })
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValueText = event.currentTarget.value
    setDraftText(nextValueText)
    publishValue(parseAmountText(nextValueText, locale, formatOptions), nextValueText, "input")
  }

  const handleFocus = () => {
    setDraftText(amountToEditableText(currentValue, locale, formatOptions))
    setEditing(true)
  }

  const handleBlur = () => {
    setEditing(false)
  }

  return (
    <Field.Root unstyled={unstyled} className={classNames?.root} css={styles?.root} data-scope="n-amount-input" data-part="root" invalid={isInvalid} required={required} disabled={disabled} width={width} colorPalette={colorPalette}>
      {label ? <Field.Label unstyled={unstyled} className={classNames?.label} css={styles?.label} data-scope="n-amount-input" data-part="label" htmlFor={inputId}>{label}<Field.RequiredIndicator /></Field.Label> : null}
      <NumberInput.Root
        unstyled={unstyled}
        value={valueText}
        min={min}
        max={max}
        step={step}
        locale={locale}
        formatOptions={formatOptions}
        allowOverflow={allowOverflow}
        clampValueOnBlur={clampValueOnBlur}
        allowMouseWheel={allowMouseWheel}
        disabled={disabled}
        readOnly={readOnly}
        invalid={isInvalid}
        size={size}
        variant={variant}
        width="full"
        onValueChange={(details) => publishValue(amountFromNumber(details.valueAsNumber), details.value, "input")}
      >
        <NumberInput.Input
          unstyled={unstyled}
          className={classNames?.input}
          css={styles?.input}
          data-scope="n-amount-input"
          data-part="input"
          asChild
          id={inputId}
          name={name}
          value={valueText}
          aria-label={label ? undefined : labels.amountAriaLabel}
          placeholder={placeholder}
          inputMode="decimal"
          textAlign={textAlign}
          pe={showControls && !readOnly ? "12" : "3"}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleInputChange}
        >
          <ControlledNumberInputField />
        </NumberInput.Input>
        {showControls && !readOnly ? (
          <NumberInput.Context>
            {(numberInput) => (
              <NumberInput.Control unstyled={unstyled} className={classNames?.controls} css={styles?.controls} data-scope="n-amount-input" data-part="controls" width="8" display="grid" gridTemplateRows="repeat(2, 1fr)">
                <Button
                  type="button"
                  aria-label={labels.increment}
                  disabled={disabled || (!allowOverflow && max !== undefined && numberInput.valueAsNumber >= max)}
                  variant="ghost"
                  size="2xs"
                  minW="0"
                  minH="0"
                  h="full"
                  p="0"
                  borderRadius="0"
                  color="fg.muted"
                  borderBottomWidth="1px"
                  borderColor="border"
                  _hover={{ bg: "bg.muted", color: "fg" }}
                  _focusVisible={{ outline: "2px solid", outlineColor: "colorPalette.focusRing", outlineOffset: "-2px" }}
                  onClick={numberInput.increment}
                >
                  <ChevronUp aria-hidden size={12} strokeWidth={2} />
                </Button>
                <Button
                  type="button"
                  aria-label={labels.decrement}
                  disabled={disabled || (!allowOverflow && min !== undefined && numberInput.valueAsNumber <= min)}
                  variant="ghost"
                  size="2xs"
                  minW="0"
                  minH="0"
                  h="full"
                  p="0"
                  borderRadius="0"
                  color="fg.muted"
                  _hover={{ bg: "bg.muted", color: "fg" }}
                  _focusVisible={{ outline: "2px solid", outlineColor: "colorPalette.focusRing", outlineOffset: "-2px" }}
                  onClick={numberInput.decrement}
                >
                  <ChevronDown aria-hidden size={12} strokeWidth={2} />
                </Button>
              </NumberInput.Control>
            )}
          </NumberInput.Context>
        ) : null}
      </NumberInput.Root>
      {quickValues.length > 0 && !readOnly ? (
        <HStack className={classNames?.quickValues} css={styles?.quickValues} data-scope="n-amount-input" data-part="quick-values" aria-label={labels.quickValuesLabel} gap="2" flexWrap="wrap">
          {quickValues.map((quickValue) => (
            <Button
              key={`${quickValue.value}-${quickValue.label ?? ""}`}
              type="button"
              size="xs"
              variant="subtle"
              aria-label={quickValue.label ?? labels.quickValue(quickValue.value)}
              disabled={disabled || (min !== undefined && quickValue.value < min) || (max !== undefined && quickValue.value > max)}
              onClick={() => publishValue(quickValue.value, amountToText(quickValue.value, locale, formatOptions), "quick-value")}
            >
              {quickValue.label ?? quickValue.value}
            </Button>
          ))}
        </HStack>
      ) : null}
      {helperText ? <Field.HelperText unstyled={unstyled} className={classNames?.helper} css={styles?.helper} data-scope="n-amount-input" data-part="helper">{helperText}</Field.HelperText> : null}
      {errorText ? <Field.ErrorText unstyled={unstyled} className={classNames?.error} css={styles?.error} data-scope="n-amount-input" data-part="error">{errorText}</Field.ErrorText> : null}
    </Field.Root>
  )
}
