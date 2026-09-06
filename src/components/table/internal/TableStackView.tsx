import { Box, Flex, IconButton, Stack, Text } from "@chakra-ui/react"
import { flexRender, type Table as TanStackTable } from "@tanstack/react-table"
import { GripVertical } from "lucide-react"
import { type DragEvent, type KeyboardEvent, useState } from "react"

import { NTooltip } from "../../internal/NTooltip"
import type { NTableColumn, NTableLabels, NTableRow } from "../types"
import { TableCheckbox } from "./TableCheckbox"

interface TableStackViewProps<T extends NTableRow> {
  table: TanStackTable<T>
  columns: NTableColumn<T>[]
  selectable: boolean
  reorderableRows: boolean
  labels: NTableLabels
  onMoveRow: (sourceId: string, targetId: string) => void
}

/** Vista responsive en móvil: cada fila se muestra como tarjeta de definiciones apilada. */
export function TableStackView<T extends NTableRow>({
  table,
  columns,
  selectable,
  reorderableRows,
  labels,
  onMoveRow,
}: TableStackViewProps<T>) {
  const [draggedRow, setDraggedRow] = useState<string | null>(null)
  const [dropTargetRow, setDropTargetRow] = useState<string | null>(null)

  const handleDrop = (event: DragEvent<HTMLElement>, targetId: string) => {
    event.preventDefault()
    const sourceId = event.dataTransfer.getData("application/x-nissi-row") || draggedRow
    if (sourceId) onMoveRow(sourceId, targetId)
    setDraggedRow(null)
    setDropTargetRow(null)
  }

  const handleMoveKey = (
    event: KeyboardEvent<HTMLButtonElement>,
    rowId: string,
    rowIndex: number,
  ) => {
    if (!event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return
    const targetIndex = rowIndex + (event.key === "ArrowUp" ? -1 : 1)
    const target = table.getRowModel().rows[targetIndex]
    if (!target) return
    event.preventDefault()
    onMoveRow(rowId, target.id)
  }

  return (
    <Stack
      role="list"
      aria-label={labels.stackViewLabel}
      display={{ base: "flex", md: "none" }}
      gap="3"
    >
      {table.getRowModel().rows.map((row, rowIndex) => (
        <Box
          role="listitem"
          key={row.id}
          borderWidth="1px"
          borderColor={dropTargetRow === row.id ? "border.emphasized" : "border"}
          rounded="md"
          p="4"
          bg="bg"
          onDragOver={reorderableRows ? (event) => {
            if (!draggedRow) return
            event.preventDefault()
            event.dataTransfer.dropEffect = "move"
            setDropTargetRow(row.id)
          } : undefined}
          onDragLeave={reorderableRows ? () => setDropTargetRow((current) => current === row.id ? null : current) : undefined}
          onDrop={reorderableRows ? (event) => handleDrop(event, row.id) : undefined}
        >
          {selectable || reorderableRows ? (
            <Flex justify={selectable && reorderableRows ? "space-between" : selectable ? "end" : "start"} mb="2">
              {reorderableRows ? (
                <NTooltip content={labels.moveRow(row.index + 1)}>
                  <IconButton
                    draggable
                    aria-label={labels.moveRow(row.index + 1)}
                    variant="ghost"
                    size="xs"
                    cursor="grab"
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move"
                      event.dataTransfer.setData("application/x-nissi-row", row.id)
                      setDraggedRow(row.id)
                    }}
                    onDragEnd={() => {
                      setDraggedRow(null)
                      setDropTargetRow(null)
                    }}
                    onKeyDown={(event) => handleMoveKey(event, row.id, rowIndex)}
                  >
                    <GripVertical size={15} />
                  </IconButton>
                </NTooltip>
              ) : null}
              {selectable ? (
              <TableCheckbox
                checked={row.getIsSelected()}
                label={labels.selectRow(row.index + 1)}
                onChange={(checked) => row.toggleSelected(checked)}
              />
              ) : null}
            </Flex>
          ) : null}
          <Stack as="dl" gap="3">
            {row.getVisibleCells().map((cell) => {
              const column = columns.find((item) => item.key === cell.column.id)!
              return (
                <Flex key={cell.id} justify="space-between" gap="4" align="start">
                  <Text as="dt" fontWeight="medium">{column.header}</Text>
                  <Box as="dd" m="0" textAlign="end">{flexRender(cell.column.columnDef.cell, cell.getContext())}</Box>
                </Flex>
              )
            })}
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}
