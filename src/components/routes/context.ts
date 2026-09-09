"use client"

import { createContext, useContext } from "react"

import type { NroutesContextValue } from "./types"

export const NroutesContext = createContext<NroutesContextValue | null>(null)

export function useNroutes<TData = unknown>(): NroutesContextValue<TData> {
  const context = useContext(NroutesContext)
  if (!context) throw new Error("useNroutes debe usarse dentro de Nroutes.")
  return context as NroutesContextValue<TData>
}
