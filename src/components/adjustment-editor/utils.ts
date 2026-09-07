import type { ReactNode } from "react"

import type { NAdjustmentField, NAdjustmentResult, NAdjustmentValue } from "./types"

export function adjustmentChangedFieldIds<T>(original: T, adjustment: T, fields: readonly NAdjustmentField<T>[]): string[] {
  return fields.filter((field) => {
    const before = field.getValue(original)
    const after = field.getValue(adjustment)
    return !(field.isEqual?.(before, after) ?? Object.is(before, after))
  }).map((field) => field.id)
}

export function parseAdjustmentValue<T>(field: NAdjustmentField<T>, rawValue: string, item: T): NAdjustmentValue {
  if (field.parseValue) return field.parseValue(rawValue, item)
  if (field.inputType === "number") return rawValue === "" ? null : Number(rawValue)
  return rawValue
}

export function adjustmentResultSucceeded(result: void | boolean | NAdjustmentResult): boolean {
  return result !== false && !(typeof result === "object" && result !== null && !result.success)
}

export function adjustmentResultMessage(result: void | boolean | NAdjustmentResult): ReactNode {
  return typeof result === "object" && result !== null ? result.message : undefined
}
