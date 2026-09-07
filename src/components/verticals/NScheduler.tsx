"use client"

import { Badge, Button, Flex, Grid, Stack, Text } from "@chakra-ui/react"
import { useMemo } from "react"

import type { NSchedulerProps } from "./types"

export const defaultNSchedulerLabels = { schedule: "Agenda", empty: "Sin eventos", allDay: "Todo el día" }
const dateKey = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
const asDate = (value: Date | string) => value instanceof Date ? value : new Date(value)
export function NScheduler({ events, startDate = new Date(), days = 7, onEventSelect, labels: custom }: NSchedulerProps) {
  const labels = { ...defaultNSchedulerLabels, ...custom }
  const dates = useMemo(() => Array.from({ length: Math.max(1, days) }, (_, index) => { const date = asDate(startDate); const copy = new Date(date); copy.setDate(copy.getDate() + index); return copy }), [startDate, days])
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" }), [])
  const timeFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }), [])
  return <Grid role="region" aria-label={labels.schedule} templateColumns={{ base: "1fr", lg: `repeat(${Math.min(days, 7)}, minmax(0, 1fr))` }} borderWidth="1px" borderColor="border" rounded="lg" overflow="hidden">{dates.map((date) => { const dayEvents = events.filter((event) => dateKey(asDate(event.start)) === dateKey(date)); return <Stack key={dateKey(date)} minH="12rem" p="3" borderInlineEndWidth={{ lg: "1px" }} borderBottomWidth={{ base: "1px", lg: "0" }} borderColor="border" _last={{ borderWidth: "0" }}><Text as="h3" fontWeight="bold" textTransform="capitalize">{dateFormatter.format(date)}</Text>{dayEvents.length ? dayEvents.map((event) => <Button key={event.id} variant="subtle" colorPalette={event.colorPalette ?? "blue"} height="auto" p="2" justifyContent="start" whiteSpace="normal" onClick={() => onEventSelect?.(event)}><Stack gap="1" textAlign="start" minW="0"><Text textStyle="xs">{timeFormatter.format(asDate(event.start))}{event.end ? ` – ${timeFormatter.format(asDate(event.end))}` : ""}</Text><Text fontWeight="semibold">{event.title}</Text>{event.resource ? <Badge width="fit-content">{event.resource}</Badge> : null}{event.description ? <Text textStyle="xs">{event.description}</Text> : null}</Stack></Button>) : <Flex flex="1" align="center" justify="center"><Text textStyle="sm" color="fg.muted">{labels.empty}</Text></Flex>}</Stack> })}</Grid>
}
