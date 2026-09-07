"use client"

import { Box, Flex, Grid, Stack, Text } from "@chakra-ui/react"
import { useMemo } from "react"

import { NDocumentView, type NDocumentField, type NDocumentSection } from "../document-view"
import { resolveNReceiptLabels } from "./labels"
import type { NReceiptProps } from "./types"
import { toValidReceiptDate } from "./utils"

/** Preset imprimible de recibo construido sobre NDocumentView y extractores del consumidor. */
export function NReceipt<TReceipt, TLine>({
  receipt, getReceiptId, getReceiptNumber, getReceiptTitle, getReceiptDate, getReceiptStatus,
  getStatusColorPalette, getLines, getLineId, getLineLabel, getLineDescription, getLineQuantity,
  getLineUnitAmount, getLineTotal, getSummaryRows, getTotal, metadata = [], sections = [],
  formatAmount, formatDate, locale = "es-MX", formatOptions, beforeLines, afterLines,
  renderReceiptHeader, renderReceiptFooter, labels: labelsProp, documentLabels,
  unstyled = false, classNames, styles, ...documentProps
}: NReceiptProps<TReceipt, TLine>) {
  const labels = useMemo(() => resolveNReceiptLabels(labelsProp), [labelsProp])
  const formatter = useMemo(() => new Intl.NumberFormat(locale, formatOptions), [formatOptions, locale])
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }), [locale])
  const presentAmount = (amount: number) => formatAmount?.(amount) ?? formatter.format(amount)
  const receiptDate = receipt ? toValidReceiptDate(getReceiptDate?.(receipt)) : undefined
  const resolvedMetadata: readonly NDocumentField<TReceipt>[] = [
    ...(receiptDate ? [{ id: "receipt-date", label: labels.date, getValue: () => formatDate?.(receiptDate) ?? dateFormatter.format(receiptDate) }] : []),
    ...metadata,
  ]

  const bodySection: NDocumentSection<TReceipt> = {
    id: "receipt-lines",
    title: labels.linesLabel,
    render: (activeReceipt) => {
      const lines = getLines(activeReceipt)
      const summaryRows = getSummaryRows?.(activeReceipt) ?? []
      return <Stack className={classNames?.lines} css={styles?.lines} data-scope="n-receipt" data-part="lines" gap="5">
        {beforeLines}
        {lines.length === 0 ? <Text role="status" color={unstyled ? undefined : "fg.muted"}>{labels.emptyLines}</Text> : <Stack gap="0">
          <Grid display={{ base: "none", md: "grid" }} gridTemplateColumns={getLineUnitAmount ? "minmax(12rem, 1fr) 7rem 9rem 9rem" : "minmax(12rem, 1fr) 7rem 9rem"} gap="3" px={unstyled ? undefined : "3"} pb={unstyled ? undefined : "2"} color={unstyled ? undefined : "fg.muted"} fontSize="xs" fontWeight="medium"><Text>{labels.item}</Text><Text textAlign="end">{labels.quantity}</Text>{getLineUnitAmount ? <Text textAlign="end">{labels.unitAmount}</Text> : null}<Text textAlign="end">{labels.lineTotal}</Text></Grid>
          <Stack as="ul" aria-label={labels.linesLabel} gap="0" m="0" p="0">{lines.map((line, index) => <Grid as="li" className={classNames?.line} css={styles?.line} data-scope="n-receipt" data-part="line" key={getLineId(line, index)} listStyleType="none" gridTemplateColumns={{ base: "minmax(0, 1fr) auto", md: getLineUnitAmount ? "minmax(12rem, 1fr) 7rem 9rem 9rem" : "minmax(12rem, 1fr) 7rem 9rem" }} gap="3" alignItems="center" py={unstyled ? undefined : "3"} px={unstyled ? undefined : "3"} borderTopWidth={unstyled ? undefined : "1px"} borderColor={unstyled ? undefined : "border"}>
            <Box className={classNames?.lineLabel} css={styles?.lineLabel} data-scope="n-receipt" data-part="line-label" minW="0"><Box fontWeight="medium">{getLineLabel(line)}</Box>{getLineDescription ? <Box color={unstyled ? undefined : "fg.muted"} fontSize="sm">{getLineDescription(line)}</Box> : null}</Box>
            <Box textAlign="end"><Text display={{ base: "block", md: "none" }} color={unstyled ? undefined : "fg.muted"} fontSize="xs">{labels.quantity}</Text>{getLineQuantity?.(line) ?? 1}</Box>
            {getLineUnitAmount ? <Box display={{ base: "none", md: "block" }} textAlign="end">{presentAmount(getLineUnitAmount(line))}</Box> : null}
            <Box gridColumn={{ base: "1 / -1", md: "auto" }} textAlign="end" fontWeight="semibold"><Text display={{ base: "inline", md: "none" }} mr="2" color={unstyled ? undefined : "fg.muted"} fontSize="xs">{labels.lineTotal}</Text>{presentAmount(getLineTotal(line))}</Box>
          </Grid>)}</Stack>
        </Stack>}
        {afterLines}
        <Stack as="dl" aria-label={labels.summaryLabel} className={classNames?.summary} css={styles?.summary} data-scope="n-receipt" data-part="summary" gap="2" m="0" ml={{ base: "0", md: "auto" }} width={{ base: "full", md: "22rem" }}>
          {summaryRows.map((row) => <Flex key={row.id} justify="space-between" gap="4"><Box as="dt" color={unstyled ? undefined : "fg.muted"}>{row.label}</Box><Box as="dd" m="0">{presentAmount(row.amount)}</Box></Flex>)}
          <Flex className={classNames?.total} css={styles?.total} data-scope="n-receipt" data-part="total" justify="space-between" gap="4" pt={unstyled ? undefined : "3"} borderTopWidth={unstyled ? undefined : "1px"} borderColor={unstyled ? undefined : "border"}><Text as="dt" fontWeight="semibold">{labels.total}</Text><Box as="dd" m="0" fontSize="xl" fontWeight="bold">{presentAmount(getTotal(activeReceipt))}</Box></Flex>
        </Stack>
      </Stack>
    },
  }

  return <NDocumentView
    {...documentProps}
    document={receipt}
    getDocumentId={getReceiptId}
    getDocumentTitle={(activeReceipt) => getReceiptTitle?.(activeReceipt) ?? labels.title}
    getDocumentSubtitle={(activeReceipt) => <>{labels.number}: {getReceiptNumber(activeReceipt)}</>}
    getDocumentStatus={getReceiptStatus}
    getStatusColorPalette={getStatusColorPalette}
    fields={resolvedMetadata}
    sections={[bodySection, ...sections]}
    renderHeader={renderReceiptHeader ? ({ document }) => renderReceiptHeader(document) : undefined}
    renderFooter={renderReceiptFooter ? ({ document }) => renderReceiptFooter(document) : undefined}
    labels={{ documentLabel: labels.receiptLabel, ...documentLabels }}
    unstyled={unstyled}
    classNames={classNames}
    styles={styles}
  />
}
