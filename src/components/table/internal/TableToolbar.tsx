import {
  Check,
  Clipboard,
  Download,
  FileSpreadsheet,
  Printer,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Input,
  Menu,
  NativeSelect,
  Portal,
  Toast,
  Toaster,
  createToaster,
} from "@chakra-ui/react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import { useMemo } from "react"

import { NTooltip } from "../../internal/NTooltip"
import { copyTable, exportTableToExcel, exportTableToPdf, printTable } from "../exporters"
import type { NTableColumn, NTableExportOptions, NTableLabels, NTableRow } from "../types"

interface TableToolbarProps<T extends NTableRow> {
  table: TanStackTable<T>
  columns: NTableColumn<T>[]
  visibleColumns: NTableColumn<T>[]
  rows: T[]
  searchable: boolean
  filterable: boolean
  columnVisibility: boolean
  exportOptions: NTableExportOptions | null
  search: string
  filterColumn: string
  filterValue: string
  title: string
  labels: NTableLabels
  onSearchChange: (value: string) => void
  onFilterColumnChange: (value: string) => void
  onFilterValueChange: (value: string) => void
}

/** Barra de búsqueda, filtro y acciones de exportación/copiado sobre la tabla completa. */
export function TableToolbar<T extends NTableRow>({
  table,
  columns,
  visibleColumns,
  rows,
  searchable,
  filterable,
  columnVisibility,
  exportOptions,
  search,
  filterColumn,
  filterValue,
  title,
  labels,
  onSearchChange,
  onFilterColumnChange,
  onFilterValueChange,
}: TableToolbarProps<T>) {
  const fileName = exportOptions?.fileName ?? "nissi-table"
  const canCopy = Boolean(exportOptions && exportOptions.copy !== false)
  const toaster = useMemo(
    () => createToaster({ placement: "bottom-end", max: 2, duration: 3000, overlap: true, gap: 12 }),
    [],
  )

  const handleCopy = async () => {
    try {
      await copyTable(rows, visibleColumns)
      toaster.success({ title: labels.copiedToClipboard })
    } catch {
      toaster.error({ title: labels.copyToClipboardError })
    }
  }

  return (
    <>
    <Flex gap="2" direction={{ base: "column", lg: "row" }} justify="space-between" minW="0">
      <Flex gap="2" direction={{ base: "column", md: "row" }} flex="1" minW="0">
        {searchable ? (
          <HStack
            borderWidth="1px"
            borderColor="border"
            rounded="md"
            px="3"
            flex={{ md: "1 1 14rem" }}
            minW="0"
            _focusWithin={{ borderColor: "colorPalette.solid", boxShadow: "0 0 0 1px var(--chakra-colors-color-palette-solid)" }}
          >
            <Search size={16} aria-hidden="true" />
            <Input
              aria-label={labels.searchAriaLabel}
              placeholder={labels.searchPlaceholder}
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              border="0"
              px="0"
              outline="none"
              _focusVisible={{ boxShadow: "none", outline: "none" }}
            />
          </HStack>
        ) : null}
        {filterable ? (
          <Flex align="stretch" gap="2" flex={{ md: "1 1 22rem" }} minW="0" wrap={{ base: "wrap", sm: "nowrap" }}>
            <NativeSelect.Root flex={{ base: "1 1 100%", sm: "0 1 10rem" }} minW="0">
              <NativeSelect.Field
                aria-label={labels.filterColumnAriaLabel}
                value={filterColumn}
                onChange={(event) => onFilterColumnChange(event.target.value)}
              >
                <option value="">{labels.filterColumnPlaceholder}</option>
                {columns.filter((column) => column.filterable !== false).map((column) => (
                  <option key={column.key} value={column.key}>{column.header}</option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <Input
              aria-label={labels.filterValueAriaLabel}
              placeholder={labels.filterValuePlaceholder}
              value={filterValue}
              disabled={!filterColumn}
              flex="1 1 10rem"
              minW="0"
              onChange={(event) => onFilterValueChange(event.target.value)}
            />
          </Flex>
        ) : null}
      </Flex>

      <Flex gap="1" justify={{ base: "start", sm: "end", lg: "initial" }} wrap="wrap">
        {columnVisibility ? (
          <Menu.Root closeOnSelect={false}>
            <NTooltip content={labels.showHideColumns}>
              <Box as="span" display="inline-flex">
                <Menu.Trigger asChild>
                  <IconButton variant="outline" aria-label={labels.showHideColumns}>
                    <SlidersHorizontal size={17} />
                  </IconButton>
                </Menu.Trigger>
              </Box>
            </NTooltip>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  {table.getAllLeafColumns().filter((column) => column.getCanHide()).map((column) => (
                    <Menu.CheckboxItem
                      key={column.id}
                      value={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(checked) => column.toggleVisibility(Boolean(checked))}
                    >
                      <Menu.ItemIndicator><Check size={14} /></Menu.ItemIndicator>
                      {columns.find((item) => item.key === column.id)?.header}
                    </Menu.CheckboxItem>
                  ))}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        ) : null}
        {canCopy ? (
          <NTooltip content={labels.copyTable}>
            <IconButton variant="outline" aria-label={labels.copyTable} onClick={() => void handleCopy()}>
              <Clipboard size={17} />
            </IconButton>
          </NTooltip>
        ) : null}
        {exportOptions && exportOptions.excel !== false ? (
          <NTooltip content={labels.downloadExcel}>
            <IconButton variant="outline" aria-label={labels.downloadExcel} onClick={() => void exportTableToExcel(rows, visibleColumns, fileName)}>
              <FileSpreadsheet size={17} />
            </IconButton>
          </NTooltip>
        ) : null}
        {exportOptions && exportOptions.pdf !== false ? (
          <NTooltip content={labels.downloadPdf}>
            <IconButton variant="outline" aria-label={labels.downloadPdf} onClick={() => void exportTableToPdf(rows, visibleColumns, fileName)}>
              <Download size={17} />
            </IconButton>
          </NTooltip>
        ) : null}
        {exportOptions && exportOptions.print !== false ? (
          <NTooltip content={labels.printTable}>
            <IconButton variant="outline" aria-label={labels.printTable} onClick={() => printTable(rows, visibleColumns, title)}>
              <Printer size={17} />
            </IconButton>
          </NTooltip>
        ) : null}
      </Flex>
    </Flex>
    {canCopy ? <Portal>
      <Toaster
        toaster={toaster}
        insetInline={{ base: "4", md: "auto" }}
        insetBlockEnd="4"
        zIndex="max"
      >
        {(toast) => (
          <Toast.Root width={{ base: "auto", md: "sm" }} maxW="calc(100vw - 2rem)">
            <Toast.Indicator />
            <Toast.Title whiteSpace="normal" wordBreak="break-word">{toast.title}</Toast.Title>
            <Toast.CloseTrigger />
          </Toast.Root>
        )}
      </Toaster>
    </Portal> : null}
    </>
  )
}
