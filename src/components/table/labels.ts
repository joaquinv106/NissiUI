import type { NTableLabels } from "./types"

export const defaultNTableLabels: NTableLabels = {
  searchPlaceholder: "Buscar…",
  searchAriaLabel: "Buscar en la tabla",
  filterColumnPlaceholder: "Filtrar por…",
  filterColumnAriaLabel: "Columna para filtrar",
  filterValuePlaceholder: "Valor",
  filterValueAriaLabel: "Valor del filtro",
  showHideColumns: "Mostrar u ocultar columnas",
  copyTable: "Copiar tabla",
  copiedToClipboard: "Tabla copiada al portapapeles",
  copyToClipboardError: "No se pudo copiar la tabla al portapapeles",
  downloadExcel: "Descargar Excel",
  downloadPdf: "Descargar PDF",
  printTable: "Imprimir tabla",
  defaultTitle: "Tabla",
  selectVisibleRows: "Seleccionar filas visibles",
  selectRow: (rowNumber) => `Seleccionar fila ${rowNumber}`,
  selectedCount: (count) => `${count} ${count === 1 ? "seleccionado" : "seleccionados"}`,
  selectionActionsAriaLabel: "Acciones para filas seleccionadas",
  rowsPerPage: "Filas por página",
  pageStatus: (page, totalPages) => `Página ${page} de ${totalPages}`,
  previousPage: "Página anterior",
  nextPage: "Página siguiente",
  emptyMessage: "No hay registros para mostrar.",
  stackViewLabel: "Registros de la tabla",
  sortColumn: (column, direction) => {
    if (direction === "asc") return `${column}: orden ascendente. Activar para ordenar descendente.`
    if (direction === "desc") return `${column}: orden descendente. Activar para quitar el orden.`
    return `Ordenar ${column} de forma ascendente.`
  },
  moveColumn: (column) => `Mover columna ${column}. Arrastra o usa Alt y las flechas izquierda o derecha.`,
  reorderRowsColumn: "Controles para reordenar filas",
  moveRow: (rowNumber) => `Mover fila ${rowNumber}. Arrastra o usa Alt y las flechas arriba o abajo.`,
  edit: "Editar",
  delete: "Eliminar",
  deleteConfirm: (count) => `¿Eliminar ${count} registro(s)?`,
  editDialogTitle: "Editar registro",
  editDialogDescription: "Modifica los campos y guarda los cambios.",
  cancel: "Cancelar",
  saveChanges: "Guardar cambios",
  closeEdit: "Cerrar edición",
  yes: "Sí",
  no: "No",
  selectOption: "Selecciona una opción",
}

export function resolveNTableLabels(labels?: Partial<NTableLabels>): NTableLabels {
  return { ...defaultNTableLabels, ...labels }
}
