"use client"

import {
  Box,
  Card,
  Heading,
  Portal,
  Stack,
  Text,
  Toast,
  Toaster,
  createToaster,
  chakra,
} from "@chakra-ui/react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { FormEvent } from "react"

import { FormActions } from "./internal/FormActions"
import { FormField } from "./internal/FormField"
import { FormSection } from "./internal/FormSection"
import { resolveNFormLabels } from "./labels"
import { usePermissions } from "../permissions"
import type { NFormMode, NFormProps, NFormRow } from "./types"
import {
  buildInitialValues,
  groupFieldsBySection,
  isFieldHidden,
  validateAllFields,
  validateFieldValue,
} from "./utils"

/** Formulario reactivo generado desde JSON: valida, agrupa por sección y notifica éxito/error. */
export function NForm<T extends NFormRow>({
  config,
  mode: modeProp,
  data,
  title,
  subtitle,
  card = true,
  variant = "outline",
  colorPalette = "blue",
  columns = 3,
  onSubmit,
  onCancel,
  onChange,
  resetOnSuccess = true,
  actions,
  labels: customLabels,
  unstyled = false,
  classNames,
  styles,
}: NFormProps<T>) {
  const labels = useMemo(() => resolveNFormLabels(customLabels), [customLabels])
  const { can } = usePermissions()
  const mode: NFormMode = modeProp ?? (data ? "edit" : "create")
  const initialValues = useMemo(() => buildInitialValues(config.fields, data), [config.fields, data])
  const [values, setValues] = useState<Partial<T>>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const toaster = useMemo(
    () => createToaster({ placement: "bottom-end", max: 2, duration: 4000 }),
    [],
  )

  const initialValuesRef = useRef(initialValues)
  useEffect(() => {
    initialValuesRef.current = initialValues
    setValues(initialValues)
    setErrors({})
  }, [initialValues])

  const groups = useMemo(() => groupFieldsBySection(config), [config])
  const hasRequiredField = config.fields.some((field) => Boolean(field.validation?.required))

  const setFieldValue = useCallback((key: string, value: unknown) => {
    setValues((current) => {
      const next = { ...current, [key]: value } as Partial<T>
      onChange?.(next)
      return next
    })
    setErrors((current) => {
      if (!(key in current)) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }, [onChange])

  const handleBlur = useCallback((key: Extract<keyof T, string>) => {
    const field = config.fields.find((item) => item.key === key)
    if (!field) return
    void validateFieldValue(field, values[key], values, labels).then((error) => {
      setErrors((current) => {
        if (!error) {
          if (!(key in current)) return current
          const next = { ...current }
          delete next[key]
          return next
        }
        return { ...current, [key]: error }
      })
    })
  }, [config.fields, labels, values])

  const handleReset = useCallback(() => {
    setValues(initialValuesRef.current)
    setErrors({})
  }, [])

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationErrors = await validateAllFields(config, values, labels, can)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setSubmitting(true)
    try {
      const result = await onSubmit(values as T, mode)
      if (result.success) {
        toaster.success({ title: result.message ?? labels.submitSuccess })
        if (mode === "create" && resetOnSuccess) handleReset()
      } else {
        setErrors(result.errors ?? {})
        toaster.error({ title: result.message ?? labels.submitError })
      }
    } catch {
      toaster.error({ title: labels.submitError })
    } finally {
      setSubmitting(false)
    }
  }, [can, config, handleReset, labels, mode, onSubmit, resetOnSuccess, toaster, values])

  const body = (
    <chakra.form className={classNames?.form ?? classNames?.root} css={styles?.form ?? styles?.root} data-scope="n-form" data-part="form" onSubmit={(event) => void handleSubmit(event)} noValidate>
      <Stack gap="6">
      {title || subtitle ? (
        <Stack className={classNames?.header} css={styles?.header} data-scope="n-form" data-part="header" gap="1">
          {title ? <Heading as="h2" size="lg">{title}</Heading> : null}
          {subtitle ? <Text color="fg.muted">{subtitle}</Text> : null}
        </Stack>
      ) : null}

      <Stack className={classNames?.fields} css={styles?.fields} data-scope="n-form" data-part="fields" gap="6">
        {groups.map((group, index) => (
          <FormSection key={group.section?.id ?? `section-${index}`} section={group.section ?? { id: `section-${index}`, columns }}>
            {group.fields.map((field) => (
              isFieldHidden(field, values, can) ? null : (
                <FormField
                  key={field.key}
                  field={field}
                  value={values[field.key]}
                  values={values}
                  error={errors[field.key]}
                  disabled={submitting}
                  labels={labels}
                  colorPalette={colorPalette}
                  onChange={(value) => setFieldValue(field.key, value)}
                  onBlur={() => handleBlur(field.key)}
                />
              )
            ))}
          </FormSection>
        ))}
      </Stack>

      <FormActions
        mode={mode}
        submitting={submitting}
        showRequiredNote={hasRequiredField}
        labels={labels}
        colorPalette={colorPalette}
        actions={actions}
        onCancel={onCancel}
        onReset={handleReset}
      />
      </Stack>
    </chakra.form>
  )

  return (
    <>
      {card ? (
        <Card.Root unstyled={unstyled} className={classNames?.surface ?? classNames?.root} css={styles?.surface ?? styles?.root} data-scope="n-form" data-part="surface" variant={unstyled || variant === "plain" ? undefined : variant} bg={unstyled ? undefined : "bg.panel"}>
          <Card.Body unstyled={unstyled}>{body}</Card.Body>
        </Card.Root>
      ) : body}
      <Portal>
        <Toaster toaster={toaster} insetInline={{ base: "4", md: "auto" }} insetBlockEnd="4" zIndex="max">
          {(toast) => {
            const toastColorPalette = toast.type === "success" ? "green" : toast.type === "error" ? "red" : colorPalette
            return (
              <Toast.Root
                width={{ base: "auto", md: "sm" }}
                maxW="calc(100vw - 2rem)"
                colorPalette={toastColorPalette}
                bg="colorPalette.subtle"
                color="colorPalette.fg"
                borderWidth="1px"
                borderColor="colorPalette.emphasized"
              >
                <Toast.Indicator color="colorPalette.fg" />
                <Toast.Title whiteSpace="normal" wordBreak="break-word">{toast.title}</Toast.Title>
                <Toast.CloseTrigger />
              </Toast.Root>
            )
          }}
        </Toaster>
      </Portal>
    </>
  )
}
