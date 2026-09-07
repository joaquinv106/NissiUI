import type { ReactNode } from "react"

import type { NDocumentActionResult } from "./types"

export function documentActionSucceeded(result: void | boolean | NDocumentActionResult): boolean {
  return result !== false && !(typeof result === "object" && result !== null && !result.success)
}

export function documentActionMessage(result: void | boolean | NDocumentActionResult): ReactNode {
  return typeof result === "object" && result !== null ? result.message : undefined
}
