"use client"

import { Button, Flex, Text } from "@chakra-ui/react"
import { ShieldAlert } from "lucide-react"
import { useState } from "react"

import type { NImpersonationBannerProps } from "./types"

export const defaultNImpersonationBannerLabels = { prefix: "Estás viendo el sistema como", actorPrefix: "sesión de", exit: "Salir de la suplantación", exiting: "Saliendo" }
export function NImpersonationBanner({ subject, actor, onExit, labels: custom, sticky = true }: NImpersonationBannerProps) {
  const labels = { ...defaultNImpersonationBannerLabels, ...custom }
  const [loading, setLoading] = useState(false)
  const exit = async () => { if (loading) return; setLoading(true); try { await onExit() } finally { setLoading(false) } }
  return <Flex role="status" position={sticky ? "sticky" : undefined} top="0" zIndex="banner" width="full" bg="orange.subtle" color="orange.fg" borderBottomWidth="1px" borderColor="orange.muted" px={{ base: "3", md: "5" }} py="2" align="center" justify="center" gap="3" wrap="wrap"><ShieldAlert size={18} aria-hidden="true" /><Text textStyle="sm"><strong>{labels.prefix} {subject}</strong>{actor ? <> · {labels.actorPrefix} {actor}</> : null}</Text><Button size="xs" variant="outline" colorPalette="orange" loading={loading} loadingText={labels.exiting} onClick={() => void exit()}>{labels.exit}</Button></Flex>
}
