import type { NThemeLabels, NThemePreference } from "./types"

export const defaultNThemeLabels: NThemeLabels = {
  selectorLabel: "Elegir tema",
  menuLabel: "Temas disponibles",
  lightTheme: "Claro",
  darkTheme: "Oscuro",
  navyTheme: "Azul marino",
  nissiTheme: "Nissi Dark",
  systemTheme: "Usar tema del sistema",
  currentTheme: (theme) => `Tema actual: ${theme}`,
}

/** Combina los textos predeterminados con las traducciones del consumidor. */
export function resolveNThemeLabels(labels?: Partial<NThemeLabels>): NThemeLabels {
  return { ...defaultNThemeLabels, ...labels }
}

export function getNThemeLabel(theme: NThemePreference, labels: NThemeLabels): string {
  if (theme === "light") return labels.lightTheme
  if (theme === "dark") return labels.darkTheme
  if (theme === "navy") return labels.navyTheme
  if (theme === "nissi") return labels.nissiTheme
  return labels.systemTheme
}
