"use client"

import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react"
import { CheckCircle2, CreditCard } from "lucide-react"
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"

import { NAmountAllocator, summarizeAmounts, type NAmountAllocation, type NAmountAllocationSummary } from "../amount-allocator"
import { resolveNCheckoutLabels } from "./labels"
import type { NCheckoutDetails, NCheckoutProps, NCheckoutResult } from "./types"
import { checkoutMessage, checkoutSucceeded } from "./utils"

/** Preset de finalización que compone NAmountAllocator y delega la transacción al consumidor. */
export function NCheckout<TMethod>({
  checkoutKey = "default", allocations, defaultAllocations = [], onAllocationsChange,
  onComplete, validate, canComplete, review, header, footer, allocatorHeader, allocatorFooter, allocatorLabels,
  labels: labelsProp, precision = 2, colorPalette = "blue", disabled = false, readOnly = false,
  total, methods, methodLayout = "stacked", ...allocatorProps
}: NCheckoutProps<TMethod>) {
  const labels = useMemo(() => resolveNCheckoutLabels(labelsProp), [labelsProp])
  const [internalAllocations, setInternalAllocations] = useState<readonly NAmountAllocation<TMethod>[]>(defaultAllocations)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<ReactNode>()
  const [messageKind, setMessageKind] = useState<"error" | "success">()
  const sequence = useRef(0)
  const activeKey = useRef(checkoutKey)
  activeKey.current = checkoutKey
  const activeAllocations = allocations ?? internalAllocations
  const summary = useMemo<NAmountAllocationSummary>(
    () => summarizeAmounts(total, activeAllocations.map((allocation) => allocation.amount), precision),
    [activeAllocations, precision, total],
  )
  const details = useMemo<NCheckoutDetails<TMethod>>(
    () => ({ total, allocations: activeAllocations, summary }),
    [activeAllocations, summary, total],
  )
  const allowed = canComplete?.(details) ?? (methods.length > 0 && summary.status === "balanced")

  useEffect(() => {
    sequence.current += 1
    if (allocations === undefined) setInternalAllocations([...defaultAllocations])
    setBusy(false)
    setMessage(undefined)
    setMessageKind(undefined)
  }, [checkoutKey])

  const changeAllocations: NonNullable<NCheckoutProps<TMethod>["onAllocationsChange"]> = (next, nextSummary, change) => {
    if (allocations === undefined) setInternalAllocations(next)
    setMessage(undefined)
    setMessageKind(undefined)
    onAllocationsChange?.(next, nextSummary, change)
  }

  const complete = async () => {
    if (disabled || readOnly || busy) return
    if (!allowed) { setMessage(labels.incomplete); setMessageKind("error"); return }
    const request = ++sequence.current
    const requestKey = checkoutKey
    setBusy(true)
    setMessage(undefined)
    try {
      const validationMessage = await validate?.(details)
      if (request !== sequence.current || activeKey.current !== requestKey) return
      if (validationMessage) { setMessage(validationMessage); setMessageKind("error"); setBusy(false); return }
      const result = await onComplete(details) as void | boolean | NCheckoutResult
      if (request !== sequence.current || activeKey.current !== requestKey) return
      if (!checkoutSucceeded(result)) { setMessage(checkoutMessage(result) ?? labels.failed); setMessageKind("error"); setBusy(false); return }
      setMessage(checkoutMessage(result) ?? labels.completed)
      setMessageKind("success")
      setBusy(false)
    } catch {
      if (request !== sequence.current || activeKey.current !== requestKey) return
      setMessage(labels.failed)
      setMessageKind("error")
      setBusy(false)
    }
  }

  return (
    <Stack as="section" aria-label={labels.checkoutLabel} gap="5" minW="0" colorPalette={colorPalette}>
      {header}
      <Flex align="center" gap="3"><Flex align="center" justify="center" boxSize="10" rounded="lg" bg="colorPalette.subtle" color="colorPalette.fg"><CreditCard aria-hidden size={20} /></Flex><Heading as="h2" size="md">{labels.title}</Heading></Flex>
      {review ? <Stack as="section" aria-label={labels.reviewLabel} gap="3" p={{ base: "4", md: "5" }} borderWidth="1px" borderColor="border" rounded="lg" bg="bg.panel">{review}</Stack> : null}
      <Box as="section" aria-label={labels.paymentLabel}>
        <NAmountAllocator
          {...allocatorProps}
          total={total}
          methods={methods}
          methodLayout={methodLayout}
          precision={precision}
          allocations={activeAllocations}
          disabled={disabled || busy}
          readOnly={readOnly}
          colorPalette={colorPalette}
          header={allocatorHeader}
          footer={allocatorFooter}
          labels={allocatorLabels}
          onAllocationsChange={changeAllocations}
        />
      </Box>
      {message ? <Box role={messageKind === "error" ? "alert" : "status"} aria-live="polite" p="3" rounded="md" borderWidth="1px" borderColor={messageKind === "error" ? "border.error" : "border.success"} bg={messageKind === "error" ? "bg.error" : "bg.success"} color={messageKind === "error" ? "fg.error" : "fg.success"}><Flex align="center" gap="2">{messageKind === "success" ? <CheckCircle2 aria-hidden size={18} /> : null}<Text>{message}</Text></Flex></Box> : null}
      {!readOnly ? <Button type="button" size="lg" colorPalette={colorPalette} width="full" disabled={disabled} loading={busy} loadingText={labels.processing} onClick={() => void complete()}>{labels.complete}</Button> : null}
      {footer}
    </Stack>
  )
}
