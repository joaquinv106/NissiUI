import type { MouseEventHandler, ReactNode } from "react"

import type { NComponentStyleProps } from "../styling"

export type NRouteStrategy = "history" | "hash" | "memory"
export type NroutesSlot = "root"
export type NRouteOutletSlot = "root" | "pending" | "notFound"

export interface NRouteDefinition<TData = unknown> {
  /** Identidad estable de la ruta. */
  id: string
  /** Patrón absoluto. Admite segmentos `:param` y un comodín final `*`. */
  path: string
  /** Título legible usado para anunciar el cambio de vista. */
  title: string
  element: ReactNode | ((match: NRouteMatch<TData>) => ReactNode)
  navigationId?: string
  data?: TData
}

export interface NRouteMatch<TData = unknown> {
  route: NRouteDefinition<TData>
  path: string
  params: Readonly<Record<string, string>>
}

export interface NRouteNavigateOptions {
  replace?: boolean
  state?: unknown
}

export interface NroutesContextValue<TData = unknown> {
  path: string
  match?: NRouteMatch<TData>
  labels: NroutesLabels
  navigate: (path: string, options?: NRouteNavigateOptions) => void
  createLinkProps: (path: string, options?: NRouteNavigateOptions) => {
    href: string
    onClick: MouseEventHandler<HTMLAnchorElement>
  }
}

export interface NroutesLabels {
  loading: string
  notFoundTitle: string
  notFoundDescription: string
  routeRegion: (title: string) => string
}

export interface NroutesProps<TData = unknown> extends NComponentStyleProps<NroutesSlot> {
  routes: readonly NRouteDefinition<TData>[]
  children?: ReactNode
  strategy?: NRouteStrategy
  /** Prefijo del pathname usado por `history`; no afecta los patrones declarados. */
  basePath?: string
  path?: string
  defaultPath?: string
  onPathChange?: (path: string, match?: NRouteMatch<TData>) => void
  labels?: Partial<NroutesLabels>
}

export interface NRouteOutletProps<TData = unknown> extends NComponentStyleProps<NRouteOutletSlot> {
  render?: (match: NRouteMatch<TData>, element: ReactNode) => ReactNode
  pendingFallback?: ReactNode
  notFoundFallback?: ReactNode
  /** Mueve el foco al contenido después de navegar con teclado o menús. */
  focusOnNavigate?: boolean
}
