"use client"

import { Box, Drawer, Flex, IconButton, Portal, Stack } from "@chakra-ui/react"
import { X } from "lucide-react"
import { useMemo } from "react"

import { useNAppShellLayout } from "../app-shell/internal/NAppShellLayoutContext"
import { resolveNPanelLabels } from "./labels"
import type { NPanelProps } from "./types"

/** Superficie modal lateral, responsive y agnóstica al contenido que presenta. */
export function NPanel({
  open,
  defaultOpen = false,
  onOpenChange,
  placement = "auto",
  sidebarPosition,
  desktopWidth = "clamp(32rem, 46vw, 48rem)",
  title,
  description,
  headerActions,
  footer,
  children,
  contentKey,
  trigger,
  closeOnEscape = true,
  closeOnInteractOutside = true,
  preventScroll = true,
  modal = true,
  trapFocus = true,
  restoreFocus = true,
  initialFocusRef,
  returnFocusRef,
  lazyMount = true,
  unmountOnExit = true,
  role = "dialog",
  colorPalette = "blue",
  labels: labelsProp,
}: NPanelProps) {
  const labels = useMemo(() => resolveNPanelLabels(labelsProp), [labelsProp])
  const appShellLayout = useNAppShellLayout()
  const effectiveSidebarPosition = sidebarPosition ?? appShellLayout.sidebarPosition
  const resolvedPlacement = placement === "auto"
    ? effectiveSidebarPosition === "start" ? "end" : "start"
    : placement

  return (
    <Drawer.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(details) => onOpenChange?.(details.open)}
      placement={resolvedPlacement}
      size="full"
      closeOnEscape={closeOnEscape}
      closeOnInteractOutside={closeOnInteractOutside}
      preventScroll={preventScroll}
      modal={modal}
      trapFocus={trapFocus}
      restoreFocus={restoreFocus}
      initialFocusEl={initialFocusRef ? () => initialFocusRef.current : undefined}
      finalFocusEl={returnFocusRef ? () => returnFocusRef.current : undefined}
      lazyMount={lazyMount}
      unmountOnExit={unmountOnExit}
      role={role}
    >
      {trigger ? <Drawer.Trigger asChild>{trigger}</Drawer.Trigger> : null}
      <Portal>
        <Drawer.Backdrop _motionReduce={{ animation: "none" }} />
        <Drawer.Positioner>
          <Drawer.Content
            data-n-panel=""
            data-placement={resolvedPlacement}
            width={{ base: "100vw", md: desktopWidth }}
            maxW={{ base: "100vw", md: "calc(100vw - 4rem)" }}
            height="100dvh"
            maxH="100dvh"
            bg="bg.panel"
            color="fg"
            colorPalette={colorPalette}
            borderInlineStartWidth={resolvedPlacement === "end" ? "1px" : undefined}
            borderInlineEndWidth={resolvedPlacement === "start" ? "1px" : undefined}
            borderColor="border"
            shadow="2xl"
            _motionReduce={{ animation: "none" }}
          >
            <Drawer.Header
              minH={{ base: "4.5rem", md: "5rem" }}
              px={{ base: "4", md: "6" }}
              py="4"
              pe={{ base: "14", md: "16" }}
              borderBottomWidth="1px"
              borderColor="border"
              alignItems="flex-start"
            >
              <Flex flex="1" minW="0" align="flex-start" justify="space-between" gap="4">
                <Stack gap="1" minW="0">
                  <Drawer.Title
                    {...(title == null ? {
                      position: "absolute",
                      width: "1px",
                      height: "1px",
                      p: "0",
                      m: "-1px",
                      overflow: "hidden",
                      clip: "rect(0, 0, 0, 0)",
                      whiteSpace: "nowrap",
                      border: "0",
                    } : {})}
                  >
                    {title ?? labels.defaultTitle}
                  </Drawer.Title>
                  {description ? <Drawer.Description>{description}</Drawer.Description> : null}
                </Stack>
                {headerActions ? <Box flexShrink="0">{headerActions}</Box> : null}
              </Flex>
            </Drawer.Header>

            <Drawer.Body px={{ base: "4", md: "6" }} py={{ base: "5", md: "6" }} overscrollBehavior="contain">
              <Box key={contentKey ?? "n-panel-content"} minW="0">
                {children}
              </Box>
            </Drawer.Body>

            {footer ? (
              <Drawer.Footer px={{ base: "4", md: "6" }} py="4" borderTopWidth="1px" borderColor="border">
                {footer}
              </Drawer.Footer>
            ) : null}

            <Drawer.CloseTrigger asChild>
              <IconButton
                aria-label={labels.closePanel}
                variant="ghost"
                size="sm"
                position="absolute"
                top={{ base: "4", md: "5" }}
                insetInlineEnd={{ base: "3", md: "5" }}
              >
                <X aria-hidden="true" size={19} />
              </IconButton>
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
