import type { NDocumentViewLabels } from "./types"

export const defaultNDocumentViewLabels: NDocumentViewLabels = {
  documentLabel: "Vista de documento",
  metadataLabel: "Información del documento",
  actionsLabel: "Acciones del documento",
  processing: "Procesando acción",
  actionFailed: "No fue posible completar la acción.",
  print: "Imprimir",
  loading: "Cargando documento",
  errorTitle: "No se pudo mostrar el documento",
  emptyTitle: "No hay un documento seleccionado",
  emptyDescription: "Selecciona un documento para consultar su contenido.",
}

export function resolveNDocumentViewLabels(labels?: Partial<NDocumentViewLabels>): NDocumentViewLabels {
  return { ...defaultNDocumentViewLabels, ...labels }
}
