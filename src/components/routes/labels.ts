import type { NroutesLabels } from "./types"

export const defaultNroutesLabels: NroutesLabels = {
  loading: "Cargando contenido",
  notFoundTitle: "Página no encontrada",
  notFoundDescription: "La ruta solicitada no existe o ya no está disponible.",
  routeRegion: (title) => `Contenido de ${title}`,
}

export const resolveNroutesLabels = (labels?: Partial<NroutesLabels>): NroutesLabels => ({
  ...defaultNroutesLabels,
  ...labels,
})
