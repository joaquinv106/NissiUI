"use client"

import { Box, Flex, HStack, IconButton } from "@chakra-ui/react"
import { Menu, Moon, Sun } from "lucide-react"
import { isValidElement, useCallback, useEffect, useMemo, useRef, useState } from "react"

import { NTooltip } from "../internal/NTooltip"
import { NTheme } from "../theme/NTheme"
import { useOptionalNTheme } from "../theme/context"
import { HeaderActions } from "./internal/HeaderActions"
import { HeaderBrand } from "./internal/HeaderBrand"
import { HeaderMobileMenu } from "./internal/HeaderMobileMenu"
import { HeaderNav } from "./internal/HeaderNav"
import { HeaderNotifications } from "./internal/HeaderNotifications"
import { HeaderSearch } from "./internal/HeaderSearch"
import { HeaderUserMenu } from "./internal/HeaderUserMenu"
import { resolveNHeaderLabels } from "./labels"
import type { NHeaderNavItem, NHeaderProps, NHeaderSearchConfig } from "./types"
import { resolveHeaderItems } from "./utils"

/** Distingue si `search` viene como configuración de objeto o como nodo/booleano. */
function isSearchConfig(value: NHeaderProps["search"]): value is NHeaderSearchConfig {
  return typeof value === "object" && value !== null && !isValidElement(value)
}

/** Barra superior: navbar de sitio o barra de aplicación, con búsqueda, acciones y usuario. */
export function NHeader<TData = unknown>({
  variant = "site",
  brand,
  items = [],
  activeItemId,
  defaultActiveItemId,
  onItemSelect,
  getItemId,
  search = false,
  actions = [],
  notifications,
  user,
  extra,
  responsive = "overlay",
  mobileOpen: controlledMobileOpen,
  defaultMobileOpen = false,
  onMobileOpenChange,
  showThemeToggle = false,
  themePresentation = "icon",
  theme,
  onThemeChange,
  sticky = false,
  height = "4rem",
  surface = "outline",
  colorPalette = "blue",
  labels: customLabels,
  unstyled = false,
  classNames,
  styles,
}: NHeaderProps<TData>) {
  const labels = useMemo(() => resolveNHeaderLabels(customLabels), [customLabels])
  const themeContext = useOptionalNTheme()
  const resolvedItems = useMemo(() => resolveHeaderItems(items, getItemId), [getItemId, items])
  const [internalActiveId, setInternalActiveId] = useState(defaultActiveItemId)
  const [internalMobileOpen, setInternalMobileOpen] = useState(defaultMobileOpen)
  const warnedAboutIds = useRef(false)
  const mobileTriggerRef = useRef<HTMLButtonElement>(null)
  const previousMobileOpen = useRef(defaultMobileOpen)
  const activeId = activeItemId ?? internalActiveId
  const mobileOpen = controlledMobileOpen ?? internalMobileOpen

  useEffect(() => {
    if (previousMobileOpen.current && !mobileOpen) mobileTriggerRef.current?.focus()
    previousMobileOpen.current = mobileOpen
  }, [mobileOpen])

  useEffect(() => {
    const isDevelopment = typeof process === "undefined" || process.env.NODE_ENV !== "production"
    if (isDevelopment && !getItemId && !warnedAboutIds.current && items.some((item) => !item.id)) {
      warnedAboutIds.current = true
      console.warn("[NissiUI] NHeader sin getItemId o item.id: la identidad puede cambiar al reordenar la navegación.")
    }
  }, [getItemId, items])

  const changeMobileOpen = useCallback((open: boolean) => {
    if (controlledMobileOpen === undefined) setInternalMobileOpen(open)
    onMobileOpenChange?.(open)
  }, [controlledMobileOpen, onMobileOpenChange])

  const selectItem = useCallback((item: NHeaderNavItem<TData>, id: string) => {
    if (activeItemId === undefined) setInternalActiveId(id)
    item.onClick?.(item)
    onItemSelect?.(item)
    changeMobileOpen(false)
  }, [activeItemId, changeMobileOpen, onItemSelect])

  const searchNode = search === true
    ? <HeaderSearch config={{}} labels={labels} />
    : isSearchConfig(search)
      ? <HeaderSearch config={search} labels={labels} />
      : search || null

  const activeLegacyTheme = theme ?? "light"
  const themeLabel = activeLegacyTheme === "light" ? labels.switchToDarkTheme : labels.switchToLightTheme
  const themeControl = showThemeToggle ? (
    themeContext && theme === undefined && onThemeChange === undefined ? <NTheme presentation={themePresentation} /> : (
      <NTooltip content={themeLabel}>
        <IconButton
          aria-label={themeLabel}
          variant="ghost"
          flexShrink="0"
          onClick={() => onThemeChange?.(activeLegacyTheme === "light" ? "dark" : "light")}
        >
          {activeLegacyTheme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </IconButton>
      </NTooltip>
    )
  ) : null

  return (
    <Box
      as="header"
      position={sticky ? "sticky" : "relative"}
      top={sticky ? "0" : undefined}
      zIndex={sticky ? "sticky" : "docked"}
      width="full"
      bg={unstyled ? undefined : "bg.muted"}
      color={unstyled ? undefined : "fg"}
      colorPalette={colorPalette}
      borderBottomWidth={!unstyled && surface === "outline" ? "1px" : undefined}
      borderColor="border"
      shadow={!unstyled && surface === "elevated" ? "sm" : undefined}
      className={classNames?.root}
      css={styles?.root}
      data-scope="n-header"
      data-part="root"
    >
      <Flex height={height} minW="0" align="center" gap={{ base: "2", md: "4" }} px={unstyled ? undefined : { base: "3", md: "6" }} className={classNames?.content} css={styles?.content} data-part="content">
        <Box display="contents" className={classNames?.brand} css={styles?.brand} data-part="brand"><HeaderBrand>{brand}</HeaderBrand></Box>

        <Box display={{ base: "none", md: "block" }} minW="0" className={classNames?.navigation} css={styles?.navigation} data-part="navigation">
          {variant === "site" ? (
            <HeaderNav items={resolvedItems} activeItemId={activeId} colorPalette={colorPalette} navigationLabel={labels.navigationLabel} onSelect={selectItem} />
          ) : extra}
        </Box>

        {variant === "app" && searchNode ? (
          <Flex display={{ base: "none", lg: "flex" }} flex="1" justify="center" minW="0" className={classNames?.search} css={styles?.search} data-part="search">{searchNode}</Flex>
        ) : <Box flex="1" />}

        <HStack gap="1" flexShrink="0" className={classNames?.actions} css={styles?.actions} data-part="actions">
          <Box display={{ base: "none", md: "contents" }}>
            <HeaderActions actions={actions} defaultPresentation={variant === "site" ? "button" : "icon"} />
          </Box>
          <Box display={{ base: "contents", md: "none" }}><HeaderActions actions={actions} mobile /></Box>
          {notifications ? <HeaderNotifications notifications={notifications} labels={labels} /> : null}
          {themeControl}
          {user ? <HeaderUserMenu user={user} labels={labels} /> : null}
          {items.length > 0 && responsive !== "hidden" ? (
            <NTooltip content={mobileOpen ? labels.closeMobileMenu : labels.openMobileMenu}>
              <IconButton
                ref={mobileTriggerRef}
                display={{ base: "inline-flex", md: "none" }}
                aria-label={mobileOpen ? labels.closeMobileMenu : labels.openMobileMenu}
                aria-expanded={mobileOpen}
                variant="ghost"
                onClick={() => changeMobileOpen(!mobileOpen)}
              >
                <Menu size={20} />
              </IconButton>
            </NTooltip>
          ) : null}
        </HStack>
      </Flex>

      <HeaderMobileMenu
        open={mobileOpen}
        responsive={responsive}
        items={resolvedItems}
        activeItemId={activeId}
        labels={labels}
        colorPalette={colorPalette}
        extra={variant === "app" ? extra : undefined}
        search={searchNode}
        onOpenChange={changeMobileOpen}
        onSelect={selectItem}
        finalFocusEl={() => mobileTriggerRef.current}
      />
    </Box>
  )
}
