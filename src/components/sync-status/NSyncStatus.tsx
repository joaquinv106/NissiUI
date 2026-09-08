"use client"

import { Badge, Box, Button, Collapsible, Flex, Spinner, Stack, Text } from "@chakra-ui/react"
import { CheckCircle2, ChevronDown, Clock3, CloudOff, RefreshCw, TriangleAlert } from "lucide-react"
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"

import { resolveNSyncStatusLabels } from "./labels"
import type { NSyncRetryResult, NSyncState, NSyncStatusProps } from "./types"
import { syncRetryMessage, syncRetrySucceeded, toValidSyncDate } from "./utils"

const statusPalette: Record<NSyncState, string> = {
  synced: "green",
  syncing: "blue",
  pending: "orange",
  offline: "gray",
  error: "red",
}

/** Representa el estado real que entrega un motor de sincronización sin inventar conectividad ni éxito remoto. */
export function NSyncStatus({
  status, syncKey = "default", pendingCount = 0, lastSyncedAt, message, error, onRetry,
  formatTimestamp, variant = "panel", showDetails = false, details, disabled = false,
  colorPalette, labels: labelsProp, unstyled = false, classNames, styles,
}: NSyncStatusProps) {
  const labels = useMemo(() => resolveNSyncStatusLabels(labelsProp), [labelsProp])
  const [retrying, setRetrying] = useState(false)
  const [retryError, setRetryError] = useState<ReactNode>()
  const sequence = useRef(0)
  const activeKey = useRef(syncKey)
  activeKey.current = syncKey

  useEffect(() => {
    sequence.current += 1
    setRetrying(false)
    setRetryError(undefined)
  }, [syncKey, status])

  const date = toValidSyncDate(lastSyncedAt)
  const formattedDate = date
    ? formatTimestamp?.(date) ?? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date)
    : undefined
  const palette = colorPalette ?? statusPalette[status]
  const statusText = labels[status]
  const canRetry = Boolean(onRetry) && (status === "error" || status === "offline" || status === "pending")
  const StatusIcon = status === "synced" ? CheckCircle2 : status === "pending" ? Clock3 : status === "offline" ? CloudOff : status === "error" ? TriangleAlert : RefreshCw

  const retry = async () => {
    if (!onRetry || retrying || disabled) return
    const requestKey = syncKey
    const request = ++sequence.current
    setRetrying(true)
    setRetryError(undefined)
    try {
      const result = await onRetry() as void | boolean | NSyncRetryResult
      if (request !== sequence.current || activeKey.current !== requestKey) return
      if (!syncRetrySucceeded(result)) setRetryError(syncRetryMessage(result) ?? labels.retryFailed)
      setRetrying(false)
    } catch {
      if (request !== sequence.current || activeKey.current !== requestKey) return
      setRetryError(labels.retryFailed)
      setRetrying(false)
    }
  }

  const icon = status === "syncing"
    ? <Spinner size="sm" aria-hidden />
    : <StatusIcon aria-hidden size={17} />

  if (variant === "compact") return (
    <Flex as="section" aria-label={labels.regionLabel} role="status" aria-live="polite" align="center" gap="2" minW="0" colorPalette={palette} className={classNames?.root} css={styles?.root} data-scope="n-sync-status" data-part="root">
      <Badge colorPalette={palette} variant="subtle" gap="1.5" flexShrink="0">{icon}{statusText}</Badge>
      {pendingCount > 0 ? <Text color="fg.muted" fontSize="sm" truncate>{labels.pendingCount(pendingCount)}</Text> : null}
      {canRetry ? <Button type="button" size="xs" variant="ghost" disabled={disabled} loading={retrying} loadingText={labels.retrying} onClick={() => void retry()}>{labels.retry}</Button> : null}
      {retryError ? <Text color="fg.error" fontSize="sm">{retryError}</Text> : null}
    </Flex>
  )

  return (
    <Stack as="section" aria-label={labels.regionLabel} role="status" aria-live="polite" gap="3" p={unstyled ? undefined : "4"} borderWidth={unstyled ? undefined : "1px"} borderColor="border" rounded={unstyled ? undefined : "lg"} bg={unstyled ? undefined : "bg.panel"} colorPalette={palette} minW="0" className={classNames?.root} css={styles?.root} data-scope="n-sync-status" data-part="root">
      <Flex align={{ base: "start", sm: "center" }} justify="space-between" direction={{ base: "column", sm: "row" }} gap="3">
        <Flex align="center" gap="3" minW="0">
          <Flex align="center" justify="center" boxSize="9" rounded="full" bg="colorPalette.subtle" color="colorPalette.fg" flexShrink="0">{icon}</Flex>
          <Box minW="0">
            <Text fontWeight="semibold">{statusText}</Text>
            {message ? <Box color="fg.muted" fontSize="sm">{message}</Box> : null}
          </Box>
        </Flex>
        {canRetry ? <Button type="button" size="sm" variant="outline" width={{ base: "full", sm: "auto" }} disabled={disabled} loading={retrying} loadingText={labels.retrying} onClick={() => void retry()}><RefreshCw aria-hidden size={16} />{labels.retry}</Button> : null}
      </Flex>
      <Flex gap="4" flexWrap="wrap" color="fg.muted" fontSize="sm">
        {pendingCount > 0 ? <Text>{labels.pendingCount(pendingCount)}</Text> : null}
        <Text>{date && formattedDate ? <>{labels.lastSynced}: <Box asChild><time dateTime={date.toISOString()}>{formattedDate}</time></Box></> : labels.neverSynced}</Text>
      </Flex>
      {error ? <Box role="alert" p="3" rounded="md" borderWidth="1px" borderColor="border.error" bg="bg.error" color="fg.error">{error}</Box> : null}
      {retryError ? <Box role="alert" p="3" rounded="md" borderWidth="1px" borderColor="border.error" bg="bg.error" color="fg.error">{retryError}</Box> : null}
      {details ? <Collapsible.Root defaultOpen={showDetails}><Collapsible.Trigger asChild><Button type="button" size="sm" variant="ghost" alignSelf="start"><ChevronDown aria-hidden size={16} />{labels.details}</Button></Collapsible.Trigger><Collapsible.Content><Box pt="2" color="fg.muted" fontSize="sm">{details}</Box></Collapsible.Content></Collapsible.Root> : null}
    </Stack>
  )
}
