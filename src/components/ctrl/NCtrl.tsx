"use client"

import { Badge, Box, Button, EmptyState, Field, Flex, IconButton, Input, InputGroup, Kbd, SimpleGrid, Spinner, Stack, Text } from "@chakra-ui/react"
import { Command, Keyboard, Search, Zap } from "lucide-react"
import { type KeyboardEvent as ReactKeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"

import { NPanel } from "../panel"
import { useRegisteredNCtrlShortcuts } from "./NCtrlContext"
import { resolveNCtrlLabels } from "./labels"
import type { NCtrlInvokeDetails, NCtrlProps, NCtrlShortcut } from "./types"
import { formatNCtrlChord, matchesNCtrlShortcut, nCtrlKeys, normalizeNCtrlChord, resolveNCtrlShortcuts } from "./utils"

function isEditableTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.matches("input, textarea, select, [contenteditable='true']")
}

/** Centro contextual de atajos: ejecuta combinaciones y documenta las disponibles en la vista activa. */
export function NCtrl({
  shortcuts = [], viewId = "default", viewLabel, open, defaultOpen = false, onOpenChange,
  toggleShortcut = "F11", enabled = true, executeShortcuts = true, disableShortcutsWhileOpen = true,
  showTrigger = true, trigger, placement = "auto", desktopWidth = "clamp(22rem, 38vw, 38rem)",
  colorPalette = "blue", onShortcutInvoke, onShortcutError, onShortcutConflict, labels: labelsProp, unstyled = false, classNames, styles,
}: NCtrlProps) {
  const labels = useMemo(() => resolveNCtrlLabels(labelsProp), [labelsProp])
  const registered = useRegisteredNCtrlShortcuts()
  const resolvedShortcuts = useMemo(() => resolveNCtrlShortcuts(shortcuts, registered), [registered, shortcuts])
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [query, setQuery] = useState("")
  const [busyId, setBusyId] = useState<string>()
  const busyIdRef = useRef<string | undefined>(undefined)
  const [error, setError] = useState<string>()
  const openRef = useRef(open ?? internalOpen)
  const shortcutsRef = useRef(resolvedShortcuts)
  const activeOpen = open ?? internalOpen
  openRef.current = activeOpen
  shortcutsRef.current = resolvedShortcuts

  const changeOpen = useCallback((next: boolean) => {
    openRef.current = next
    if (open === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }, [onOpenChange, open])

  useEffect(() => { setQuery(""); setError(undefined) }, [viewId])

  const invoke = useCallback(async (shortcut: NCtrlShortcut, keys: string, source: NCtrlInvokeDetails["source"]) => {
    if (shortcut.disabled || !shortcut.handler || busyIdRef.current) return
    const details = { shortcut, keys, source } satisfies NCtrlInvokeDetails
    busyIdRef.current = shortcut.id
    setBusyId(shortcut.id)
    setError(undefined)
    try {
      onShortcutInvoke?.(details)
      await shortcut.handler()
      if (source === "panel") changeOpen(false)
    } catch (cause) {
      setError(labels.executionFailed)
      onShortcutError?.(cause, details)
    } finally {
      busyIdRef.current = undefined
      setBusyId(undefined)
    }
  }, [changeOpen, labels.executionFailed, onShortcutError, onShortcutInvoke])
  const invokeRef = useRef(invoke)
  invokeRef.current = invoke

  useEffect(() => {
    if (!enabled) return
    const toggleChord = normalizeNCtrlChord(toggleShortcut)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (normalizeNCtrlChord([event.ctrlKey && "Ctrl", event.altKey && "Alt", event.shiftKey && "Shift", event.metaKey && "Meta", event.key].filter(Boolean).join("+")) === toggleChord) {
        event.preventDefault()
        changeOpen(!openRef.current)
        return
      }
      if (!executeShortcuts || (disableShortcutsWhileOpen && openRef.current) || event.isComposing) return
      const matches = shortcutsRef.current
        .filter((shortcut) => !shortcut.disabled && shortcut.handler && (shortcut.repeat || !event.repeat) && (!isEditableTarget(event.target) || shortcut.allowInEditable))
        .flatMap((shortcut) => {
          const keys = matchesNCtrlShortcut(event, shortcut.keys)
          return keys ? [{ shortcut, keys }] : []
        })
        .sort((left, right) => (right.shortcut.priority ?? 0) - (left.shortcut.priority ?? 0))
      const selected = matches[0]
      if (!selected) return
      if (matches.length > 1) onShortcutConflict?.(selected.keys, matches.map(({ shortcut }) => shortcut))
      if (selected.shortcut.preventDefault !== false) event.preventDefault()
      void invokeRef.current(selected.shortcut, selected.keys, "keyboard")
    }
    window.addEventListener("keydown", handleKeyDown, true)
    return () => window.removeEventListener("keydown", handleKeyDown, true)
  }, [changeOpen, disableShortcutsWhileOpen, enabled, executeShortcuts, onShortcutConflict, toggleShortcut])

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return resolvedShortcuts.filter((shortcut) => !normalizedQuery || [shortcut.label, shortcut.description, shortcut.group, ...nCtrlKeys(shortcut.keys)].some((value) => value?.toLocaleLowerCase().includes(normalizedQuery)))
  }, [query, resolvedShortcuts])
  const groups = useMemo(() => {
    const grouped = new Map<string, NCtrlShortcut[]>()
    for (const shortcut of filtered) {
      const group = shortcut.group ?? labels.defaultGroup
      grouped.set(group, [...(grouped.get(group) ?? []), shortcut])
    }
    return [...grouped]
  }, [filtered, labels.defaultGroup])

  const defaultTrigger = <IconButton
    aria-label={`${labels.openPanel}. ${labels.shortcutHint(formatNCtrlChord(toggleShortcut))}`}
    aria-keyshortcuts={toggleShortcut}
    position="fixed"
    insetInlineEnd={{ base: "4", md: "6" }}
    bottom={{ base: "4", md: "6" }}
    zIndex="docked"
    rounded="full"
    size={{ base: "md", md: "lg" }}
    colorPalette={colorPalette}
    shadow="lg"
  ><Keyboard aria-hidden /></IconButton>

  return <NPanel
    open={activeOpen}
    onOpenChange={changeOpen}
    placement={placement}
    desktopWidth={desktopWidth}
    title={viewLabel ? `${labels.title} · ${viewLabel}` : labels.title}
    description={`${labels.description} ${labels.shortcutHint(formatNCtrlChord(toggleShortcut))}`}
    contentKey={viewId}
    colorPalette={colorPalette}
    trigger={showTrigger ? (trigger ?? defaultTrigger) : undefined}
    unstyled={unstyled}
    classNames={{ content: classNames?.root, trigger: classNames?.trigger }}
    styles={{ content: styles?.root, trigger: styles?.trigger }}
  >
    <Stack gap="5" data-scope="n-ctrl" data-part="root">
      <Field.Root>
        <Field.Label position="absolute" width="1px" height="1px" overflow="hidden" clip="rect(0, 0, 0, 0)">{labels.searchLabel}</Field.Label>
        <InputGroup startElement={<Search aria-hidden size={17} />}>
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.searchPlaceholder} />
        </InputGroup>
      </Field.Root>
      {error ? <Box role="alert" bg="bg.error" color="fg.error" borderWidth="1px" borderColor="border.error" rounded="md" p="3" className={classNames?.error} css={styles?.error} data-part="error">{error}</Box> : null}
      {groups.length ? groups.map(([group, entries]) => <Stack key={group} as="section" gap="3" aria-labelledby={`n-ctrl-${viewId}-${group}`}>
        <Flex align="center" gap="2"><Zap aria-hidden size={16} /><Text id={`n-ctrl-${viewId}-${group}`} as="h3" fontWeight="semibold">{group}</Text><Badge variant="subtle">{entries.length}</Badge></Flex>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
          {entries.map((shortcut) => {
            const available = Boolean(shortcut.handler) && !shortcut.disabled
            return <Button
              key={shortcut.id}
              variant="outline"
              height="auto"
              minH="5rem"
              p="3"
              justifyContent="stretch"
              whiteSpace="normal"
              disabled={!available || Boolean(busyId)}
              aria-keyshortcuts={nCtrlKeys(shortcut.keys).join(" ")}
              onClick={() => void invoke(shortcut, nCtrlKeys(shortcut.keys)[0] ?? "", "panel")}
            >
              <Flex width="full" align="flex-start" gap="3">
                <Box color="colorPalette.fg" flexShrink="0">{busyId === shortcut.id ? <Spinner size="sm" /> : shortcut.icon ?? <Command aria-hidden size={18} />}</Box>
                <Stack gap="1.5" flex="1" minW="0" textAlign="start">
                  <Flex gap="1.5" wrap="wrap">{nCtrlKeys(shortcut.keys).map((keys) => <Kbd key={keys}>{formatNCtrlChord(keys)}</Kbd>)}</Flex>
                  <Text fontWeight="semibold">{shortcut.label}</Text>
                  <Text fontSize="xs" color="fg.muted">{shortcut.disabled ? labels.unavailable : shortcut.description ?? (!shortcut.handler ? labels.noHandler : busyId === shortcut.id ? labels.executing : "")}</Text>
                </Stack>
              </Flex>
            </Button>
          })}
        </SimpleGrid>
      </Stack>) : <EmptyState.Root><EmptyState.Content><EmptyState.Indicator><Keyboard aria-hidden /></EmptyState.Indicator><EmptyState.Title>{labels.empty}</EmptyState.Title></EmptyState.Content></EmptyState.Root>}
    </Stack>
  </NPanel>
}
