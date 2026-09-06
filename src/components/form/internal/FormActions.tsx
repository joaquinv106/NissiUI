"use client"

import { Button, HStack, Text } from "@chakra-ui/react"
import type { ReactNode } from "react"

import type { NFormLabels, NFormMode } from "../types"

interface FormActionsProps {
  mode: NFormMode
  submitting: boolean
  showRequiredNote: boolean
  labels: NFormLabels
  colorPalette: string
  actions?: ReactNode
  onCancel?: () => void
  onReset: () => void
}

/** Barra de acciones del formulario: restablecer, cancelar y enviar, con nota de campos requeridos. */
export function FormActions({
  mode,
  submitting,
  showRequiredNote,
  labels,
  colorPalette,
  actions,
  onCancel,
  onReset,
}: FormActionsProps) {
  return (
    <HStack justify="space-between" wrap="wrap" gap="3">
      {showRequiredNote ? (
        <Text color="fg.muted" fontSize="xs">{labels.requiredFieldsNote}</Text>
      ) : <span />}
      <HStack gap="2" wrap="wrap">
        {actions}
        <Button type="button" variant="ghost" disabled={submitting} onClick={onReset}>
          {labels.reset}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" disabled={submitting} onClick={onCancel}>
            {labels.cancel}
          </Button>
        ) : null}
        <Button type="submit" colorPalette={colorPalette} loading={submitting}>
          {mode === "create" ? labels.create : labels.save}
        </Button>
      </HStack>
    </HStack>
  )
}
