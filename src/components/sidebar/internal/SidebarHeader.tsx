import { Box, Flex, IconButton } from "@chakra-ui/react"
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react"
import type { ReactNode } from "react"

import { NTooltip } from "../../internal/NTooltip"
import type { NSidebarLabels } from "../types"

interface SidebarHeaderProps {
  children?: ReactNode
  collapsible: boolean
  collapsed: boolean
  position: "start" | "end"
  mobile?: boolean
  labels: NSidebarLabels
  onCollapsedChange: (collapsed: boolean) => void
}

/** Encabezado del sidebar: slot de marca y, en m\u00f3vil, el bot\u00f3n de cerrar el Drawer. */
export function SidebarHeader({
  children,
  collapsible,
  collapsed,
  position,
  mobile = false,
  labels,
  onCollapsedChange,
}: SidebarHeaderProps) {
  const label = collapsed ? labels.expandSidebar : labels.collapseSidebar
  const CollapseIcon = position === "start"
    ? collapsed ? PanelLeftOpen : PanelLeftClose
    : collapsed ? PanelRightOpen : PanelRightClose

  if (!children && !collapsible) return null

  return (
    <Flex
      as="header"
      align="center"
      justify={collapsed ? "center" : "space-between"}
      gap="2"
      minH="16"
      ps="2"
      pe={mobile ? "12" : "2"}
      bg="bg.muted"
      borderBottomWidth="1px"
      borderColor="border"
    >
      {children ? (
        <Box
          flex="1"
          minW="0"
          maxW="full"
          overflow="hidden"
          display="flex"
          alignItems="center"
          justifyContent="start"
          css={{ "& *": { flexShrink: 0 } }}
        >
          {children}
        </Box>
      ) : null}
      {collapsible && mobile ? (
        <NTooltip content={label}>
          <IconButton
            aria-label={label}
            size="sm"
            variant="ghost"
            flexShrink="0"
            onClick={() => onCollapsedChange(!collapsed)}
          >
            <CollapseIcon size={18} />
          </IconButton>
        </NTooltip>
      ) : null}
    </Flex>
  )
}
