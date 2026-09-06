"use client"

import { Badge, Box, Card, Code, Heading, Stack, SimpleGrid, Tabs, Text } from "@chakra-ui/react"
import type { ReactNode } from "react"

export interface ComponentDocVariant {
  name: string
  description: string
}

export interface VariantExample {
  id: string
  /** Texto corto de la pestaña/pill, p. ej. "Site" o "Colapsado". */
  label: string
  /** Qué prop(s) distingue a esta variante, mostrado junto al pill. */
  summary?: string
  preview: ReactNode
  code: string
}

export interface PropExample {
  label: string
  code: string
}

export interface ComponentDocsProps {
  purpose: string
  steps: string[]
  variants: ComponentDocVariant[]
  /** Variantes navegables por pills: cada una con su propia vista previa en vivo y su código. */
  variantExamples?: VariantExample[]
  /** Ejemplos adicionales de paso de props (uno o varios), para casos de uso concretos. */
  propExamples?: PropExample[]
  code: string
}

function CodePanel({ code }: { code: string }) {
  return (
    <Box
      as="pre"
      bg="bg.muted"
      borderWidth="1px"
      borderColor="border"
      rounded="md"
      p="4"
      overflowX="auto"
      fontFamily="mono"
      fontSize="xs"
      lineHeight="1.7"
      color="fg"
    >
      {code}
    </Box>
  )
}

/** Pills de variantes: cada pestaña muestra la vista previa en vivo junto a su código. */
function VariantExplorer({ examples }: { examples: VariantExample[] }) {
  if (examples.length === 0) return null
  return (
    <Tabs.Root
      defaultValue={examples[0]!.id}
      variant="subtle"
      colorPalette="blue"
      css={{ "--tabs-trigger-radius": "9999px" }}
    >
      <Tabs.List flexWrap="wrap" gap="2" bg="transparent" p="0">
        {examples.map((example) => (
          <Tabs.Trigger key={example.id} value={example.id} borderWidth="1px" borderColor="border">
            {example.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {examples.map((example) => (
        <Tabs.Content key={example.id} value={example.id}>
          <Stack gap="4">
            {example.summary ? (
              <Code colorPalette="blue" alignSelf="start" px="2" py="0.5" rounded="sm" fontSize="xs">{example.summary}</Code>
            ) : null}
            <Box borderWidth="1px" borderColor="border" rounded="md" p="4" bg="bg.subtle" overflow="auto">
              {example.preview}
            </Box>
            <CodePanel code={example.code} />
          </Stack>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}

/** Panel de documentación reutilizado en cada vista del catálogo: propósito, pasos, variantes interactivas y props. */
export function ComponentDocs({ purpose, steps, variants, variantExamples, propExamples, code }: ComponentDocsProps) {
  return (
    <Card.Root variant="outline" bg="bg.panel">
      <Card.Body gap="6">
        <Stack gap="2">
          <Badge alignSelf="start" colorPalette="blue" variant="subtle">Documentación</Badge>
          <Text color="fg.muted">{purpose}</Text>
        </Stack>

        <Stack gap="2">
          <Heading as="h3" size="sm">Cómo implementarlo</Heading>
          <Stack gap="1.5">
            {steps.map((step, index) => (
              <Text key={step} fontSize="sm" color="fg.muted">
                <Text as="span" fontWeight="semibold" color="fg">{index + 1}. </Text>
                {step}
              </Text>
            ))}
          </Stack>
        </Stack>

        <Stack gap="2">
          <Heading as="h3" size="sm">Variantes</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
            {variants.map((variant) => (
              <Box key={variant.name} borderWidth="1px" borderColor="border" rounded="md" p="3" bg="bg.muted">
                <Code colorPalette="blue" px="2" py="0.5" rounded="sm" fontSize="xs">{variant.name}</Code>
                <Text fontSize="sm" color="fg.muted" mt="2">{variant.description}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Stack>

        {variantExamples && variantExamples.length > 0 ? (
          <Stack gap="3">
            <Heading as="h3" size="sm">Explora las variantes</Heading>
            <Text fontSize="sm" color="fg.muted">Cada pestaña combina la vista previa en vivo con el código que la genera.</Text>
            <VariantExplorer examples={variantExamples} />
          </Stack>
        ) : null}

        {propExamples && propExamples.length > 0 ? (
          <Stack gap="3">
            <Heading as="h3" size="sm">Más ejemplos de props</Heading>
            <Stack gap="4">
              {propExamples.map((example) => (
                <Stack key={example.label} gap="2">
                  <Text fontSize="sm" fontWeight="medium">{example.label}</Text>
                  <CodePanel code={example.code} />
                </Stack>
              ))}
            </Stack>
          </Stack>
        ) : null}

        <Stack gap="2">
          <Heading as="h3" size="sm">Código de ejemplo completo</Heading>
          <CodePanel code={code} />
        </Stack>
      </Card.Body>
    </Card.Root>
  )
}
