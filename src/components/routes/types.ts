import type { ComponentType, MouseEventHandler, ReactNode } from "react"

import type { NPermissionCapability, NPermissionMode } from "../permissions/types"
import type { NComponentStyleProps } from "../styling"

export type NRouteStrategy = "history" | "hash" | "memory"
export type NroutesSlot = "root" | "progress"
export type NRouteOutletSlot = "root" | "pending" | "notFound" | "forbidden" | "error"
export type NNavigationStatus = "idle" | "loading"
export type NRouteNavigationAction = "push" | "replace" | "traverse" | "unload"

export interface NRouteLocation {
  pathname: string
  search: string
  searchParams: URLSearchParams
  hash: string
  state?: unknown
  key: string
}

export interface NRoutePathTarget {
  pathname?: string
  search?: string | URLSearchParams | Readonly<Record<string, string | number | boolean | null | undefined>>
  hash?: string
}

export type NRouteSearchSerialized = string | readonly string[] | undefined

/** Codec pequeño y extensible para un search param; no depende de un validador externo. */
export interface NRouteSearchCodec<TValue> {
  parse(values: readonly string[]): TValue
  serialize(value: TValue): NRouteSearchSerialized
}

/** Codec creado por los helpers incluidos, con soporte encadenable para valores predeterminados. */
export interface NRouteSearchParam<TValue> extends NRouteSearchCodec<TValue> {
  default<TDefault extends Exclude<TValue, undefined>>(value: TDefault): NRouteSearchParam<Exclude<TValue, undefined>>
}

export type NRouteSearchSchema = Readonly<Record<string, NRouteSearchCodec<unknown>>>

export type NRouteSearchValues<TSchema extends NRouteSearchSchema> = Readonly<{
  [TKey in keyof TSchema]: TSchema[TKey] extends NRouteSearchCodec<infer TValue> ? TValue : never
}>

export type NRouteSearchInput<TSchema extends NRouteSearchSchema> = Readonly<{
  [TKey in keyof TSchema]?: (TSchema[TKey] extends NRouteSearchCodec<infer TValue> ? TValue : never) | null
}>

export interface NRouteIdTarget {
  route: string
  params?: Readonly<Record<string, string | number>>
  search?: NRoutePathTarget["search"]
  hash?: string
}

export type NRouteTarget = string | NRoutePathTarget | NRouteIdTarget

type NJoinRoutePath<TParent extends string, TPath extends string> = TPath extends `/${string}`
  ? TPath
  : TParent extends "" | "/" ? `/${TPath}` : `${TParent}/${TPath}`

type NPathParamKeys<TPath extends string> =
  TPath extends `${string}:${infer TParam}/${infer TRest}` ? TParam | NPathParamKeys<`/${TRest}`>
    : TPath extends `${string}:${infer TParam}` ? TParam
      : TPath extends `${string}*${string}` ? "*"
        : never

type NTypedRouteSearch<TSearch> = TSearch extends NRouteSearchSchema
  ? string | URLSearchParams | NRouteSearchInput<TSearch>
  : NRoutePathTarget["search"]

type NTypedRouteById<TId extends string, TPath extends string, TSearch> = {
  route: TId
  search?: NTypedRouteSearch<TSearch>
  hash?: string
} & ([NPathParamKeys<TPath>] extends [never]
  ? { params?: never }
  : { params: { readonly [TKey in NPathParamKeys<TPath>]: string | number } })

type NRouteTargetsFromTree<TRoutes, TParent extends string = ""> = TRoutes extends readonly unknown[]
  ? TRoutes[number] extends infer TRoute
    ? TRoute extends { id: infer TId extends string; path: infer TPath extends string }
      ? NTypedRouteById<TId, NJoinRoutePath<TParent, TPath>, TRoute extends { search: infer TSearch } ? TSearch : never>
        | (TRoute extends { children: infer TChildren }
          ? NRouteTargetsFromTree<TChildren, NJoinRoutePath<TParent, TPath>>
          : never)
      : never
    : never
  : never

export type NTypedRouteTarget<TRoutes extends readonly NRouteDefinition[]> =
  | string
  | (NRoutePathTarget & { route?: never })
  | NRouteTargetsFromTree<TRoutes>

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
  /** Resultados ya resueltos. Sólo las dependencias declaradas están garantizadas para un loader. */
  loaderData: Readonly<Record<string, unknown>>
}

export interface NRouteShouldReloadDetails<TData = unknown, TContext = unknown> {
  current: NRouteMatchEntry<TData, TContext>
  next: NRouteMatchEntry<TData, TContext>
  currentLocation: NRouteLocation
  nextLocation: NRouteLocation
  changedParams: readonly string[]
  changedSearch: readonly string[]
  hashChanged: boolean
}

export type NRouteRevalidationPolicy<TData = unknown, TContext = unknown> =
  | "always"
  | "params"
  | "search"
  | "never"
  | ((details: NRouteShouldReloadDetails<TData, TContext>) => boolean)

export type NRouteCacheMode = "cache-first" | "network-first" | "stale-while-revalidate"

export interface NRouteCachePolicy {
  mode?: NRouteCacheMode
  /** Tiempo en milisegundos durante el que un resultado se considera fresh. */
  staleTime?: number
  /** Tiempo en milisegundos sin uso tras el que el resultado puede recolectarse. */
  gcTime?: number
  tags?: readonly string[]
}

export interface NRouteCacheInvalidation {
  routeIds?: readonly string[]
  tags?: readonly string[]
}

export type NRouteGuardResult = void | boolean | NRouteRedirect

export interface NRouteModule<TData = unknown, TContext = unknown> {
  Component?: ComponentType
  loader?: (details: NRouteTransitionContext<TContext, TData>) => unknown | Promise<unknown>
  beforeEnter?: (details: NRouteTransitionContext<TContext, TData>) => NRouteGuardResult | Promise<NRouteGuardResult>
  ErrorBoundary?: ComponentType<{ error: unknown; match: NRouteMatch<TData, TContext> }>
  pendingElement?: ReactNode
  data?: TData
  breadcrumb?: string | ((match: NRouteMatch<TData, TContext>) => string)
  preload?: () => void | Promise<unknown>
}

export interface NRouteDefinition<TData = unknown, TContext = unknown> {
  /** Identidad estable y única de la ruta. */
  id: string
  /** Patrón absoluto en raíz o relativo dentro de `children`. Admite `:param` y un comodín final `*`. */
  path: string
  /** Título legible usado para anunciar el cambio de vista y derivar breadcrumbs. */
  title: string | ((match: NRouteMatch<TData, TContext>) => string)
  element?: ReactNode | ((match: NRouteMatch<TData, TContext>) => ReactNode)
  /** Import explícito y deduplicado del módulo de ruta; `id`, `path`, permisos y `title` permanecen eager. */
  lazy?: () => Promise<NRouteModule<TData, TContext>>
  /** Fallback disponible antes de que el módulo lazy haya terminado de importar. */
  pendingElement?: ReactNode
  navigationId?: string
  /** Metadata estática; los resultados remotos pertenecen a `loaderData`. */
  data?: TData
  children?: readonly NRouteDefinition<TData, TContext>[]
  requiredPermission?: NPermissionCapability | NPermissionCapability[]
  permissionMode?: NPermissionMode
  beforeEnter?: (details: NRouteTransitionContext<TContext, TData>) => NRouteGuardResult | Promise<NRouteGuardResult>
  loader?: (details: NRouteTransitionContext<TContext, TData>) => unknown | Promise<unknown>
  /** Ids de loaders de la misma branch que deben terminar antes de ejecutar este loader. */
  dependsOn?: readonly string[]
  /** Controla si guards/loaders de un segmento retenido vuelven a ejecutarse. El default responde a sus params. */
  revalidate?: NRouteRevalidationPolicy<TData, TContext>
  /** Search params que afectan a esta ruta cuando `revalidate` no se declara. */
  reloadOnSearch?: readonly string[]
  /** Schema opcional para leer y serializar search params con tipos sin retirar URLSearchParams. */
  search?: NRouteSearchSchema
  /** Caché acotado al loader de esta ruta. `false` fuerza red en cada ejecución. */
  cache?: false | NRouteCachePolicy
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

export interface NRouteRetainedEntry<TData = unknown, TContext = unknown> {
  current: NRouteMatchEntry<TData, TContext>
  next: NRouteMatchEntry<TData, TContext>
  changedParams: readonly string[]
  shouldReload: boolean
}

export interface NRouteTransition<TData = unknown, TContext = unknown> {
  from?: NRouteMatch<TData, TContext>
  to: NRouteMatch<TData, TContext>
  /** Orden padre → hijo. */
  retained: readonly NRouteRetainedEntry<TData, TContext>[]
  /** Orden padre → hijo. */
  entering: readonly NRouteMatchEntry<TData, TContext>[]
  /** Orden hijo → padre para facilitar cleanup. */
  leaving: readonly NRouteMatchEntry<TData, TContext>[]
  changes: {
    pathname: boolean
    search: readonly string[]
    hash: boolean
  }
}

export interface NRouteNavigateOptions {
  replace?: boolean
  state?: unknown
  /** Conserva la posición actual; por defecto una navegación push se mueve al inicio. */
  preventScrollReset?: boolean
}

export interface NRouteBlockerDetails {
  from: NRouteLocation
  to: NRouteLocation
  action: NRouteNavigationAction
}

export type NRouteBlockerCondition = boolean | ((details: NRouteBlockerDetails) => boolean)

export interface NRouteBlocker {
  state: "idle" | "blocked"
  from?: NRouteLocation
  to?: NRouteLocation
  action?: NRouteNavigationAction
  /** Continúa exclusivamente la navegación pendiente, sin evaluar otra vez los blockers. */
  proceed: () => void
  /** Cancela la navegación pendiente y conserva la location actual. */
  reset: () => void
}

export interface NNavigationState<TData = unknown, TContext = unknown> {
  status: NNavigationStatus
  from?: NRouteLocation
  to?: NRouteLocation
  transition?: NRouteTransition<TData, TContext>
}

export interface NRouterAdapter {
  /** Location controlada por Next.js u otro router externo. */
  location: string | NRouteLocation
  navigate: (to: string, options?: NRouteNavigateOptions) => void
  createHref?: (to: string) => string
  prefetch?: (to: string) => void | Promise<unknown>
  back?: () => void
  forward?: () => void
}

export interface NroutesContextValue<TData = unknown, TContext = unknown> {
  /** Alias del pathname conservado para compatibilidad. */
  path: string
  location: NRouteLocation
  match?: NRouteMatch<TData, TContext>
  matches: readonly NRouteMatchEntry<TData, TContext>[]
  navigation: NNavigationState<TData, TContext>
  labels: NroutesLabels
  navigate: (to: NRouteTarget, options?: NRouteNavigateOptions) => void
  replace: (to: NRouteTarget, options?: Omit<NRouteNavigateOptions, "replace">) => void
  back: () => void
  forward: () => void
  prefetch: (to: NRouteTarget) => Promise<void>
  href: (to: NRouteTarget) => string
  invalidate: (filter: NRouteCacheInvalidation) => void
  invalidateRoute: (routeId: string) => void
  /** Invalida y vuelve a resolver la branch activa. */
  revalidate: () => void
  clearCache: () => void
  /** Descarta un módulo importado y reintenta la branch activa. */
  retryRouteModule: (routeId?: string) => void
  createLinkProps: (to: NRouteTarget, options?: NRouteNavigateOptions) => {
    href: string
    onClick: MouseEventHandler<HTMLAnchorElement>
  }
}

export type NTypedNroutesContextValue<
  TRoutes extends readonly NRouteDefinition[],
  TData = unknown,
  TContext = unknown,
> = Omit<NroutesContextValue<TData, TContext>, "navigate" | "replace" | "prefetch" | "href" | "createLinkProps"> & {
  navigate: (to: NTypedRouteTarget<TRoutes>, options?: NRouteNavigateOptions) => void
  replace: (to: NTypedRouteTarget<TRoutes>, options?: Omit<NRouteNavigateOptions, "replace">) => void
  prefetch: (to: NTypedRouteTarget<TRoutes>) => Promise<void>
  href: (to: NTypedRouteTarget<TRoutes>) => string
  createLinkProps: (to: NTypedRouteTarget<TRoutes>, options?: NRouteNavigateOptions) => {
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
