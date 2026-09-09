import type {
  NRouteLocation,
  NRouteMatch,
  NRouteMatchEntry,
  NRouteRetainedEntry,
  NRouteShouldReloadDetails,
  NRouteTransition,
} from "../types"

function changedRecordKeys(
  current: Readonly<Record<string, string>>,
  next: Readonly<Record<string, string>>,
): string[] {
  return [...new Set([...Object.keys(current), ...Object.keys(next)])]
    .filter((key) => current[key] !== next[key])
    .sort()
}
function searchValues(location: NRouteLocation, key: string): string {
  return JSON.stringify(location.searchParams.getAll(key))
}

export function changedSearchKeys(current: NRouteLocation, next: NRouteLocation): string[] {
  const keys = new Set<string>()
  current.searchParams.forEach((_value, key) => keys.add(key))
  next.searchParams.forEach((_value, key) => keys.add(key))
  return [...keys].filter((key) => searchValues(current, key) !== searchValues(next, key)).sort()
}

function shouldReloadRetained<TData, TContext>(
  current: NRouteMatchEntry<TData, TContext>,
  next: NRouteMatchEntry<TData, TContext>,
  currentLocation: NRouteLocation,
  nextLocation: NRouteLocation,
  changedParams: readonly string[],
  changedSearch: readonly string[],
): boolean {
  const { revalidate, reloadOnSearch } = next.route
  const details: NRouteShouldReloadDetails<TData, TContext> = {
    current,
    next,
    currentLocation,
    nextLocation,
    changedParams,
    changedSearch,
    hashChanged: currentLocation.hash !== nextLocation.hash,
  }

  if (typeof revalidate === "function") return revalidate(details)
  if (revalidate === "always") return true
  if (revalidate === "never") return false
  if (revalidate === "search") {
    return reloadOnSearch?.length
      ? reloadOnSearch.some((key) => changedSearch.includes(key))
      : changedSearch.length > 0
  }
  if (revalidate === "params") return changedParams.length > 0
  return changedParams.length > 0 || Boolean(reloadOnSearch?.some((key) => changedSearch.includes(key)))
}

/** Compara dos branches sin ejecutar efectos y decide el trabajo incremental de cada segmento. */
export function createNRouteTransition<TData, TContext>(
  from: NRouteMatch<TData, TContext> | undefined,
  to: NRouteMatch<TData, TContext>,
): NRouteTransition<TData, TContext> {
  const changedSearch = from ? changedSearchKeys(from.location, to.location) : [...to.location.searchParams.keys()]
  let retainedLength = 0
  if (from) {
    const maximum = Math.min(from.branch.length, to.branch.length)
    while (retainedLength < maximum && from.branch[retainedLength]!.route.id === to.branch[retainedLength]!.route.id) {
      retainedLength += 1
    }
  }

  const retained: NRouteRetainedEntry<TData, TContext>[] = []
  for (let index = 0; index < retainedLength; index += 1) {
    const current = from!.branch[index]!
    const next = to.branch[index]!
    const changedParams = changedRecordKeys(current.params, next.params)
    retained.push({
      current,
      next,
      changedParams,
      shouldReload: shouldReloadRetained(current, next, from!.location, to.location, changedParams, changedSearch),
    })
  }

  return {
    from,
    to,
    retained,
    entering: to.branch.slice(retainedLength),
    leaving: from ? from.branch.slice(retainedLength).reverse() : [],
    changes: {
      pathname: from ? from.location.pathname !== to.location.pathname : true,
      search: [...new Set(changedSearch)].sort(),
      hash: from ? from.location.hash !== to.location.hash : Boolean(to.location.hash),
    },
  }
}

/** Identidades de las rutas cuyo guard/loader sí participa en la transición. */
export function transitionWorkRouteIds<TData, TContext>(transition: NRouteTransition<TData, TContext>): ReadonlySet<string> {
  return new Set([
    ...transition.entering.map((entry) => entry.route.id),
    ...transition.retained.filter((entry) => entry.shouldReload).map((entry) => entry.next.route.id),
  ])
}

/** Copia loader data de segmentos retenidos para que el siguiente match no pierda resultados válidos. */
export function retainedLoaderData<TData, TContext>(transition: NRouteTransition<TData, TContext>): Record<string, unknown> {
  return Object.fromEntries(transition.retained.flatMap(({ current }) =>
    current.loaderData === undefined ? [] : [[current.route.id, current.loaderData]],
  ))
}
