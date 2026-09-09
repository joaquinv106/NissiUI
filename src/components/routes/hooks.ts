"use client"

import { useCallback, useMemo } from "react"

import { useNroutes } from "./context"
import { parseNRouteSearch, rawNRouteSearch } from "./search"
import type {
  NRouteNavigateOptions,
  NRouteSearchSchema,
  NRouteSearchValues,
  NRouteTarget,
  NSearchParamsUpdate,
  NSetSearchParamsOptions,
} from "./types"

export function useNNavigate() {
  return useNroutes().navigate
}

export function useNLocation() {
  return useNroutes().location
}

export function useNRouteParams() {
  return useNroutes().match?.params ?? {}
}

export function useNNavigation() {
  return useNroutes().navigation
}

export function useNRouteMatches() {
  return useNroutes().matches
}

export function useNLoaderData<T = unknown>(routeId?: string): T | undefined {
  const { match } = useNroutes()
  const id = routeId ?? match?.route.id
  return (id ? match?.loaderData[id] : undefined) as T | undefined
}

function applySearchUpdate(
  current: URLSearchParams,
  update: Exclude<NSearchParamsUpdate, Function>,
  mode: "merge" | "replace",
): URLSearchParams {
  const next = mode === "merge" ? new URLSearchParams(current) : new URLSearchParams()
  if (typeof update === "string" || update instanceof URLSearchParams) {
    const source = new URLSearchParams(update)
    if (mode === "replace") return source
    source.forEach((value, key) => next.set(key, value))
    return next
  }
  Object.entries(update).forEach(([key, value]) => {
    if (value === null || value === undefined) next.delete(key)
    else next.set(key, String(value))
  })
  return next
}

export function useNSearchParams(): [URLSearchParams, (update: NSearchParamsUpdate, options?: NSetSearchParamsOptions) => void] {
  const { location, navigate } = useNroutes()
  const setSearchParams = useCallback((update: NSearchParamsUpdate, options: NSetSearchParamsOptions = {}) => {
    const current = new URLSearchParams(location.searchParams)
    const resolved = typeof update === "function" ? update(current) : update
    const next = applySearchUpdate(current, resolved, options.mode ?? "replace")
    navigate({ search: next }, options)
  }, [location.searchParams, navigate])
  return [new URLSearchParams(location.searchParams), setSearchParams]
}

export function useNRouteSearch(): Readonly<Record<string, string | readonly string[]>>
export function useNRouteSearch<const TSchema extends NRouteSearchSchema>(schema: TSchema): NRouteSearchValues<TSchema>
export function useNRouteSearch<const TSchema extends NRouteSearchSchema>(schema?: TSchema) {
  const { location, match } = useNroutes()
  const activeSchema = schema ?? match?.route.search
  return useMemo(
    () => activeSchema ? parseNRouteSearch(activeSchema, location.searchParams) : rawNRouteSearch(location.searchParams),
    [activeSchema, location.search],
  )
}

/** Crea un hook sin argumentos vinculado a un schema y conserva inferencia completa. */
export function createNRouteSearchHook<const TSchema extends NRouteSearchSchema>(schema: TSchema) {
  return function useBoundNRouteSearch(): NRouteSearchValues<TSchema> {
    return useNRouteSearch(schema)
  }
}

export function useNCreateHref() {
  const { createLinkProps } = useNroutes()
  return useCallback((to: NRouteTarget, options?: NRouteNavigateOptions) => createLinkProps(to, options).href, [createLinkProps])
}
