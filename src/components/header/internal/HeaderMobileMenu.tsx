import { Badge, Box, Button, Drawer, IconButton, Portal, Stack } from "@chakra-ui/react"
import { X } from "lucide-react"
import type { ReactNode } from "react"

import type { NHeaderLabels, NHeaderNavItem, NHeaderResponsive, ResolvedHeaderNavItem } from "../types"

interface HeaderMobileMenuProps<TData> {
  open: boolean
  responsive: NHeaderResponsive
  items: ResolvedHeaderNavItem<TData>[]
  activeItemId?: string
  labels: NHeaderLabels
  colorPalette: string
  extra?: ReactNode
  search?: ReactNode
  onOpenChange: (open: boolean) => void
  onSelect: (item: NHeaderNavItem<TData>, id: string) => void
  finalFocusEl?: () => HTMLElement | null
}

interface MobileNavigationProps<TData> extends Pick<HeaderMobileMenuProps<TData>, "items" | "activeItemId" | "labels" | "colorPalette" | "extra" | "search" | "onSelect"> {}

/** Lista de navegación compartida entre el modo `push` (en flujo) y el Drawer móvil. */
function MobileNavigation<TData>({ items, activeItemId, labels, colorPalette, extra, search, onSelect }: MobileNavigationProps<TData>) {
  const renderItems = (nodes: ResolvedHeaderNavItem<TData>[], nested = false): ReactNode => nodes.map(({ id, item, children }) => {
    const active = activeItemId === id
    const content = (
      <>
        {item.icon ? <Box aria-hidden="true">{item.icon}</Box> : null}
        <Box flex="1" textAlign="start">{item.label}</Box>
        {item.badge !== undefined ? <Badge colorPalette={colorPalette}>{item.badge}</Badge> : null}
      </>
    )
    return (
      <Box as="li" key={id} listStyleType="none">
        {item.href ? (
          <Button width="full" justifyContent="start" ps={nested ? "6" : "3"} variant="ghost" colorPalette={colorPalette} bg={active ? "colorPalette.subtle" : undefined} asChild>
            <a href={item.href} aria-current={active ? "page" : undefined} onClick={() => onSelect(item, id)}>{content}</a>
          </Button>
        ) : (
          <Button width="full" justifyContent="start" ps={nested ? "6" : "3"} variant="ghost" colorPalette={colorPalette} bg={active ? "colorPalette.subtle" : undefined} disabled={item.disabled} aria-current={active ? true : undefined} onClick={() => onSelect(item, id)}>{content}</Button>
        )}
        {children.length > 0 ? <Box as="ul" m="0" p="0">{renderItems(children, true)}</Box> : null}
      </Box>
    )
  })

  return (
    <Stack gap="4" height="full">
      {search}
      {extra}
      <Box as="nav" aria-label={labels.navigationLabel} flex="1" overflowY="auto">
        <Box as="ul" m="0" p="0">{renderItems(items)}</Box>
      </Box>
    </Stack>
  )
}

/** Menú móvil de NHeader: oculto, en flujo (`push`) o como Drawer (`overlay`), según `responsive`. */
export function HeaderMobileMenu<TData>(props: HeaderMobileMenuProps<TData>) {
  const { open, responsive, labels, onOpenChange } = props
  if (responsive === "hidden") return null
  if (responsive === "push") {
    return open ? (
      <Box display={{ base: "block", md: "none" }} bg="bg.panel" borderTopWidth="1px" borderColor="border" p="4">
        <MobileNavigation {...props} />
      </Box>
    ) : null
  }
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      placement="end"
      finalFocusEl={props.finalFocusEl}
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content width="min(22rem, calc(100vw - 2rem))" bg="bg.panel" color="fg">
            <Drawer.Header borderBottomWidth="1px" borderColor="border">
              <Drawer.Title>{labels.mobileMenuTitle}</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body p="4"><MobileNavigation {...props} /></Drawer.Body>
            <Drawer.CloseTrigger asChild>
              <IconButton aria-label={labels.closeMobileMenu} variant="ghost" size="sm" position="absolute" top="3" insetInlineEnd="3">
                <X size={18} />
              </IconButton>
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
