import { Center, Flex, Heading, Stack, Text } from "@chakra-ui/react"
import { Inbox } from "lucide-react"
import { useMemo } from "react"

import { defaultNEmptyStateLabels, resolveLabels } from "./labels"
import type { NEmptyStateProps } from "./types"

export function NEmptyState({ title, description, icon, primaryAction, secondaryAction, compact = false, colorPalette = "blue", labels: labelsProp }: NEmptyStateProps) {
  const labels = useMemo(() => resolveLabels(defaultNEmptyStateLabels, labelsProp), [labelsProp])
  return (
    <Center as="section" role="status" minH={compact ? "8rem" : "14rem"} p={compact ? "4" : { base: "6", md: "10" }} borderWidth="1px" borderColor="border" rounded="lg" bg="bg.subtle" colorPalette={colorPalette} textAlign="center">
      <Stack align="center" gap="3" maxW="lg">
        <Flex align="center" justify="center" boxSize={compact ? "10" : "12"} rounded="full" bg="colorPalette.subtle" color="colorPalette.fg">{icon ?? <Inbox aria-hidden="true" size={compact ? 20 : 24} />}</Flex>
        <Heading as="h2" size={compact ? "sm" : "md"}>{title ?? labels.defaultTitle}</Heading>
        <Text color="fg.muted" fontSize="sm">{description ?? labels.defaultDescription}</Text>
        {(primaryAction || secondaryAction) ? <Flex gap="2" wrap="wrap" justify="center" pt="1">{primaryAction}{secondaryAction}</Flex> : null}
      </Stack>
    </Center>
  )
}
