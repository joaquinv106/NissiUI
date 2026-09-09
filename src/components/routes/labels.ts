import type { NroutesLabels } from "./types"

export const defaultNroutesLabels: NroutesLabels = {
  loading: "Cargando contenido",
  notFoundTitle: "Página no encontrada",
  notFoundDescription: "La ruta solicitada no existe o ya no está disponible.",
  forbiddenTitle: "Acceso restringido",
  forbiddenDescription: "No tienes permiso para abrir esta página.",
  errorTitle: "No fue posible abrir la página",
  errorDescription: "Ocurrió un problema inesperado al cargar el contenido.",
  routeRegion: (title) => `Contenido de ${title}`,
  navigationProgress: "Cargando nueva página",
}

export const resolveNroutesLabels = (labels?: Partial<NroutesLabels>): NroutesLabels => ({
  ...defaultNroutesLabels,
  ...labels,
})
