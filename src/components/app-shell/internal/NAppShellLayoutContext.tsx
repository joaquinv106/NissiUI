import { createContext, type ReactNode, useContext } from "react"

export type NAppShellSidebarPosition = "start" | "end"

interface NAppShellLayoutValue {
  sidebarPosition: NAppShellSidebarPosition
}

const defaultLayout: NAppShellLayoutValue = { sidebarPosition: "start" }
const NAppShellLayoutContext = createContext<NAppShellLayoutValue>(defaultLayout)

export function NAppShellLayoutProvider({
  children,
  sidebarPosition,
}: {
  children: ReactNode
  sidebarPosition: NAppShellSidebarPosition
}) {
  return (
    <NAppShellLayoutContext.Provider value={{ sidebarPosition }}>
      {children}
    </NAppShellLayoutContext.Provider>
  )
}

export function useNAppShellLayout(): NAppShellLayoutValue {
  return useContext(NAppShellLayoutContext)
}
