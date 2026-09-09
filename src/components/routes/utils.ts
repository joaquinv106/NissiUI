import type { NRouteDefinition, NRouteMatch, NRouteStrategy } from "./types"

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

export function routeHref(path: string, strategy: NRouteStrategy, basePath = ""): string {
  const normalized = normalizeRoutePath(path)
  if (strategy === "hash") return `#${normalized}`
  if (strategy === "memory") return normalized
  return `${normalizeBasePath(basePath)}${normalized === "/" ? "" : normalized}` || "/"
}

function decodeRouteValue(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function matchRoute<TData>(routes: readonly NRouteDefinition<TData>[], path: string): NRouteMatch<TData> | undefined {
  const normalizedPath = normalizeRoutePath(path)
  const pathSegments = normalizedPath === "/" ? [] : normalizedPath.slice(1).split("/")

  for (const route of routes) {
    if (route.path === "*") return { route, path: normalizedPath, params: {} }
    const normalizedPattern = normalizeRoutePath(route.path)
    const patternSegments = normalizedPattern === "/" ? [] : normalizedPattern.slice(1).split("/")
    const params: Record<string, string> = {}
    let matched = true

    for (let index = 0; index < patternSegments.length; index += 1) {
      const patternSegment = patternSegments[index]!
      if (patternSegment === "*") {
        params["*"] = decodeRouteValue(pathSegments.slice(index).join("/"))
        break
      }
      const pathSegment = pathSegments[index]
      if (pathSegment === undefined) {
        matched = false
        break
      }
      if (patternSegment.startsWith(":")) params[patternSegment.slice(1)] = decodeRouteValue(pathSegment)
      else if (decodeRouteValue(patternSegment) !== decodeRouteValue(pathSegment)) {
        matched = false
        break
      }
    }

    const acceptsRest = patternSegments.at(-1) === "*"
    if (matched && (acceptsRest || patternSegments.length === pathSegments.length)) {
      return { route, path: normalizedPath, params }
    }
  }

  return undefined
}
