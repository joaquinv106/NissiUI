import { normalizeRoutePath } from "./location"
import type { NRouteDefinition, NRouteLocation, NRouteMatch, NRouteMatchEntry, NRoutePathTarget, NRouteTarget } from "./types"

interface CompiledBranch<TData, TContext> {
  routes: readonly NRouteDefinition<TData, TContext>[]
  patterns: readonly string[]
  fullPattern: string
  score: number
  order: number
}

/** Conserva literales de ids y paths al declarar rutas sin exigir anotaciones manuales. */
export function defineNroutes<const TRoutes extends readonly NRouteDefinition[]>(routes: TRoutes): TRoutes {
  return routes
}

/** Convierte un target por id en pathname usando el mismo árbol declarado. */
export function resolveNRouteTarget<TData, TContext>(
  routes: readonly NRouteDefinition<TData, TContext>[],
  target: NRouteTarget,
): string | NRoutePathTarget {
  if (typeof target === "string" || !("route" in target)) return target
  let found: string | undefined
  const visit = (nodes: readonly NRouteDefinition<TData, TContext>[], parent: string): void => {
    for (const route of nodes) {
      const pattern = joinRoutePath(parent, route.path)
      if (route.id === target.route) { found = pattern; return }
      if (route.children) visit(route.children, pattern)
      if (found) return
    }
  }
  visit(routes, "/")
  if (!found) throw new Error(`Nroutes no encontró la ruta con id "${target.route}".`)
  const params = target.params ?? {}
  const pathname = found.replace(/:([^/]+)/g, (_, key: string) => {
    const value = params[key]
    if (value === undefined) throw new Error(`Falta el parámetro "${key}" para la ruta "${target.route}".`)
    return encodeURIComponent(String(value))
  }).replace(/\*$/, () => {
    const value = params["*"]
    if (value === undefined) throw new Error(`Falta el parámetro "*" para la ruta "${target.route}".`)
    return String(value).split("/").map(encodeURIComponent).join("/")
  })
  return { pathname, search: target.search, hash: target.hash }
}

function joinRoutePath(parent: string, child: string): string {
  if (child.startsWith("/")) return normalizeRoutePath(child)
  const base = parent === "/" ? "" : parent
  return normalizeRoutePath(`${base}/${child}`)
}

function scorePattern(pattern: string): number {
  const segments = normalizeRoutePath(pattern).split("/").filter(Boolean)
  const exactBonus = segments.at(-1) === "*" ? 0 : 1000
  return exactBonus + segments.reduce((score, segment) => score + (segment === "*" ? -10 : segment.startsWith(":") ? 10 : 100), 0) + segments.length
}

export function compileRouteBranches<TData, TContext>(
  routes: readonly NRouteDefinition<TData, TContext>[],
): readonly CompiledBranch<TData, TContext>[] {
  const branches: CompiledBranch<TData, TContext>[] = []
  const ids = new Set<string>()
  const patterns = new Map<string, { id: string; parentId?: string }>()
  let order = 0
  const development = typeof process === "undefined" || process.env.NODE_ENV !== "production"

  const visit = (
    nodes: readonly NRouteDefinition<TData, TContext>[],
    parentPattern: string,
    parents: readonly NRouteDefinition<TData, TContext>[],
    parentPatterns: readonly string[],
  ) => {
    nodes.forEach((route) => {
      const fullPattern = joinRoutePath(parentPattern, route.path)
      if (development && ids.has(route.id)) console.warn(`[NissiUI] Nroutes recibió el id duplicado "${route.id}".`)
      ids.add(route.id)
      const signature = fullPattern.replace(/:[^/]+/g, ":param")
      const parentId = parents.at(-1)?.id
      const prior = patterns.get(signature)
      if (development && prior && prior.id !== route.id && prior.parentId === parentId) {
        console.warn(`[NissiUI] Las rutas "${prior.id}" y "${route.id}" tienen patrones indistinguibles.`)
      }
      patterns.set(signature, { id: route.id, parentId })

      const branchRoutes = [...parents, route]
      const branchPatterns = [...parentPatterns, fullPattern]
      branches.push({ routes: branchRoutes, patterns: branchPatterns, fullPattern, score: scorePattern(fullPattern), order: order++ })
      if (route.children?.length) visit(route.children, fullPattern, branchRoutes, branchPatterns)
    })
  }

  visit(routes, "/", [], [])
  return branches.sort((left, right) => right.score - left.score || right.routes.length - left.routes.length || left.order - right.order)
}

function decodeRouteValue(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function matchPattern(pattern: string, pathname: string): Record<string, string> | undefined {
  if (pattern === "*") return { "*": decodeRouteValue(normalizeRoutePath(pathname).slice(1)) }
  const patternSegments = normalizeRoutePath(pattern).split("/").filter(Boolean)
  const pathSegments = normalizeRoutePath(pathname).split("/").filter(Boolean)
  const params: Record<string, string> = {}

  for (let index = 0; index < patternSegments.length; index += 1) {
    const patternSegment = patternSegments[index]!
    if (patternSegment === "*") {
      params["*"] = decodeRouteValue(pathSegments.slice(index).join("/"))
      return params
    }
    const pathSegment = pathSegments[index]
    if (pathSegment === undefined) return undefined
    if (patternSegment.startsWith(":")) params[patternSegment.slice(1)] = decodeRouteValue(pathSegment)
    else if (decodeRouteValue(patternSegment) !== decodeRouteValue(pathSegment)) return undefined
  }
  return patternSegments.length === pathSegments.length ? params : undefined
}

function paramsForPattern(pattern: string, params: Readonly<Record<string, string>>): Record<string, string> {
  const names = normalizeRoutePath(pattern).split("/").filter((segment) => segment.startsWith(":"))
    .map((segment) => segment.slice(1))
  if (normalizeRoutePath(pattern).split("/").includes("*")) names.push("*")
  return Object.fromEntries(names.flatMap((name) => params[name] === undefined ? [] : [[name, params[name]!]]))
}

export function matchRoutes<TData, TContext>(
  branches: readonly CompiledBranch<TData, TContext>[],
  location: NRouteLocation,
): NRouteMatch<TData, TContext> | undefined {
  for (const compiled of branches) {
    const params = matchPattern(compiled.fullPattern, location.pathname)
    if (!params) continue
    const branch: NRouteMatchEntry<TData, TContext>[] = compiled.routes.map((route, index) => ({
      route,
      pathname: compiled.patterns[index]!,
      params: paramsForPattern(compiled.patterns[index]!, params),
    }))
    return {
      route: compiled.routes.at(-1)!,
      path: location.pathname,
      params,
      branch,
      location,
      loaderData: {},
    }
  }
  return undefined
}

/** Matcher plano conservado para compatibilidad. Ahora aplica ranking por especificidad. */
export function matchRoute<TData, TContext = unknown>(
  routes: readonly NRouteDefinition<TData, TContext>[],
  path: string,
): NRouteMatch<TData, TContext> | undefined {
  const location = parseMatchLocation(path)
  return matchRoutes(compileRouteBranches(routes), location)
}

function parseMatchLocation(path: string): NRouteLocation {
  const pathname = normalizeRoutePath(path)
  return { pathname, search: "", searchParams: new URLSearchParams(), hash: "", key: `match:${pathname}` }
}
