"use client"

import { Card, Heading, Stack, Text } from "@chakra-ui/react"
import {
  type ColumnDef,
  type ColumnOrderState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { TableCellValue } from "./internal/TableCellValue"
import { TableDesktopView } from "./internal/TableDesktopView"
import { TablePagination } from "./internal/TablePagination"
import { TableSelectionBar } from "./internal/TableSelectionBar"
import { TableStackView } from "./internal/TableStackView"
import { TableToolbar } from "./internal/TableToolbar"
import { resolveNTableLabels } from "./labels"
import { usePermissions } from "../permissions"
import type { NTableExportOptions, NTableProps, NTableRow, NTableServerOptions } from "./types"
import {
  defaultRowId,
  hasStableDefaultRowId,
  moveItem,
  rowMatchesSearch,
  serializeHeaders,
  valueToText,
} from "./utils"

/** Normaliza `exportOptions`: `true` habilita todo con valores por defecto, `false`/`undefined` lo desactiva. */
function normalizeExportOptions(value: NTableProps["exportOptions"]): NTableExportOptions | null {
  if (!value) return null
  return value === true ? {} : value
}

/** Tabla base configurable desde JSON: orquesta TanStack Table, orden, selección y exportaciones. */
export function NTable<T extends NTableRow>({
  config,
  card = true,
  title,
  subtitle,
  caption,
  captionSide = "bottom",
  size = "md",
  variant = "line",
  colorPalette = "blue",
  striped = false,
  interactive = false,
  showColumnBorder = false,
  borderWidth,
  overflow = "auto",
  maxHeight,
  stickyHeader = false,
  stickyColumn = false,
  native = false,
  responsive = "scroll",
  useTanStack = false,
  columnGroups = false,
  pagination = false,
  server,
  selectable = false,
  selectionMode = "multiple",
  actions = [],
  searchable = false,
  filterable = false,
  columnVisibility = false,
  reorderableColumns = false,
  reorderableRows = false,
  exportOptions = false,
  emptyMessage,
  labels: customLabels,
  getRowId,
  iconMap,
  onSelectionChange,
  onRowOrderChange,
}: NTableProps<T>) {
  const labels = useMemo(() => resolveNTableLabels(customLabels), [customLabels])
  const { can } = usePermissions()
  const visibleActions = useMemo(
    () => actions.filter((action) => !action.requiredPermission || can(action.requiredPermission, action.permissionMode)),
    [actions, can],
  )
  const [localSearch, setLocalSearch] = useState("")
  const [localFilterColumn, setLocalFilterColumn] = useState("")
  const [localFilterValue, setLocalFilterValue] = useState("")
  const [localSorting, setLocalSorting] = useState<SortingState>([])
  const [localPagination, setLocalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: typeof pagination === "object" ? pagination.pageSize ?? 5 : 5,
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [visibility, setVisibility] = useState<VisibilityState>(() =>
    Object.fromEntries(config.headers.filter((column) => column.hidden).map((column) => [column.key, false])),
  )
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() =>
    config.headers.map((column) => column.key),
  )
  const [rowOrder, setRowOrder] = useState<string[]>(() =>
    config.data.map((row, index) => getRowId?.(row, index) ?? defaultRowId(row, index)),
  )
  const warnedAboutRowId = useRef(false)
  const paginationOptions = typeof pagination === "object" ? pagination : {}
  const search = server?.query.search ?? localSearch
  const filterColumn = server?.query.filterColumn ?? localFilterColumn
  const filterValue = server?.query.filterValue ?? localFilterValue
  const sorting: SortingState = server?.query.sorting ?? localSorting
  const paginationState: PaginationState = server
    ? { pageIndex: server.query.pageIndex, pageSize: server.query.pageSize }
    : localPagination
  const emitServerQuery = useCallback((change: Partial<NTableServerOptions["query"]>) => {
    if (!server) return
    server.onQueryChange({ ...server.query, ...change })
  }, [server])
  const exportConfig = normalizeExportOptions(exportOptions)
  const resolvedGetRowId = useCallback(
    (row: T, index: number) => getRowId?.(row, index) ?? defaultRowId(row, index),
    [getRowId],
  )
  const columnKeySignature = config.headers.map((column) => column.key).join("\u001f")
  const rowEntries = useMemo(
    () => config.data.map((row, index) => ({ id: resolvedGetRowId(row, index), row })),
    [config.data, resolvedGetRowId],
  )
  const rowIdSignature = rowEntries.map(({ id }) => id).join("\u001f")

  useEffect(() => {
    const keys: string[] = config.headers.map((column) => column.key)
    setColumnOrder((current) => {
      const next = reorderableColumns
        ? [...current.filter((key) => keys.includes(key)), ...keys.filter((key) => !current.includes(key))]
        : keys
      return next.length === current.length && next.every((key, index) => key === current[index])
        ? current
        : next
    })
  }, [columnKeySignature, config.headers, reorderableColumns])

  useEffect(() => {
    const ids = rowEntries.map(({ id }) => id)
    setRowOrder((current) => {
      const next = reorderableRows
        ? [...current.filter((id) => ids.includes(id)), ...ids.filter((id) => !current.includes(id))]
        : ids
      return next.length === current.length && next.every((id, index) => id === current[index])
        ? current
        : next
    })
  }, [reorderableRows, rowEntries, rowIdSignature])

  useEffect(() => {
    const isDevelopment = typeof process === "undefined" || process.env.NODE_ENV !== "production"
    if (
      isDevelopment &&
      (selectable || reorderableRows) &&
      !getRowId &&
      !warnedAboutRowId.current &&
      config.data.some((row) => !hasStableDefaultRowId(row))
    ) {
      warnedAboutRowId.current = true
      console.warn(
        "[NissiUI] NTable seleccionable o reordenable sin getRowId ni campo id/key: la identidad puede perderse al filtrar, ordenar o mover filas.",
      )
    }
  }, [config.data, getRowId, reorderableRows, selectable])

  const effectiveRowOrder = useMemo(() => {
    const ids = rowEntries.map(({ id }) => id)
    return [...rowOrder.filter((id) => ids.includes(id)), ...ids.filter((id) => !rowOrder.includes(id))]
  }, [rowEntries, rowOrder])
  const orderedData = useMemo(() => {
    if (!reorderableRows) return config.data
    const rowsById = new Map(rowEntries.map(({ id, row }) => [id, row]))
    return effectiveRowOrder.map((id) => rowsById.get(id)).filter((row): row is T => Boolean(row))
  }, [config.data, effectiveRowOrder, reorderableRows, rowEntries])

  const filteredData = useMemo(
    () => (server ? orderedData : orderedData.filter((row) => {
      const matchesSearch = rowMatchesSearch(row, config.headers, search)
      const matchesField =
        !filterColumn ||
        !filterValue.trim() ||
        valueToText(row[filterColumn]).toLocaleLowerCase().includes(filterValue.toLocaleLowerCase())
      return matchesSearch && matchesField
    })),
    [config.headers, filterColumn, filterValue, orderedData, search, server],
  )

  const columns = useMemo<ColumnDef<T>[]>(
    () => config.headers.map((column) => ({
      id: column.key,
      accessorKey: column.key,
      header: column.header,
      enableHiding: column.hideable !== false,
      enableSorting: useTanStack && column.sortable !== false,
      cell: ({ row }) => <TableCellValue column={column} row={row.original} iconMap={iconMap} />,
    })),
    [config.headers, iconMap, useTanStack],
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, pagination: paginationState, rowSelection, columnVisibility: visibility, columnOrder },
    enableRowSelection: selectable,
    enableMultiRowSelection: selectionMode === "multiple",
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater
      if (server) emitServerQuery({ sorting: next, pageIndex: 0 })
      else setLocalSorting(next)
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(paginationState) : updater
      if (server) emitServerQuery(next)
      else setLocalPagination(next)
    },
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setVisibility,
    onColumnOrderChange: setColumnOrder,
    getRowId: resolvedGetRowId,
    getCoreRowModel: getCoreRowModel(),
    ...(server ? { manualFiltering: true, manualSorting: true, manualPagination: true, rowCount: server.rowCount } : { getSortedRowModel: getSortedRowModel() }),
    ...(pagination && !server ? { getPaginationRowModel: getPaginationRowModel() } : {}),
  })

  const visibleColumns = table
    .getVisibleLeafColumns()
    .map((column) => config.headers.find((item) => item.key === column.id)!)
    .filter(Boolean)
  const selectedTableRows = useMemo(
    () => table.getSelectedRowModel().rows,
    [filteredData, rowSelection, sorting, table],
  )
  const selectedRows = useMemo(
    () => selectedTableRows.map((row) => row.original),
    [selectedTableRows],
  )
  const exportRows = table.getPrePaginationRowModel().rows.map((row) => row.original)
  const hasToolbar = searchable || filterable || columnVisibility || Boolean(exportConfig)

  const moveColumn = useCallback((sourceId: string, targetId: string) => {
    setColumnOrder((current) => moveItem(current, sourceId, targetId))
  }, [])

  const moveRow = useCallback((sourceId: string, targetId: string) => {
    const visibleIds = table.getPrePaginationRowModel().rows.map((row) => row.id)
    const reorderedVisibleIds = moveItem(visibleIds, sourceId, targetId)
    if (reorderedVisibleIds === visibleIds) return

    const visibleIdSet = new Set(visibleIds)
    let visibleIndex = 0
    const nextOrder = effectiveRowOrder.map((id) =>
      visibleIdSet.has(id) ? reorderedVisibleIds[visibleIndex++] : id,
    )
    const rowsById = new Map(rowEntries.map(({ id, row }) => [id, row]))
    const nextRows = nextOrder.map((id) => rowsById.get(id)).filter((row): row is T => Boolean(row))

    setRowOrder(nextOrder)
    if (server) emitServerQuery({ sorting: [] })
    else setLocalSorting([])
    onRowOrderChange?.(nextRows)
  }, [effectiveRowOrder, emitServerQuery, onRowOrderChange, rowEntries, server, table])

  useEffect(() => {
    if (!server) table.setPageIndex(0)
  }, [filterColumn, filterValue, search, server, table])

  const handleSearchChange = (value: string) => {
    if (server) emitServerQuery({ search: value, pageIndex: 0 })
    else setLocalSearch(value)
  }
  const handleFilterColumnChange = (value: string) => {
    if (server) emitServerQuery({ filterColumn: value, filterValue: "", pageIndex: 0 })
    else {
      setLocalFilterColumn(value)
      setLocalFilterValue("")
    }
  }
  const handleFilterValueChange = (value: string) => {
    if (server) emitServerQuery({ filterValue: value, pageIndex: 0 })
    else setLocalFilterValue(value)
  }

  useEffect(() => {
    onSelectionChange?.(selectedRows)
  }, [onSelectionChange, selectedRows])

  const runAction = (action: (typeof visibleActions)[number]) => {
    const selectedTableRow = selectedTableRows[0]
    if (!selectedTableRow) return
    void action.onClick({
      headers: serializeHeaders(config.headers),
      data: JSON.stringify(selectedTableRow.original),
      rowId: selectedTableRow.id,
      row: selectedTableRow.original,
      selectedRowIds: selectedTableRows.map((row) => row.id),
      selectedRows,
    })
  }

  const content = (
    <Stack gap="4" width="full" aria-busy={server?.loading || undefined}>
      {title || subtitle ? (
        <Stack gap="1">
          {title ? <Heading as="h2" size="lg">{title}</Heading> : null}
          {subtitle ? <Text color="fg.muted">{subtitle}</Text> : null}
        </Stack>
      ) : null}

      {hasToolbar ? (
        <TableToolbar
          table={table}
          columns={config.headers}
          visibleColumns={visibleColumns}
          rows={exportRows}
          searchable={searchable}
          filterable={filterable}
          columnVisibility={columnVisibility}
          exportOptions={exportConfig}
          search={search}
          filterColumn={filterColumn}
          filterValue={filterValue}
          title={title ?? labels.defaultTitle}
          labels={labels}
          onSearchChange={handleSearchChange}
          onFilterColumnChange={handleFilterColumnChange}
          onFilterValueChange={handleFilterValueChange}
        />
      ) : null}

      {selectable ? (
        <TableSelectionBar
          selectedCount={selectedRows.length}
          actions={visibleActions}
          colorPalette={colorPalette}
          labels={labels}
          onClear={() => setRowSelection({})}
          onAction={runAction}
        />
      ) : null}

      <TableDesktopView
        table={table}
        columns={config.headers}
        visibleColumns={visibleColumns}
        caption={caption}
        captionSide={captionSide}
        size={size}
        variant={variant}
        colorPalette={colorPalette}
        striped={striped}
        interactive={interactive}
        showColumnBorder={showColumnBorder}
        borderWidth={borderWidth}
        overflow={overflow}
        maxHeight={maxHeight}
        stickyHeader={stickyHeader}
        stickyColumn={stickyColumn}
        native={native}
        columnGroups={columnGroups}
        selectable={selectable}
        reorderableColumns={reorderableColumns}
        onMoveColumn={moveColumn}
        reorderableRows={reorderableRows}
        onMoveRow={moveRow}
        responsive={responsive}
        emptyMessage={emptyMessage ?? labels.emptyMessage}
        labels={labels}
      />

      {responsive === "stack" ? (
        <TableStackView
          table={table}
          columns={config.headers}
          selectable={selectable}
          reorderableRows={reorderableRows}
          labels={labels}
          onMoveRow={moveRow}
        />
      ) : null}

      {pagination ? <TablePagination table={table} options={paginationOptions} labels={labels} /> : null}
    </Stack>
  )

  if (!card) return content

  return (
    <Card.Root variant="outline" width="full" bg="bg.panel">
      <Card.Body p={{ base: "4", md: "6" }}>{content}</Card.Body>
    </Card.Root>
  )
}
