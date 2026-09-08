import { Badge, Card, Flex, Skeleton, Stack, Text } from "@chakra-ui/react"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"

import type { NStatCardProps } from "./types"

export function NStatCard({ label, value, helperText, trend, trendLabel, icon, action, colorPalette = "blue", loading = false, unstyled = false, classNames, styles }: NStatCardProps) {
  const direction = trend == null || trend === 0 ? "flat" : trend > 0 ? "up" : "down"
  const TrendIcon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus
  return <Card.Root unstyled={unstyled} variant={unstyled ? undefined : "outline"} bg={unstyled ? undefined : "bg.panel"} height="full" className={classNames?.root} css={styles?.root} data-scope="n-stat-card" data-part="root"><Card.Body unstyled={unstyled}><Stack gap="4"><Flex justify="space-between" align="start" gap="3" className={classNames?.header} css={styles?.header} data-part="header"><Text color="fg.muted" fontWeight="medium">{label}</Text><Flex gap="2" align="center">{icon ? <Flex color={`${colorPalette}.fg`} bg={`${colorPalette}.subtle`} rounded="md" p="2">{icon}</Flex> : null}{action}</Flex></Flex><Skeleton loading={loading}><Text textStyle="3xl" fontWeight="bold" letterSpacing="tight" className={classNames?.value} css={styles?.value} data-part="value">{value}</Text></Skeleton>{trend != null || helperText ? <Flex gap="2" align="center" wrap="wrap" className={classNames?.trend} css={styles?.trend} data-part="trend">{trend != null ? <Badge colorPalette={direction === "down" ? "red" : direction === "up" ? "green" : "gray"}><TrendIcon size={13} aria-hidden="true" /> {Math.abs(trend)}%</Badge> : null}{trendLabel || helperText ? <Text textStyle="sm" color="fg.muted">{trendLabel ?? helperText}</Text> : null}</Flex> : null}</Stack></Card.Body></Card.Root>
}
