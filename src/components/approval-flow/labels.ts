import type { NApprovalFlowLabels } from "./types"

export const defaultNApprovalFlowLabels: NApprovalFlowLabels = {
  flowLabel: "Flujo de aprobación",
  statusLabel: "Estado",
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  changesRequested: "Cambios solicitados",
  approve: "Aprobar",
  reject: "Rechazar",
  requestChanges: "Solicitar cambios",
  commentLabel: "Comentario",
  commentPlaceholder: "Agrega contexto para la decisión",
  commentHelp: "El comentario es opcional al aprobar y obligatorio para rechazar o solicitar cambios.",
  commentRequired: "Escribe un comentario antes de continuar.",
  processing: "Procesando decisión",
  decisionFailed: "No fue posible registrar la decisión.",
  historyTitle: "Historial",
  noHistory: "Todavía no hay decisiones registradas.",
  actorFallback: "Sistema",
  loading: "Cargando solicitud",
  errorTitle: "No fue posible cargar la solicitud",
  emptyTitle: "No hay una solicitud seleccionada",
  emptyDescription: "Selecciona una solicitud para revisar sus datos y tomar una decisión.",
}

export function resolveNApprovalFlowLabels(labels?: Partial<NApprovalFlowLabels>): NApprovalFlowLabels {
  return { ...defaultNApprovalFlowLabels, ...labels }
}
