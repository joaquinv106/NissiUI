import { Box, Flex, Stack, Text } from "@chakra-ui/react"
import { Circle } from "lucide-react"

import type { NActivityTimelineProps } from "./types"

export function NActivityTimeline({ items, compact = false, "aria-label": ariaLabel = "Actividad" }: NActivityTimelineProps) {
  return <Stack as="ol" aria-label={ariaLabel} listStyleType="none" m="0" p="0" gap="0">{items.map((item, index) => <Flex as="li" key={item.id} gap="3" position="relative" pb={index === items.length - 1 ? "0" : compact ? "3" : "5"}><Flex width="8" justify="center" flexShrink="0"><Flex zIndex="1" bg="bg.panel" color={`${item.colorPalette ?? "blue"}.fg`} rounded="full" boxSize="8" align="center" justify="center">{item.icon ?? <Circle size={12} fill="currentColor" />}</Flex>{index < items.length - 1 ? <Box position="absolute" top="8" bottom="0" insetInlineStart="calc(1rem - 1px)" borderInlineStartWidth="2px" borderColor="border" /> : null}</Flex><Stack gap="1" minW="0" pt="1"><Flex gap="2" direction={{ base: "column", sm: "row" }} justify="space-between"><Text fontWeight="semibold">{item.title}</Text>{item.timestamp ? <Text textStyle="xs" color="fg.muted">{item.timestamp}</Text> : null}</Flex>{item.description ? <Text color="fg.muted" textStyle="sm">{item.description}</Text> : null}{item.content}</Stack></Flex>)}</Stack>
}
