import type { NAdjustmentEditorLabels } from "./types"

export const defaultNAdjustmentEditorLabels: NAdjustmentEditorLabels = {
  editorLabel: "Editor de ajustes",
  originalTitle: "Valor original",
  adjustmentTitle: "Ajuste propuesto",
  originalValue: "Original",
  adjustedValue: "Ajustado",
  changed: "Modificado",
  reasonLabel: "Motivo del ajuste",
  reasonPlaceholder: "Describe por qué se requiere este cambio",
  reasonHelp: "El motivo formará parte del registro de auditoría.",
  reasonRequired: "Escribe el motivo del ajuste.",
  noChanges: "Realiza al menos un cambio antes de guardar.",
  reset: "Restablecer",
  submit: "Guardar ajuste",
  processing: "Guardando ajuste",
  validationFailed: "Revisa los datos del ajuste.",
  submitFailed: "No fue posible guardar el ajuste.",
  loading: "Cargando información",
  errorTitle: "No se pudo mostrar el ajuste",
  emptyTitle: "No hay un elemento seleccionado",
  emptyDescription: "Selecciona un elemento para consultar y ajustar sus valores.",
}

export function resolveNAdjustmentEditorLabels(labels?: Partial<NAdjustmentEditorLabels>): NAdjustmentEditorLabels {
  return { ...defaultNAdjustmentEditorLabels, ...labels }
}
