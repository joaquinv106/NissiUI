"use client"

import { Edit, Trash2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { EditRowDialog } from "./EditRowDialog"
import { resolveNTableLabels } from "./labels"
import { NTable } from "./NTable"
import type { NDataTableProps, NTableAction, NTableRow } from "./types"
import { defaultRowId } from "./utils"

interface EditingRow<T extends NTableRow> {
  id: string
  value: T
}

/** Extiende NTable con búsqueda, filtro, selección, edición, borrado y exportación activados por defecto. */
export function NDataTable<T extends NTableRow>({
  config,
  pagination = { pageSize: 5, pageSizeOptions: [5, 10, 20, 50] },
  selectable = true,
  searchable = true,
  filterable = true,
  columnVisibility = true,
  reorderableColumns = true,
  reorderableRows = true,
  exportOptions = true,
  defaultActions = true,
  confirmDelete = true,
  actions = [],
  labels: customLabels,
  onBeforeDelete,
  onDataChange,
  onRowOrderChange,
  onEdit,
  onDelete,
  getRowId,
  ...tableProps
}: NDataTableProps<T>) {
  const labels = useMemo(() => resolveNTableLabels(customLabels), [customLabels])
  const [rows, setRows] = useState(config.data)
  const [editingRow, setEditingRow] = useState<EditingRow<T> | null>(null)
  const resolveRowId = useCallback(
    (row: T, index: number) => getRowId?.(row, index) ?? defaultRowId(row, index),
    [getRowId],
  )

  useEffect(() => setRows(config.data), [config.data])

  const updateRows = useCallback((nextRows: T[]) => {
    setRows(nextRows)
    onDataChange?.(nextRows)
  }, [onDataChange])

  const updateRowOrder = useCallback((nextRows: T[]) => {
    updateRows(nextRows)
    onRowOrderChange?.(nextRows)
  }, [onRowOrderChange, updateRows])

  const saveEdit = async (editedRow: T) => {
    if (!editingRow) return
    const currentIndex = rows.findIndex((row, index) => resolveRowId(row, index) === editingRow.id)
    if (currentIndex < 0) {
      console.warn(`[NissiUI] No se encontró la fila ${editingRow.id} para aplicar la edición.`)
      return
    }
    const nextRows = rows.map((row, index) => index === currentIndex ? editedRow : row)
    updateRows(nextRows)
    await onEdit?.(editedRow)
  }

  const builtInActions = useMemo<NTableAction<T>[]>(() => {
    if (!defaultActions) return []
    return [
      {
        id: "edit",
        label: labels.edit,
        icon: <Edit size={16} />,
        selectionRequirement: "single",
        onClick: ({ row, rowId }) => setEditingRow({ id: rowId, value: row }),
      },
      {
        id: "delete",
        label: labels.delete,
        icon: <Trash2 size={16} />,
        colorPalette: "red",
        onClick: async ({ selectedRows, selectedRowIds }) => {
          if (onBeforeDelete && !(await onBeforeDelete(selectedRows))) return
          if (!onBeforeDelete && confirmDelete && !window.confirm(labels.deleteConfirm(selectedRows.length))) return

          const ids = new Set(selectedRowIds)
          const nextRows = rows.filter((row, index) => !ids.has(resolveRowId(row, index)))
          updateRows(nextRows)
          await onDelete?.(selectedRows)
        },
      },
    ]
  }, [confirmDelete, defaultActions, labels, onBeforeDelete, onDelete, resolveRowId, rows, updateRows])

  return (
    <>
      <NTable
        {...tableProps}
        config={{ ...config, data: rows }}
        pagination={pagination}
        selectable={selectable}
        searchable={searchable}
        filterable={filterable}
        columnVisibility={columnVisibility}
        reorderableColumns={reorderableColumns}
        reorderableRows={reorderableRows}
        exportOptions={exportOptions}
        actions={[...builtInActions, ...actions]}
        labels={customLabels}
        getRowId={getRowId}
        onRowOrderChange={updateRowOrder}
        useTanStack
      />
      <EditRowDialog
        open={Boolean(editingRow)}
        row={editingRow?.value ?? null}
        columns={config.headers}
        labels={labels}
        onOpenChange={(open) => { if (!open) setEditingRow(null) }}
        onSave={saveEdit}
      />
    </>
  )
}
