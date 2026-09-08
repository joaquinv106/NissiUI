"use client"

import { Badge, Box, Button, Center, Flex, Heading, HStack, IconButton, Input, SimpleGrid, Spinner, Stack, Text, VisuallyHidden } from "@chakra-ui/react"
import { Check, Search, SearchX, X } from "lucide-react"
import { type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from "react"

import { resolveNItemPickerLabels } from "./labels"
import type { NItemPickerProps, NItemPickerRenderState } from "./types"
import { normalizeItemPickerText, uniqueItemPickerIds } from "./utils"

interface ResolvedItem<TItem> {
  id: string
  index: number
  item: TItem
  label: string
  description?: string
  group?: string
  disabled: boolean
}

/** Selector genérico, buscable y responsive para productos, servicios, personas o cualquier entidad. */
export function NItemPicker<TItem>({
  items,
  getItemId,
  getItemLabel,
  getItemDescription,
  getSearchText,
  groupBy,
  renderItem,
  renderLeading,
  renderTrailing,
  selectionMode = "single",
  selectedIds,
  defaultSelectedIds = [],
  onSelectionChange,
  onItemSelect,
  searchable = true,
  searchValue,
  defaultSearchValue = "",
  onSearchValueChange,
  filterItem,
  shouldFilter = true,
  layout = "grid",
  columns = { base: 1, sm: 2, lg: 3 },
  disabled = false,
  isItemDisabled,
  loading = false,
  maxHeight,
  header,
  footer,
  emptyState,
  colorPalette = "blue",
  labels: labelsProp,
  unstyled = false,
  classNames,
  styles,
}: NItemPickerProps<TItem>) {
  const labels = useMemo(() => resolveNItemPickerLabels(labelsProp), [labelsProp])
  const [internalSearch, setInternalSearch] = useState(defaultSearchValue)
  const [internalSelectedIds, setInternalSelectedIds] = useState(() => uniqueItemPickerIds(defaultSelectedIds))
  const query = searchValue ?? internalSearch
  const activeSelectedIds = selectedIds ?? internalSelectedIds
  const normalizedSelectedIds = useMemo(() => uniqueItemPickerIds(activeSelectedIds), [activeSelectedIds])
  const selectedSet = useMemo(() => new Set(normalizedSelectedIds), [normalizedSelectedIds])
  const groupHeadingPrefix = useId()
  const itemRefs = useRef(new Map<string, HTMLButtonElement>())
  const warnedAboutDuplicateIds = useRef(false)

  const resolvedItems = useMemo<ResolvedItem<TItem>[]>(() => items.map((item, index) => ({
    id: getItemId(item, index),
    index,
    item,
    label: getItemLabel(item),
    description: getItemDescription?.(item),
    group: groupBy?.(item),
    disabled: disabled || Boolean(isItemDisabled?.(item)),
  })), [disabled, getItemDescription, getItemId, getItemLabel, groupBy, isItemDisabled, items])

  useEffect(() => {
    const ids = resolvedItems.map((item) => item.id)
    const isDevelopment = typeof process === "undefined" || process.env.NODE_ENV !== "production"
    if (isDevelopment && !warnedAboutDuplicateIds.current && new Set(ids).size !== ids.length) {
      warnedAboutDuplicateIds.current = true
      console.warn("[NissiUI] NItemPicker recibió identificadores duplicados mediante getItemId.")
    }
  }, [resolvedItems])

  const visibleItems = useMemo(() => {
    if (!shouldFilter || !query.trim()) return resolvedItems
    const normalizedQuery = normalizeItemPickerText(query)
    return resolvedItems.filter((resolved) => {
      if (filterItem) return filterItem(resolved.item, query)
      const searchableText = [
        resolved.label,
        resolved.description,
        resolved.group,
        getSearchText?.(resolved.item),
      ].filter(Boolean).join(" ")
      return normalizeItemPickerText(searchableText).includes(normalizedQuery)
    })
  }, [filterItem, getSearchText, query, resolvedItems, shouldFilter])

  const groupedItems = useMemo(() => {
    const groups = new Map<string | undefined, ResolvedItem<TItem>[]>()
    visibleItems.forEach((resolved) => {
      const group = groupBy ? resolved.group : undefined
      const current = groups.get(group) ?? []
      current.push(resolved)
      groups.set(group, current)
    })
    return [...groups.entries()]
  }, [groupBy, visibleItems])

  const focusableIds = visibleItems.filter((item) => !item.disabled).map((item) => item.id)

  const changeSearch = (value: string) => {
    if (searchValue === undefined) setInternalSearch(value)
    onSearchValueChange?.(value)
  }

  const selectItem = (resolved: ResolvedItem<TItem>) => {
    if (resolved.disabled) return
    onItemSelect?.(resolved.item)
    if (selectionMode === "none") return

    const nextIds = selectionMode === "multiple"
      ? selectedSet.has(resolved.id)
        ? normalizedSelectedIds.filter((id) => id !== resolved.id)
        : [...normalizedSelectedIds, resolved.id]
      : [resolved.id]
    const uniqueIds = uniqueItemPickerIds(nextIds)
    if (selectedIds === undefined) setInternalSelectedIds(uniqueIds)
    const itemById = new Map(resolvedItems.map((item) => [item.id, item.item]))
    onSelectionChange?.(uniqueIds.flatMap((id) => {
      return itemById.has(id) ? [itemById.get(id) as TItem] : []
    }), uniqueIds)
  }

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, currentId: string) => {
    if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) return
    if (focusableIds.length === 0) return
    const currentIndex = Math.max(0, focusableIds.indexOf(currentId))
    const targetIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? focusableIds.length - 1
        : event.key === "ArrowDown" || event.key === "ArrowRight"
          ? (currentIndex + 1) % focusableIds.length
          : (currentIndex - 1 + focusableIds.length) % focusableIds.length
    event.preventDefault()
    itemRefs.current.get(focusableIds[targetIndex])?.focus()
  }

  const renderResolvedItem = (resolved: ResolvedItem<TItem>) => {
    const selected = selectionMode !== "none" && selectedSet.has(resolved.id)
    const state: NItemPickerRenderState = {
      id: resolved.id,
      index: resolved.index,
      selected,
      disabled: resolved.disabled,
    }

    return (
      <Box as="li" key={resolved.id} minW="0" listStyleType="none">
        <Button
          ref={(element) => {
            if (element) itemRefs.current.set(resolved.id, element)
            else itemRefs.current.delete(resolved.id)
          }}
          type="button"
          variant="outline"
          colorPalette={colorPalette}
          aria-label={resolved.label}
          aria-pressed={selectionMode === "none" ? undefined : selected}
          disabled={resolved.disabled}
          width="full"
          height="full"
          minH={layout === "grid" ? "5.5rem" : "4.5rem"}
          minW="0"
          justifyContent="flex-start"
          whiteSpace="normal"
          textAlign="start"
          p="4"
          color="fg"
          borderColor={selected ? "colorPalette.emphasized" : "border"}
          bg={selected ? "colorPalette.subtle" : "bg.panel"}
          _hover={{ bg: selected ? "colorPalette.muted" : "bg.subtle", borderColor: "colorPalette.border" }}
          _focusVisible={{ outline: "2px solid", outlineColor: "colorPalette.focusRing", outlineOffset: "2px" }}
          onClick={() => selectItem(resolved)}
          onKeyDown={(event) => moveFocus(event, resolved.id)}
        >
          {renderItem ? renderItem(resolved.item, state) : (
            <HStack width="full" minW="0" align="start" gap="3">
              {renderLeading ? <Box aria-hidden="true" flexShrink="0">{renderLeading(resolved.item, state)}</Box> : null}
              <Stack gap="1" minW="0" flex="1">
                <Text width="full" fontWeight="semibold" lineClamp="1">{resolved.label}</Text>
                {resolved.description ? <Text width="full" color="fg.muted" fontSize="sm" lineClamp="2">{resolved.description}</Text> : null}
              </Stack>
              {renderTrailing ? <Box flexShrink="0">{renderTrailing(resolved.item, state)}</Box> : null}
              {selected ? <Check aria-hidden="true" size={18} /> : null}
            </HStack>
          )}
        </Button>
      </Box>
    )
  }

  return (
    <Stack as="section" aria-label={labels.itemsLabel} gap={unstyled ? undefined : "4"} minW="0" colorPalette={colorPalette} className={classNames?.root} css={styles?.root} data-scope="n-item-picker" data-part="root">
      {header}

      {searchable ? (
        <Flex direction={{ base: "column", sm: "row" }} align={{ base: "stretch", sm: "center" }} gap="3">
          <HStack
            flex="1"
            minW="0"
            px="3"
            bg="bg"
            borderWidth="1px"
            borderColor="border"
            rounded="md"
            _focusWithin={{ borderColor: "colorPalette.solid", boxShadow: "0 0 0 1px var(--chakra-colors-color-palette-solid)" }}
          >
            <Box color="fg.muted" display="inline-flex" flexShrink="0"><Search aria-hidden="true" size={17} /></Box>
            <Input
              type="search"
              aria-label={labels.searchAriaLabel}
              placeholder={labels.searchPlaceholder}
              value={query}
              minW="0"
              border="0"
              px="0"
              outline="none"
              _placeholder={{ color: "fg.muted" }}
              _focusVisible={{ boxShadow: "none", outline: "none" }}
              onChange={(event) => changeSearch(event.target.value)}
            />
            {query ? (
              <IconButton
                aria-label={labels.clearSearch}
                size="xs"
                variant="ghost"
                flexShrink="0"
                onClick={() => changeSearch("")}
              >
                <X aria-hidden="true" size={15} />
              </IconButton>
            ) : null}
          </HStack>
          <HStack gap="2" flexShrink="0">
            <Text aria-live="polite" color="fg.muted" fontSize="sm">{labels.resultsCount(visibleItems.length)}</Text>
            {selectionMode !== "none" && normalizedSelectedIds.length > 0 ? (
              <Badge colorPalette={colorPalette}>{labels.selectionCount(normalizedSelectedIds.length)}</Badge>
            ) : null}
          </HStack>
        </Flex>
      ) : null}

      {selectionMode !== "none" ? (
        <VisuallyHidden aria-live="polite">{labels.selectionCount(normalizedSelectedIds.length)}</VisuallyHidden>
      ) : null}

      {loading ? (
        <Center role="status" minH="10rem" gap="3" color="fg.muted">
          <Spinner size="sm" />
          <Text>{labels.loading}</Text>
        </Center>
      ) : visibleItems.length === 0 ? (
        emptyState ?? (
          <Center role="status" minH="12rem" flexDirection="column" gap="2" px="6" textAlign="center" borderWidth="1px" borderColor="border" rounded="lg" bg="bg.panel">
            <Box color="fg.muted"><SearchX aria-hidden="true" size={28} /></Box>
            <Heading as="h3" size="sm">{labels.emptyTitle}</Heading>
            <Text color="fg.muted" fontSize="sm">{labels.emptyDescription}</Text>
          </Center>
        )
      ) : (
        <Stack gap="5" maxH={maxHeight} overflowY={maxHeight ? "auto" : undefined} pe={maxHeight ? "1" : undefined}>
          {groupedItems.map(([group, groupItems], groupIndex) => {
            const headingId = `${groupHeadingPrefix}-${groupIndex}`
            return (
              <Stack key={group ?? "__ungrouped"} as={group ? "section" : "div"} aria-labelledby={group ? headingId : undefined} gap="3">
                {group ? <Heading id={headingId} as="h3" size="sm">{group}</Heading> : null}
                <SimpleGrid
                  as="ul"
                  aria-label={group || undefined}
                  columns={layout === "list" ? 1 : columns}
                  gap="3"
                  p="0"
                  m="0"
                >
                  {groupItems.map(renderResolvedItem)}
                </SimpleGrid>
              </Stack>
            )
          })}
        </Stack>
      )}

      {footer}
    </Stack>
  )
}
