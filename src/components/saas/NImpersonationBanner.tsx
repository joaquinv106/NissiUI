"use client"

import { Button, Flex, Text } from "@chakra-ui/react"
import { ShieldAlert } from "lucide-react"
import { useState } from "react"

import type { NImpersonationBannerProps } from "./types"

export const defaultNImpersonationBannerLabels = { prefix: "Estás viendo el sistema como", actorPrefix: "sesión de", exit: "Salir de la suplantación", exiting: "Saliendo" }
export function NImpersonationBanner({ subject, actor, onExit, labels: custom, sticky = true, unstyled = false, classNames, styles }: NImpersonationBannerProps) {
  const labels = { ...defaultNImpersonationBannerLabels, ...custom }
  const [loading, setLoading] = useState(false)
  const exit = async () => { if (loading) return; setLoading(true); try { await onExit() } finally { setLoading(false) } }
  return <Flex role="status" position={sticky ? "sticky" : undefined} top="0" zIndex="banner" width="full" bg={unstyled ? undefined : "orange.subtle"} color={unstyled ? undefined : "orange.fg"} borderBottomWidth={unstyled ? undefined : "1px"} borderColor="orange.muted" px={unstyled ? undefined : { base: "3", md: "5" }} py={unstyled ? undefined : "2"} align="center" justify="center" gap="3" wrap="wrap" className={classNames?.root} css={styles?.root} data-scope="n-impersonation-banner" data-part="root"><ShieldAlert size={18} aria-hidden="true" /><Text textStyle="sm" className={classNames?.content} css={styles?.content} data-part="content"><strong>{labels.prefix} {subject}</strong>{actor ? <> · {labels.actorPrefix} {actor}</> : null}</Text><Button size="xs" variant="outline" colorPalette="orange" loading={loading} loadingText={labels.exiting} onClick={() => void exit()} className={classNames?.action} css={styles?.action} data-part="action">{labels.exit}</Button></Flex>
}
