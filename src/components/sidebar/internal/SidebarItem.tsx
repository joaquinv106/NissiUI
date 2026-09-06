import { Badge, Box, Button, Flex, Text } from "@chakra-ui/react"
import type { ReactElement } from "react"

import { NTooltip } from "../../internal/NTooltip"
import type { NSidebarItem as NSidebarItemType, ResolvedSidebarItem } from "../types"

interface SidebarItemProps<TData> {
  resolved: ResolvedSidebarItem<TData>
  active: boolean
  collapsed: boolean
  colorPalette: string
  onSelect: (item: NSidebarItemType<TData>, id: string) => void
}

/** Ítem de navegación hoja: enlace o botón, con tooltip cuando el sidebar está colapsado. */
export function SidebarItem<TData>({
  resolved,
  active,
  collapsed,
  colorPalette,
  onSelect,
}: SidebarItemProps<TData>) {
  const { item, id, parentId } = resolved
  const content = (
    <>
      {item.icon ? <Box aria-hidden="true" flexShrink="0">{item.icon}</Box> : collapsed ? (
        <Text aria-hidden="true" fontWeight="semibold">{item.label.slice(0, 1)}</Text>
      ) : null}
      {!collapsed ? <Text truncate flex="1" textAlign="start">{item.label}</Text> : null}
      {item.badge !== undefined ? (
        <Badge colorPalette={colorPalette} size="sm" flexShrink="0">{item.badge}</Badge>
      ) : null}
    </>
  )
  const commonProps = {
    "data-n-sidebar-item": id,
    "data-parent-id": parentId,
    width: "full",
    minH: "10",
    px: collapsed ? "2" : "3",
    justifyContent: collapsed ? "center" : "flex-start",
    variant: "ghost" as const,
    colorPalette,
    bg: active ? "colorPalette.subtle" : undefined,
    color: active ? "colorPalette.fg" : "fg.muted",
    _hover: {
      bg: active ? "colorPalette.muted" : "bg.subtle",
      color: active ? "colorPalette.fg" : "fg",
    },
    disabled: item.disabled,
    "aria-label": collapsed ? item.label : undefined,
  }

  let control: ReactElement
  if (item.href) {
    control = (
      <Button {...commonProps} asChild>
        <a
          href={item.href}
          aria-current={active ? "page" : undefined}
          aria-disabled={item.disabled || undefined}
          tabIndex={item.disabled ? -1 : undefined}
          onClick={(event) => {
            if (item.disabled) event.preventDefault()
            else onSelect(item, id)
          }}
        >
          <Flex align="center" gap="3" width="full">{content}</Flex>
        </a>
      </Button>
    )
  } else {
    control = (
      <Button
        {...commonProps}
        aria-current={active ? true : undefined}
        onClick={() => onSelect(item, id)}
      >
        <Flex align="center" gap="3" width="full">{content}</Flex>
      </Button>
    )
  }

  return (
    <Box as="li" listStyleType="none">
      <NTooltip content={item.label} disabled={!collapsed}>{control}</NTooltip>
    </Box>
  )
}
