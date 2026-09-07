"use client"

import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react"
import { ShoppingCart, Trash2 } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { NLineItemEditor } from "../line-item-editor"
import { resolveNCartLabels } from "./labels"
import type { NCartChange, NCartProps } from "./types"
import { normalizeCartSummary, summarizeCart } from "./utils"

/** Preset de carrito construido sobre NLineItemEditor; el consumidor conserva todas las reglas comerciales. */
export function NCart<TItem, TLine>({
  lines, defaultLines = [], cartKey = "default", onLinesChange, getLineAmount, calculateSummary, formatAmount,
  locale = "es-MX", formatOptions, showClear = true, renderSummary, header, footer,
  editorHeader, editorFooter, labels: labelsProp, editorLabels, colorPalette = "blue", ...editorProps
}: NCartProps<TItem, TLine>) {
  const labels = useMemo(() => resolveNCartLabels(labelsProp), [labelsProp])
  const [internalLines, setInternalLines] = useState<readonly TLine[]>(defaultLines)
  const previousCartKey = useRef(cartKey)
  const activeLines = lines ?? internalLines

  useEffect(() => {
    if (previousCartKey.current === cartKey) return
    previousCartKey.current = cartKey
    if (lines === undefined) setInternalLines([...defaultLines])
  }, [cartKey, defaultLines, lines])
  const summary = useMemo(
    () => normalizeCartSummary(calculateSummary?.(activeLines) ?? summarizeCart(activeLines, getLineAmount)),
    [activeLines, calculateSummary, getLineAmount],
  )
  const formatter = useMemo(() => new Intl.NumberFormat(locale, formatOptions), [formatOptions, locale])
  const presentAmount = (amount: number) => formatAmount?.(amount) ?? formatter.format(amount)

  const publish = (nextLines: readonly TLine[], change: NCartChange<TItem, TLine>) => {
    const copy = [...nextLines]
    if (lines === undefined) setInternalLines(copy)
    onLinesChange?.(copy, change)
  }

  return (
    <Stack as="section" aria-label={labels.cartLabel} gap="5" minW="0" colorPalette={colorPalette}>
      {header}
      <Flex align={{ base: "start", sm: "center" }} justify="space-between" direction={{ base: "column", sm: "row" }} gap="3">
        <Flex align="center" gap="3">
          <Flex align="center" justify="center" boxSize="10" rounded="lg" bg="colorPalette.subtle" color="colorPalette.fg"><ShoppingCart aria-hidden size={20} /></Flex>
          <Heading as="h2" size="md">{labels.title}</Heading>
        </Flex>
        {showClear && activeLines.length > 0 && !editorProps.readOnly ? <Button type="button" size="sm" variant="ghost" colorPalette="red" width={{ base: "full", sm: "auto" }} disabled={editorProps.disabled} onClick={() => publish([], { reason: "clear" })}><Trash2 aria-hidden size={16} />{labels.clear}</Button> : null}
      </Flex>
      <NLineItemEditor
        {...editorProps}
        lines={activeLines}
        colorPalette={colorPalette}
        header={editorHeader}
        footer={editorFooter}
        labels={editorLabels}
        onLinesChange={(nextLines, change) => publish(nextLines, change)}
      />
      {renderSummary ? renderSummary(summary, activeLines) : (
        <Stack as="dl" aria-label={labels.summaryLabel} gap="2" m="0" p={{ base: "4", md: "5" }} borderWidth="1px" borderColor="border" rounded="lg" bg="bg.subtle">
          <Flex justify="space-between" gap="4"><Text as="dt" color="fg.muted">{labels.subtotal}</Text><Box as="dd" m="0" fontWeight="medium">{presentAmount(summary.subtotal)}</Box></Flex>
          {summary.rows.map((row) => <Flex key={row.id} justify="space-between" gap="4"><Box as="dt" color="fg.muted">{row.label}</Box><Box as="dd" m="0" fontWeight="medium">{presentAmount(row.amount)}</Box></Flex>)}
          <Flex justify="space-between" gap="4" pt="3" borderTopWidth="1px" borderColor="border"><Text as="dt" fontWeight="semibold">{labels.total}</Text><Box as="dd" m="0" fontSize="xl" fontWeight="bold">{presentAmount(summary.total)}</Box></Flex>
        </Stack>
      )}
      {footer}
    </Stack>
  )
}
