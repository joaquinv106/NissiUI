"use client"

import { createContext, useContext, useMemo } from "react"

import type { NFactureContextValue, NFactureProviderProps } from "./types"

const NFactureContext = createContext<NFactureContextValue>({})

export function NissiInvoicingProvider({ data, adapter, children }: NFactureProviderProps) {
  const value = useMemo(() => ({ data, adapter }), [adapter, data])
  return <NFactureContext.Provider value={value}>{children}</NFactureContext.Provider>
}

export function useNFacture(): NFactureContextValue {
  return useContext(NFactureContext)
}
