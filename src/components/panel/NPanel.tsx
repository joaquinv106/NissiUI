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
  unstyled = false,
  classNames,
  styles,
}: NPanelProps) {
  const labels = useMemo(() => resolveNPanelLabels(labelsProp), [labelsProp])
  const appShellLayout = useNAppShellLayout()
  const effectiveSidebarPosition = sidebarPosition ?? appShellLayout.sidebarPosition
  const resolvedPlacement = placement === "auto"
    ? effectiveSidebarPosition === "start" ? "end" : "start"
    : placement

  return (
    <Drawer.Root
      unstyled={unstyled}
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
      {trigger ? <Drawer.Trigger asChild className={classNames?.trigger} css={styles?.trigger} data-scope="n-panel" data-part="trigger">{trigger}</Drawer.Trigger> : null}
      <Portal>
        <Drawer.Backdrop unstyled={unstyled} className={classNames?.backdrop} css={styles?.backdrop} data-scope="n-panel" data-part="backdrop" _motionReduce={{ animation: "none" }} />
        <Drawer.Positioner unstyled={unstyled} className={classNames?.positioner} css={styles?.positioner} data-scope="n-panel" data-part="positioner">
          <Drawer.Content
            unstyled={unstyled}
            className={classNames?.content ?? classNames?.root}
            css={styles?.content ?? styles?.root}
            data-scope="n-panel"
            data-part="content"
            data-n-panel=""
            data-placement={resolvedPlacement}
            width={{ base: "100vw", md: desktopWidth }}
            maxW={{ base: "100vw", md: "calc(100vw - 4rem)" }}
            height="100dvh"
            maxH="100dvh"
            bg={unstyled ? undefined : "bg.panel"}
            color={unstyled ? undefined : "fg"}
            colorPalette={colorPalette}
            borderInlineStartWidth={!unstyled && resolvedPlacement === "end" ? "1px" : undefined}
            borderInlineEndWidth={!unstyled && resolvedPlacement === "start" ? "1px" : undefined}
            borderColor={unstyled ? undefined : "border"}
            shadow={unstyled ? undefined : "2xl"}
            _motionReduce={{ animation: "none" }}
          >
            <Drawer.Header
              unstyled={unstyled}
              className={classNames?.header}
              css={styles?.header}
              data-scope="n-panel"
              data-part="header"
              minH={unstyled ? undefined : { base: "4.5rem", md: "5rem" }}
              px={unstyled ? undefined : { base: "4", md: "6" }}
              py={unstyled ? undefined : "4"}
              pe={unstyled ? undefined : { base: "14", md: "16" }}
              borderBottomWidth={unstyled ? undefined : "1px"}
              borderColor={unstyled ? undefined : "border"}
              alignItems="flex-start"
            >
              <Flex flex="1" minW="0" align="flex-start" justify="space-between" gap="4">
                <Stack gap="1" minW="0">
                  <Drawer.Title
                    unstyled={unstyled}
                    className={classNames?.title}
                    css={styles?.title}
                    data-scope="n-panel"
                    data-part="title"
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
                  {description ? <Drawer.Description unstyled={unstyled} className={classNames?.description} css={styles?.description} data-scope="n-panel" data-part="description">{description}</Drawer.Description> : null}
                </Stack>
                {headerActions ? <Box className={classNames?.headerActions} css={styles?.headerActions} data-scope="n-panel" data-part="header-actions" flexShrink="0">{headerActions}</Box> : null}
              </Flex>
            </Drawer.Header>

            <Drawer.Body unstyled={unstyled} className={classNames?.body} css={styles?.body} data-scope="n-panel" data-part="body" px={unstyled ? undefined : { base: "4", md: "6" }} py={unstyled ? undefined : { base: "5", md: "6" }} overscrollBehavior="contain">
              <Box key={contentKey ?? "n-panel-content"} minW="0">
                {children}
              </Box>
            </Drawer.Body>

            {footer ? (
              <Drawer.Footer unstyled={unstyled} className={classNames?.footer} css={styles?.footer} data-scope="n-panel" data-part="footer" px={unstyled ? undefined : { base: "4", md: "6" }} py={unstyled ? undefined : "4"} borderTopWidth={unstyled ? undefined : "1px"} borderColor={unstyled ? undefined : "border"}>
                {footer}
              </Drawer.Footer>
            ) : null}

            <Drawer.CloseTrigger asChild>
              <IconButton
                unstyled={unstyled}
                className={classNames?.closeTrigger}
                css={styles?.closeTrigger}
                data-scope="n-panel"
                data-part="close-trigger"
                aria-label={labels.closePanel}
                variant={unstyled ? undefined : "ghost"}
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
