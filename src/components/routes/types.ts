import type { MouseEventHandler, ReactNode } from "react"

import type { NPermissionCapability, NPermissionMode } from "../permissions/types"
import type { NComponentStyleProps } from "../styling"

export type NRouteStrategy = "history" | "hash" | "memory"
export type NroutesSlot = "root" | "progress"
export type NRouteOutletSlot = "root" | "pending" | "notFound" | "forbidden" | "error"
export type NNavigationStatus = "idle" | "loading"

export interface NRouteLocation {
  pathname: string
  search: string
  searchParams: URLSearchParams
  hash: string
  state?: unknown
  key: string
}

export type NRouteTarget = string | {
  pathname?: string
  search?: string | URLSearchParams | Readonly<Record<string, string | number | boolean | null | undefined>>
  hash?: string
}

export interface NRouteRedirect {
  readonly type: "redirect"
  readonly to: NRouteTarget
  readonly replace?: boolean
  readonly state?: unknown
}

export interface NRouteTransitionContext<TContext = unknown, TData = unknown> {
  params: Readonly<Record<string, string>>
  location: NRouteLocation
  context: TContext
  signal: AbortSignal
  route: NRouteDefinition<TData, TContext>
}

export type NRouteGuardResult = void | boolean | NRouteRedirect

export interface NRouteDefinition<TData = unknown, TContext = unknown> {
  /** Identidad estable y única de la ruta. */
  id: string
  /** Patrón absoluto en raíz o relativo dentro de `children`. Admite `:param` y un comodín final `*`. */
  path: string
  /** Título legible usado para anunciar el cambio de vista y derivar breadcrumbs. */
  title: string | ((match: NRouteMatch<TData, TContext>) => string)
  element: ReactNode | ((match: NRouteMatch<TData, TContext>) => ReactNode)
  navigationId?: string
  /** Metadata estática; los resultados remotos pertenecen a `loaderData`. */
  data?: TData
  children?: readonly NRouteDefinition<TData, TContext>[]
  requiredPermission?: NPermissionCapability | NPermissionCapability[]
  permissionMode?: NPermissionMode
  beforeEnter?: (details: NRouteTransitionContext<TContext, TData>) => NRouteGuardResult | Promise<NRouteGuardResult>
  loader?: (details: NRouteTransitionContext<TContext, TData>) => unknown | Promise<unknown>
  preload?: () => void | Promise<unknown>
  errorElement?: ReactNode | ((error: unknown, match: NRouteMatch<TData, TContext>) => ReactNode)
  breadcrumb?: string | ((match: NRouteMatch<TData, TContext>) => string)
}

export interface NRouteMatchEntry<TData = unknown, TContext = unknown> {
  route: NRouteDefinition<TData, TContext>
  pathname: string
  params: Readonly<Record<string, string>>
  loaderData?: unknown
}

export interface NRouteMatch<TData = unknown, TContext = unknown> {
  /** Hoja de la branch; se conserva por compatibilidad con la API plana. */
  route: NRouteDefinition<TData, TContext>
  /** Pathname normalizado; se conserva por compatibilidad. */
  path: string
  params: Readonly<Record<string, string>>
  branch: readonly NRouteMatchEntry<TData, TContext>[]
  location: NRouteLocation
  loaderData: Readonly<Record<string, unknown>>
  error?: unknown
  errorRouteId?: string
}

export interface NRouteNavigateOptions {
  replace?: boolean
  state?: unknown
  /** Conserva la posición actual; por defecto una navegación push se mueve al inicio. */
  preventScrollReset?: boolean
}

export interface NNavigationState {
  status: NNavigationStatus
  from?: NRouteLocation
  to?: NRouteLocation
}

export interface NRouterAdapter {
  /** Location controlada por Next.js u otro router externo. */
  location: string | NRouteLocation
  navigate: (to: string, options?: NRouteNavigateOptions) => void
  createHref?: (to: string) => string
  prefetch?: (to: string) => void | Promise<unknown>
}

export interface NroutesContextValue<TData = unknown, TContext = unknown> {
  /** Alias del pathname conservado para compatibilidad. */
  path: string
  location: NRouteLocation
  match?: NRouteMatch<TData, TContext>
  matches: readonly NRouteMatchEntry<TData, TContext>[]
  navigation: NNavigationState
  labels: NroutesLabels
  navigate: (to: NRouteTarget, options?: NRouteNavigateOptions) => void
  prefetch: (to: NRouteTarget) => Promise<void>
  createLinkProps: (to: NRouteTarget, options?: NRouteNavigateOptions) => {
    href: string
    onClick: MouseEventHandler<HTMLAnchorElement>
  }
}

export interface NroutesLabels {
  loading: string
  notFoundTitle: string
  notFoundDescription: string
  forbiddenTitle: string
  forbiddenDescription: string
  errorTitle: string
  errorDescription: string
  routeRegion: (title: string) => string
  navigationProgress: string
}

export interface NroutesProps<TData = unknown, TContext = unknown> extends NComponentStyleProps<NroutesSlot> {
  routes: readonly NRouteDefinition<TData, TContext>[]
  children?: ReactNode
  strategy?: NRouteStrategy
  /** Adaptador opcional: el framework externo conserva el control de URL y navegación. */
  router?: NRouterAdapter
  context?: TContext
  /** Prefijo del pathname usado por `history`; no afecta los patrones declarados. */
  basePath?: string
  /** Path o URL relativa controlada. `location` es la alternativa rica recomendada. */
  path?: string
  location?: string | NRouteLocation
  defaultPath?: string
  onPathChange?: (path: string, match?: NRouteMatch<TData, TContext>) => void
  onLocationChange?: (location: NRouteLocation, match?: NRouteMatch<TData, TContext>) => void
  labels?: Partial<NroutesLabels>
  pendingFallback?: ReactNode
  notFoundFallback?: ReactNode
  forbiddenFallback?: ReactNode
  errorFallback?: ReactNode | ((error: unknown, match?: NRouteMatch<TData, TContext>) => ReactNode)
  scrollRestoration?: false | "top" | "restore"
  progress?: boolean
  progressDelay?: number
  colorPalette?: string
}

export interface NRouteOutletProps<TData = unknown, TContext = unknown> extends NComponentStyleProps<NRouteOutletSlot> {
  render?: (match: NRouteMatch<TData, TContext>, element: ReactNode) => ReactNode
  pendingFallback?: ReactNode
  notFoundFallback?: ReactNode
  forbiddenFallback?: ReactNode
  errorFallback?: ReactNode | ((error: unknown, match?: NRouteMatch<TData, TContext>) => ReactNode)
  /** Mueve el foco al contenido cuando termina la navegación. */
  focusOnNavigate?: boolean
}

export interface NLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: NRouteTarget
  replace?: boolean
  state?: unknown
  preventScrollReset?: boolean
  prefetch?: "none" | "intent"
}

export type NSearchParamsUpdate =
  | URLSearchParams
  | string
  | Readonly<Record<string, string | number | boolean | null | undefined>>
  | ((current: URLSearchParams) => URLSearchParams | string | Readonly<Record<string, string | number | boolean | null | undefined>>)

export interface NSetSearchParamsOptions extends NRouteNavigateOptions {
  /** `merge` conserva los parámetros existentes; `replace` sustituye el query completo. */
  mode?: "merge" | "replace"
}

export function isNRouteRedirect(value: unknown): value is NRouteRedirect {
  return typeof value === "object" && value !== null && (value as { type?: unknown }).type === "redirect"
}
