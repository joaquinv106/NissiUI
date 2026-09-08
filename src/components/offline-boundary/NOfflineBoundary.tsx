"use client"

import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react"
import { CheckCircle2, CloudOff, RefreshCw } from "lucide-react"
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"

import { resolveNOfflineBoundaryLabels } from "./labels"
import type { NConnectivityCheckResult, NOfflineBoundaryProps } from "./types"

/** Comunica conectividad y aplica un fallback opcional sin implementar persistencia ni una cola ficticia. */
export function NOfflineBoundary({
  children, online, defaultOnline = true, onOnlineChange, detectBrowserEvents = true,
  behavior = "banner", fallback, queuedCount = 0, onCheckConnectivity, showOnlineStatus = false,
  disabled = false, colorPalette = "orange", labels: labelsProp, unstyled = false, classNames, styles,
}: NOfflineBoundaryProps) {
  const labels = useMemo(() => resolveNOfflineBoundaryLabels(labelsProp), [labelsProp])
  const [internalOnline, setInternalOnline] = useState(defaultOnline)
  const [checking, setChecking] = useState(false)
  const [checkMessage, setCheckMessage] = useState<ReactNode>()
  const sequence = useRef(0)
  const activeOnline = online ?? internalOnline
  const controlled = online !== undefined

  useEffect(() => {
    if (controlled || !detectBrowserEvents || typeof window === "undefined") return
    const update = (next: boolean) => {
      setInternalOnline(next)
      setCheckMessage(undefined)
      onOnlineChange?.(next)
    }
    const handleOnline = () => update(true)
    const handleOffline = () => update(false)
    setInternalOnline(window.navigator.onLine)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [controlled, detectBrowserEvents, onOnlineChange])

  useEffect(() => {
    sequence.current += 1
    setChecking(false)
    setCheckMessage(undefined)
  }, [activeOnline])

  const checkConnectivity = async () => {
    if (!onCheckConnectivity || checking || disabled) return
    const request = ++sequence.current
    setChecking(true)
    setCheckMessage(undefined)
    try {
      const result = await onCheckConnectivity() as boolean | NConnectivityCheckResult
      if (request !== sequence.current) return
      const nextOnline = typeof result === "boolean" ? result : result.online
      const resultMessage = typeof result === "object" ? result.message : undefined
      if (!controlled) setInternalOnline(nextOnline)
      onOnlineChange?.(nextOnline)
      if (!nextOnline) setCheckMessage(resultMessage ?? labels.retryFailed)
      setChecking(false)
    } catch {
      if (request !== sequence.current) return
      setCheckMessage(labels.retryFailed)
      setChecking(false)
    }
  }

  const notice = !activeOnline ? (
    <Flex role="status" aria-live="polite" align={{ base: "start", sm: "center" }} justify="space-between" direction={{ base: "column", sm: "row" }} gap="3" p={unstyled ? undefined : "4"} rounded={unstyled ? undefined : "lg"} borderWidth={unstyled ? undefined : "1px"} borderColor="colorPalette.muted" bg={unstyled ? undefined : "colorPalette.subtle"} colorPalette={colorPalette} className={classNames?.banner} css={styles?.banner} data-part="banner">
      <Flex align="start" gap="3">
        <CloudOff aria-hidden size={20} />
        <Box>
          <Text fontWeight="semibold">{labels.offlineTitle}</Text>
          <Text color="fg.muted" fontSize="sm">{labels.offlineDescription}</Text>
          {queuedCount > 0 ? <Text mt="1" fontSize="sm" fontWeight="medium">{labels.queuedChanges(queuedCount)}</Text> : null}
        </Box>
      </Flex>
      {onCheckConnectivity ? <Button type="button" size="sm" variant="outline" width={{ base: "full", sm: "auto" }} disabled={disabled} loading={checking} loadingText={labels.checking} onClick={() => void checkConnectivity()}><RefreshCw aria-hidden size={16} />{labels.retry}</Button> : null}
    </Flex>
  ) : showOnlineStatus ? (
    <Flex role="status" aria-live="polite" align="center" gap="2" p="3" rounded="md" borderWidth="1px" borderColor="border.success" bg="bg.success" color="fg.success"><CheckCircle2 aria-hidden size={18} /><Text fontSize="sm" fontWeight="medium">{labels.onlineRestored}</Text></Flex>
  ) : null

  return (
    <Stack as="section" aria-label={labels.regionLabel} gap="3" minW="0" className={classNames?.root} css={styles?.root} data-scope="n-offline-boundary" data-part="root">
      {notice}
      {checkMessage ? <Box role="alert" p="3" rounded="md" borderWidth="1px" borderColor="border.error" bg="bg.error" color="fg.error">{checkMessage}</Box> : null}
      {!activeOnline && behavior === "fallback" ? fallback ?? null : children}
    </Stack>
  )
}
