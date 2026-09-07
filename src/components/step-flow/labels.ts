import type { NStepFlowLabels } from "./types"

export const defaultNStepFlowLabels: NStepFlowLabels = {
  flowLabel: "Flujo por pasos",
  stepsLabel: "Pasos del flujo",
  optional: "Opcional",
  previous: "Anterior",
  next: "Continuar",
  complete: "Finalizar",
  working: "Procesando",
  loading: "Cargando flujo",
  errorTitle: "No fue posible cargar el flujo",
  emptyTitle: "No hay pasos configurados",
  emptyDescription: "Agrega al menos un paso para iniciar el flujo.",
  validationError: "Revisa la información del paso antes de continuar.",
  stepAriaLabel: (title, index, count) => `${title}, paso ${index} de ${count}`,
}

export function resolveNStepFlowLabels(labels?: Partial<NStepFlowLabels>): NStepFlowLabels {
  return { ...defaultNStepFlowLabels, ...labels }
}
