import { Badge, Box, Button, Flex, Text } from "@chakra-ui/react"
import { ChevronDown } from "lucide-react"
import type { ReactElement, ReactNode } from "react"

import { NTooltip } from "../../internal/NTooltip"
import type { NSidebarLabels, ResolvedSidebarItem } from "../types"

interface SidebarGroupProps<TData> {
  resolved: ResolvedSidebarItem<TData>
  open: boolean
  collapsed: boolean
  colorPalette: string
  labels: NSidebarLabels
  instanceId: string
  children: ReactNode
  onToggle: (id: string) => void
}

/** Grupo/submenú expandible: alterna sus hijos y expone `aria-expanded` para accesibilidad. */
export function SidebarGroup<TData>({
  resolved,
  open,
  collapsed,
  colorPalette,
  labels,
  instanceId,
  children,
  onToggle,
}: SidebarGroupProps<TData>) {
  const { item, id, parentId } = resolved
  const actionLabel = open ? labels.collapseGroup(item.label) : labels.expandGroup(item.label)
  const control: ReactElement = (
    <Button
      data-n-sidebar-item={id}
      data-parent-id={parentId}
      data-sidebar-group="true"
      width="full"
      minH="10"
      px={collapsed ? "2" : "3"}
      justifyContent={collapsed ? "center" : "flex-start"}
      variant="ghost"
      colorPalette={colorPalette}
      color="fg.muted"
      _hover={{ bg: "bg.subtle", color: "fg" }}
      disabled={item.disabled}
      aria-label={collapsed ? actionLabel : undefined}
      aria-expanded={open}
      aria-controls={`${instanceId}-${id}`}
      onClick={() => onToggle(id)}
    >
      <Flex align="center" gap="3" width="full">
        {item.icon ? <Box aria-hidden="true" flexShrink="0">{item.icon}</Box> : collapsed ? (
          <Text aria-hidden="true" fontWeight="semibold">{item.label.slice(0, 1)}</Text>
        ) : null}
        {!collapsed ? <Text truncate flex="1" textAlign="start">{item.label}</Text> : null}
        {!collapsed && item.badge !== undefined ? (
          <Badge colorPalette={colorPalette} size="sm">{item.badge}</Badge>
        ) : null}
        {!collapsed ? (
          <ChevronDown
            size={15}
            aria-hidden="true"
            style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.2s" }}
          />
        ) : null}
      </Flex>
    </Button>
  )

  return (
    <Box as="li" listStyleType="none">
      <NTooltip content={actionLabel} disabled={!collapsed}>{control}</NTooltip>
      {open && !collapsed ? (
        <Box
          as="ul"
          id={`${instanceId}-${id}`}
          role="group"
          listStyleType="none"
          m="0"
          ps="4"
        >
          {children}
        </Box>
      ) : null}
    </Box>
  )
}
