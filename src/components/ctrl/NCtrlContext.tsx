"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

import type { NCtrlProviderProps, NCtrlShortcut } from "./types"

type ShortcutReader = () => NCtrlShortcut

interface NCtrlContextValue {
  shortcuts: readonly NCtrlShortcut[]
  register: (id: string, reader: ShortcutReader) => () => void
  refresh: () => void
}

const NCtrlContext = createContext<NCtrlContextValue | undefined>(undefined)

export function NCtrlProvider({ children }: NCtrlProviderProps) {
  const readers = useRef(new Map<string, ShortcutReader>())
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((current) => current + 1), [])
  const register = useCallback((id: string, reader: ShortcutReader) => {
    readers.current.set(id, reader)
    refresh()
    return () => {
      if (readers.current.get(id) === reader) {
        readers.current.delete(id)
        refresh()
      }
    }
  }, [refresh])
  const shortcuts = useMemo(() => [...readers.current.values()].map((reader) => reader()), [version])
  const context = useMemo(() => ({ shortcuts, register, refresh }), [register, refresh, shortcuts])
  return <NCtrlContext.Provider value={context}>{children}</NCtrlContext.Provider>
}

export function useNCtrlShortcut(shortcut: NCtrlShortcut) {
  const context = useContext(NCtrlContext)
  const register = context?.register
  const refresh = context?.refresh
  const shortcutRef = useRef(shortcut)
  shortcutRef.current = shortcut
  const signature = JSON.stringify({ ...shortcut, icon: undefined, handler: undefined })
  useEffect(() => {
    if (!register) return
    return register(shortcut.id, () => shortcutRef.current)
  }, [register, shortcut.id])
  useEffect(() => { refresh?.() }, [refresh, signature])
}

export function useNCtrlShortcuts(shortcuts: readonly NCtrlShortcut[]) {
  const context = useContext(NCtrlContext)
  const register = context?.register
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts
  const signature = JSON.stringify(shortcuts.map(({ icon: _icon, handler: _handler, ...shortcut }) => shortcut))
  useEffect(() => {
    if (!register) return
    const unregister = shortcutsRef.current.map((shortcut, index) => register(shortcut.id, () => shortcutsRef.current[index] ?? shortcut))
    return () => unregister.forEach((dispose) => dispose())
  }, [register, signature])
}

export function useRegisteredNCtrlShortcuts(): readonly NCtrlShortcut[] {
  return useContext(NCtrlContext)?.shortcuts ?? []
}
