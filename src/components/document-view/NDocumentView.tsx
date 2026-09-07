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

  if (error) return <Stack as="section" aria-label={labels.documentLabel} role="alert" gap="1" p="4" borderWidth="1px" borderColor="border.error" rounded="lg" bg="bg.error"><Text color="fg.error" fontWeight="semibold">{labels.errorTitle}</Text><Box color="fg.error">{error}</Box></Stack>
  if (loading) return <Center as="section" aria-label={labels.documentLabel} role="status" minH="12rem" gap="3"><Spinner size="sm" /><Text color="fg.muted">{labels.loading}</Text></Center>
  if (!document || !documentId) return emptyState ?? <Center as="section" aria-label={labels.documentLabel} role="status" minH="12rem" flexDirection="column" gap="2" p="6" borderWidth="1px" borderColor="border" rounded="lg"><Text fontWeight="semibold">{labels.emptyTitle}</Text><Text color="fg.muted" fontSize="sm">{labels.emptyDescription}</Text></Center>

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
    <Stack as="section" aria-label={labels.documentLabel} gap="4" minW="0" colorPalette={colorPalette} data-document-id={documentId}>
      {header}
      {(actions.length > 0 || showPrint) ? <Flex aria-label={labels.actionsLabel} justify="flex-end" gap="2" flexWrap="wrap" _print={{ display: "none" }}>{showPrint ? <Button type="button" variant="outline" width={{ base: "full", sm: "auto" }} disabled={disabled || busy} onClick={print}><Printer aria-hidden size={16} />{labels.print}</Button> : null}{actions.map((action) => <Button key={action.id} type="button" colorPalette={action.colorPalette ?? colorPalette} variant={action.variant ?? "outline"} width={{ base: "full", sm: "auto" }} disabled={disabled || busy || canPerformAction?.(document, action) === false} loading={busyActionId === action.id} loadingText={labels.processing} onClick={() => void runAction(action)}>{action.icon}{action.label}</Button>)}</Flex> : null}
      {actionError ? <Box role="alert" p="3" rounded="md" borderWidth="1px" borderColor="border.error" bg="bg.error" color="fg.error">{actionError}</Box> : null}
      <Box as="article" aria-labelledby={`document-${documentId}-title`} bg={variant === "paper" ? "bg.panel" : undefined} borderWidth={variant === "paper" ? "1px" : undefined} borderColor="border" rounded={variant === "paper" ? "lg" : undefined} shadow={variant === "paper" ? "sm" : undefined} p={variant === "paper" ? { base: "5", md: "8" } : undefined} _print={{ borderWidth: "0", shadow: "none", p: "0" }}>
        <Stack gap="6">
          {renderHeader ? renderHeader(context) : <Flex justify="space-between" align={{ base: "start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap="3"><Box><Heading id={`document-${documentId}-title`} as="h2" size="lg">{getDocumentTitle(document)}</Heading>{getDocumentSubtitle ? <Box color="fg.muted">{getDocumentSubtitle(document)}</Box> : null}</Box>{getDocumentStatus ? <Badge colorPalette={getStatusColorPalette?.(document) ?? colorPalette}>{getDocumentStatus(document)}</Badge> : null}</Flex>}
          {fields.length > 0 ? <SimpleGrid as="dl" aria-label={labels.metadataLabel} columns={{ base: 1, sm: 2, lg: columns }} gap="4" m="0">{fields.map((field) => <Box key={field.id} gridColumn={field.colSpan === "full" ? "1 / -1" : field.colSpan ? `span ${field.colSpan}` : undefined}><Text as="dt" color="fg.muted" fontSize="xs">{field.label}</Text><Box as="dd" m="0" fontWeight="medium">{field.getValue(document)}</Box></Box>)}</SimpleGrid> : null}
          {renderBody?.(context)}
          {sections.map((section) => <Stack as="section" key={section.id} aria-labelledby={section.title ? `document-${documentId}-${section.id}` : undefined} gap="2" pt="4" borderTopWidth="1px" borderColor="border"><Box>{section.title ? <Heading id={`document-${documentId}-${section.id}`} as="h3" size="sm">{section.title}</Heading> : null}{section.description ? <Box color="fg.muted" fontSize="sm">{section.description}</Box> : null}</Box>{section.render(document)}</Stack>)}
          {renderFooter?.(context)}
        </Stack>
      </Box>
      {footer}
    </Stack>
  )
}
