import { Stack } from "@chakra-ui/react"

import { NPanel } from "../panel"
import { NDescriptionList } from "./NDescriptionList"
import type { NDetailPanelProps } from "./types"

export function NDetailPanel({ summary, items = [], columns = 2, children, ...panelProps }: NDetailPanelProps) {
  return <NPanel {...panelProps}><Stack gap="6">{summary}{items.length ? <NDescriptionList items={items} columns={columns} dividers /> : null}{children}</Stack></NPanel>
}
