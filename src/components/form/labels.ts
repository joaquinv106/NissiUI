import type { NFormLabels } from "./types"

export const defaultNFormLabels: NFormLabels = {
  requiredError: "Este campo es obligatorio.",
  minError: (min) => `Debe ser mayor o igual a ${min}.`,
  maxError: (max) => `Debe ser menor o igual a ${max}.`,
  minLengthError: (min) => `Debe tener al menos ${min} caracteres.`,
  maxLengthError: (max) => `Debe tener como máximo ${max} caracteres.`,
  patternError: "El formato no es válido.",
  selectPlaceholder: "Selecciona una opción…",
  create: "Crear",
  save: "Guardar cambios",
  cancel: "Cancelar",
  reset: "Restablecer",
  yes: "Sí",
  no: "No",
  submitSuccess: "Los cambios se guardaron correctamente.",
  submitError: "No se pudo guardar la información.",
  requiredFieldsNote: "Los campos marcados con * son obligatorios.",
}

/** Combina los textos predeterminados con los que el consumidor sobreescriba. */
export function resolveNFormLabels(labels?: Partial<NFormLabels>): NFormLabels {
  return { ...defaultNFormLabels, ...labels }
}
