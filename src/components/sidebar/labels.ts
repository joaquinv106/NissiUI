import type { NSidebarLabels } from "./types"

export const defaultNSidebarLabels: NSidebarLabels = {
  navigationLabel: "Navegación principal",
  collapseSidebar: "Contraer menú lateral",
  expandSidebar: "Expandir menú lateral",
  openMobileMenu: "Abrir menú de navegación",
  closeMobileMenu: "Cerrar menú de navegación",
  searchPlaceholder: "Buscar en el menú…",
  searchAriaLabel: "Buscar opciones de navegación",
  emptySearch: "No se encontraron opciones.",
  expandGroup: (group) => `Expandir grupo ${group}`,
  collapseGroup: (group) => `Contraer grupo ${group}`,
}

/** Combina los textos predeterminados con los que el consumidor sobreescriba. */
export function resolveNSidebarLabels(labels?: Partial<NSidebarLabels>): NSidebarLabels {
  return { ...defaultNSidebarLabels, ...labels }
}
