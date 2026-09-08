import { Box, Grid, Stack } from "@chakra-ui/react"

import type { NDescriptionListProps } from "./types"

export function NDescriptionList({ items, columns = 2, orientation = "stacked", dividers = false, unstyled = false, classNames, styles }: NDescriptionListProps) {
  return (
    <Grid as="dl" templateColumns={{ base: "1fr", md: `repeat(${columns}, minmax(0, 1fr))` }} gap="0" m="0" className={classNames?.root} css={styles?.root} data-scope="n-description-list" data-part="root">
      {items.map((item) => <Stack key={item.id} direction={orientation === "inline" ? { base: "column", sm: "row" } : "column"} gap="1" py={unstyled ? undefined : "3"} pe={unstyled ? undefined : "4"} borderBottomWidth={!unstyled && dividers ? "1px" : undefined} borderColor="border" gridColumn={{ md: `span ${Math.min(item.span ?? 1, columns)}` }} className={classNames?.item} css={styles?.item} data-part="item"><Box as="dt" color={unstyled ? undefined : "fg.muted"} textStyle={unstyled ? undefined : "sm"} minW={orientation === "inline" ? "8rem" : undefined} className={classNames?.term} css={styles?.term} data-part="term">{item.label}</Box><Box as="dd" m="0" fontWeight={unstyled ? undefined : "medium"} minW="0" className={classNames?.description} css={styles?.description} data-part="description">{item.value}</Box></Stack>)}
    </Grid>
  )
}
