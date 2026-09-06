"use client"

import { cloneElement, isValidElement, useMemo } from "react"
import type { ReactElement } from "react"

import { NTooltip } from "../internal/NTooltip"
import { resolveNPermissionLabels } from "./labels"
import type { NPermissionGateProps } from "./types"
import { useCanAccess } from "./useCanAccess"

/** Oculta o deshabilita su contenido cuando falta la capacidad requerida. */
export function NPermissionGate({
  requires,
  mode = "any",
  behavior = "hide",
  fallback = null,
  children,
  labels: customLabels,
}: NPermissionGateProps) {
  const labels = useMemo(() => resolveNPermissionLabels(customLabels), [customLabels])
  const allowed = useCanAccess(requires, mode)

  if (allowed) return <>{children}</>
  if (behavior === "hide" || !isValidElement(children)) return <>{fallback}</>

  const disabledChild = cloneElement(children as ReactElement<{ disabled?: boolean; "aria-disabled"?: boolean }>, {
    disabled: true,
    "aria-disabled": true,
  })
  return <NTooltip content={labels.deniedTooltip}>{disabledChild}</NTooltip>
}
