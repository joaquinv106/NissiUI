"use client"

import { Box } from "@chakra-ui/react"
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
  classNames,
  styles,
}: NPermissionGateProps) {
  const labels = useMemo(() => resolveNPermissionLabels(customLabels), [customLabels])
  const allowed = useCanAccess(requires, mode)

  if (allowed) return <Box display="contents" className={classNames?.root} css={styles?.root} data-scope="n-permission-gate" data-part="root">{children}</Box>
  if (behavior === "hide" || !isValidElement(children)) return <Box display="contents" className={classNames?.fallback} css={styles?.fallback} data-scope="n-permission-gate" data-part="fallback">{fallback}</Box>

  const disabledChild = cloneElement(children as ReactElement<{ disabled?: boolean; "aria-disabled"?: boolean }>, {
    disabled: true,
    "aria-disabled": true,
  })
  return <Box display="contents" className={classNames?.root} css={styles?.root} data-scope="n-permission-gate" data-part="root"><NTooltip content={labels.deniedTooltip}>{disabledChild}</NTooltip></Box>
}
