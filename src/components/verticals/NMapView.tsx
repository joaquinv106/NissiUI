import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react"
import { MapPin } from "lucide-react"

import type { NMapViewProps } from "./types"

export const defaultNMapViewLabels = { region: "Mapa", locations: "Ubicaciones", empty: "No hay ubicaciones.", providerPlaceholder: "Conecta aquí el adaptador de tu proveedor cartográfico." }
export function NMapView({ markers, renderer, selectedId, onSelect, height = "26rem", labels: custom }: NMapViewProps) {
  const labels = { ...defaultNMapViewLabels, ...custom }
  return <Flex role="region" aria-label={labels.region} height={{ base: "auto", md: height }} minH={{ md: "18rem" }} borderWidth="1px" borderColor="border" rounded="lg" overflow="hidden" direction={{ base: "column", md: "row" }}><Box flex="1" minH={{ base: "16rem", md: "auto" }} bg="bg.subtle" position="relative">{renderer ? renderer({ markers, selectedId, onSelect }) : <Flex height="full" align="center" justify="center" p="6"><Stack align="center" textAlign="center" color="fg.muted"><MapPin size={28} aria-hidden="true" /><Text>{labels.providerPlaceholder}</Text></Stack></Flex>}</Box><Stack width={{ base: "full", md: "18rem" }} borderInlineStartWidth={{ md: "1px" }} borderTopWidth={{ base: "1px", md: "0" }} borderColor="border" overflowY="auto" gap="0"><Text fontWeight="bold" p="3">{labels.locations}</Text>{markers.length ? markers.map((marker) => <Button key={marker.id} variant={selectedId === marker.id ? "subtle" : "ghost"} colorPalette="blue" height="auto" rounded="0" p="3" justifyContent="start" textAlign="start" whiteSpace="normal" onClick={() => onSelect?.(marker)}><Stack gap="1"><Text fontWeight="semibold">{marker.label}</Text>{marker.description ? <Text textStyle="sm" color="fg.muted">{marker.description}</Text> : null}<Text textStyle="xs" color="fg.muted">{marker.latitude.toFixed(5)}, {marker.longitude.toFixed(5)}</Text></Stack></Button>) : <Text color="fg.muted" p="4">{labels.empty}</Text>}</Stack></Flex>
}
