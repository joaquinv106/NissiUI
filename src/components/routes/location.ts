import type { NRouteLocation, NRouteStrategy, NRouteTarget } from "./types"

let locationSequence = 0

export function createLocationKey(): string {
  locationSequence += 1
  return `nroute-${Date.now().toString(36)}-${locationSequence.toString(36)}`
}

export function normalizeRoutePath(value: string | undefined, fallback = "/"): string {
  const source = (value || fallback).trim()
  const withoutOrigin = source.startsWith("http://") || source.startsWith("https://")
    ? new URL(source).pathname
    : source
  const pathname = withoutOrigin.split(/[?#]/, 1)[0] || "/"
  const normalized = `/${pathname.replace(/^\/+|\/+$/g, "")}`
  return normalized === "/" ? normalized : normalized.replace(/\/+$/g, "")
}

export function normalizeBasePath(value: string | undefined): string {
  if (!value || value === "/") return ""
  return normalizeRoutePath(value)
}

export function stripBasePath(pathname: string, basePath: string): string {
  const normalizedPath = normalizeRoutePath(pathname)
  const normalizedBase = normalizeBasePath(basePath)
  if (!normalizedBase) return normalizedPath
  if (normalizedPath === normalizedBase) return "/"
  return normalizedPath.startsWith(`${normalizedBase}/`)
    ? normalizeRoutePath(normalizedPath.slice(normalizedBase.length))
    : normalizedPath
}

function normalizeSearch(search: string): string {
  if (!search || search === "?") return ""
  return search.startsWith("?") ? search : `?${search}`
}

function normalizeHash(hash: string): string {
  if (!hash || hash === "#") return ""
  return hash.startsWith("#") ? hash : `#${hash}`
}

function serializeSearch(search: Exclude<Extract<NRouteTarget, object>["search"], undefined>): string {
  if (typeof search === "string") return normalizeSearch(search)
  if (search instanceof URLSearchParams) {
    const value = search.toString()
    return value ? `?${value}` : ""
  }
  const params = new URLSearchParams()
  Object.entries(search).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.set(key, String(value))
  })
  const value = params.toString()
  return value ? `?${value}` : ""
}

export function parseRouteLocation(
  value: string | NRouteLocation | undefined,
  fallback = "/",
  state?: unknown,
  key = createLocationKey(),
): NRouteLocation {
  if (value && typeof value !== "string") {
    const search = normalizeSearch(value.search || value.searchParams.toString())
    return {
      pathname: normalizeRoutePath(value.pathname, fallback),
      search,
      searchParams: new URLSearchParams(search),
      hash: normalizeHash(value.hash),
      state: value.state,
      key: value.key || key,
    }
  }

  const source = (value || fallback).trim()
  let relative = source
  if (source.startsWith("http://") || source.startsWith("https://")) {
    const url = new URL(source)
    relative = `${url.pathname}${url.search}${url.hash}`
  }
  const hashIndex = relative.indexOf("#")
  const hash = hashIndex >= 0 ? normalizeHash(relative.slice(hashIndex + 1)) : ""
  const withoutHash = hashIndex >= 0 ? relative.slice(0, hashIndex) : relative
  const searchIndex = withoutHash.indexOf("?")
  const search = searchIndex >= 0 ? normalizeSearch(withoutHash.slice(searchIndex + 1)) : ""
  const pathname = searchIndex >= 0 ? withoutHash.slice(0, searchIndex) : withoutHash

  return {
    pathname: normalizeRoutePath(pathname, fallback),
    search,
    searchParams: new URLSearchParams(search),
    hash,
    state,
    key,
  }
}

export function resolveRouteTarget(target: NRouteTarget, current: NRouteLocation): NRouteLocation {
  if (typeof target === "string") return parseRouteLocation(target, current.pathname)
  if ("route" in target) throw new Error("Un target por route id debe resolverse con el manifest de Nroutes.")
  const search = target.search === undefined ? current.search : serializeSearch(target.search)
  const hash = target.hash === undefined ? current.hash : normalizeHash(target.hash)
  return parseRouteLocation(`${target.pathname ?? current.pathname}${search}${hash}`, current.pathname)
}

export function locationPath(location: Pick<NRouteLocation, "pathname" | "search" | "hash">): string {
  return `${location.pathname}${location.search}${location.hash}`
}

export function isExternalRouteTarget(target: NRouteTarget): boolean {
  if (typeof target !== "string") return false
  if (/^(mailto:|tel:|sms:|data:|javascript:)/i.test(target) || target.startsWith("//")) return true
  if (!/^https?:\/\//i.test(target)) return false
  if (typeof window === "undefined") return true
  return new URL(target).origin !== window.location.origin
}

export function routeHref(target: string | NRouteLocation, strategy: NRouteStrategy, basePath = ""): string {
  const location = typeof target === "string" ? parseRouteLocation(target) : target
  const relative = locationPath(location)
  if (strategy === "hash") return `#${relative}`
  if (strategy === "memory") return relative
  return `${normalizeBasePath(basePath)}${location.pathname === "/" ? "" : location.pathname}${location.search}${location.hash}` || "/"
}

export function readBrowserLocation(strategy: NRouteStrategy, basePath: string, fallback: string): NRouteLocation {
  if (typeof window === "undefined" || strategy === "memory") return parseRouteLocation(fallback)
  if (strategy === "hash") return parseRouteLocation(window.location.hash.slice(1), fallback, window.history.state)
  return parseRouteLocation(
    `${stripBasePath(window.location.pathname, basePath)}${window.location.search}${window.location.hash}`,
    fallback,
    window.history.state,
  )
}
