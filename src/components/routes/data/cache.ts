import type {
  NRouteCacheInvalidation,
  NRouteCachePolicy,
  NRouteLocation,
  NRouteMatchEntry,
} from "../types"

const defaultPolicy: Required<Pick<NRouteCachePolicy, "mode" | "staleTime" | "gcTime">> = {
  mode: "cache-first",
  staleTime: 30_000,
  gcTime: 300_000,
}

interface CacheEntry {
  key: string
  routeId: string
  tags: Set<string>
  value?: unknown
  hasValue: boolean
  updatedAt: number
  accessedAt: number
  staleTime: number
  gcTime: number
  pending?: Promise<unknown>
  controller?: AbortController
  consumers: number
}

export interface NRouteCacheLoadOptions<T> {
  key: string
  routeId: string
  policy?: NRouteCachePolicy
  signal: AbortSignal
  load: (signal: AbortSignal) => T | Promise<T>
  /** Recibe únicamente resultados de una revalidación SWR iniciada en background. */
  onBackgroundUpdate?: (value: T) => void
}

export interface NRouteCacheSnapshot {
  key: string
  routeId: string
  tags: readonly string[]
  state: "fresh" | "stale" | "pending"
}

function abortError(): DOMException {
  return new DOMException("Navigation aborted", "AbortError")
}

function normalizedPolicy(policy: NRouteCachePolicy = {}): Required<Pick<NRouteCachePolicy, "mode" | "staleTime" | "gcTime">> & Pick<NRouteCachePolicy, "tags"> {
  const staleTime = Math.max(0, policy.staleTime ?? defaultPolicy.staleTime)
  return {
    mode: policy.mode ?? defaultPolicy.mode,
    staleTime,
    gcTime: Math.max(staleTime, policy.gcTime ?? defaultPolicy.gcTime),
    tags: policy.tags,
  }
}

function stablePairs(params: Iterable<[string, string]>): string {
  return JSON.stringify([...params].sort(([leftKey, leftValue], [rightKey, rightValue]) =>
    leftKey.localeCompare(rightKey) || leftValue.localeCompare(rightValue),
  ))
}

/** La clave omite hash y limita search a lo declarado por la ruta. */
export function createNRouteCacheKey<TData, TContext>(
  entry: NRouteMatchEntry<TData, TContext>,
  location: NRouteLocation,
): string {
  const paramPairs = Object.entries(entry.params)
  const searchKeys = entry.route.reloadOnSearch
  const searchPairs = searchKeys
    ? [...location.searchParams].filter(([key]) => searchKeys.includes(key))
    : entry.route.revalidate === "search" ? [...location.searchParams] : []
  return `${entry.route.id}:${stablePairs(paramPairs)}:${stablePairs(searchPairs)}`
}

/** Caché de lifecycle de rutas; no normaliza entidades ni reemplaza un caché de queries. */
export class NRouteCache {
  private readonly entries = new Map<string, CacheEntry>()

  constructor(private readonly now: () => number = Date.now) {}

  private sweep(): void {
    const now = this.now()
    for (const [key, entry] of this.entries) {
      if (!entry.pending && now - entry.accessedAt >= entry.gcTime) this.entries.delete(key)
    }
  }

  private entry(key: string, routeId: string, policy: ReturnType<typeof normalizedPolicy>): CacheEntry {
    const existing = this.entries.get(key)
    if (existing) {
      existing.accessedAt = this.now()
      existing.gcTime = policy.gcTime
      existing.staleTime = policy.staleTime
      for (const tag of policy.tags ?? []) existing.tags.add(tag)
      return existing
    }
    const created: CacheEntry = {
      key,
      routeId,
      tags: new Set(policy.tags),
      hasValue: false,
      updatedAt: 0,
      accessedAt: this.now(),
      staleTime: policy.staleTime,
      gcTime: policy.gcTime,
      consumers: 0,
    }
    this.entries.set(key, created)
    return created
  }

  private start<T>(entry: CacheEntry, load: (signal: AbortSignal) => T | Promise<T>): Promise<T> {
    if (entry.pending) return entry.pending as Promise<T>
    const controller = new AbortController()
    entry.controller = controller
    const pending = Promise.resolve().then(() => load(controller.signal)).then((value) => {
      entry.value = value
      entry.hasValue = true
      entry.updatedAt = this.now()
      entry.accessedAt = entry.updatedAt
      return value
    }).finally(() => {
      if (entry.pending === pending) {
        entry.pending = undefined
        entry.controller = undefined
        entry.consumers = 0
      }
    })
    entry.pending = pending
    return pending
  }

  private consume<T>(entry: CacheEntry, pending: Promise<T>, signal: AbortSignal): Promise<T> {
    if (signal.aborted) return Promise.reject(abortError())
    entry.consumers += 1
    return new Promise<T>((resolve, reject) => {
      let settled = false
      const release = () => {
        if (settled) return
        settled = true
        signal.removeEventListener("abort", onAbort)
        entry.consumers = Math.max(0, entry.consumers - 1)
      }
      const onAbort = () => {
        release()
        if (entry.consumers === 0 && entry.pending === pending) entry.controller?.abort()
        reject(abortError())
      }
      signal.addEventListener("abort", onAbort, { once: true })
      pending.then((value) => { release(); resolve(value) }, (error) => { release(); reject(error) })
    })
  }

  async load<T>({ key, routeId, policy: inputPolicy, signal, load, onBackgroundUpdate }: NRouteCacheLoadOptions<T>): Promise<T> {
    if (signal.aborted) throw abortError()
    this.sweep()
    const policy = normalizedPolicy(inputPolicy)
    const entry = this.entry(key, routeId, policy)
    const fresh = entry.hasValue && this.now() - entry.updatedAt < policy.staleTime

    if (policy.mode === "cache-first" && fresh) return entry.value as T
    if (policy.mode === "stale-while-revalidate" && entry.hasValue) {
      if (!fresh && !entry.pending) {
        void this.start(entry, load).then((value) => onBackgroundUpdate?.(value)).catch(() => undefined)
      }
      return entry.value as T
    }

    const pending = this.start(entry, load)
    try {
      return await this.consume(entry, pending, signal)
    } catch (error) {
      if (policy.mode === "network-first" && entry.hasValue && !(error instanceof DOMException && error.name === "AbortError")) {
        return entry.value as T
      }
      throw error
    }
  }

  invalidate(filter: NRouteCacheInvalidation): void {
    const routeIds = new Set(filter.routeIds ?? [])
    const tags = new Set(filter.tags ?? [])
    for (const [key, entry] of this.entries) {
      const routeMatch = routeIds.size > 0 && routeIds.has(entry.routeId)
      const tagMatch = tags.size > 0 && [...tags].some((tag) => entry.tags.has(tag))
      if (routeMatch || tagMatch) {
        entry.controller?.abort()
        this.entries.delete(key)
      }
    }
  }

  invalidateRoute(routeId: string): void {
    this.invalidate({ routeIds: [routeId] })
  }

  clear(): void {
    for (const entry of this.entries.values()) entry.controller?.abort()
    this.entries.clear()
  }

  snapshot(): readonly NRouteCacheSnapshot[] {
    this.sweep()
    const now = this.now()
    return [...this.entries.values()].map((entry) => ({
      key: entry.key,
      routeId: entry.routeId,
      tags: [...entry.tags].sort(),
      state: entry.pending ? "pending" : now - entry.updatedAt < entry.staleTime ? "fresh" : "stale",
    }))
  }
}
