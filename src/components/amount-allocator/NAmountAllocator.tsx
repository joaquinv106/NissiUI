"use client"

import { Badge, Box, Button, Center, Flex, Heading, HStack, Progress, SimpleGrid, Spinner, Stack, Text } from "@chakra-ui/react"
import { CircleDollarSign, Equal, RotateCcw } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { NAmountInput } from "../amount-input"
import { resolveNAmountAllocatorLabels } from "./labels"
import type { NAmountAllocation, NAmountAllocationChange, NAmountAllocatorProps } from "./types"
import { distributeAmountEvenly, roundAmount, summarizeAmounts } from "./utils"

interface ResolvedMethod<TMethod> {
  id: string
  index: number
  method: TMethod
  label: string
  description?: string
  disabled: boolean
}

/** Distribuye un total entre métodos, presupuestos, centros de costo o cualquier colección tipada. */
export function NAmountAllocator<TMethod>({
  total,
  methods,
  getMethodId,
  getMethodLabel,
  getMethodDescription,
  allocations,
  defaultAllocations = [],
  onAllocationsChange,
  precision = 2,
  locale = "es-MX",
  formatOptions,
  formatAmount,
  amountInputProps,
  allowOverAllocation = false,
  allowNegative = false,
  showDistributeEvenly = true,
  showReset = true,
  showAssignRemaining = true,
  methodLayout = "responsive",
  getMethodMin,
  getMethodMax,
  isMethodDisabled,
  validateAllocation,
  renderMethodLeading,
  renderMethodTrailing,
  name,
  disabled = false,
  readOnly = false,
  loading = false,
  error,
  header,
  footer,
  emptyState,
  colorPalette = "blue",
  labels: labelsProp,
}: NAmountAllocatorProps<TMethod>) {
  const labels = useMemo(() => resolveNAmountAllocatorLabels(labelsProp), [labelsProp])
  const [internalAllocations, setInternalAllocations] = useState<readonly NAmountAllocation<TMethod>[]>(defaultAllocations)
  const [methodErrors, setMethodErrors] = useState<Record<string, string>>({})
  const warnedAboutDuplicateIds = useRef(false)
  const activeAllocations = allocations ?? internalAllocations
  const effectivePrecision = Math.max(0, Math.min(12, Math.trunc(precision)))

  const resolvedMethods = useMemo<ResolvedMethod<TMethod>[]>(() => methods.map((method, index) => ({
    id: getMethodId(method, index),
    index,
    method,
    label: getMethodLabel(method),
    description: getMethodDescription?.(method),
    disabled: disabled || Boolean(isMethodDisabled?.(method)),
  })), [disabled, getMethodDescription, getMethodId, getMethodLabel, isMethodDisabled, methods])

  useEffect(() => {
    const ids = resolvedMethods.map((method) => method.id)
    const isDevelopment = typeof process === "undefined" || process.env.NODE_ENV !== "production"
    if (isDevelopment && !warnedAboutDuplicateIds.current && new Set(ids).size !== ids.length) {
      warnedAboutDuplicateIds.current = true
      console.warn("[NissiUI] NAmountAllocator recibió identificadores duplicados mediante getMethodId.")
    }
  }, [resolvedMethods])

  const amountById = useMemo(() => {
    const next = new Map<string, number>()
    activeAllocations.forEach((allocation, index) => {
      next.set(getMethodId(allocation.method, index), roundAmount(allocation.amount, effectivePrecision))
    })
    return next
  }, [activeAllocations, effectivePrecision, getMethodId])

  const amounts = resolvedMethods.map((method) => amountById.get(method.id) ?? 0)
  const summary = summarizeAmounts(total, amounts, effectivePrecision)
  const formatter = useMemo(() => new Intl.NumberFormat(locale, formatOptions ?? {
    minimumFractionDigits: effectivePrecision,
    maximumFractionDigits: effectivePrecision,
  }), [effectivePrecision, formatOptions, locale])
  const presentAmount = (amount: number) => formatAmount?.(amount) ?? formatter.format(amount)

  const publishAmounts = (nextAmounts: readonly number[], change: NAmountAllocationChange<TMethod>) => {
    const nextAllocations = resolvedMethods.map((resolved, index) => ({
      method: resolved.method,
      amount: roundAmount(nextAmounts[index] ?? 0, effectivePrecision),
    }))
    const nextSummary = summarizeAmounts(total, nextAllocations.map((allocation) => allocation.amount), effectivePrecision)
    if (allocations === undefined) setInternalAllocations(nextAllocations)
    onAllocationsChange?.(nextAllocations, nextSummary, change)
    if (validateAllocation) {
      const nextErrors: Record<string, string> = {}
      resolvedMethods.forEach((resolved, index) => {
        const message = validateAllocation(nextAllocations[index], nextSummary)
        if (message) nextErrors[resolved.id] = message
      })
      setMethodErrors(nextErrors)
    }
  }

  const updateAmount = (index: number, requestedAmount: number | null) => {
    const resolved = resolvedMethods[index]
    if (!resolved || resolved.disabled || readOnly) return
    const currentAmount = amounts[index] ?? 0
    const configuredMin = getMethodMin?.(resolved.method)
    const configuredMax = getMethodMax?.(resolved.method)
    const minimum = configuredMin ?? (allowNegative ? Number.NEGATIVE_INFINITY : 0)
    const totalMaximum = currentAmount + Math.max(0, summary.remaining)
    const maximum = Math.min(configuredMax ?? Number.POSITIVE_INFINITY, allowOverAllocation ? Number.POSITIVE_INFINITY : totalMaximum)
    const nextAmount = roundAmount(Math.max(minimum, Math.min(maximum, requestedAmount ?? 0)), effectivePrecision)
    const nextAmounts = [...amounts]
    nextAmounts[index] = nextAmount
    publishAmounts(nextAmounts, { reason: "update", method: resolved.method })
  }

  const assignRemaining = (index: number) => {
    const resolved = resolvedMethods[index]
    if (!resolved || resolved.disabled || readOnly || summary.remaining <= 0) return
    const nextAmounts = [...amounts]
    const methodMaximum = getMethodMax?.(resolved.method) ?? Number.POSITIVE_INFINITY
    nextAmounts[index] = Math.min(methodMaximum, roundAmount((amounts[index] ?? 0) + summary.remaining, effectivePrecision))
    publishAmounts(nextAmounts, { reason: "remaining", method: resolved.method })
  }

  const distributeEvenly = () => {
    if (disabled || readOnly) return
    const enabledMethods = resolvedMethods.filter((method) => !method.disabled)
    if (enabledMethods.length === 0) return
    const lockedTotal = resolvedMethods.reduce((sum, method, index) => method.disabled ? sum + (amounts[index] ?? 0) : sum, 0)
    const shares = distributeAmountEvenly(total - lockedTotal, enabledMethods.length, effectivePrecision)
    let shareIndex = 0
    const nextAmounts = resolvedMethods.map((method, index) => {
      if (method.disabled) return amounts[index] ?? 0
      const share = shares[shareIndex++]
      const minimum = getMethodMin?.(method.method) ?? (allowNegative ? Number.NEGATIVE_INFINITY : 0)
      const maximum = getMethodMax?.(method.method) ?? Number.POSITIVE_INFINITY
      return roundAmount(Math.max(minimum, Math.min(maximum, share)), effectivePrecision)
    })
    publishAmounts(nextAmounts, { reason: "equal" })
  }

  const reset = () => {
    if (disabled || readOnly) return
    const nextAmounts = resolvedMethods.map((method, index) => method.disabled ? amounts[index] ?? 0 : 0)
    publishAmounts(nextAmounts, { reason: "reset" })
  }

  const progressValue = summary.total === 0 ? (summary.allocated === 0 ? 100 : 0) : Math.max(0, Math.min(100, (summary.allocated / summary.total) * 100))
  const statusLabel = summary.status === "balanced" ? labels.balanced : summary.status === "over" ? labels.overAllocated : labels.underAllocated
  const statusPalette = summary.status === "balanced" ? "green" : summary.status === "over" ? "red" : colorPalette

  return (
    <Stack as="section" aria-label={labels.allocatorLabel} gap="5" minW="0" colorPalette={colorPalette}>
      {header}

      <Stack gap="3" p={{ base: "4", md: "5" }} borderWidth="1px" borderColor="border" rounded="lg" bg="bg.subtle">
        <SimpleGrid columns={{ base: 1, sm: 3 }} gap="3">
          {[
            [labels.total, presentAmount(summary.total)],
            [labels.allocated, presentAmount(summary.allocated)],
            [labels.remaining, presentAmount(summary.remaining)],
          ].map(([label, value]) => (
            <Stack key={String(label)} gap="0.5">
              <Text color="fg.muted" fontSize="xs" fontWeight="medium">{label}</Text>
              <Box fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold">{value}</Box>
            </Stack>
          ))}
        </SimpleGrid>
        <Progress.Root value={progressValue} max={100} colorPalette={statusPalette}>
          <Progress.Track aria-label={labels.progressLabel}><Progress.Range /></Progress.Track>
        </Progress.Root>
        <Flex justify="space-between" align={{ base: "stretch", sm: "center" }} direction={{ base: "column", sm: "row" }} gap="3">
          <Badge aria-live="polite" alignSelf={{ base: "start", sm: "center" }} colorPalette={statusPalette}>{statusLabel}</Badge>
          {!readOnly ? (
            <HStack gap="2" flexWrap="wrap">
              {showDistributeEvenly && resolvedMethods.length > 1 ? <Button type="button" size="xs" variant="outline" disabled={disabled || loading} onClick={distributeEvenly}><Equal aria-hidden="true" />{labels.distributeEvenly}</Button> : null}
              {showReset ? <Button type="button" size="xs" variant="ghost" disabled={disabled || loading || summary.allocated === 0} onClick={reset}><RotateCcw aria-hidden="true" />{labels.reset}</Button> : null}
            </HStack>
          ) : null}
        </Flex>
      </Stack>

      {error ? (
        <Stack role="alert" gap="1" p="4" borderWidth="1px" borderColor="border.error" rounded="lg" bg="bg.error">
          <Text fontWeight="semibold" color="fg.error">{labels.errorTitle}</Text>
          <Box color="fg.error">{error}</Box>
        </Stack>
      ) : loading ? (
        <Center role="status" minH="10rem" gap="3" color="fg.muted"><Spinner size="sm" /><Text>{labels.loading}</Text></Center>
      ) : resolvedMethods.length === 0 ? (
        emptyState ?? (
          <Center role="status" minH="11rem" flexDirection="column" gap="2" p="6" textAlign="center" borderWidth="1px" borderColor="border" rounded="lg" bg="bg.panel">
            <Box color="fg.muted"><CircleDollarSign aria-hidden="true" size={28} /></Box>
            <Heading as="h3" size="sm">{labels.emptyTitle}</Heading>
            <Text color="fg.muted" fontSize="sm">{labels.emptyDescription}</Text>
          </Center>
        )
      ) : (
        <Stack as="ul" aria-label={labels.methodsLabel} gap="3" p="0" m="0">
          {resolvedMethods.map((resolved, index) => {
            const amount = amounts[index] ?? 0
            const errorMessage = methodErrors[resolved.id]
            const methodMaximum = getMethodMax?.(resolved.method)
            const availableMaximum = allowOverAllocation ? methodMaximum : Math.min(methodMaximum ?? Number.POSITIVE_INFINITY, amount + Math.max(0, summary.remaining))
            const state = { id: resolved.id, index, method: resolved.method, amount, disabled: resolved.disabled, error: errorMessage, summary }
            return (
              <Flex
                as="li"
                key={resolved.id}
                listStyleType="none"
                direction={methodLayout === "stacked" ? "column" : { base: "column", md: "row" }}
                align={methodLayout === "stacked" ? "stretch" : { base: "stretch", md: "center" }}
                gap="4"
                p="4"
                borderWidth="1px"
                borderColor="border"
                rounded="lg"
                bg="bg.panel"
                opacity={resolved.disabled ? 0.6 : 1}
              >
                <HStack flex="1" minW="0" align="start" gap="3">
                  {renderMethodLeading ? <Box flexShrink="0">{renderMethodLeading(resolved.method, state)}</Box> : null}
                  <Stack gap="0.5" minW="0">
                    <Text fontWeight="semibold" lineClamp="1">{resolved.label}</Text>
                    {resolved.description ? <Text color="fg.muted" fontSize="sm" lineClamp="2">{resolved.description}</Text> : null}
                  </Stack>
                </HStack>
                <Flex width={methodLayout === "stacked" ? "full" : { base: "full", md: "min(100%, 24rem)" }} align={{ base: "stretch", sm: "end" }} direction={{ base: "column", sm: "row" }} gap="2">
                  <NAmountInput
                    {...amountInputProps}
                    value={amount}
                    min={getMethodMin?.(resolved.method) ?? (allowNegative ? undefined : 0)}
                    max={Number.isFinite(availableMaximum) ? availableMaximum : undefined}
                    locale={locale}
                    formatOptions={formatOptions}
                    disabled={resolved.disabled || loading}
                    readOnly={readOnly}
                    invalid={Boolean(errorMessage)}
                    errorText={errorMessage}
                    name={name ? `${name}.${resolved.id}` : undefined}
                    colorPalette={colorPalette}
                    labels={{ amountAriaLabel: labels.amountFor(resolved.label) }}
                    onValueChange={(nextAmount) => updateAmount(index, nextAmount)}
                  />
                  {showAssignRemaining && !readOnly ? (
                    <Button type="button" size="sm" variant="subtle" flexShrink="0" aria-label={labels.assignRemaining(resolved.label)} disabled={resolved.disabled || loading || summary.remaining <= 0} onClick={() => assignRemaining(index)}>
                      {labels.remaining}
                    </Button>
                  ) : null}
                  {renderMethodTrailing?.(resolved.method, state)}
                </Flex>
              </Flex>
            )
          })}
        </Stack>
      )}

      {footer}
    </Stack>
  )
}
