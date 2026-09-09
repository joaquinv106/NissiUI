"use client"

import { createContext, useContext } from "react"
import type { ReactNode } from "react"

import type { NRouteDefinition, NroutesContextValue, NTypedNroutesContextValue } from "./types"

export const NroutesContext = createContext<NroutesContextValue | null>(null)

export interface NRouteRenderContextValue {
  state: "ready" | "pending" | "not-found" | "forbidden" | "error"
  pendingFallback?: ReactNode
  notFoundFallback?: ReactNode
  forbiddenFallback?: ReactNode
  errorFallback?: ReactNode | ((error: unknown, match?: unknown) => ReactNode)
}

export const NRouteRenderContext = createContext<NRouteRenderContextValue>({ state: "not-found" })
export const NOutletDepthContext = createContext(0)

export function useNroutes<TData = unknown, TContext = unknown>(): NroutesContextValue<TData, TContext> {
  const context = useContext(NroutesContext)
  if (!context) throw new Error("useNroutes debe usarse dentro de Nroutes.")
  return context as NroutesContextValue<TData, TContext>
}

/** Vincula el contexto actual con los literales preservados por `defineNroutes()`. */
export function useNTypedNroutes<
  const TRoutes extends readonly NRouteDefinition[],
  TData = unknown,
  TContext = unknown,
>(_routes: TRoutes): NTypedNroutesContextValue<TRoutes, TData, TContext> {
  return useNroutes<TData, TContext>() as NTypedNroutesContextValue<TRoutes, TData, TContext>
}
