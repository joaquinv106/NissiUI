import { Button, Center, Stack, Text } from "@chakra-ui/react"
import { LockKeyhole } from "lucide-react"

import type { NSubscriptionGateProps } from "./types"

export const defaultNSubscriptionGateLabels = { title: "Función no disponible", description: "Esta función requiere un plan diferente.", upgrade: "Ver planes" }
export function NSubscriptionGate({ allowed, children, feature, fallback, onUpgrade, labels: custom }: NSubscriptionGateProps) {
  if (allowed) return children
  if (fallback) return fallback
  const labels = { ...defaultNSubscriptionGateLabels, ...custom }
  return <Center role="status" minH="12rem" p="6" borderWidth="1px" borderColor="border" borderStyle="dashed" rounded="lg" bg="bg.subtle"><Stack align="center" textAlign="center" maxW="md"><LockKeyhole aria-hidden="true" /><Text fontWeight="bold">{labels.title}{feature ? `: ${feature}` : ""}</Text><Text color="fg.muted">{labels.description}</Text>{onUpgrade ? <Button onClick={onUpgrade}>{labels.upgrade}</Button> : null}</Stack></Center>
}
