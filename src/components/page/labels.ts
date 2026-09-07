import type { NAsyncStateLabels, NBreadcrumbsLabels, NConfirmDialogLabels, NEmptyStateLabels } from "./types"

export const defaultNBreadcrumbsLabels: NBreadcrumbsLabels = {
  navigationLabel: "Ruta de navegación",
  overflowLabel: "Más niveles",
}

export const defaultNEmptyStateLabels: NEmptyStateLabels = {
  defaultTitle: "No hay información",
  defaultDescription: "Aún no existen elementos para mostrar.",
}

export const defaultNAsyncStateLabels: NAsyncStateLabels = {
  loading: "Cargando información",
  errorTitle: "No se pudo cargar la información",
  errorDescription: "Ocurrió un problema inesperado. Intenta nuevamente.",
  retry: "Reintentar",
  emptyTitle: "No hay resultados",
  emptyDescription: "No se encontró información para esta vista.",
}

export const defaultNConfirmDialogLabels: NConfirmDialogLabels = {
  defaultTitle: "Confirmar acción",
  defaultDescription: "Esta acción puede modificar la información actual.",
  confirm: "Confirmar",
  confirming: "Confirmando",
  cancel: "Cancelar",
  close: "Cerrar confirmación",
  failed: "No se pudo completar la acción.",
}

export const resolveLabels = <T extends object>(defaults: T, labels?: Partial<T>): T => ({ ...defaults, ...labels })
