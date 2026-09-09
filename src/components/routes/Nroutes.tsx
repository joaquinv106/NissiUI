"use client"

import { Box, Center, Spinner, Stack, Text } from "@chakra-ui/react"
import {
  Component,
  Suspense,
  isValidElement,
  type ErrorInfo,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { usePermissions } from "../permissions"
import { NOutletDepthContext, NRouteRenderContext, NroutesContext, useNroutes } from "./context"
import { createNRouteTransition, retainedLoaderData, transitionWorkRouteIds } from "./core/transition"
import { createNRouteCacheKey, NRouteCache } from "./data/cache"
import { NRouteLoaderSchedulerError, scheduleNRouteLoaders } from "./data/scheduler"
import { NRouteModuleError, NRouteModuleRegistry, resolveNRouteModules } from "./modules"
import { resolveNroutesLabels } from "./labels"
import {
  locationPath,
  isExternalRouteTarget,
  normalizeBasePath,
  parseRouteLocation,
  readBrowserLocation,
  resolveRouteTarget,
  routeHref,
  stripBasePath,
} from "./location"
import { compileRouteBranches, matchRoutes, resolveNRouteTarget } from "./matcher"
import type {
  NNavigationState,
  NRouteCacheInvalidation,
  NRouteDefinition,
  NRouteLocation,
  NRouteMatch,
  NRouteNavigateOptions,
  NRouteOutletProps,
  NRouteTarget,
  NRouteTransition,
  NroutesContextValue,
  NroutesProps,
} from "./types"
import { isNRouteRedirect } from "./types"

type RenderState = "ready" | "pending" | "not-found" | "forbidden" | "error"

interface RouteResolution<TData, TContext> {
  key: string
  state: RenderState
  match?: NRouteMatch<TData, TContext>
}

interface RouteErrorBoundaryProps {
  children: ReactNode
  errorElement?: ReactNode | ((error: unknown) => ReactNode)
  resetKey: string
}

interface RouteErrorBoundaryState {
  error?: unknown
}

class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = {}

  static getDerivedStateFromError(error: unknown): RouteErrorBoundaryState {
    return { error }
  }

  componentDidCatch(_error: unknown, _info: ErrorInfo) {}

  componentDidUpdate(previous: RouteErrorBoundaryProps) {
    if (previous.resetKey !== this.props.resetKey && this.state.error !== undefined) this.setState({ error: undefined })
  }

  render() {
    if (this.state.error === undefined) return this.props.children
    if (this.props.errorElement === undefined) throw this.state.error
    return typeof this.props.errorElement === "function"
      ? this.props.errorElement(this.state.error)
      : this.props.errorElement
  }
}

function isPlainPrimaryClick(event: ReactMouseEvent): boolean {
  return event.button === 0 && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

function hasTransitionWork<TData, TContext>(transition: NRouteTransition<TData, TContext>): boolean {
  const routeIds = transitionWorkRouteIds(transition)
  return transition.to.branch.some(({ route }) => routeIds.has(route.id) && Boolean(route.lazy || route.beforeEnter || route.loader))
}

function withLoaderData<TData, TContext>(
  match: NRouteMatch<TData, TContext>,
  loaderData: Readonly<Record<string, unknown>>,
): NRouteMatch<TData, TContext> {
  return {
    ...match,
    loaderData,
    branch: match.branch.map((entry) => ({ ...entry, loaderData: loaderData[entry.route.id] })),
  }
}

function withRetainedModules<TData, TContext>(
  match: NRouteMatch<TData, TContext>,
  transition: NRouteTransition<TData, TContext>,
): NRouteMatch<TData, TContext> {
  const retained = new Map(transition.retained.map((entry) => [entry.next.route.id, entry.current.route]))
  const branch = match.branch.map((entry) => retained.has(entry.route.id) ? { ...entry, route: retained.get(entry.route.id)! } : entry)
  return { ...match, route: branch.at(-1)!.route, branch }
}

function routeTitle<TData, TContext>(match: NRouteMatch<TData, TContext>): string {
  return typeof match.route.title === "function" ? match.route.title(match) : match.route.title
}

function closestErrorRouteId<TData, TContext>(match: NRouteMatch<TData, TContext>, failedIndex: number): string | undefined {
  for (let index = failedIndex; index >= 0; index -= 1) {
    if (match.branch[index]?.route.errorElement !== undefined) return match.branch[index]!.route.id
  }
  return undefined
}

/** Administrador SPA jerárquico con rutas planas compatibles, guards, loaders y adaptadores externos. */
export function Nroutes<TData = unknown, TContext = unknown>({
  routes,
  children,
  strategy = "history",
  router,
  context,
  basePath: basePathProp,
  path: controlledPath,
  location: controlledLocation,
  defaultPath = "/",
  onPathChange,
  onLocationChange,
  labels: labelsProp,
  pendingFallback,
  notFoundFallback,
  forbiddenFallback,
  errorFallback,
  scrollRestoration = false,
  progress = false,
  progressDelay = 160,
  colorPalette = "blue",
  unstyled = false,
  classNames,
  styles,
}: NroutesProps<TData, TContext>) {
  const basePath = normalizeBasePath(basePathProp)
  const labels = useMemo(() => resolveNroutesLabels(labelsProp), [labelsProp])
  const compiled = useMemo(() => compileRouteBranches(routes), [routes])
  const { can } = usePermissions()
  const [internalLocation, setInternalLocation] = useState(() => readBrowserLocation(strategy, basePath, defaultPath))
  const externalValue = router?.location ?? controlledLocation ?? controlledPath
  const currentLocation = useMemo(() => {
    if (externalValue === undefined) return internalLocation
    if (typeof externalValue === "string") return parseRouteLocation(externalValue, defaultPath, undefined, `controlled:${externalValue}`)
    return parseRouteLocation(externalValue, defaultPath)
  }, [defaultPath, externalValue, internalLocation])
  const candidate = useMemo(() => matchRoutes(compiled, currentLocation), [compiled, currentLocation])
  const candidateAllowed = candidate?.branch.every(({ route }) => !route.requiredPermission || can(route.requiredPermission, route.permissionMode)) ?? true
  const immediateState: RenderState = !candidate ? "not-found" : !candidateAllowed
    ? "forbidden"
    : candidate.branch.some(({ route }) => Boolean(route.lazy || route.beforeEnter || route.loader)) ? "pending" : "ready"
  const [resolution, setResolution] = useState<RouteResolution<TData, TContext>>(() => ({
    key: currentLocation.key,
    state: immediateState,
    match: immediateState === "ready" ? candidate : undefined,
  }))
  const [navigation, setNavigation] = useState<NNavigationState<TData, TContext>>({ status: immediateState === "pending" ? "loading" : "idle" })
  const abortRef = useRef<AbortController | undefined>(undefined)
  const generationRef = useRef(0)
  const activeLocationRef = useRef(currentLocation)
  const activeMatchRef = useRef<NRouteMatch<TData, TContext> | undefined>(resolution.match)
  const routeCache = useRef(new NRouteCache())
  const moduleRegistry = useRef(new NRouteModuleRegistry<TData, TContext>())
  const prefetchCache = useRef(new Map<string, Promise<void>>())
  const [cacheRevision, setCacheRevision] = useState(0)
  const scrollPositions = useRef(new Map<string, { x: number; y: number }>())
  const navigationOptions = useRef(new Map<string, NRouteNavigateOptions>())

  const matchForLocation = useCallback((nextLocation: NRouteLocation) => matchRoutes(compiled, nextLocation), [compiled])
  const normalizeTarget = useCallback((target: NRouteTarget) => resolveNRouteTarget(routes, target), [routes])

  const updateLocation = useCallback((target: NRouteTarget, options: NRouteNavigateOptions = {}) => {
    const nextLocation = { ...resolveRouteTarget(normalizeTarget(target), currentLocation), state: options.state }
    const fullPath = locationPath(nextLocation)
    const nextMatch = matchForLocation(nextLocation)
    if (typeof window !== "undefined" && scrollRestoration === "restore") {
      scrollPositions.current.set(locationPath(activeLocationRef.current), { x: window.scrollX, y: window.scrollY })
    }
    navigationOptions.current.set(locationPath(nextLocation), options)

    if (router) router.navigate(fullPath, options)
    else {
      if (controlledLocation === undefined && controlledPath === undefined) setInternalLocation(nextLocation)
      if (typeof window !== "undefined" && strategy !== "memory") {
        const href = routeHref(nextLocation, strategy, basePath)
        window.history[options.replace ? "replaceState" : "pushState"](options.state, "", href)
      }
    }
    onPathChange?.(nextLocation.pathname, nextMatch)
    onLocationChange?.(nextLocation, nextMatch)
  }, [basePath, controlledLocation, controlledPath, currentLocation, matchForLocation, normalizeTarget, onLocationChange, onPathChange, router, scrollRestoration, strategy])

  const loadMatch = useCallback(async (
    match: NRouteMatch<TData, TContext>,
    transition: NRouteTransition<TData, TContext>,
    signal: AbortSignal,
    onModulesResolved?: (match: NRouteMatch<TData, TContext>) => void,
  ): Promise<{ state: RenderState; match: NRouteMatch<TData, TContext>; redirect?: { to: NRouteTarget; options: NRouteNavigateOptions } }> => {
    let resolvedMatch: NRouteMatch<TData, TContext>
    try {
      resolvedMatch = await resolveNRouteModules(match, moduleRegistry.current, signal)
      onModulesResolved?.(resolvedMatch)
    } catch (error) {
      if (signal.aborted) throw error
      const failedIndex = error instanceof NRouteModuleError ? error.routeIndex : 0
      const cause = error instanceof NRouteModuleError ? error.cause : error
      return {
        state: "error",
        match: {
          ...withLoaderData(match, retainedLoaderData(transition)),
          error: cause,
          errorRouteId: closestErrorRouteId(match, failedIndex),
        },
      }
    }
    const initialLoaderData = retainedLoaderData(transition)
    const workRouteIds = transitionWorkRouteIds(transition)
    for (let index = 0; index < resolvedMatch.branch.length; index += 1) {
      const route = resolvedMatch.branch[index]!.route
      if (!workRouteIds.has(route.id)) continue
      const details = { params: resolvedMatch.params, location: resolvedMatch.location, context: context as TContext, signal, route, loaderData: initialLoaderData }
      try {
        const guardResult = await route.beforeEnter?.(details)
        if (signal.aborted) throw new DOMException("Navigation aborted", "AbortError")
        if (isNRouteRedirect(guardResult)) {
          return { state: "pending", match: resolvedMatch, redirect: { to: guardResult.to, options: { replace: guardResult.replace ?? true, state: guardResult.state } } }
        }
        if (guardResult === false) return { state: "forbidden", match: resolvedMatch }
      } catch (error) {
        if (signal.aborted) throw error
        return {
          state: "error",
          match: {
            ...withLoaderData(resolvedMatch, initialLoaderData),
            error,
            errorRouteId: closestErrorRouteId(resolvedMatch, index),
          },
        }
      }
    }

    try {
      const loaderData = await scheduleNRouteLoaders({
        match: resolvedMatch,
        routeIds: workRouteIds,
        initialLoaderData,
        context: context as TContext,
        signal,
        execute: async (entry, details) => {
          const { route } = entry
          if (route.cache === false) return route.loader!(details)
          const cacheKey = createNRouteCacheKey(entry, resolvedMatch.location)
          return routeCache.current.load({
            key: cacheKey,
            routeId: route.id,
            policy: route.cache,
            signal,
            load: (cacheSignal) => route.loader!({ ...details, signal: cacheSignal }),
            onBackgroundUpdate: (data) => {
              setResolution((current) => {
                if (current.state !== "ready" || !current.match) return current
                const currentEntry = current.match.branch.find(({ route: activeRoute }) => activeRoute.id === route.id)
                if (!currentEntry || createNRouteCacheKey(currentEntry, current.match.location) !== cacheKey) return current
                const nextMatch = withLoaderData(current.match, { ...current.match.loaderData, [route.id]: data })
                activeMatchRef.current = nextMatch
                return { ...current, match: nextMatch }
              })
            },
          })
        },
      })
      return { state: "ready", match: withLoaderData(resolvedMatch, loaderData) }
    } catch (error) {
      if (signal.aborted) throw error
      const failedIndex = error instanceof NRouteLoaderSchedulerError ? error.routeIndex : 0
      const cause = error instanceof NRouteLoaderSchedulerError && error.cause !== undefined ? error.cause : error
      const loaderData = error instanceof NRouteLoaderSchedulerError ? error.loaderData : initialLoaderData
      return {
        state: "error",
        match: {
          ...withLoaderData(resolvedMatch, loaderData),
          error: cause,
          errorRouteId: closestErrorRouteId(resolvedMatch, failedIndex),
        },
      }
    }
  }, [context])

  const prefetch = useCallback(async (target: NRouteTarget) => {
    const nextLocation = resolveRouteTarget(normalizeTarget(target), currentLocation)
    const targetPath = locationPath(nextLocation)
    const existing = prefetchCache.current.get(targetPath)
    if (existing) return existing
    const task = (async () => {
      await router?.prefetch?.(targetPath)
      const nextMatch = matchForLocation(nextLocation)
      if (!nextMatch || !nextMatch.branch.every(({ route }) => !route.requiredPermission || can(route.requiredPermission, route.permissionMode))) return
      const controller = new AbortController()
      const resolvedMatch = await resolveNRouteModules(nextMatch, moduleRegistry.current, controller.signal)
      await Promise.all(resolvedMatch.branch.map(({ route }) => route.preload?.()))
      const transition = createNRouteTransition(activeMatchRef.current, resolvedMatch)
      await loadMatch(resolvedMatch, transition, controller.signal)
    })()
    prefetchCache.current.set(targetPath, task)
    try {
      await task
    } catch (error) {
      prefetchCache.current.delete(targetPath)
      throw error
    }
  }, [can, currentLocation, loadMatch, matchForLocation, normalizeTarget, router])

  useEffect(() => {
    generationRef.current += 1
    const generation = generationRef.current
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    if (!candidate) {
      setResolution({ key: currentLocation.key, state: "not-found" })
      setNavigation({ status: "idle" })
      activeLocationRef.current = currentLocation
      activeMatchRef.current = undefined
      return () => controller.abort()
    }
    if (!candidateAllowed) {
      setResolution({ key: currentLocation.key, state: "forbidden", match: candidate })
      setNavigation({ status: "idle" })
      activeLocationRef.current = currentLocation
      activeMatchRef.current = undefined
      return () => controller.abort()
    }
    const transition = createNRouteTransition(activeMatchRef.current, candidate)
    if (!hasTransitionWork(transition)) {
      const readyMatch = withLoaderData(withRetainedModules(candidate, transition), retainedLoaderData(transition))
      setResolution({ key: currentLocation.key, state: "ready", match: readyMatch })
      setNavigation({ status: "idle" })
      activeLocationRef.current = currentLocation
      activeMatchRef.current = readyMatch
      return () => controller.abort()
    }

    setResolution({ key: currentLocation.key, state: "pending", match: candidate })
    setNavigation({ status: "loading", from: activeLocationRef.current, to: currentLocation, transition })
    void loadMatch(candidate, transition, controller.signal, (resolvedMatch) => {
      if (!controller.signal.aborted && generation === generationRef.current) {
        setResolution({ key: currentLocation.key, state: "pending", match: resolvedMatch })
      }
    }).then((result) => {
      if (controller.signal.aborted || generation !== generationRef.current) return
      if (result.redirect) {
        updateLocation(result.redirect.to, result.redirect.options)
        return
      }
      setResolution({ key: currentLocation.key, state: result.state, match: result.match })
      setNavigation({ status: "idle" })
      activeLocationRef.current = currentLocation
      activeMatchRef.current = result.state === "ready" || result.state === "error" ? result.match : undefined
    }).catch((error: unknown) => {
      if (controller.signal.aborted || generation !== generationRef.current) return
      setResolution({ key: currentLocation.key, state: "error", match: { ...candidate, error } })
      setNavigation({ status: "idle" })
    })
    return () => controller.abort()
  }, [cacheRevision, candidate, candidateAllowed, currentLocation, loadMatch, updateLocation])

  useEffect(() => {
    if (typeof window === "undefined" || strategy === "memory" || router) return undefined
    const syncFromBrowser = () => {
      const nextLocation = readBrowserLocation(strategy, basePath, defaultPath)
      if (controlledLocation === undefined && controlledPath === undefined) setInternalLocation(nextLocation)
      const nextMatch = matchForLocation(nextLocation)
      onPathChange?.(nextLocation.pathname, nextMatch)
      onLocationChange?.(nextLocation, nextMatch)
    }
    window.addEventListener("popstate", syncFromBrowser)
    if (strategy === "hash") window.addEventListener("hashchange", syncFromBrowser)
    return () => {
      window.removeEventListener("popstate", syncFromBrowser)
      if (strategy === "hash") window.removeEventListener("hashchange", syncFromBrowser)
    }
  }, [basePath, controlledLocation, controlledPath, defaultPath, matchForLocation, onLocationChange, onPathChange, router, strategy])

  useEffect(() => {
    if (navigation.status !== "idle" || typeof window === "undefined" || !scrollRestoration) return
    const options = navigationOptions.current.get(locationPath(currentLocation))
    if (options?.preventScrollReset) return
    if (scrollRestoration === "restore") {
      const saved = scrollPositions.current.get(locationPath(currentLocation))
      if (saved) window.scrollTo(saved.x, saved.y)
      else window.scrollTo(0, 0)
    } else window.scrollTo(0, 0)
  }, [currentLocation.key, navigation.status, scrollRestoration])

  const createHref = useCallback((target: NRouteTarget) => {
    if (isExternalRouteTarget(target)) return target as string
    const next = resolveRouteTarget(normalizeTarget(target), currentLocation)
    return router?.createHref?.(locationPath(next)) ?? routeHref(next, strategy, basePath)
  }, [basePath, currentLocation, normalizeTarget, router, strategy])

  const createLinkProps = useCallback((target: NRouteTarget, options?: NRouteNavigateOptions) => ({
    href: createHref(target),
    onClick: (event: ReactMouseEvent<HTMLAnchorElement>) => {
      if (!isPlainPrimaryClick(event)) return
      if (event.currentTarget.hasAttribute("download") || event.currentTarget.target && event.currentTarget.target !== "_self") return
      if (isExternalRouteTarget(target)) return
      event.preventDefault()
      updateLocation(target, options)
    },
  }), [createHref, updateLocation])

  const handleLinkCapture = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    if (!isPlainPrimaryClick(event)) return
    const anchor = (event.target as Element).closest<HTMLAnchorElement>("a[href]")
    if (!anchor || anchor.target && anchor.target !== "_self" || anchor.hasAttribute("download")) return
    const rawHref = anchor.getAttribute("href")
    if (!rawHref || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) return
    if (rawHref.startsWith("#") && !(strategy === "hash" && rawHref.startsWith("#/"))) return
    const url = new URL(anchor.href, typeof window === "undefined" ? "http://localhost" : window.location.href)
    if (typeof window !== "undefined" && url.origin !== window.location.origin) return
    const candidatePath = strategy === "hash" && rawHref.startsWith("#/")
      ? rawHref.slice(1)
      : `${stripBasePath(url.pathname, basePath)}${url.search}${url.hash}`
    const nextLocation = parseRouteLocation(candidatePath)
    if (!matchForLocation(nextLocation)) return
    event.preventDefault()
    updateLocation(candidatePath)
  }, [basePath, matchForLocation, strategy, updateLocation])

  const invalidate = useCallback((filter: NRouteCacheInvalidation) => {
    routeCache.current.invalidate(filter)
    prefetchCache.current.clear()
  }, [])
  const invalidateRoute = useCallback((routeId: string) => {
    routeCache.current.invalidateRoute(routeId)
    prefetchCache.current.clear()
  }, [])
  const clearCache = useCallback(() => {
    routeCache.current.clear()
    prefetchCache.current.clear()
  }, [])
  const retryRouteModule = useCallback((routeId?: string) => {
    moduleRegistry.current.invalidate(routeId)
    activeMatchRef.current = undefined
    setCacheRevision((revision) => revision + 1)
  }, [])
  const revalidate = useCallback(() => {
    const routeIds = activeMatchRef.current?.branch.map(({ route }) => route.id) ?? []
    if (routeIds.length > 0) routeCache.current.invalidate({ routeIds })
    activeMatchRef.current = undefined
    setCacheRevision((revision) => revision + 1)
  }, [])

  const previewTransition = candidate ? createNRouteTransition(activeMatchRef.current, candidate) : undefined
  const previewState: RenderState = !candidate ? "not-found" : !candidateAllowed
    ? "forbidden"
    : previewTransition && hasTransitionWork(previewTransition) ? "pending" : "ready"
  const previewMatch = candidate && previewTransition && previewState === "ready"
    ? withLoaderData(candidate, retainedLoaderData(previewTransition))
    : undefined
  const effectiveResolution = resolution.key === currentLocation.key
    ? resolution
    : { key: currentLocation.key, state: previewState, match: previewMatch }
  const value = useMemo<NroutesContextValue<TData, TContext>>(() => ({
    path: currentLocation.pathname,
    location: currentLocation,
    match: effectiveResolution.match,
    matches: effectiveResolution.match?.branch ?? candidate?.branch ?? [],
    navigation,
    labels,
    navigate: updateLocation,
    prefetch,
    href: createHref,
    invalidate,
    invalidateRoute,
    revalidate,
    clearCache,
    retryRouteModule,
    createLinkProps,
  }), [candidate?.branch, clearCache, createLinkProps, currentLocation, effectiveResolution.match, invalidate, invalidateRoute, labels, navigation, prefetch, retryRouteModule, revalidate, updateLocation])
  const renderValue = useMemo(() => ({
    state: effectiveResolution.state,
    pendingFallback,
    notFoundFallback,
    forbiddenFallback,
    errorFallback: typeof errorFallback === "function"
      ? (error: unknown, match?: unknown) => errorFallback(error, match as NRouteMatch<TData, TContext> | undefined)
      : errorFallback,
  }), [effectiveResolution.state, errorFallback, forbiddenFallback, notFoundFallback, pendingFallback])

  return (
    <NroutesContext.Provider value={value as NroutesContextValue}>
      <NRouteRenderContext.Provider value={renderValue}>
        <Box
          display="contents"
          colorPalette={colorPalette}
          onClickCapture={handleLinkCapture}
          className={classNames?.root}
          css={styles?.root}
          data-scope="n-routes"
          data-part="root"
        >
          {progress ? <NRouteProgress delay={progressDelay} unstyled={unstyled} className={classNames?.progress} styles={styles?.progress} /> : null}
          {children ?? <NRouteOutlet<TData, TContext> />}
        </Box>
      </NRouteRenderContext.Provider>
    </NroutesContext.Provider>
  )
}

function NRouteProgress({ delay, unstyled, className, styles }: { delay: number; unstyled: boolean; className?: string; styles?: NonNullable<NroutesProps["styles"]>["progress"] }) {
  const { labels, navigation } = useNroutes()
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (navigation.status === "idle") {
      setVisible(false)
      return undefined
    }
    const timer = window.setTimeout(() => setVisible(true), Math.max(0, delay))
    return () => window.clearTimeout(timer)
  }, [delay, navigation.status])
  if (!visible) return null
  return (
    <Box
      role="progressbar"
      aria-label={labels.navigationProgress}
      position="fixed"
      insetBlockStart="0"
      insetInline="0"
      height={unstyled ? undefined : "0.2rem"}
      zIndex="max"
      overflow="hidden"
      bg={unstyled ? undefined : "colorPalette.muted"}
      className={className}
      css={styles}
      data-scope="n-routes"
      data-part="progress"
    >
      <Box width={unstyled ? undefined : "40%"} height="full" bg={unstyled ? undefined : "colorPalette.solid"} animation={unstyled ? undefined : "n-route-progress 1s ease-in-out infinite"} _motionReduce={{ animation: "none", width: "70%" }} css={{
        "@keyframes n-route-progress": { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(350%)" } },
      }} />
    </Box>
  )
}

function resolveErrorElement<TData, TContext>(
  route: NRouteDefinition<TData, TContext>,
  match: NRouteMatch<TData, TContext>,
): ReactNode | ((error: unknown) => ReactNode) | undefined {
  const errorElement = route.errorElement
  if (errorElement === undefined) return undefined
  return typeof errorElement === "function" ? (error: unknown) => errorElement(error, match) : errorElement
}

function RouteLevel<TData, TContext>({ match, depth }: { match: NRouteMatch<TData, TContext>; depth: number }) {
  const entry = match.branch[depth]
  if (!entry) return null
  const routeMatch = { ...match, route: entry.route }
  const boundary = resolveErrorElement(entry.route, routeMatch)
  if (match.error !== undefined && match.errorRouteId === entry.route.id) {
    return <>{typeof boundary === "function" ? boundary(match.error) : boundary}</>
  }
  const element = typeof entry.route.element === "function" ? entry.route.element(routeMatch) : entry.route.element
  return (
    <RouteErrorBoundary errorElement={boundary} resetKey={match.location.key}>
      <NOutletDepthContext.Provider value={depth + 1}>{element}</NOutletDepthContext.Provider>
    </RouteErrorBoundary>
  )
}

/** Renderiza el siguiente nivel de la branch activa. */
export function NOutlet() {
  const depth = useContext(NOutletDepthContext)
  const { match } = useNroutes()
  return match ? <RouteLevel match={match} depth={depth} /> : null
}

/** Outlet principal accesible; enfoca y anuncia únicamente cuando termina la transición. */
export function NRouteOutlet<TData = unknown, TContext = unknown>({
  render,
  pendingFallback,
  notFoundFallback,
  forbiddenFallback,
  errorFallback,
  focusOnNavigate = true,
  unstyled = false,
  classNames,
  styles,
}: NRouteOutletProps<TData, TContext>) {
  const { labels, match, location, navigation } = useNroutes<TData, TContext>()
  const providerRender = useContext(NRouteRenderContext)
  const state = providerRender.state
  const regionRef = useRef<HTMLElement>(null)
  const previousKey = useRef(location.key)

  useEffect(() => {
    if (navigation.status !== "idle" || state === "pending") return
    if (focusOnNavigate && previousKey.current !== location.key) regionRef.current?.focus({ preventScroll: true })
    previousKey.current = location.key
  }, [focusOnNavigate, location.key, navigation.status, state])

  const stateBox = (part: "pending" | "notFound" | "forbidden" | "error", content: ReactNode) => (
    <Box ref={regionRef} as="section" tabIndex={-1} outline="none" role={part === "error" ? "alert" : undefined} className={classNames?.[part]} css={styles?.[part]} data-scope="n-route-outlet" data-part={part.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}>
      {content}
    </Box>
  )
  if (state === "pending") {
    const routePending = match ? [...match.branch].reverse().find(({ route }) => route.pendingElement !== undefined)?.route.pendingElement : undefined
    return stateBox("pending", pendingFallback ?? routePending ?? providerRender.pendingFallback ?? <DefaultPending labels={labels} />)
  }
  if (state === "not-found") return stateBox("notFound", notFoundFallback ?? providerRender.notFoundFallback ?? <DefaultMessage title={labels.notFoundTitle} description={labels.notFoundDescription} />)
  if (state === "forbidden") return stateBox("forbidden", forbiddenFallback ?? providerRender.forbiddenFallback ?? <DefaultMessage title={labels.forbiddenTitle} description={labels.forbiddenDescription} />)
  if (state === "error" && !match?.errorRouteId) {
    const fallback = errorFallback ?? providerRender.errorFallback
    const content = typeof fallback === "function" ? fallback(match?.error, match) : fallback
    return stateBox("error", content ?? <DefaultMessage title={labels.errorTitle} description={labels.errorDescription} />)
  }
  if (!match) return null

  const branchElement = <RouteLevel match={match} depth={0} />
  const content = render ? render(match, branchElement) : branchElement
  const title = routeTitle(match)
  return (
    <RouteErrorBoundary
      resetKey={match.location.key}
      errorElement={(error) => {
        const fallback = errorFallback ?? providerRender.errorFallback
        return typeof fallback === "function" ? fallback(error, match) : fallback ?? <DefaultMessage title={labels.errorTitle} description={labels.errorDescription} />
      }}
    >
      <Box
        key={locationPath(location)}
        ref={regionRef}
        as="section"
        tabIndex={-1}
        aria-label={labels.routeRegion(title)}
        outline="none"
        animation={unstyled ? undefined : "n-route-enter 180ms ease-out both"}
        css={{
          "@keyframes n-route-enter": {
            from: { opacity: 0, transform: "translateY(0.25rem)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
          "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          ...styles?.root,
        }}
        className={classNames?.root}
        data-scope="n-route-outlet"
        data-part="root"
      >
        <Box position="absolute" width="1px" height="1px" overflow="hidden" clip="rect(0, 0, 0, 0)" aria-live="polite">
          {title}
        </Box>
        <Suspense fallback={pendingFallback ?? providerRender.pendingFallback ?? <DefaultPending labels={labels} />}>
          {isValidElement(content) || content !== undefined ? content : null}
        </Suspense>
      </Box>
    </RouteErrorBoundary>
  )
}

function DefaultPending({ labels }: { labels: ReturnType<typeof resolveNroutesLabels> }) {
  return <Center minH="12rem" gap="3" role="status"><Spinner size="sm" /><Text color="fg.muted">{labels.loading}</Text></Center>
}

function DefaultMessage({ title, description }: { title: string; description: string }) {
  return <Center minH="16rem"><Stack textAlign="center" gap="2"><Text fontWeight="semibold" fontSize="lg">{title}</Text><Text color="fg.muted">{description}</Text></Stack></Center>
}

export function redirect(to: NRouteTarget, options: Omit<NRouteNavigateOptions, "preventScrollReset"> = {}): ReturnType<typeof createRedirect> {
  return createRedirect(to, options)
}

function createRedirect(to: NRouteTarget, options: Omit<NRouteNavigateOptions, "preventScrollReset">) {
  return { type: "redirect" as const, to, replace: options.replace, state: options.state }
}
