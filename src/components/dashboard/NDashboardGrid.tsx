import { Grid, GridItem } from "@chakra-ui/react"

import type { NDashboardGridItemProps, NDashboardGridProps } from "./types"

export function NDashboardGrid({ children, columns = 4, minItemWidth = "15rem", gap = "4", classNames, styles }: NDashboardGridProps) {
  return <Grid width="full" templateColumns={{ base: "1fr", md: `repeat(auto-fit, minmax(min(100%, ${minItemWidth}), 1fr))`, xl: `repeat(${columns}, minmax(0, 1fr))` }} gap={gap} className={classNames?.root} css={styles?.root} data-scope="n-dashboard-grid" data-part="root">{children}</Grid>
}
export function NDashboardGridItem({ children, colSpan = 1, rowSpan = 1, classNames, styles }: NDashboardGridItemProps) {
  return <GridItem minW="0" colSpan={{ base: 1, xl: colSpan }} rowSpan={rowSpan} className={classNames?.root} css={styles?.root} data-scope="n-dashboard-grid-item" data-part="root">{children}</GridItem>
}
