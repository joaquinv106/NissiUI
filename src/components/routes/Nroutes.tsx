"use client"

import { Box, Center, Spinner, Stack, Text } from "@chakra-ui/react"
import {
  Suspense,
  isValidElement,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { NroutesContext, useNroutes } from "./context"
import { resolveNroutesLabels } from "./labels"
import type { NRouteDefinition, NRouteMatch, NRouteNavigateOptions, NRouteOutletProps, NroutesContextValue, NroutesProps } from "./types"
import { matchRoute, normalizeBasePath, normalizeRoutePath, routeHref, stripBasePath } from "./utils"

function readBrowserPath(strategy: NroutesProps["strategy"], basePath: string, fallback: string): string {
  if (typeof window === "undefined" || strategy === "memory") return normalizeRoutePath(fallback)
  if (strategy === "hash") return normalizeRoutePath(window.location.hash.slice(1), fallback)
  return stripBasePath(window.location.pathname, basePath)
}

function isPlainPrimaryClick(event: ReactMouseEvent): boolean {
  return event.button === 0 && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

/** Administrador de rutas ligero con History API, hash o memoria y navegación sin recargas. */
export function Nroutes<TData = unknown>({
  routes,
  children,
  strategy = "history",
  basePath: basePathProp,
  path: controlledPath,
  defaultPath = "/",
  onPathChange,
  labels: labelsProp,
  classNames,
  styles,
}: NroutesProps<TData>) {
  const basePath = normalizeBasePath(basePathProp)
  const labels = useMemo(() => resolveNroutesLabels(labelsProp), [labelsProp])
  const [internalPath, setInternalPath] = useState(() => readBrowserPath(strategy, basePath, defaultPath))
  const path = normalizeRoutePath(controlledPath ?? internalPath, defaultPath)
  const match = useMemo(() => matchRoute(routes, path), [path, routes])

  const updatePath = useCallback((nextPath: string, options: NRouteNavigateOptions = {}) => {
    const normalized = normalizeRoutePath(nextPath)
    const nextMatch = matchRoute(routes, normalized)
    if (controlledPath === undefined) setInternalPath(normalized)

    if (typeof window !== "undefined" && strategy !== "memory") {
      if (strategy === "hash") {
        const href = routeHref(normalized, strategy)
        const nextUrl = `${window.location.pathname}${window.location.search}${href}`
        window.history[options.replace ? "replaceState" : "pushState"](options.state, "", nextUrl)
      } else {
        window.history[options.replace ? "replaceState" : "pushState"](
          options.state,
          "",
          routeHref(normalized, strategy, basePath),
        )
      }
    }
    onPathChange?.(normalized, nextMatch)
  }, [basePath, controlledPath, onPathChange, routes, strategy])

  useEffect(() => {
    if (typeof window === "undefined" || strategy === "memory") return undefined
    const syncFromBrowser = () => {
      const nextPath = readBrowserPath(strategy, basePath, defaultPath)
      if (controlledPath === undefined) setInternalPath(nextPath)
      onPathChange?.(nextPath, matchRoute(routes, nextPath))
    }
    window.addEventListener("popstate", syncFromBrowser)
    if (strategy === "hash") window.addEventListener("hashchange", syncFromBrowser)
    return () => {
      window.removeEventListener("popstate", syncFromBrowser)
      if (strategy === "hash") window.removeEventListener("hashchange", syncFromBrowser)
    }
  }, [basePath, controlledPath, defaultPath, onPathChange, routes, strategy])

  const createLinkProps = useCallback((nextPath: string, options?: NRouteNavigateOptions) => ({
    href: routeHref(nextPath, strategy, basePath),
    onClick: (event: ReactMouseEvent<HTMLAnchorElement>) => {
      if (!isPlainPrimaryClick(event)) return
      event.preventDefault()
      updatePath(nextPath, options)
    },
  }), [basePath, strategy, updatePath])

  const handleLinkCapture = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    if (!isPlainPrimaryClick(event)) return
    const target = event.target as Element
    const anchor = target.closest<HTMLAnchorElement>("a[href]")
    if (!anchor || anchor.target && anchor.target !== "_self" || anchor.hasAttribute("download")) return
    const rawHref = anchor.getAttribute("href")
    if (!rawHref || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) return
    if (rawHref.startsWith("#") && !(strategy === "hash" && rawHref.startsWith("#/"))) return

    const url = new URL(anchor.href, typeof window === "undefined" ? "http://localhost" : window.location.href)
    if (typeof window !== "undefined" && url.origin !== window.location.origin) return
    const candidate = strategy === "hash" && rawHref.startsWith("#")
      ? normalizeRoutePath(rawHref.slice(1))
      : stripBasePath(url.pathname, basePath)
    if (!matchRoute(routes, candidate)) return

    event.preventDefault()
    updatePath(candidate)
  }, [basePath, routes, strategy, updatePath])

  const value = useMemo<NroutesContextValue<TData>>(() => ({
    path,
    match,
    labels,
    navigate: updatePath,
    createLinkProps,
  }), [createLinkProps, labels, match, path, updatePath])

  return (
    <NroutesContext.Provider value={value as NroutesContextValue}>
      <Box
        display="contents"
        onClickCapture={handleLinkCapture}
        className={classNames?.root}
        css={styles?.root}
        data-scope="n-routes"
        data-part="root"
      >
        {children ?? <NRouteOutlet<TData> />}
      </Box>
    </NroutesContext.Provider>
  )
}

/** Outlet accesible que anima sutilmente cada cambio y respeta reduced motion. */
export function NRouteOutlet<TData = unknown>({
  render,
  pendingFallback,
  notFoundFallback,
  focusOnNavigate = true,
  unstyled = false,
  classNames,
  styles,
}: NRouteOutletProps<TData>) {
  const { labels, match, path } = useNroutes<TData>()
  const regionRef = useRef<HTMLElement>(null)
  const previousPath = useRef(path)

  useEffect(() => {
    if (focusOnNavigate && previousPath.current !== path) regionRef.current?.focus({ preventScroll: true })
    previousPath.current = path
  }, [focusOnNavigate, path])

  if (!match) {
    return (
      <Box ref={regionRef} as="section" tabIndex={-1} outline="none" className={classNames?.notFound} css={styles?.notFound} data-scope="n-route-outlet" data-part="not-found">
        {notFoundFallback ?? (
          <Center minH="16rem">
            <Stack textAlign="center" gap="2">
              <Text fontWeight="semibold" fontSize="lg">{labels.notFoundTitle}</Text>
              <Text color="fg.muted">{labels.notFoundDescription}</Text>
            </Stack>
          </Center>
        )}
      </Box>
    )
  }

  const resolvedElement = typeof match.route.element === "function" ? match.route.element(match) : match.route.element
  const content = render ? render(match, resolvedElement) : resolvedElement
  const fallback = pendingFallback ?? (
    <Center minH="12rem" gap="3" role="status" className={classNames?.pending} css={styles?.pending} data-part="pending">
      <Spinner size="sm" />
      <Text color="fg.muted">{labels.loading}</Text>
    </Center>
  )

  return (
    <Box
      key={path}
      ref={regionRef}
      as="section"
      tabIndex={-1}
      aria-label={labels.routeRegion(match.route.title)}
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
        {match.route.title}
      </Box>
      <Suspense fallback={fallback}>{isValidElement(content) || content !== undefined ? content : null}</Suspense>
    </Box>
  )
}
