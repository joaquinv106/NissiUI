"use client"

import { Box, Button, Center, Skeleton, Stack, Text } from "@chakra-ui/react"
import { RefreshCw } from "lucide-react"
import { useMemo, useState } from "react"

import { defaultNAsyncStateLabels, resolveLabels } from "./labels"
import { NEmptyState } from "./NEmptyState"
import type { NAsyncStateProps } from "./types"

export function NAsyncState({ status, children, error, onRetry, loadingFallback, errorFallback, emptyFallback, skeletonLines = 4, minHeight = "12rem", labels: labelsProp, unstyled = false, classNames, styles }: NAsyncStateProps) {
  const labels = useMemo(() => resolveLabels(defaultNAsyncStateLabels, labelsProp), [labelsProp])
  const [retrying, setRetrying] = useState(false)
  const retry = async () => { if (!onRetry || retrying) return; setRetrying(true); try { await onRetry() } finally { setRetrying(false) } }

  if (status === "success") return <Box display="contents" className={classNames?.content} css={styles?.content ?? styles?.root} data-scope="n-async-state" data-part="content">{children}</Box>
  if (status === "idle") return null
  if (status === "loading") return loadingFallback ?? <Stack role="status" aria-label={labels.loading} minH={minHeight} justify="center" gap="3" className={classNames?.loading} css={styles?.loading ?? styles?.root} data-scope="n-async-state" data-part="loading">{Array.from({ length: Math.max(1, skeletonLines) }, (_, index) => <Skeleton key={index} height={index === 0 ? "8" : "5"} width={index === skeletonLines - 1 ? "65%" : "full"} />)}</Stack>
  if (status === "empty") return emptyFallback ?? <NEmptyState title={labels.emptyTitle} description={labels.emptyDescription} unstyled={unstyled} classNames={{ root: classNames?.empty }} styles={{ root: styles?.empty ?? styles?.root }} />
  return errorFallback ?? <Center role="alert" minH={minHeight} p={unstyled ? undefined : "6"} borderWidth={unstyled ? undefined : "1px"} borderColor="border.error" rounded={unstyled ? undefined : "lg"} bg={unstyled ? undefined : "bg.error"} className={classNames?.error} css={styles?.error ?? styles?.root} data-scope="n-async-state" data-part="error"><Stack align="center" gap="3" textAlign="center"><Text color="fg.error" fontWeight="semibold">{labels.errorTitle}</Text><Box color="fg.error" fontSize="sm">{error ?? labels.errorDescription}</Box>{onRetry ? <Button size="sm" variant="outline" colorPalette="red" loading={retrying} onClick={() => void retry()}><RefreshCw aria-hidden="true" size={16} />{labels.retry}</Button> : null}</Stack></Center>
}
