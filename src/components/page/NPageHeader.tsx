import { Box, Button, Flex, Heading, HStack, Stack, Text } from "@chakra-ui/react"
import { ArrowLeft } from "lucide-react"

import type { NPageHeaderProps } from "./types"

/** Encabezado de página responsive con contexto, jerarquía y acciones componibles. */
export function NPageHeader({
  title,
  subtitle,
  eyebrow,
  breadcrumbs,
  leading,
  actions,
  metadata,
  backAction,
  level = 1,
  colorPalette = "blue",
}: NPageHeaderProps) {
  return (
    <Stack as="header" gap="4" minW="0" colorPalette={colorPalette}>
      {breadcrumbs}
      {backAction ? (
        <Button alignSelf="start" size="sm" variant="ghost" onClick={backAction.onClick}>
          <ArrowLeft aria-hidden="true" size={16} />{backAction.label}
        </Button>
      ) : null}
      <Flex align={{ base: "stretch", md: "flex-start" }} justify="space-between" direction={{ base: "column", md: "row" }} gap="4">
        <HStack align="flex-start" gap="4" minW="0">
          {leading ? <Flex flexShrink="0" aria-hidden="true">{leading}</Flex> : null}
          <Stack gap="1" minW="0">
            {eyebrow ? <Text color="colorPalette.fg" fontSize="sm" fontWeight="semibold">{eyebrow}</Text> : null}
            <Heading as={level === 1 ? "h1" : "h2"} size={{ base: "2xl", md: "3xl" }}>{title}</Heading>
            {subtitle ? <Box color="fg.muted" maxW="4xl">{subtitle}</Box> : null}
            {metadata ? <Box pt="1" color="fg.muted" fontSize="sm">{metadata}</Box> : null}
          </Stack>
        </HStack>
        {actions ? <Flex flexShrink="0" gap="2" wrap="wrap" justify={{ base: "stretch", md: "flex-end" }} css={{ "& > *": { flex: { base: "1 1 auto", md: "0 0 auto" } } }}>{actions}</Flex> : null}
      </Flex>
    </Stack>
  )
}
