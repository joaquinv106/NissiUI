import type { NLineItemField, NLineItemValue } from "./types"

export function parseLineItemValue<TLine>(field: NLineItemField<TLine>, rawValue: string, line: TLine): NLineItemValue {
  if (field.parseValue) return field.parseValue(rawValue, line)
  if (field.inputType === "number" && rawValue !== "") return Number(rawValue)
  return rawValue
}

export function moveLineItem<TLine>(lines: readonly TLine[], fromIndex: number, toIndex: number): TLine[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= lines.length || toIndex >= lines.length) {
    return [...lines]
  }
  const nextLines = [...lines]
  const [line] = nextLines.splice(fromIndex, 1)
  nextLines.splice(toIndex, 0, line)
  return nextLines
}
