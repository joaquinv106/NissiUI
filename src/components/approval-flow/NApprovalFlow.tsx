"use client"

import { Badge, Box, Button, Card, Center, Field, Flex, Heading, HStack, Spinner, Stack, Text, Textarea } from "@chakra-ui/react"
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react"

import { resolveNApprovalFlowLabels } from "./labels"
import type {
  NApprovalAction,
  NApprovalDecisionDetails,
  NApprovalDecisionResult,
  NApprovalFlowProps,
  NApprovalStatus,
} from "./types"
import { approvalStatusLabel, approvalStatusPalette, approvalTimestampDateTime, decisionMessage, decisionSucceeded, formatApprovalTimestamp } from "./utils"

/** Presenta solicitudes tipadas, captura decisiones y comunica su estado sin reemplazar la autorización del servidor. */
export function NApprovalFlow<TRequest>({
  request,
  getRequestId,
  getRequestTitle,
  getRequestDescription,
  status,
  defaultStatus = "pending",
  onStatusChange,
  onDecision,
  actions,
  history = [],
  canPerformAction,
  renderRequest,
  renderHistoryEntry,
  formatTimestamp,
  allowRepeatDecisions = false,
  showHistory = true,
  defaultComment = "",
  disabled = false,
  readOnly = false,
  loading = false,
  error,
  emptyState,
  header,
  footer,
  locale,
  colorPalette = "blue",
  labels: labelsProp,
}: NApprovalFlowProps<TRequest>) {
  const labels = useMemo(() => resolveNApprovalFlowLabels(labelsProp), [labelsProp])
  const defaultActions = useMemo<readonly NApprovalAction[]>(() => [
    { id: "approve", label: labels.approve, status: "approved", colorPalette: "green", variant: "solid" },
    { id: "changes", label: labels.requestChanges, status: "changes-requested", colorPalette: "orange", variant: "outline", requiresComment: true },
    { id: "reject", label: labels.reject, status: "rejected", colorPalette: "red", variant: "outline", requiresComment: true },
  ], [labels])
  const resolvedActions = actions ?? defaultActions
  const [internalStatus, setInternalStatus] = useState<NApprovalStatus>(defaultStatus)
  const [comment, setComment] = useState(defaultComment)
  const [commentError, setCommentError] = useState<string>()
  const [decisionError, setDecisionError] = useState<ReactNode>()
  const [busyActionId, setBusyActionId] = useState<string>()
  const warnedAboutDuplicateIds = useRef(false)
  const requestId = request ? getRequestId(request) : undefined
  const previousRequestId = useRef(requestId)
  const currentRequestId = useRef(requestId)
  const decisionSequence = useRef(0)
  const currentStatus = status ?? internalStatus
  const busy = Boolean(busyActionId)
  currentRequestId.current = requestId

  useEffect(() => {
    if (previousRequestId.current === requestId) return
    previousRequestId.current = requestId
    decisionSequence.current += 1
    setInternalStatus(defaultStatus)
    setComment(defaultComment)
    setCommentError(undefined)
    setDecisionError(undefined)
    setBusyActionId(undefined)
  }, [defaultComment, defaultStatus, requestId])

  useEffect(() => {
    const ids = resolvedActions.map((action) => action.id)
    const isDevelopment = typeof process === "undefined" || process.env.NODE_ENV !== "production"
    if (isDevelopment && !warnedAboutDuplicateIds.current && new Set(ids).size !== ids.length) {
      warnedAboutDuplicateIds.current = true
      console.warn("[NissiUI] NApprovalFlow recibió identificadores de acción duplicados.")
    }
  }, [resolvedActions])

  if (error) {
    return (
      <Stack as="section" aria-label={labels.flowLabel} role="alert" gap="1" p="4" borderWidth="1px" borderColor="border.error" rounded="lg" bg="bg.error">
        <Text color="fg.error" fontWeight="semibold">{labels.errorTitle}</Text>
        <Box color="fg.error">{error}</Box>
      </Stack>
    )
  }

  if (loading) {
    return (
      <Center as="section" aria-label={labels.flowLabel} role="status" minH="12rem" gap="3" color="fg.muted">
        <Spinner size="sm" />
        <Text>{labels.loading}</Text>
      </Center>
    )
  }

  if (!request) {
    return emptyState ?? (
      <Center as="section" aria-label={labels.flowLabel} role="status" minH="12rem" flexDirection="column" gap="2" p="6" textAlign="center" borderWidth="1px" borderColor="border" rounded="lg" bg="bg.panel">
        <Text fontWeight="semibold">{labels.emptyTitle}</Text>
        <Text color="fg.muted" fontSize="sm">{labels.emptyDescription}</Text>
      </Center>
    )
  }

  const resolvedRequestId = requestId as string
  const context = { request, requestId: resolvedRequestId, status: currentStatus, busy, disabled }
  const decisionsLocked = !allowRepeatDecisions && currentStatus !== "pending"

  const publishDecision = async (action: NApprovalAction) => {
    const permitted = canPerformAction?.(request, action) ?? true
    if (disabled || readOnly || busy || decisionsLocked || !permitted) return
    const normalizedComment = comment.trim()
    if (action.requiresComment && !normalizedComment) {
      setCommentError(labels.commentRequired)
      return
    }

    setCommentError(undefined)
    setDecisionError(undefined)
    setBusyActionId(action.id)
    const sequence = ++decisionSequence.current
    const details: NApprovalDecisionDetails = {
      requestId: resolvedRequestId,
      actionId: action.id,
      status: action.status,
      comment: normalizedComment,
    }

    try {
      const result = await onDecision?.(request, details) as void | boolean | NApprovalDecisionResult
      if (decisionSequence.current !== sequence || currentRequestId.current !== resolvedRequestId) return
      if (!decisionSucceeded(result)) {
        setDecisionError(decisionMessage(result) ?? labels.decisionFailed)
        setBusyActionId(undefined)
        return
      }
      if (status === undefined) setInternalStatus(action.status)
      onStatusChange?.(action.status, details)
      setComment("")
      setBusyActionId(undefined)
    } catch {
      if (decisionSequence.current !== sequence || currentRequestId.current !== resolvedRequestId) return
      setDecisionError(labels.decisionFailed)
      setBusyActionId(undefined)
    }
  }

  return (
    <Stack as="section" aria-label={labels.flowLabel} gap="5" minW="0" colorPalette={colorPalette} data-request-id={resolvedRequestId}>
      {header}

      <Card.Root variant="outline" bg="bg.panel">
        <Card.Body gap="4">
          <Flex justify="space-between" align={{ base: "start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap="3">
            <Box flex="1" minW="0">
              {renderRequest ? renderRequest(request, context) : (
                <Stack gap="1">
                  <Heading as="h3" size="md">{getRequestTitle(request)}</Heading>
                  {getRequestDescription ? <Text color="fg.muted" fontSize="sm">{getRequestDescription(request)}</Text> : null}
                </Stack>
              )}
            </Box>
            <HStack aria-live="polite" gap="2" flexShrink="0">
              <Text color="fg.muted" fontSize="xs" fontWeight="medium">{labels.statusLabel}</Text>
              <Badge colorPalette={approvalStatusPalette(currentStatus)}>{approvalStatusLabel(currentStatus, labels)}</Badge>
            </HStack>
          </Flex>
        </Card.Body>
      </Card.Root>

      {!readOnly && resolvedActions.length > 0 ? (
        <Stack gap="4" p={{ base: "4", md: "5" }} borderWidth="1px" borderColor="border" rounded="lg" bg="bg.subtle">
          <Field.Root invalid={Boolean(commentError)} disabled={disabled || busy || decisionsLocked}>
            <Field.Label>{labels.commentLabel}</Field.Label>
            <Textarea
              value={comment}
              placeholder={labels.commentPlaceholder}
              autoresize
              minH="6rem"
              onChange={(event) => {
                setComment(event.target.value)
                if (commentError) setCommentError(undefined)
              }}
            />
            <Field.HelperText>{labels.commentHelp}</Field.HelperText>
            {commentError ? <Field.ErrorText>{commentError}</Field.ErrorText> : null}
          </Field.Root>

          <Flex gap="2" justify={{ base: "stretch", sm: "flex-end" }} direction={{ base: "column", sm: "row" }} flexWrap="wrap">
            {resolvedActions.map((action) => {
              const permitted = canPerformAction?.(request, action) ?? true
              return (
                <Button
                  key={action.id}
                  type="button"
                  colorPalette={action.colorPalette ?? colorPalette}
                  variant={action.variant ?? "outline"}
                  width={{ base: "full", sm: "auto" }}
                  disabled={disabled || busy || decisionsLocked || !permitted}
                  loading={busyActionId === action.id}
                  loadingText={labels.processing}
                  onClick={() => void publishDecision(action)}
                >
                  {action.label}
                </Button>
              )
            })}
          </Flex>
        </Stack>
      ) : null}

      {decisionError ? (
        <Box role="alert" p="3" borderWidth="1px" borderColor="border.error" rounded="md" bg="bg.error" color="fg.error" fontSize="sm">
          {decisionError}
        </Box>
      ) : null}

      {showHistory ? (
        <Stack gap="3">
          <Heading as="h3" size="sm">{labels.historyTitle}</Heading>
          {history.length === 0 ? <Text color="fg.muted" fontSize="sm">{labels.noHistory}</Text> : (
            <Stack as="ol" aria-label={labels.historyTitle} gap="3" p="0" m="0">
              {history.map((entry, index) => (
                <Box as="li" key={entry.id} listStyleType="none" p="3" borderWidth="1px" borderColor="border" rounded="md" bg="bg.panel">
                  {renderHistoryEntry ? renderHistoryEntry(entry, index) : (
                    <Stack gap="2">
                      <Flex justify="space-between" align={{ base: "start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap="2">
                        <HStack gap="2">
                          <Badge colorPalette={approvalStatusPalette(entry.status)}>{approvalStatusLabel(entry.status, labels)}</Badge>
                          <Text fontWeight="medium">{entry.title ?? entry.actor ?? labels.actorFallback}</Text>
                        </HStack>
                        {entry.timestamp ? (
                          <Box asChild color="fg.muted" fontSize="xs">
                            <time dateTime={approvalTimestampDateTime(entry.timestamp)}>
                              {formatTimestamp?.(entry.timestamp) ?? formatApprovalTimestamp(entry.timestamp, locale)}
                            </time>
                          </Box>
                        ) : null}
                      </Flex>
                      {entry.comment ? <Box color="fg.muted" fontSize="sm">{entry.comment}</Box> : null}
                    </Stack>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      ) : null}

      {footer}
    </Stack>
  )
}
