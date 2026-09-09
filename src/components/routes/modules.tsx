import { createElement } from "react"

import type { NRouteDefinition, NRouteMatch, NRouteModule } from "./types"

export class NRouteModuleError extends Error {
  readonly routeId: string
  readonly routeIndex: number
  readonly cause: unknown

  constructor(routeId: string, routeIndex: number, cause: unknown) {
    super(`No se pudo cargar el módulo de la ruta "${routeId}".`)
    this.name = "NRouteModuleError"
    this.routeId = routeId
    this.routeIndex = routeIndex
    this.cause = cause
  }
}

interface ModuleRecord<TData, TContext> {
  module?: NRouteModule<TData, TContext>
  pending?: Promise<NRouteModule<TData, TContext>>
}

function abortError(): DOMException {
  return new DOMException("Navigation aborted", "AbortError")
}

function awaitWithSignal<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(abortError())
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortError())
    signal.addEventListener("abort", onAbort, { once: true })
    promise.then(
      (value) => { signal.removeEventListener("abort", onAbort); resolve(value) },
      (error) => { signal.removeEventListener("abort", onAbort); reject(error) },
    )
  })
}

/** Registro por instancia que deduplica imports y permite reintentar chunks fallidos. */
export class NRouteModuleRegistry<TData = unknown, TContext = unknown> {
  private readonly records = new Map<string, ModuleRecord<TData, TContext>>()

  async load(route: NRouteDefinition<TData, TContext>, signal: AbortSignal): Promise<NRouteModule<TData, TContext> | undefined> {
    if (!route.lazy) return undefined
    const existing = this.records.get(route.id)
    if (existing?.module) return existing.module
    if (existing?.pending) return awaitWithSignal(existing.pending, signal)

    const record: ModuleRecord<TData, TContext> = {}
    const pending = Promise.resolve().then(route.lazy).then((module) => {
      if (!module || typeof module !== "object") throw new TypeError(`El módulo de la ruta "${route.id}" no es válido.`)
      record.module = module
      record.pending = undefined
      return module
    }).catch((error) => {
      if (this.records.get(route.id) === record) this.records.delete(route.id)
      throw error
    })
    record.pending = pending
    this.records.set(route.id, record)
    return awaitWithSignal(pending, signal)
  }

  invalidate(routeId?: string): void {
    if (routeId) this.records.delete(routeId)
    else this.records.clear()
  }
}

function applyModule<TData, TContext>(
  route: NRouteDefinition<TData, TContext>,
  module: NRouteModule<TData, TContext>,
): NRouteDefinition<TData, TContext> {
  const ErrorBoundary = module.ErrorBoundary
  return {
    ...route,
    beforeEnter: module.beforeEnter ?? route.beforeEnter,
    loader: module.loader ?? route.loader,
    element: module.Component ? createElement(module.Component) : route.element,
    errorElement: ErrorBoundary
      ? (error, match) => createElement(ErrorBoundary, { error, match })
      : route.errorElement,
    pendingElement: module.pendingElement ?? route.pendingElement,
    data: module.data ?? route.data,
    breadcrumb: module.breadcrumb ?? route.breadcrumb,
    preload: module.preload ?? route.preload,
  }
}

/** Resuelve imports independientes en paralelo y elige errores por orden de branch. */
export async function resolveNRouteModules<TData, TContext>(
  match: NRouteMatch<TData, TContext>,
  registry: NRouteModuleRegistry<TData, TContext>,
  signal: AbortSignal,
): Promise<NRouteMatch<TData, TContext>> {
  const settled = await Promise.allSettled(match.branch.map(({ route }) => registry.load(route, signal)))
  if (signal.aborted) throw abortError()
  const failedIndex = settled.findIndex((result) => result.status === "rejected")
  if (failedIndex >= 0) {
    const failed = settled[failedIndex] as PromiseRejectedResult
    throw new NRouteModuleError(match.branch[failedIndex]!.route.id, failedIndex, failed.reason)
  }
  const branch = match.branch.map((entry, index) => {
    const module = (settled[index] as PromiseFulfilledResult<NRouteModule<TData, TContext> | undefined>).value
    return module ? { ...entry, route: applyModule(entry.route, module) } : entry
  })
  return { ...match, route: branch.at(-1)!.route, branch }
}
