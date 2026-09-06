import type { NHeaderLabels } from "./types"

export const defaultNHeaderLabels: NHeaderLabels = {
  navigationLabel: "Navegación principal",
  mobileMenuTitle: "Menú de navegación",
  openMobileMenu: "Abrir menú de navegación",
  closeMobileMenu: "Cerrar menú de navegación",
  searchPlaceholder: "Buscar…",
  searchAriaLabel: "Buscar en la aplicación",
  userMenu: (name) => `Abrir menú de ${name}`,
  notifications: "Notificaciones",
  noNotifications: "No hay notificaciones.",
  unreadNotifications: (count) => `${count} notificaciones sin leer`,
  switchToLightTheme: "Cambiar a tema claro",
  switchToDarkTheme: "Cambiar a tema oscuro",
}

/** Combina los textos predeterminados con los que el consumidor sobreescriba. */
export function resolveNHeaderLabels(labels?: Partial<NHeaderLabels>): NHeaderLabels {
  return { ...defaultNHeaderLabels, ...labels }
}
