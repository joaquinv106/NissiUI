import { Box, Button, Center, Stack, Text } from "@chakra-ui/react"
import { LockKeyhole } from "lucide-react"

import type { NSubscriptionGateProps } from "./types"

export const defaultNSubscriptionGateLabels = { title: "Función no disponible", description: "Esta función requiere un plan diferente.", upgrade: "Ver planes" }
export function NSubscriptionGate({ allowed, children, feature, fallback, onUpgrade, labels: custom, unstyled = false, classNames, styles }: NSubscriptionGateProps) {
  if (allowed) return <Box display="contents" className={classNames?.root} css={styles?.root} data-scope="n-subscription-gate" data-part="root">{children}</Box>
  if (fallback) return <Box display="contents" className={classNames?.root} css={styles?.root} data-scope="n-subscription-gate" data-part="root">{fallback}</Box>
  const labels = { ...defaultNSubscriptionGateLabels, ...custom }
  return <Center role="status" minH="12rem" p={unstyled ? undefined : "6"} borderWidth={unstyled ? undefined : "1px"} borderColor="border" borderStyle="dashed" rounded={unstyled ? undefined : "lg"} bg={unstyled ? undefined : "bg.subtle"} className={classNames?.root} css={styles?.root} data-scope="n-subscription-gate" data-part="root"><Stack align="center" textAlign="center" maxW="md" className={classNames?.content} css={styles?.content} data-part="content"><LockKeyhole aria-hidden="true" /><Text fontWeight="bold">{labels.title}{feature ? `: ${feature}` : ""}</Text><Text color="fg.muted">{labels.description}</Text>{onUpgrade ? <Button onClick={onUpgrade} className={classNames?.actions} css={styles?.actions} data-part="actions">{labels.upgrade}</Button> : null}</Stack></Center>
}
