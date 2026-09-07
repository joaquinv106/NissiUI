"use client"

import { Badge, Box, Button, Flex, IconButton, Popover, Portal, Stack, Text } from "@chakra-ui/react"
import { Bell } from "lucide-react"
import { useMemo } from "react"

import { defaultNNotificationCenterLabels, resolveLabels } from "./labels"
import type { NNotificationCenterProps } from "./types"

export function NNotificationCenter({ notifications, trigger, onSelect, onMarkRead, onMarkAllRead, labels: custom }: NNotificationCenterProps) {
  const labels = useMemo(() => resolveLabels(defaultNNotificationCenterLabels, custom), [custom])
  const unread = notifications.filter((item) => !item.read).length
  return <Popover.Root positioning={{ placement: "bottom-end" }}><Popover.Trigger asChild>{trigger ?? <IconButton variant="ghost" aria-label={`${labels.trigger}. ${labels.unreadCount(unread)}`} position="relative"><Bell size={19} />{unread ? <Badge position="absolute" top="0" insetInlineEnd="0" size="xs" colorPalette="red">{unread > 99 ? "99+" : unread}</Badge> : null}</IconButton>}</Popover.Trigger><Portal><Popover.Positioner><Popover.Content width={{ base: "calc(100vw - 2rem)", sm: "24rem" }} maxH="min(32rem, calc(100dvh - 6rem))"><Popover.Arrow /><Popover.Header><Flex justify="space-between" align="center" gap="3"><Popover.Title>{labels.title}</Popover.Title>{unread && onMarkAllRead ? <Button size="xs" variant="plain" onClick={onMarkAllRead}>{labels.markAllRead}</Button> : null}</Flex></Popover.Header><Popover.Body overflowY="auto" p="0">{notifications.length ? <Stack gap="0">{notifications.map((item) => <Button key={item.id} variant="ghost" height="auto" justifyContent="start" rounded="0" p="3" whiteSpace="normal" bg={!item.read ? "colorPalette.subtle" : undefined} onClick={() => { onMarkRead?.(item.id); onSelect?.(item) }}><Flex gap="3" textAlign="start" width="full">{item.icon ? <Box flexShrink="0">{item.icon}</Box> : null}<Stack gap="1" minW="0"><Text fontWeight={!item.read ? "bold" : "medium"}>{item.title}</Text>{item.description ? <Text textStyle="sm" color="fg.muted">{item.description}</Text> : null}{item.timestamp ? <Text textStyle="xs" color="fg.muted">{item.timestamp}</Text> : null}</Stack></Flex></Button>)}</Stack> : <Text color="fg.muted" p="5" textAlign="center">{labels.empty}</Text>}</Popover.Body></Popover.Content></Popover.Positioner></Portal></Popover.Root>
}
