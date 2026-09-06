"use client"

import { Box, Drawer, IconButton, Portal, Text } from "@chakra-ui/react"
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react"
import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"

import { NTooltip } from "../internal/NTooltip"
import { usePermissions } from "../permissions"
import { SidebarFooter } from "./internal/SidebarFooter"
import { SidebarGroup } from "./internal/SidebarGroup"
import { SidebarHeader } from "./internal/SidebarHeader"
import { SidebarItem } from "./internal/SidebarItem"
import { SidebarSearch } from "./internal/SidebarSearch"
import { resolveNSidebarLabels } from "./labels"
import type { NSidebarItem as NSidebarItemType, NSidebarProps, ResolvedSidebarItem } from "./types"
import {
  filterSidebarItems,
  filterSidebarItemsByPermission,
  findSidebarPath,
  flattenSidebarItems,
  resolveSidebarItems,
} from "./utils"

interface SidebarContentProps {
  collapsed: boolean
  width: string
  mobile?: boolean
  onItemSelected?: () => void
}

/** Menú lateral de navegación: árbol con grupos, búsqueda, colapso y Drawer en móvil. */
export function NSidebar<TData = unknown>({
  items,
  activeItemId,
  defaultActiveItemId,
  onItemSelect,
  collapsible = true,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  collapsedWidth = "4.5rem",
  expandedWidth = "17rem",
  variant = "outline",
  colorPalette = "blue",
  position = "start",
  responsive = "overlay",
  showMobileTrigger = true,
  mobileOpen: controlledMobileOpen,
  defaultMobileOpen = false,
  onMobileOpenChange,
  searchable = false,
  header,
  footer,
  getItemId,
  labels: customLabels,
  multipleGroupsOpen = true,
}: NSidebarProps<TData>) {
  const labels = useMemo(() => resolveNSidebarLabels(customLabels), [customLabels])
  const { can } = usePermissions()
  const resolvedItems = useMemo(
    () => filterSidebarItemsByPermission(resolveSidebarItems(items, getItemId), can),
    [can, getItemId, items],
  )
  const flatItems = useMemo(() => flattenSidebarItems(resolvedItems), [resolvedItems])
  const [internalActiveId, setInternalActiveId] = useState(defaultActiveItemId)
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed)
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set())
  const [search, setSearch] = useState("")
  const [internalMobileOpen, setInternalMobileOpen] = useState(defaultMobileOpen)
  const warnedAboutIds = useRef(false)
  const instanceId = useId().replaceAll(":", "")
  const activeId = activeItemId ?? internalActiveId
  const collapsed = controlledCollapsed ?? internalCollapsed
  const mobileOpen = controlledMobileOpen ?? internalMobileOpen
  const width = collapsed ? collapsedWidth : expandedWidth
  const filteredItems = useMemo(() => filterSidebarItems(resolvedItems, search), [resolvedItems, search])

  useEffect(() => {
    const isDevelopment = typeof process === "undefined" || process.env.NODE_ENV !== "production"
    if (isDevelopment && !getItemId && !warnedAboutIds.current && flatItems.some(({ item }) => !item.id)) {
      warnedAboutIds.current = true
      console.warn("[NissiUI] NSidebar sin getItemId o item.id: la identidad puede cambiar al reordenar el menú.")
    }
  }, [flatItems, getItemId])

  useEffect(() => {
    if (!activeId) return
    const path = findSidebarPath(resolvedItems, activeId)
    const ancestorGroups = path.slice(0, -1).filter(({ children }) => children.length > 0).map(({ id }) => id)
    if (ancestorGroups.length === 0) return
    setOpenGroups((current) => {
      if (ancestorGroups.every((id) => current.has(id))) return current
      return new Set([...current, ...ancestorGroups])
    })
  }, [activeId, resolvedItems])

  const changeCollapsed = useCallback((next: boolean) => {
    if (controlledCollapsed === undefined) setInternalCollapsed(next)
    onCollapsedChange?.(next)
  }, [controlledCollapsed, onCollapsedChange])

  const changeMobileOpen = useCallback((next: boolean) => {
    if (controlledMobileOpen === undefined) setInternalMobileOpen(next)
    onMobileOpenChange?.(next)
  }, [controlledMobileOpen, onMobileOpenChange])

  const toggleGroup = useCallback((id: string) => {
    if (collapsed) changeCollapsed(false)
    setOpenGroups((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else if (multipleGroupsOpen) next.add(id)
      else {
        next.clear()
        findSidebarPath(resolvedItems, id).forEach((entry) => {
          if (entry.children.length > 0) next.add(entry.id)
        })
      }
      return next
    })
  }, [changeCollapsed, collapsed, multipleGroupsOpen, resolvedItems])

  const selectItem = useCallback((item: NSidebarItemType<TData>, id: string) => {
    if (activeItemId === undefined) setInternalActiveId(id)
    item.onClick?.(item)
    onItemSelect?.(item)
  }, [activeItemId, onItemSelect])

  // Navegación por teclado: flechas, Home/End, Espacio en enlaces y flechas izquierda/derecha para grupos.
  const handleNavigationKey = useCallback((event: KeyboardEvent<HTMLElement>) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-n-sidebar-item]")
    if (!target) return
    const controls = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        "[data-n-sidebar-item]:not([disabled]):not([aria-disabled='true'])",
      ),
    )
    const currentIndex = controls.indexOf(target)
    if (currentIndex < 0) return

    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
      event.preventDefault()
      const nextIndex = event.key === "Home"
        ? 0
        : event.key === "End"
          ? controls.length - 1
          : (currentIndex + (event.key === "ArrowDown" ? 1 : -1) + controls.length) % controls.length
      controls[nextIndex]?.focus()
      return
    }

    const itemId = target.dataset.nSidebarItem
    const isGroup = target.dataset.sidebarGroup === "true"
    if (event.key === " " && target.tagName === "A") {
      event.preventDefault()
      target.click()
      return
    }
    if (event.key === "ArrowRight" && isGroup && itemId) {
      event.preventDefault()
      if (target.getAttribute("aria-expanded") !== "true") toggleGroup(itemId)
      else controls.find((control) => control.dataset.parentId === itemId)?.focus()
    }
    if (event.key === "ArrowLeft") {
      if (isGroup && itemId && target.getAttribute("aria-expanded") === "true") {
        event.preventDefault()
        toggleGroup(itemId)
      } else if (target.dataset.parentId) {
        event.preventDefault()
        controls.find((control) => control.dataset.nSidebarItem === target.dataset.parentId)?.focus()
      }
    }
  }, [toggleGroup])

  // Dibuja recursivamente grupos e ítems hoja, propagando el estado colapsado/abierto.
  const renderItems = (
    nodes: ResolvedSidebarItem<TData>[],
    isCollapsed: boolean,
    contentInstanceId: string,
    onItemSelected?: () => void,
  ): ReactNode => nodes.map((resolved) => {
    if (resolved.children.length > 0) {
      const open = search.trim() ? true : openGroups.has(resolved.id)
      return (
        <SidebarGroup
          key={resolved.id}
          resolved={resolved}
          open={open}
          collapsed={isCollapsed}
          colorPalette={colorPalette}
          labels={labels}
          instanceId={contentInstanceId}
          onToggle={toggleGroup}
        >
          {renderItems(resolved.children, isCollapsed, contentInstanceId, onItemSelected)}
        </SidebarGroup>
      )
    }
    return (
      <SidebarItem
        key={resolved.id}
        resolved={resolved}
        active={activeId === resolved.id}
        collapsed={isCollapsed}
        colorPalette={colorPalette}
        onSelect={(item, id) => {
          selectItem(item, id)
          onItemSelected?.()
        }}
      />
    )
  })

  // Estructura compartida entre el sidebar de escritorio y el contenido del Drawer móvil.
  const renderSidebarContent = ({ collapsed: isCollapsed, width: contentWidth, mobile, onItemSelected }: SidebarContentProps) => (
    <Box
      as="nav"
      aria-label={labels.navigationLabel}
      width={contentWidth}
      height="full"
      minH={mobile ? "100dvh" : "100%"}
      display="flex"
      flexDirection="column"
      bg="bg.muted"
      color="fg"
      colorPalette={colorPalette}
      borderWidth={variant === "outline" ? "1px" : undefined}
      borderColor="border"
      shadow={variant === "elevated" ? "lg" : undefined}
      isolation="isolate"
      transition="width 0.2s ease"
      overflow="hidden"
      onKeyDown={handleNavigationKey}
    >
      <SidebarHeader
        collapsible={collapsible && !mobile}
        collapsed={isCollapsed}
        position={position}
        mobile={mobile}
        labels={labels}
        onCollapsedChange={changeCollapsed}
      >
        {header}
      </SidebarHeader>
      {searchable && !isCollapsed ? (
        <Box py="2"><SidebarSearch value={search} labels={labels} onChange={setSearch} /></Box>
      ) : null}
      <Box flex="1" overflowY="auto" px="2" py="2">
        {filteredItems.length > 0 ? (
          <Box as="ul" listStyleType="none" m="0" p="0">
            {renderItems(filteredItems, isCollapsed, `${instanceId}-${mobile ? "mobile" : "desktop"}`, onItemSelected)}
          </Box>
        ) : <Text color="fg.muted" fontSize="sm" px="3" py="2">{labels.emptySearch}</Text>}
      </Box>
      {!isCollapsed ? <SidebarFooter>{footer}</SidebarFooter> : null}
    </Box>
  )

  const desktopDisplay = responsive === "push" ? "flex" : { base: "none", md: "flex" }
  const collapseLabel = collapsed ? labels.expandSidebar : labels.collapseSidebar
  const CollapseIcon = position === "start"
    ? collapsed ? ChevronRight : ChevronLeft
    : collapsed ? ChevronLeft : ChevronRight

  return (
    <>
      {responsive === "overlay" ? (
        <Drawer.Root
          open={mobileOpen}
          onOpenChange={(details) => changeMobileOpen(details.open)}
          placement={position}
          lazyMount
          unmountOnExit
        >
          {showMobileTrigger ? (
            <Portal>
              <Box
                display={{ base: mobileOpen ? "none" : "block", md: "none" }}
                position="fixed"
                top="4"
                insetInlineStart={position === "start" ? "4" : undefined}
                insetInlineEnd={position === "end" ? "4" : undefined}
                zIndex="modal"
              >
                <Drawer.Trigger asChild>
                  <IconButton
                    aria-label={labels.openMobileMenu}
                    variant="outline"
                    bg="bg.muted"
                    color="fg"
                    borderColor="border"
                    shadow="sm"
                    zIndex="max"
                    _hover={{ bg: "bg.emphasized" }}
                  >
                    <Menu size={18} />
                  </IconButton>
                </Drawer.Trigger>
              </Box>
            </Portal>
          ) : null}
          <Portal>
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content width={expandedWidth} maxW="calc(100vw - 2rem)" bg="bg.muted" color="fg">
                <Drawer.Title
                  position="absolute"
                  width="1px"
                  height="1px"
                  p="0"
                  m="-1px"
                  overflow="hidden"
                  clip="rect(0, 0, 0, 0)"
                  whiteSpace="nowrap"
                  border="0"
                >
                  {labels.navigationLabel}
                </Drawer.Title>
                <Drawer.Body p="0">
                  {renderSidebarContent({
                    collapsed: false,
                    width: "full",
                    mobile: true,
                    onItemSelected: () => changeMobileOpen(false),
                  })}
                </Drawer.Body>
                <Drawer.CloseTrigger asChild>
                  <IconButton
                    aria-label={labels.closeMobileMenu}
                    variant="ghost"
                    size="sm"
                    position="absolute"
                    top="2"
                    insetInlineEnd="2"
                  >
                    <X size={18} />
                  </IconButton>
                </Drawer.CloseTrigger>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>
      ) : null}

      <Box
        display={desktopDisplay}
        position="relative"
        width={width}
        height="full"
        flexShrink="0"
        order={position === "end" ? 1 : undefined}
      >
        {renderSidebarContent({ collapsed, width: "full" })}
        {collapsible ? (
          <NTooltip content={collapseLabel}>
            <IconButton
              aria-label={collapseLabel}
              onClick={() => changeCollapsed(!collapsed)}
              position="absolute"
              top="50%"
              insetStart={position === "start" ? undefined : "-3"}
              insetEnd={position === "start" ? "-3" : undefined}
              transform="translateY(-50%)"
              size="xs"
              rounded="full"
              bg="bg.muted"
              borderWidth="1px"
              borderColor="border"
              shadow="sm"
              color="fg"
              zIndex="max"
              _hover={{ bg: "bg.emphasized" }}
            >
              <CollapseIcon size={14} />
            </IconButton>
          </NTooltip>
        ) : null}
      </Box>
    </>
  )
}
