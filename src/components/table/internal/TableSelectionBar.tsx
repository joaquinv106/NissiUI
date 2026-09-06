import { ActionBar, Box, Button, Portal, Text } from "@chakra-ui/react"
import { Ellipsis } from "lucide-react"

import { NTooltip } from "../../internal/NTooltip"
import type { NTableAction, NTableLabels, NTableRow } from "../types"

interface TableSelectionBarProps<T extends NTableRow> {
  selectedCount: number
  actions: NTableAction<T>[]
  colorPalette: string
  labels: NTableLabels
  onClear: () => void
  onAction: (action: NTableAction<T>) => void
}

/** ActionBar flotante con las acciones disponibles según la cantidad de filas seleccionadas. */
export function TableSelectionBar<T extends NTableRow>({
  selectedCount,
  actions,
  colorPalette,
  labels,
  onClear,
  onAction,
}: TableSelectionBarProps<T>) {
  if (actions.length === 0) return null
  const visibleActions = actions.filter((action) => {
    if (action.selectionRequirement === "single") return selectedCount === 1
    if (action.selectionRequirement === "multiple") return selectedCount > 1
    return true
  })

  return (
    <ActionBar.Root
      open={selectedCount > 0}
      onOpenChange={(details) => { if (!details.open) onClear() }}
      closeOnInteractOutside={false}
    >
      <Portal>
        <ActionBar.Positioner zIndex="max">
          <ActionBar.Content
            role="toolbar"
            aria-label={labels.selectionActionsAriaLabel}
            colorPalette={colorPalette}
            bg="bg.muted"
            borderWidth="1px"
            borderColor="border"
            width="auto"
            maxW="calc(100vw - 2rem)"
            flexDirection="row"
            alignItems="center"
            flexWrap="nowrap"
            overflowX="auto"
            gap="2"
            zIndex="max"
          >
            <ActionBar.SelectionTrigger flexShrink="0">
              {labels.selectedCount(selectedCount)}
            </ActionBar.SelectionTrigger>
            <ActionBar.Separator flexShrink="0" />
            {visibleActions.map((action) => (
              <NTooltip key={action.id} content={action.label} zIndex="max">
                <Button
                  aria-label={action.label}
                  size="sm"
                  variant="outline"
                  colorPalette={action.colorPalette}
                  boxSize={{ base: "9", sm: "auto" }}
                  minW={{ base: "9", sm: "auto" }}
                  px={{ base: "0", sm: "3" }}
                  flexShrink="0"
                  onClick={() => onAction(action)}
                >
                  <Box aria-hidden="true" display="inline-flex">
                    {action.icon ?? <Ellipsis size={16} />}
                  </Box>
                  <Text as="span" display={{ base: "none", sm: "inline" }}>
                    {action.label}
                  </Text>
                </Button>
              </NTooltip>
            ))}
          </ActionBar.Content>
        </ActionBar.Positioner>
      </Portal>
    </ActionBar.Root>
  )
}
