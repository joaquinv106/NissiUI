import type { NLineItemEditorLabels } from "./types"

export const defaultNLineItemEditorLabels: NLineItemEditorLabels = {
  editorLabel: "Editor de partidas",
  itemColumn: "Elemento",
  addItems: "Agregar elementos",
  closeItems: "Cerrar selector",
  loading: "Cargando partidas",
  errorTitle: "No fue posible cargar las partidas",
  emptyTitle: "A\u00fan no hay partidas",
  emptyDescription: "Agrega un elemento para comenzar.",
  lineCount: (count) => `${count} ${count === 1 ? "partida" : "partidas"}`,
  removeLine: (lineLabel) => `Eliminar ${lineLabel}`,
  moveLineUp: (lineLabel) => `Mover ${lineLabel} hacia arriba`,
  moveLineDown: (lineLabel) => `Mover ${lineLabel} hacia abajo`,
  editField: (fieldLabel, lineLabel) => `${fieldLabel} de ${lineLabel}`,
}

export function resolveNLineItemEditorLabels(labels?: Partial<NLineItemEditorLabels>): NLineItemEditorLabels {
  return { ...defaultNLineItemEditorLabels, ...labels }
}
