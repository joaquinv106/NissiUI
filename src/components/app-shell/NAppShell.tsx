"use client"

import { Box, Flex, Link } from "@chakra-ui/react"
import { useId } from "react"

import { defaultNAppShellLabels } from "./labels"
import { NAppShellLayoutProvider } from "./internal/NAppShellLayoutContext"
import type { NAppShellProps } from "./types"

const paddingByDensity = {
  none: { base: "0" },
  compact: { base: "3", md: "5", xl: "6" },
  comfortable: { base: "4", md: "8", xl: "12" },
} as const

/**
 * Estructura raíz para aplicaciones: coordina header, sidebar, contenido y footer
 * sobre una sola superficie responsive, sin apropiarse del estado de sus hijos.
 */
export function NAppShell({
  header,
  sidebar,
  footer,
  children,
  sidebarPosition = "start",
  contentMaxWidth = "8xl",
  contentPadding = "comfortable",
  minHeight = "100dvh",
  colorPalette = "blue",
  labels: labelsProp,
  unstyled = false,
  classNames,
  styles,
}: NAppShellProps) {
  const generatedId = useId().replaceAll(":", "")
  const contentId = `n-app-shell-content-${generatedId}`
  const labels = { ...defaultNAppShellLabels, ...labelsProp }
  const sidebarRegion = sidebar ? (
    <Box
      as="aside"
      aria-label={labels.sidebarRegion}
      flexShrink="0"
      minW="0"
      position={{ base: "fixed", md: "sticky" }}
      top="0"
      alignSelf="flex-start"
      height={{ md: "100dvh" }}
      zIndex="docked"
      className={classNames?.sidebar}
      css={styles?.sidebar}
      data-part="sidebar"
    >
      {sidebar}
    </Box>
  ) : null

  return (
    <NAppShellLayoutProvider sidebarPosition={sidebarPosition}>
      <Box minH={minHeight} bg={unstyled ? undefined : "bg"} color={unstyled ? undefined : "fg"} colorPalette={colorPalette} transition={unstyled ? undefined : "background 0.2s ease, color 0.2s ease"} className={classNames?.root} css={styles?.root} data-scope="n-app-shell" data-part="root">
        <Link
          href={`#${contentId}`}
          position="fixed"
          top="2"
          insetInlineStart="2"
          zIndex="max"
          px="3"
          py="2"
          rounded="md"
          bg="colorPalette.solid"
          color="colorPalette.contrast"
          transform="translateY(-150%)"
          _focusVisible={{ transform: "translateY(0)", outlineWidth: "2px", outlineColor: "colorPalette.focusRing" }}
          className={classNames?.skipLink}
          css={styles?.skipLink}
          data-part="skip-link"
        >
          {labels.skipToContent}
        </Link>

        <Flex minH={minHeight} align="stretch">
          {sidebarPosition === "start" ? sidebarRegion : null}
          <Flex flex="1" minW="0" direction="column">
            {header ? <Box display="contents" className={classNames?.header} css={styles?.header} data-part="header">{header}</Box> : null}
            <Box
              as="main"
              id={contentId}
              aria-label={labels.contentRegion}
              flex="1"
              width="full"
              maxW={contentMaxWidth === "full" ? undefined : contentMaxWidth}
              mx={contentMaxWidth === "full" ? undefined : "auto"}
              p={paddingByDensity[contentPadding]}
              className={classNames?.content}
              css={styles?.content}
              data-part="content"
            >
              {children}
            </Box>
            {footer ? <Box as="footer" className={classNames?.footer} css={styles?.footer} data-part="footer">{footer}</Box> : null}
          </Flex>
          {sidebarPosition === "end" ? sidebarRegion : null}
        </Flex>
      </Box>
    </NAppShellLayoutProvider>
  )
}
