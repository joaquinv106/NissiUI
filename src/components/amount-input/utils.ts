export function amountToText(
  value: number | null | undefined,
  locale?: string,
  formatOptions?: Intl.NumberFormatOptions,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return ""
  return formatOptions ? new Intl.NumberFormat(locale, formatOptions).format(value) : String(value)
}

/** Texto numérico sin adornos para editar sin pelear con símbolos, grupos o ceros decimales. */
export function amountToEditableText(
  value: number | null | undefined,
  locale?: string,
  formatOptions?: Intl.NumberFormatOptions,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return ""
  const numericValue = formatOptions?.style === "percent" ? value * 100 : value
  const resolved = new Intl.NumberFormat(locale, formatOptions).resolvedOptions()
  return new Intl.NumberFormat(locale, {
    numberingSystem: resolved.numberingSystem,
    useGrouping: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.max(resolved.maximumFractionDigits ?? 0, 12),
  }).format(numericValue)
}

export function amountFromNumber(value: number): number | null {
  return Number.isFinite(value) ? value : null
}

export function parseAmountText(valueText: string, locale?: string, formatOptions?: Intl.NumberFormatOptions): number | null {
  if (!valueText.trim()) return null
  const parts = new Intl.NumberFormat(locale, formatOptions).formatToParts(-12345.6)
  const group = parts.find((part) => part.type === "group")?.value
  const decimal = parts.find((part) => part.type === "decimal")?.value
  const minusSign = parts.find((part) => part.type === "minusSign")?.value
  let normalized = valueText.replace(/[\s\u00a0\u202f]/gu, "")
  if (group) normalized = normalized.split(group).join("")
  if (decimal && decimal !== ".") normalized = normalized.split(decimal).join(".")
  if (minusSign && minusSign !== "-") normalized = normalized.split(minusSign).join("-")
  normalized = normalized.replace(/[^0-9.+-]/gu, "")
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) return null
  return formatOptions?.style === "percent" ? parsed / 100 : parsed
}
