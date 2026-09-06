import { Box, Button, Flex, IconButton, Table } from "@chakra-ui/react"
import { flexRender, type Table as TanStackTable } from "@tanstack/react-table"
import { ChevronDown, ChevronsUpDown, ChevronUp, GripVertical } from "lucide-react"
import { type DragEvent, type KeyboardEvent, useLayoutEffect, useRef, useState } from "react"

import { NTooltip } from "../../internal/NTooltip"
import type { NTableColumn, NTableLabels, NTableRow } from "../types"
import { TableCheckbox } from "./TableCheckbox"

interface TableDesktopViewProps<T extends NTableRow> {
  table: TanStackTable<T>
  columns: NTableColumn<T>[]
  visibleColumns: NTableColumn<T>[]
  caption?: string
  captionSide: "top" | "bottom"
  size: "sm" | "md" | "lg"
  variant: "line" | "outline"
  colorPalette: string
  striped: boolean
  interactive: boolean
  showColumnBorder: boolean
  borderWidth?: string | number
  overflow: "auto" | "hidden" | "visible"
  maxHeight?: string
  stickyHeader: boolean
  stickyColumn: boolean | string
  native: boolean
  columnGroups: boolean
  selectable: boolean
  reorderableColumns: boolean
  onMoveColumn: (sourceId: string, targetId: string) => void
  reorderableRows: boolean
  onMoveRow: (sourceId: string, targetId: string) => void
  responsive: "scroll" | "stack"
  emptyMessage: string
  labels: NTableLabels
}

/** Icono de orden por columna: flecha arriba/abajo si está ordenada, o doble flecha si no. */
function SortIcon({ direction }: { direction: false | "asc" | "desc" }) {
  if (direction === "asc") return <ChevronUp size={14} />
  if (direction === "desc") return <ChevronDown size={14} />
  return <ChevronsUpDown size={14} />
}

/** Tabla de escritorio: cabeceras agrupadas, columnas/filas pegajosas y arrastre para reordenar. */
export function TableDesktopView<T extends NTableRow>({
  table,
  columns,
  visibleColumns,
  caption,
  captionSide,
  size,
  variant,
  colorPalette,
  striped,
  interactive,
  showColumnBorder,
  borderWidth,
  overflow,
  maxHeight,
  stickyHeader,
  stickyColumn,
  native,
  columnGroups,
  selectable,
  reorderableColumns,
  onMoveColumn,
  reorderableRows,
  onMoveRow,
  responsive,
  emptyMessage,
  labels,
}: TableDesktopViewProps<T>) {
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [draggedRow, setDraggedRow] = useState<string | null>(null)
  const [dropTargetRow, setDropTargetRow] = useState<string | null>(null)
  const groupRowRef = useRef<HTMLTableRowElement>(null)
  const [groupRowHeight, setGroupRowHeight] = useState(0)
  const stickyKey = stickyColumn === true ? visibleColumns[0]?.key : stickyColumn || undefined
  const groupHeaders = visibleColumns.reduce<Array<{ label: string; span: number }>>((groups, column) => {
    const label = column.group ?? ""
    const previous = groups.at(-1)
    if (previous?.label === label && column.group) previous.span += 1
    else groups.push({ label, span: 1 })
    return groups
  }, [])
  const allPageRowsSelected = table.getIsAllPageRowsSelected()
  const somePageRowsSelected = table.getIsSomePageRowsSelected()

  useLayoutEffect(() => {
    if (!stickyHeader || !columnGroups) return
    const node = groupRowRef.current
    if (!node) return
    const updateHeight = () => setGroupRowHeight(node.getBoundingClientRect().height)
    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(node)
    return () => observer.disconnect()
  }, [stickyHeader, columnGroups, groupHeaders.length])

  const handleDrop = (event: DragEvent<HTMLElement>, targetId: string) => {
    event.preventDefault()
    const sourceId = event.dataTransfer.getData("text/plain") || draggedColumn
    if (sourceId) onMoveColumn(sourceId, targetId)
    setDraggedColumn(null)
    setDropTarget(null)
  }

  const handleMoveKey = (
    event: KeyboardEvent<HTMLButtonElement>,
    columnId: string,
    columnIndex: number,
  ) => {
    if (!event.altKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return
    const targetIndex = columnIndex + (event.key === "ArrowLeft" ? -1 : 1)
    const target = visibleColumns[targetIndex]
    if (!target) return
    event.preventDefault()
    onMoveColumn(columnId, target.key)
  }

  const handleRowDrop = (event: DragEvent<HTMLElement>, targetId: string) => {
    event.preventDefault()
    const sourceId = event.dataTransfer.getData("application/x-nissi-row") || draggedRow
    if (sourceId) onMoveRow(sourceId, targetId)
    setDraggedRow(null)
    setDropTargetRow(null)
  }

  const handleRowMoveKey = (
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
    <Box display={responsive === "stack" ? { base: "none", md: "block" } : "block"}>
      <Table.ScrollArea
        overflow={overflow}
        maxH={maxHeight}
        borderWidth={borderWidth}
        borderColor={borderWidth !== undefined ? "border" : undefined}
        borderRadius={borderWidth !== undefined || variant === "outline" ? "md" : undefined}
      >
        <Table.Root
          size={size}
          variant={variant}
          colorPalette={colorPalette}
          striped={striped}
          interactive={interactive}
          showColumnBorder={showColumnBorder}
          stickyHeader={stickyHeader}
          native={native}
        >
          {caption ? <Table.Caption captionSide={captionSide}>{caption}</Table.Caption> : null}
          <Table.ColumnGroup>
            {reorderableRows ? <Table.Column width="10" /> : null}
            {selectable ? <Table.Column width="12" /> : null}
            {visibleColumns.map((column) => <Table.Column key={column.key} width={column.width} />)}
          </Table.ColumnGroup>
          <Table.Header>
            {columnGroups ? (
              <Table.Row ref={groupRowRef}>
                {reorderableRows ? (
                  <Table.ColumnHeader
                    rowSpan={2}
                    aria-label={labels.reorderRowsColumn}
                    position={stickyHeader ? "sticky" : undefined}
                    top={stickyHeader ? "0" : undefined}
                    zIndex={stickyHeader ? "1" : undefined}
                    bg={stickyHeader ? "bg.panel" : undefined}
                  />
                ) : null}
                {selectable ? (
                  <Table.ColumnHeader
                    rowSpan={2}
                    position={stickyColumn || stickyHeader ? "sticky" : undefined}
                    left={stickyColumn ? "0" : undefined}
                    top={stickyHeader ? "0" : undefined}
                    zIndex={stickyColumn ? "3" : stickyHeader ? "1" : undefined}
                    bg={stickyColumn ? "bg.muted" : stickyHeader ? "bg.panel" : undefined}
                  >
                    <TableCheckbox
                      checked={allPageRowsSelected ? true : somePageRowsSelected ? "indeterminate" : false}
                      label={labels.selectVisibleRows}
                      onChange={(checked) => table.toggleAllPageRowsSelected(checked)}
                    />
                  </Table.ColumnHeader>
                ) : null}
                {groupHeaders.map((group, index) => (
                  <Table.ColumnHeader
                    key={`${group.label}-${index}`}
                    colSpan={group.span}
                    textAlign="center"
                    position={stickyHeader ? "sticky" : undefined}
                    top={stickyHeader ? "0" : undefined}
                    zIndex={stickyHeader ? "1" : undefined}
                    bg={stickyHeader ? "bg.panel" : undefined}
                  >
                    {group.label}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            ) : null}
            <Table.Row>
              {reorderableRows && !columnGroups ? (
                <Table.ColumnHeader
                  aria-label={labels.reorderRowsColumn}
                  position={stickyHeader ? "sticky" : undefined}
                  top={stickyHeader ? "0" : undefined}
                  zIndex={stickyHeader ? "1" : undefined}
                  bg={stickyHeader ? "bg.panel" : undefined}
                />
              ) : null}
              {selectable && !columnGroups ? (
                <Table.ColumnHeader
                  position={stickyColumn || stickyHeader ? "sticky" : undefined}
                  left={stickyColumn ? "0" : undefined}
                  top={stickyHeader ? "0" : undefined}
                  zIndex={stickyColumn ? "3" : stickyHeader ? "1" : undefined}
                  bg={stickyColumn ? "bg.muted" : stickyHeader ? "bg.panel" : undefined}
                >
                  <TableCheckbox
                    checked={allPageRowsSelected ? true : somePageRowsSelected ? "indeterminate" : false}
                    label={labels.selectVisibleRows}
                    onChange={(checked) => table.toggleAllPageRowsSelected(checked)}
                  />
                </Table.ColumnHeader>
              ) : null}
              {visibleColumns.map((column) => {
                const tanstackColumn = table.getColumn(column.key)!
                const sorted = tanstackColumn.getIsSorted()
                const isStickyColumn = stickyKey === column.key
                const headerTop = stickyHeader ? (columnGroups ? `${groupRowHeight}px` : "0") : undefined
                return (
                  <Table.ColumnHeader
                    key={column.key}
                    textAlign={column.align}
                    aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"}
                    position={isStickyColumn || stickyHeader ? "sticky" : undefined}
                    left={isStickyColumn ? (selectable ? "12" : "0") : undefined}
                    top={headerTop}
                    zIndex={isStickyColumn ? "2" : stickyHeader ? "1" : undefined}
                    bg={isStickyColumn ? "bg.muted" : stickyHeader ? "bg.panel" : undefined}
                    borderInlineStartWidth={dropTarget === column.key ? "2px" : undefined}
                    borderInlineStartColor={dropTarget === column.key ? "colorPalette.solid" : undefined}
                    onDragOver={reorderableColumns ? (event) => {
                      event.preventDefault()
                      event.dataTransfer.dropEffect = "move"
                      setDropTarget(column.key)
                    } : undefined}
                    onDragLeave={reorderableColumns ? () => setDropTarget((current) => current === column.key ? null : current) : undefined}
                    onDrop={reorderableColumns ? (event) => handleDrop(event, column.key) : undefined}
                  >
                    <Flex align="center" gap="1">
                      {reorderableColumns ? (
                        <NTooltip content={labels.moveColumn(column.header)}>
                          <IconButton
                            draggable
                            aria-label={labels.moveColumn(column.header)}
                            variant="ghost"
                            size="xs"
                            cursor="grab"
                            onDragStart={(event) => {
                              event.dataTransfer.effectAllowed = "move"
                              event.dataTransfer.setData("text/plain", column.key)
                              setDraggedColumn(column.key)
                            }}
                            onDragEnd={() => {
                              setDraggedColumn(null)
                              setDropTarget(null)
                            }}
                            onKeyDown={(event) => handleMoveKey(event, column.key, visibleColumns.indexOf(column))}
                          >
                            <GripVertical size={15} />
                          </IconButton>
                        </NTooltip>
                      ) : null}
                      {tanstackColumn.getCanSort() ? (
                        <NTooltip content={labels.sortColumn(column.header, sorted)}>
                          <Button
                            variant="plain"
                            size="sm"
                            px="0"
                            aria-label={labels.sortColumn(column.header, sorted)}
                            onClick={tanstackColumn.getToggleSortingHandler()}
                          >
                            {column.header}<SortIcon direction={sorted} />
                          </Button>
                        </NTooltip>
                      ) : column.header}
                    </Flex>
                  </Table.ColumnHeader>
                )
              })}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows.length === 0 ? (
              <Table.Row>
                <Table.Cell
                  colSpan={visibleColumns.length + (selectable ? 1 : 0) + (reorderableRows ? 1 : 0)}
                  textAlign="center"
                  color="fg.muted"
                >
                  {emptyMessage}
                </Table.Cell>
              </Table.Row>
            ) : table.getRowModel().rows.map((row, rowIndex) => (
              <Table.Row
                key={row.id}
                data-selected={row.getIsSelected() ? "" : undefined}
                borderBlockStartWidth={dropTargetRow === row.id ? "2px" : undefined}
                borderBlockStartColor={dropTargetRow === row.id ? "colorPalette.solid" : undefined}
                onDragOver={reorderableRows ? (event) => {
                  if (!draggedRow) return
                  event.preventDefault()
                  event.dataTransfer.dropEffect = "move"
                  setDropTargetRow(row.id)
                } : undefined}
                onDragLeave={reorderableRows ? () => setDropTargetRow((current) => current === row.id ? null : current) : undefined}
                onDrop={reorderableRows ? (event) => handleRowDrop(event, row.id) : undefined}
              >
                {reorderableRows ? (
                  <Table.Cell>
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
                        onKeyDown={(event) => handleRowMoveKey(event, row.id, rowIndex)}
                      >
                        <GripVertical size={15} />
                      </IconButton>
                    </NTooltip>
                  </Table.Cell>
                ) : null}
                {selectable ? (
                  <Table.Cell
                    position={stickyColumn ? "sticky" : undefined}
                    left={stickyColumn ? "0" : undefined}
                    zIndex={stickyColumn ? "2" : undefined}
                    bg={stickyColumn ? "bg" : undefined}
                  >
                    <TableCheckbox
                      checked={row.getIsSelected()}
                      label={labels.selectRow(row.index + 1)}
                      onChange={(checked) => row.toggleSelected(checked)}
                    />
                  </Table.Cell>
                ) : null}
                {row.getVisibleCells().map((cell) => {
                  const column = columns.find((item) => item.key === cell.column.id)!
                  return (
                    <Table.Cell
                      key={cell.id}
                      textAlign={column.align}
                      position={stickyKey === column.key ? "sticky" : undefined}
                      left={stickyKey === column.key ? (selectable ? "12" : "0") : undefined}
                      zIndex={stickyKey === column.key ? "1" : undefined}
                      bg={stickyKey === column.key ? "bg" : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Cell>
                  )
                })}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  )
}
