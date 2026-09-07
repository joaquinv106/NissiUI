import type { NPanelLabels } from "./types"

export const defaultNPanelLabels: NPanelLabels = {
  defaultTitle: "Panel lateral",
  closePanel: "Cerrar panel lateral",
}

export function resolveNPanelLabels(labels?: Partial<NPanelLabels>): NPanelLabels {
  return { ...defaultNPanelLabels, ...labels }
}
