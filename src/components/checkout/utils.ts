import type { ReactNode } from "react"
import type { NCheckoutResult } from "./types"

export function checkoutSucceeded(result: void | boolean | NCheckoutResult): boolean {
  return result !== false && !(typeof result === "object" && result !== null && !result.success)
}

export function checkoutMessage(result: void | boolean | NCheckoutResult): ReactNode {
  return typeof result === "object" && result !== null ? result.message : undefined
}
