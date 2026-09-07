import type { ReactNode } from "react"
import type { NCodeCaptureResult } from "./types"

export function codeCaptureSucceeded(result: void | boolean | NCodeCaptureResult): boolean {
  return result !== false && !(typeof result === "object" && result !== null && !result.success)
}

export function codeCaptureMessage(result: void | boolean | NCodeCaptureResult): ReactNode {
  return typeof result === "object" && result !== null ? result.message : undefined
}
