import { Flex, HStack, IconButton, NativeSelect, Text } from "@chakra-ui/react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { NTooltip } from "../../internal/NTooltip"
import type { NTableLabels, NTablePaginationOptions, NTableRow } from "../types"

interface TablePaginationProps<T extends NTableRow> {
  table: TanStackTable<T>
  options: NTablePaginationOptions
  labels: NTableLabels
}

/** Controles de paginación: tamaño de página, estado "Página X de Y" y navegación. */
export function TablePagination<T extends NTableRow>({ table, options, labels }: TablePaginationProps<T>) {
  if (table.getPageCount() === 0) return null

  return (
    <Flex justify="space-between" align={{ base: "stretch", md: "center" }} gap="3" direction={{ base: "column", md: "row" }}>
      <HStack>
        <Text color="fg.muted" textStyle="sm">{labels.rowsPerPage}</Text>
        <NativeSelect.Root size="sm" width="20">
          <NativeSelect.Field
            aria-label={labels.rowsPerPage}
            value={table.getState().pagination.pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
          >
            {(options.pageSizeOptions ?? [5, 10, 20, 50]).map((value) => <option key={value} value={value}>{value}</option>)}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </HStack>
      <HStack justify="space-between">
        <Text textStyle="sm">{labels.pageStatus(table.getState().pagination.pageIndex + 1, table.getPageCount())}</Text>
        <HStack gap="1">
          <NTooltip content={labels.previousPage} disabled={!table.getCanPreviousPage()}>
            <IconButton size="sm" variant="outline" aria-label={labels.previousPage} disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
              <ChevronLeft size={16} />
            </IconButton>
          </NTooltip>
          <NTooltip content={labels.nextPage} disabled={!table.getCanNextPage()}>
            <IconButton size="sm" variant="outline" aria-label={labels.nextPage} disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
              <ChevronRight size={16} />
            </IconButton>
          </NTooltip>
        </HStack>
      </HStack>
    </Flex>
  )
}
