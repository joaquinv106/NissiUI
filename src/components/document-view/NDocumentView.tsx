"use client"

import { Badge, Box, Button, Center, Flex, Heading, SimpleGrid, Spinner, Stack, Text } from "@chakra-ui/react"
import { Printer } from "lucide-react"
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"

import { resolveNDocumentViewLabels } from "./labels"
import type { NDocumentActionResult, NDocumentViewProps } from "./types"
import { documentActionMessage, documentActionSucceeded } from "./utils"

/** Presenta documentos tipados y acciones de aplicación sin imponer un formato o dominio. */
export function NDocumentView<TDocument>({
  document, getDocumentId, getDocumentTitle, getDocumentSubtitle, getDocumentStatus, getStatusColorPalette,
  fields = [], sections = [], actions = [], canPerformAction, renderHeader, renderBody, renderFooter,
  showPrint = false, onPrint, variant = "paper", columns = 3, disabled = false, loading = false, error,
  emptyState, header, footer, colorPalette = "blue", labels: labelsProp,
  unstyled = false, classNames, styles,
}: NDocumentViewProps<TDocument>) {
  const labels = useMemo(() => resolveNDocumentViewLabels(labelsProp), [labelsProp])
  const documentId = document ? getDocumentId(document) : undefined
  const [busyActionId, setBusyActionId] = useState<string>()
  const [actionError, setActionError] = useState<ReactNode>()
  const previousDocumentId = useRef(documentId)
  const currentDocumentId = useRef(documentId)
  const sequence = useRef(0)
  currentDocumentId.current = documentId

  useEffect(() => {
    if (previousDocumentId.current === documentId) return
    previousDocumentId.current = documentId
    sequence.current += 1
    setBusyActionId(undefined)
    setActionError(undefined)
  }, [documentId])

  if (error) return <Stack as="section" aria-label={labels.documentLabel} role="alert" className={classNames?.error ?? classNames?.root} css={styles?.error ?? styles?.root} data-scope="n-document-view" data-part="error" gap="1" p={unstyled ? undefined : "4"} borderWidth={unstyled ? undefined : "1px"} borderColor={unstyled ? undefined : "border.error"} rounded={unstyled ? undefined : "lg"} bg={unstyled ? undefined : "bg.error"}><Text color={unstyled ? undefined : "fg.error"} fontWeight="semibold">{labels.errorTitle}</Text><Box color={unstyled ? undefined : "fg.error"}>{error}</Box></Stack>
  if (loading) return <Center as="section" aria-label={labels.documentLabel} role="status" className={classNames?.loading ?? classNames?.root} css={styles?.loading ?? styles?.root} data-scope="n-document-view" data-part="loading" minH="12rem" gap="3"><Spinner size="sm" /><Text color={unstyled ? undefined : "fg.muted"}>{labels.loading}</Text></Center>
  if (!document || !documentId) return emptyState ?? <Center as="section" aria-label={labels.documentLabel} role="status" className={classNames?.empty ?? classNames?.root} css={styles?.empty ?? styles?.root} data-scope="n-document-view" data-part="empty" minH="12rem" flexDirection="column" gap="2" p={unstyled ? undefined : "6"} borderWidth={unstyled ? undefined : "1px"} borderColor={unstyled ? undefined : "border"} rounded={unstyled ? undefined : "lg"}><Text fontWeight="semibold">{labels.emptyTitle}</Text><Text color={unstyled ? undefined : "fg.muted"} fontSize="sm">{labels.emptyDescription}</Text></Center>

  const busy = Boolean(busyActionId)
  const context = { document, documentId, busyActionId, disabled }
  const runAction = async (action: (typeof actions)[number]) => {
    if (disabled || busy || canPerformAction?.(document, action) === false) return
    setBusyActionId(action.id)
    setActionError(undefined)
    const request = ++sequence.current
    try {
      const result = await action.onAction(document) as void | boolean | NDocumentActionResult
      if (request !== sequence.current || currentDocumentId.current !== documentId) return
      if (!documentActionSucceeded(result)) setActionError(documentActionMessage(result) ?? labels.actionFailed)
      setBusyActionId(undefined)
    } catch {
      if (request !== sequence.current || currentDocumentId.current !== documentId) return
      setActionError(labels.actionFailed)
      setBusyActionId(undefined)
    }
  }
  const print = () => onPrint ? onPrint(document) : typeof window !== "undefined" ? window.print() : undefined

  return (
    <Stack as="section" aria-label={labels.documentLabel} className={classNames?.root} css={styles?.root} data-scope="n-document-view" data-part="root" gap="4" minW="0" colorPalette={colorPalette} data-document-id={documentId}>
      {header}
      {(actions.length > 0 || showPrint) ? <Flex aria-label={labels.actionsLabel} className={classNames?.actions} css={styles?.actions} data-scope="n-document-view" data-part="actions" justify="flex-end" gap="2" flexWrap="wrap" _print={{ display: "none" }}>{showPrint ? <Button unstyled={unstyled} type="button" variant={unstyled ? undefined : "outline"} width={{ base: "full", sm: "auto" }} disabled={disabled || busy} onClick={print}><Printer aria-hidden size={16} />{labels.print}</Button> : null}{actions.map((action) => <Button unstyled={unstyled} key={action.id} type="button" colorPalette={action.colorPalette ?? colorPalette} variant={unstyled ? undefined : action.variant ?? "outline"} width={{ base: "full", sm: "auto" }} disabled={disabled || busy || canPerformAction?.(document, action) === false} loading={busyActionId === action.id} loadingText={labels.processing} onClick={() => void runAction(action)}>{action.icon}{action.label}</Button>)}</Flex> : null}
      {actionError ? <Box role="alert" className={classNames?.error} css={styles?.error} data-scope="n-document-view" data-part="error" p={unstyled ? undefined : "3"} rounded={unstyled ? undefined : "md"} borderWidth={unstyled ? undefined : "1px"} borderColor={unstyled ? undefined : "border.error"} bg={unstyled ? undefined : "bg.error"} color={unstyled ? undefined : "fg.error"}>{actionError}</Box> : null}
      <Box as="article" aria-labelledby={`document-${documentId}-title`} className={classNames?.document} css={styles?.document} data-scope="n-document-view" data-part="document" bg={!unstyled && variant === "paper" ? "bg.panel" : undefined} borderWidth={!unstyled && variant === "paper" ? "1px" : undefined} borderColor={unstyled ? undefined : "border"} rounded={!unstyled && variant === "paper" ? "lg" : undefined} shadow={!unstyled && variant === "paper" ? "sm" : undefined} p={!unstyled && variant === "paper" ? { base: "5", md: "8" } : undefined} _print={{ borderWidth: "0", shadow: "none", p: "0" }}>
        <Stack gap="6">
          {renderHeader ? classNames?.documentHeader || styles?.documentHeader ? <Box className={classNames?.documentHeader} css={styles?.documentHeader} data-scope="n-document-view" data-part="document-header">{renderHeader(context)}</Box> : renderHeader(context) : <Flex className={classNames?.documentHeader} css={styles?.documentHeader} data-scope="n-document-view" data-part="document-header" justify="space-between" align={{ base: "start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap="3"><Box><Heading className={classNames?.title} css={styles?.title} data-scope="n-document-view" data-part="title" id={`document-${documentId}-title`} as="h2" size="lg">{getDocumentTitle(document)}</Heading>{getDocumentSubtitle ? <Box color={unstyled ? undefined : "fg.muted"}>{getDocumentSubtitle(document)}</Box> : null}</Box>{getDocumentStatus ? <Badge unstyled={unstyled} colorPalette={getStatusColorPalette?.(document) ?? colorPalette}>{getDocumentStatus(document)}</Badge> : null}</Flex>}
          {fields.length > 0 ? <SimpleGrid as="dl" aria-label={labels.metadataLabel} className={classNames?.metadata} css={styles?.metadata} data-scope="n-document-view" data-part="metadata" columns={{ base: 1, sm: 2, lg: columns }} gap="4" m="0">{fields.map((field) => <Box key={field.id} gridColumn={field.colSpan === "full" ? "1 / -1" : field.colSpan ? `span ${field.colSpan}` : undefined}><Text as="dt" color={unstyled ? undefined : "fg.muted"} fontSize="xs">{field.label}</Text><Box as="dd" m="0" fontWeight="medium">{field.getValue(document)}</Box></Box>)}</SimpleGrid> : null}
          {renderBody?.(context)}
          {sections.map((section) => <Stack as="section" key={section.id} aria-labelledby={section.title ? `document-${documentId}-${section.id}` : undefined} className={classNames?.section} css={styles?.section} data-scope="n-document-view" data-part="section" gap="2" pt={unstyled ? undefined : "4"} borderTopWidth={unstyled ? undefined : "1px"} borderColor={unstyled ? undefined : "border"}><Box>{section.title ? <Heading id={`document-${documentId}-${section.id}`} as="h3" size="sm">{section.title}</Heading> : null}{section.description ? <Box color={unstyled ? undefined : "fg.muted"} fontSize="sm">{section.description}</Box> : null}</Box>{section.render(document)}</Stack>)}
          {renderFooter ? classNames?.documentFooter || styles?.documentFooter ? <Box className={classNames?.documentFooter} css={styles?.documentFooter} data-scope="n-document-view" data-part="document-footer">{renderFooter(context)}</Box> : renderFooter(context) : null}
        </Stack>
      </Box>
      {footer}
    </Stack>
  )
}
