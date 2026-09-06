export function normalizeItemPickerText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .trim()
}

export function uniqueItemPickerIds(ids: readonly string[]): string[] {
  return [...new Set(ids)]
}
