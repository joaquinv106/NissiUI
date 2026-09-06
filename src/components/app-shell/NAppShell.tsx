"use client"

import { Box, Flex, Link } from "@chakra-ui/react"
import { useId } from "react"

import { defaultNAppShellLabels } from "./labels"
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
    >
      {sidebar}
    </Box>
  ) : null

  return (
    <Box minH={minHeight} bg="bg" color="fg" colorPalette={colorPalette} transition="background 0.2s ease, color 0.2s ease">
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
      >
        {labels.skipToContent}
      </Link>

      <Flex minH={minHeight} align="stretch">
        {sidebarPosition === "start" ? sidebarRegion : null}
        <Flex flex="1" minW="0" direction="column">
          {header}
          <Box
            as="main"
            id={contentId}
            aria-label={labels.contentRegion}
            flex="1"
            width="full"
            maxW={contentMaxWidth === "full" ? undefined : contentMaxWidth}
            mx={contentMaxWidth === "full" ? undefined : "auto"}
            p={paddingByDensity[contentPadding]}
          >
            {children}
          </Box>
          {footer ? <Box as="footer">{footer}</Box> : null}
        </Flex>
        {sidebarPosition === "end" ? sidebarRegion : null}
      </Flex>
    </Box>
  )
}
