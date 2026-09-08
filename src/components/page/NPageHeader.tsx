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
  unstyled = false,
  classNames,
  styles,
}: NPageHeaderProps) {
  return (
    <Stack as="header" gap="4" minW="0" colorPalette={colorPalette} className={classNames?.root} css={styles?.root} data-scope="n-page-header" data-part="root">
      {breadcrumbs ? <Box display="contents" className={classNames?.breadcrumbs} css={styles?.breadcrumbs} data-part="breadcrumbs">{breadcrumbs}</Box> : null}
      {backAction ? (
        <Button unstyled={unstyled} alignSelf="start" size="sm" variant={unstyled ? undefined : "ghost"} onClick={backAction.onClick} className={classNames?.backAction} css={styles?.backAction} data-part="back-action">
          <ArrowLeft aria-hidden="true" size={16} />{backAction.label}
        </Button>
      ) : null}
      <Flex align={{ base: "stretch", md: "flex-start" }} justify="space-between" direction={{ base: "column", md: "row" }} gap="4" className={classNames?.content} css={styles?.content} data-part="content">
        <HStack align="flex-start" gap="4" minW="0">
          {leading ? <Flex flexShrink="0" aria-hidden="true">{leading}</Flex> : null}
          <Stack gap="1" minW="0">
            {eyebrow ? <Text color="colorPalette.fg" fontSize="sm" fontWeight="semibold">{eyebrow}</Text> : null}
            <Heading as={level === 1 ? "h1" : "h2"} size={unstyled ? undefined : { base: "2xl", md: "3xl" }} className={classNames?.title} css={styles?.title} data-part="title">{title}</Heading>
            {subtitle ? <Box color={unstyled ? undefined : "fg.muted"} maxW="4xl" className={classNames?.subtitle} css={styles?.subtitle} data-part="subtitle">{subtitle}</Box> : null}
            {metadata ? <Box pt={unstyled ? undefined : "1"} color={unstyled ? undefined : "fg.muted"} fontSize={unstyled ? undefined : "sm"} className={classNames?.metadata} css={styles?.metadata} data-part="metadata">{metadata}</Box> : null}
          </Stack>
        </HStack>
        {actions ? <Flex flexShrink="0" gap="2" wrap="wrap" justify={{ base: "stretch", md: "flex-end" }} css={{ "& > *": { flex: { base: "1 1 auto", md: "0 0 auto" } }, ...styles?.actions }} className={classNames?.actions} data-part="actions">{actions}</Flex> : null}
      </Flex>
    </Stack>
  )
}
