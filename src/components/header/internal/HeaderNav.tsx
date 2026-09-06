import { Badge, Box, Button, HStack, Menu, Portal } from "@chakra-ui/react"
import { ChevronDown } from "lucide-react"

import type { NHeaderNavItem, ResolvedHeaderNavItem } from "../types"

interface HeaderNavProps<TData> {
  items: ResolvedHeaderNavItem<TData>[]
  activeItemId?: string
  colorPalette: string
  navigationLabel: string
  onSelect: (item: NHeaderNavItem<TData>, id: string) => void
}

/** Determina si un ítem (o alguno de sus descendientes) es el activo, para resaltarlo. */
function containsActive<TData>(item: ResolvedHeaderNavItem<TData>, activeId?: string): boolean {
  return item.id === activeId || item.children.some((child) => containsActive(child, activeId))
}

/** Navegación horizontal de escritorio para la variante `site`, con dropdowns por grupo. */
export function HeaderNav<TData>({
  items,
  activeItemId,
  colorPalette,
  navigationLabel,
  onSelect,
}: HeaderNavProps<TData>) {
  return (
    <HStack as="nav" aria-label={navigationLabel} gap="1" minW="0">
      {items.map((resolved) => {
        const { item, id } = resolved
        const active = containsActive(resolved, activeItemId)
        if (resolved.children.length > 0) {
          return (
            <Menu.Root key={id} positioning={{ placement: "bottom-start" }}>
              <Menu.Trigger asChild>
                <Button
                  variant="ghost"
                  colorPalette={colorPalette}
                  color={active ? "colorPalette.fg" : "fg.muted"}
                  bg={active ? "colorPalette.subtle" : undefined}
                  disabled={item.disabled}
                  _hover={{ bg: active ? "colorPalette.muted" : "bg.subtle", color: "fg" }}
                >
                  {item.icon ? <Box aria-hidden="true">{item.icon}</Box> : null}
                  {item.label}
                  {item.badge !== undefined ? <Badge colorPalette={colorPalette}>{item.badge}</Badge> : null}
                  <ChevronDown size={14} aria-hidden="true" />
                </Button>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content maxW="calc(100vw - 2rem)" zIndex="dropdown">
                    {resolved.children.map((child) => (
                      <Menu.Item
                        key={child.id}
                        value={child.id}
                        disabled={child.item.disabled}
                        color={child.id === activeItemId ? "colorPalette.fg" : undefined}
                        onClick={() => onSelect(child.item, child.id)}
                        asChild={Boolean(child.item.href)}
                      >
                        {child.item.href ? (
                          <a href={child.item.href} aria-current={child.id === activeItemId ? "page" : undefined}>
                            {child.item.icon ? <Box aria-hidden="true">{child.item.icon}</Box> : null}
                            {child.item.label}
                            {child.item.badge !== undefined ? <Badge ms="auto">{child.item.badge}</Badge> : null}
                          </a>
                        ) : (
                          <>
                            {child.item.icon ? <Box aria-hidden="true">{child.item.icon}</Box> : null}
                            {child.item.label}
                            {child.item.badge !== undefined ? <Badge ms="auto">{child.item.badge}</Badge> : null}
                          </>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          )
        }

        const content = (
          <>
            {item.icon ? <Box aria-hidden="true">{item.icon}</Box> : null}
            {item.label}
            {item.badge !== undefined ? <Badge colorPalette={colorPalette}>{item.badge}</Badge> : null}
          </>
        )
        const props = {
          variant: "ghost" as const,
          colorPalette,
          color: active ? "colorPalette.fg" : "fg.muted",
          bg: active ? "colorPalette.subtle" : undefined,
          disabled: item.disabled,
          _hover: { bg: active ? "colorPalette.muted" : "bg.subtle", color: "fg" },
        }
        return item.href ? (
          <Button key={id} {...props} asChild>
            <a href={item.href} aria-current={active ? "page" : undefined} onClick={() => onSelect(item, id)}>{content}</a>
          </Button>
        ) : (
          <Button key={id} {...props} aria-current={active ? true : undefined} onClick={() => onSelect(item, id)}>{content}</Button>
        )
      })}
    </HStack>
  )
}
