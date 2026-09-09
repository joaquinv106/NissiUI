"use client"

import { forwardRef } from "react"

import { useNroutes } from "./context"
import { resolveRouteTarget } from "./location"
import type { NLinkProps } from "./types"

/** Enlace semántico que conserva el comportamiento nativo y añade navegación SPA/prefetch por intención. */
export const NLink = forwardRef<HTMLAnchorElement, NLinkProps>(function NLink({
  to,
  replace,
  state,
  preventScrollReset,
  prefetch = "none",
  onClick,
  onPointerEnter,
  onFocus,
  ...props
}, ref) {
  const router = useNroutes()
  const link = router.createLinkProps(to, { replace, state, preventScrollReset })
  const current = resolveRouteTarget(to, router.location).pathname === router.location.pathname
  const prepare = () => {
    if (prefetch === "intent") void router.prefetch(to)
  }
  return (
    <a
      {...props}
      ref={ref}
      href={link.href}
      aria-current={props["aria-current"] ?? (current ? "page" : undefined)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) link.onClick(event)
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        if (!event.defaultPrevented) prepare()
      }}
      onFocus={(event) => {
        onFocus?.(event)
        if (!event.defaultPrevented) prepare()
      }}
    />
  )
})
