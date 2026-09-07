import { Box, Grid, Stack } from "@chakra-ui/react"

import type { NDescriptionListProps } from "./types"

export function NDescriptionList({ items, columns = 2, orientation = "stacked", dividers = false }: NDescriptionListProps) {
  return (
    <Grid as="dl" templateColumns={{ base: "1fr", md: `repeat(${columns}, minmax(0, 1fr))` }} gap="0" m="0">
      {items.map((item) => <Stack key={item.id} direction={orientation === "inline" ? { base: "column", sm: "row" } : "column"} gap="1" py="3" pe="4" borderBottomWidth={dividers ? "1px" : undefined} borderColor="border" gridColumn={{ md: `span ${Math.min(item.span ?? 1, columns)}` }}><Box as="dt" color="fg.muted" textStyle="sm" minW={orientation === "inline" ? "8rem" : undefined}>{item.label}</Box><Box as="dd" m="0" fontWeight="medium" minW="0">{item.value}</Box></Stack>)}
    </Grid>
  )
}
