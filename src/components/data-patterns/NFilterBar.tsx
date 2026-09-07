"use client"

import { Button, Collapsible, Flex, HStack, IconButton, Stack, Tag, Text } from "@chakra-ui/react"
import { ChevronDown, SlidersHorizontal, X } from "lucide-react"
import { useMemo } from "react"

import { defaultNFilterBarLabels, resolveLabels } from "./labels"
import type { NFilterBarProps } from "./types"

export function NFilterBar({ children, filters = [], actions, onClear, collapsible = false, defaultExpanded = true, labels: custom }: NFilterBarProps) {
  const labels = useMemo(() => resolveLabels(defaultNFilterBarLabels, custom), [custom])
  const fields = <Flex gap="3" wrap="wrap" align="end">{children}</Flex>
  return (
    <Collapsible.Root defaultOpen={collapsible ? defaultExpanded : true}>
    <Stack as="section" aria-label={labels.region} gap="3" p="4" bg="bg.panel" borderWidth="1px" borderColor="border" rounded="lg">
      <Flex justify="space-between" gap="3" align="center">
        <HStack><SlidersHorizontal size={18} aria-hidden="true" /><Text fontWeight="semibold">{labels.region}</Text></HStack>
        <HStack>{actions}{collapsible ? <Collapsible.Trigger asChild><IconButton variant="ghost" size="sm" aria-label={labels.toggle}><ChevronDown size={18} /></IconButton></Collapsible.Trigger> : null}</HStack>
      </Flex>
      {collapsible ? <Collapsible.Content>{fields}</Collapsible.Content> : fields}
      {filters.length ? (
        <Flex aria-label={labels.activeFilters} gap="2" wrap="wrap" align="center">
          {filters.map((filter) => <Tag.Root key={filter.id} variant="subtle"><Tag.Label>{filter.label}: {filter.value}</Tag.Label>{filter.onRemove ? <Tag.EndElement><IconButton unstyled aria-label={labels.removeFilter(filter.label)} onClick={filter.onRemove}><X size={13} /></IconButton></Tag.EndElement> : null}</Tag.Root>)}
          {onClear ? <Button size="xs" variant="plain" onClick={onClear}>{labels.clearAll}</Button> : null}
        </Flex>
      ) : null}
    </Stack>
    </Collapsible.Root>
  )
}
