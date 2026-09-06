"use client"

import { Grid, Heading, Stack, Text } from "@chakra-ui/react"
import type { ReactNode } from "react"

import type { NFormSection } from "../types"

interface FormSectionProps {
  section?: NFormSection
  children: ReactNode
}

/** Agrupa campos en una rejilla responsive, con título/descripción opcionales de la sección. */
export function FormSection({ section, children }: FormSectionProps) {
  const grid = (
    <Grid templateColumns={{ base: "1fr", md: `repeat(${section?.columns ?? 3}, 1fr)` }} gap="4">
      {children}
    </Grid>
  )

  if (!section?.title && !section?.description) return grid

  return (
    <Stack gap="3">
      <Stack gap="1">
        {section.title ? <Heading as="h3" size="sm">{section.title}</Heading> : null}
        {section.description ? <Text color="fg.muted" fontSize="sm">{section.description}</Text> : null}
      </Stack>
      {grid}
    </Stack>
  )
}
