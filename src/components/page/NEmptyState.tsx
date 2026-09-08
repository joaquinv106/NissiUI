import { Center, Flex, Heading, Stack, Text } from "@chakra-ui/react"
import { Inbox } from "lucide-react"
import { useMemo } from "react"

import { defaultNEmptyStateLabels, resolveLabels } from "./labels"
import type { NEmptyStateProps } from "./types"

export function NEmptyState({ title, description, icon, primaryAction, secondaryAction, compact = false, colorPalette = "blue", labels: labelsProp, unstyled = false, classNames, styles }: NEmptyStateProps) {
  const labels = useMemo(() => resolveLabels(defaultNEmptyStateLabels, labelsProp), [labelsProp])
  return (
    <Center as="section" role="status" minH={unstyled ? undefined : compact ? "8rem" : "14rem"} p={unstyled ? undefined : compact ? "4" : { base: "6", md: "10" }} borderWidth={unstyled ? undefined : "1px"} borderColor="border" rounded={unstyled ? undefined : "lg"} bg={unstyled ? undefined : "bg.subtle"} colorPalette={colorPalette} textAlign="center" className={classNames?.root} css={styles?.root} data-scope="n-empty-state" data-part="root">
      <Stack align="center" gap="3" maxW="lg">
        <Flex align="center" justify="center" boxSize={compact ? "10" : "12"} rounded={unstyled ? undefined : "full"} bg={unstyled ? undefined : "colorPalette.subtle"} color="colorPalette.fg" className={classNames?.icon} css={styles?.icon} data-part="icon">{icon ?? <Inbox aria-hidden="true" size={compact ? 20 : 24} />}</Flex>
        <Heading as="h2" size={unstyled ? undefined : compact ? "sm" : "md"} className={classNames?.title} css={styles?.title} data-part="title">{title ?? labels.defaultTitle}</Heading>
        <Text color={unstyled ? undefined : "fg.muted"} fontSize={unstyled ? undefined : "sm"} className={classNames?.description} css={styles?.description} data-part="description">{description ?? labels.defaultDescription}</Text>
        {(primaryAction || secondaryAction) ? <Flex gap="2" wrap="wrap" justify="center" pt="1" className={classNames?.actions} css={styles?.actions} data-part="actions">{primaryAction}{secondaryAction}</Flex> : null}
      </Stack>
    </Center>
  )
}
