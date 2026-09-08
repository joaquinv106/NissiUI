"use client"

import { Badge, Box, Button, Card, Center, Flex, Heading, SimpleGrid, Spinner, Stack, Text } from "@chakra-ui/react"
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"

import { NAmountInput } from "../amount-input"
import { resolveNBalanceSessionLabels } from "./labels"
import type { NBalanceSessionProps, NBalanceSessionResult, NBalanceSessionStatus } from "./types"
import { balanceResultMessage, balanceResultSucceeded, createBalanceSummary } from "./utils"

const statusPalette: Record<NBalanceSessionStatus, string> = { open: "blue", balanced: "green", variance: "orange", closed: "gray" }

/** Compara valores esperados y observados de cualquier sesión operativa sin imponer reglas contables. */
export function NBalanceSession<TEntry>({
  sessionId, entries, openingAmount = 0, getEntryId, getEntryLabel, getEntryAmount, getEntryDescription,
  countedAmount, defaultCountedAmount = null, onCountedAmountChange, status, tolerance = 0,
  allowCloseWithVariance = false, onClose, formatAmount, locale, formatOptions, renderEntry, renderSummary,
  showEntries = true, disabled = false, readOnly = false, loading = false, error, emptyState, header, footer,
  colorPalette = "blue", labels: labelsProp, unstyled = false, classNames, styles,
}: NBalanceSessionProps<TEntry>) {
  const labels = useMemo(() => resolveNBalanceSessionLabels(labelsProp), [labelsProp])
  const [internalCounted, setInternalCounted] = useState({ sessionId, amount: defaultCountedAmount })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<ReactNode>()
  const previousSessionId = useRef(sessionId)
  const currentSessionId = useRef(sessionId)
  const sequence = useRef(0)
  currentSessionId.current = sessionId
  const movementAmount = entries.reduce((total, entry) => total + getEntryAmount(entry), 0)
  const activeCounted = countedAmount === undefined
    ? internalCounted.sessionId === sessionId ? internalCounted.amount : defaultCountedAmount
    : countedAmount
  const summary = createBalanceSummary(openingAmount, movementAmount, activeCounted, tolerance, status)
  const money = (amount: number) => formatAmount?.(amount) ?? new Intl.NumberFormat(locale, formatOptions).format(amount)
  const statusLabel = summary.status === "balanced" ? labels.balanced : summary.status === "variance" ? labels.variance : summary.status === "closed" ? labels.closed : labels.open

  useEffect(() => {
    if (previousSessionId.current === sessionId) return
    previousSessionId.current = sessionId
    sequence.current += 1
    setInternalCounted({ sessionId, amount: defaultCountedAmount })
    setBusy(false)
    setMessage(undefined)
  }, [defaultCountedAmount, sessionId])

  const changeCounted = (amount: number | null) => {
    if (countedAmount === undefined) setInternalCounted({ sessionId, amount })
    setMessage(undefined)
    onCountedAmountChange?.(amount, createBalanceSummary(openingAmount, movementAmount, amount, tolerance, status))
  }

  const close = async () => {
    if (disabled || readOnly || busy || summary.status === "closed") return
    if (activeCounted === null) { setMessage(labels.countedRequired); return }
    if (!allowCloseWithVariance && summary.status === "variance") { setMessage(labels.varianceBlocked); return }
    setBusy(true)
    setMessage(undefined)
    const request = ++sequence.current
    try {
      const result = await onClose?.({ sessionId, countedAmount: activeCounted, summary }) as void | boolean | NBalanceSessionResult
      if (request !== sequence.current || currentSessionId.current !== sessionId) return
      if (!balanceResultSucceeded(result)) setMessage(balanceResultMessage(result) ?? labels.closeFailed)
      setBusy(false)
    } catch {
      if (request !== sequence.current || currentSessionId.current !== sessionId) return
      setMessage(labels.closeFailed)
      setBusy(false)
    }
  }

  if (error) return <Stack as="section" aria-label={labels.sessionLabel} role="alert" gap="1" p={unstyled ? undefined : "4"} borderWidth={unstyled ? undefined : "1px"} borderColor="border.error" rounded={unstyled ? undefined : "lg"} bg={unstyled ? undefined : "bg.error"} className={classNames?.error} css={styles?.error ?? styles?.root} data-scope="n-balance-session" data-part="error"><Text color="fg.error" fontWeight="semibold">{labels.errorTitle}</Text><Box color="fg.error">{error}</Box></Stack>
  if (loading) return <Center as="section" aria-label={labels.sessionLabel} role="status" minH="12rem" gap="3" className={classNames?.loading} css={styles?.loading ?? styles?.root} data-scope="n-balance-session" data-part="loading"><Spinner size="sm" /><Text color="fg.muted">{labels.loading}</Text></Center>
  if (!sessionId) return emptyState ?? <Center as="section" aria-label={labels.sessionLabel} role="status" minH="12rem" flexDirection="column" gap="2" p="6" borderWidth="1px" borderColor="border" rounded="lg"><Text fontWeight="semibold">{labels.emptyTitle}</Text><Text color="fg.muted" fontSize="sm">{labels.emptyDescription}</Text></Center>

  return (
    <Stack as="section" aria-label={labels.sessionLabel} gap="5" minW="0" colorPalette={colorPalette} data-session-id={sessionId} className={classNames?.root} css={styles?.root} data-scope="n-balance-session" data-part="root">
      {header}
      {renderSummary ? renderSummary(summary) : (
        <Card.Root variant="outline" bg="bg.panel"><Card.Body gap="4">
          <Flex justify="space-between" align="center" gap="3" flexWrap="wrap"><Heading as="h3" size="md">{labels.sessionLabel}</Heading><Badge colorPalette={statusPalette[summary.status]} aria-live="polite">{statusLabel}</Badge></Flex>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="3">
            {[[labels.openingAmount, summary.openingAmount], [labels.movements, summary.movementAmount], [labels.expectedAmount, summary.expectedAmount]].map(([label, value]) => <Box key={String(label)} p="3" rounded="md" bg="bg.subtle"><Text color="fg.muted" fontSize="xs">{label}</Text><Box fontWeight="semibold">{money(Number(value))}</Box></Box>)}
            <Box p="3" rounded="md" bg={summary.difference !== null && Math.abs(summary.difference) > tolerance ? "bg.warning" : "bg.subtle"}><Text color="fg.muted" fontSize="xs">{labels.difference}</Text><Box fontWeight="semibold">{summary.difference === null ? "—" : money(summary.difference)}</Box></Box>
          </SimpleGrid>
        </Card.Body></Card.Root>
      )}
      <NAmountInput label={labels.countedAmount} value={activeCounted} onValueChange={changeCounted} locale={locale} formatOptions={formatOptions} disabled={disabled || busy || summary.status === "closed"} readOnly={readOnly} showControls />
      {message ? <Box role="alert" p="3" rounded="md" borderWidth="1px" borderColor="border.error" bg="bg.error" color="fg.error">{message}</Box> : null}
      {!readOnly && summary.status !== "closed" ? <Flex justify="flex-end"><Button type="button" colorPalette={colorPalette} width={{ base: "full", sm: "auto" }} disabled={disabled} loading={busy} loadingText={labels.processing} onClick={() => void close()}>{labels.close}</Button></Flex> : null}
      {showEntries ? <Stack gap="3"><Heading as="h3" size="sm">{labels.entriesTitle}</Heading>{entries.length === 0 ? <Text color="fg.muted" fontSize="sm">{labels.noEntries}</Text> : <Stack as="ol" aria-label={labels.entriesTitle} gap="2" p="0" m="0">{entries.map((entry, index) => <Flex as="li" key={getEntryId(entry, index)} justify="space-between" align={{ base: "start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap="2" p="3" listStyleType="none" borderWidth="1px" borderColor="border" rounded="md" bg="bg.panel">{renderEntry ? renderEntry(entry, index) : <><Box><Box fontWeight="medium">{getEntryLabel(entry)}</Box>{getEntryDescription ? <Box color="fg.muted" fontSize="sm">{getEntryDescription(entry)}</Box> : null}</Box><Box fontWeight="semibold">{money(getEntryAmount(entry))}</Box></>}</Flex>)}</Stack>}</Stack> : null}
      {footer}
    </Stack>
  )
}
