"use client"

import { Box, Stack, Text } from "@chakra-ui/react"
import { useMemo } from "react"

import { NAppShell } from "../app-shell"
import { NHeader } from "../header"
import { NBreadcrumbs, NPageHeader } from "../page"
import { NRouteOutlet, Nroutes, useNroutes } from "../routes"
import { NSidebar } from "../sidebar"
import { NThemeProvider } from "../theme"
import type { NlayoutProps, NlayoutRoute } from "./types"

type NlayoutFrameProps<TData, TContext> = Omit<
  NlayoutProps<TData, TContext>,
  "routeStrategy" | "routeRouter" | "routeContext" | "routeBasePath" | "path" | "location" | "defaultPath" | "onPathChange" | "routeLabels" | "provideTheme" | "themeProviderProps" | "routeProgress" | "routeProgressDelay" | "scrollRestoration"
>

function resolvePatternPath(pattern: string, params: Readonly<Record<string, string>>): string {
  return pattern.replace(/:([^/]+)/g, (_, key: string) => encodeURIComponent(params[key] ?? key)).replace(/\/\*$/, "") || "/"
}

function flattenLayoutRoutes<TData, TContext>(routes: readonly NlayoutRoute<TData, TContext>[]): NlayoutRoute<TData, TContext>[] {
  return routes.flatMap((route) => [route, ...flattenLayoutRoutes(route.children ?? [])])
}

function NlayoutFrame<TData, TContext>({
  routes,
  navigation,
  headerNavigation,
  brand,
  sidebarHeader,
  sidebarFooter,
  footer,
  sidebarProps,
  headerProps,
  shellProps,
  pendingFallback,
  notFoundFallback,
  forbiddenFallback,
  errorFallback,
  mobileSidebarTriggerInset = "4.25rem",
  unstyled = false,
  classNames,
  styles,
}: NlayoutFrameProps<TData, TContext>) {
  const { match, navigate } = useNroutes<TData, TContext>()
  const activeTitle = match
    ? typeof match.route.title === "function" ? match.route.title(match) : match.route.title
    : undefined
  const activeItemId = match?.route.navigationId
  const sidebarPosition = shellProps?.sidebarPosition ?? "start"
  const hasMobileSidebarTrigger = (sidebarProps?.responsive ?? "overlay") === "overlay" && sidebarProps?.showMobileTrigger !== false
  const headerContentInset = !unstyled && hasMobileSidebarTrigger
    ? sidebarPosition === "start"
      ? { paddingInlineStart: { base: mobileSidebarTriggerInset, md: "6" } }
      : { paddingInlineEnd: { base: mobileSidebarTriggerInset, md: "6" } }
    : {}
  const routeByNavigationId = useMemo(() => new Map(
    flattenLayoutRoutes(routes).filter((route) => route.navigationId).map((route) => [route.navigationId!, route]),
  ), [routes])

  const selectRoute = (id: string | undefined) => {
    const route = id ? routeByNavigationId.get(id) : undefined
    if (route) navigate(route.path)
  }

  const sidebar = (
    <NSidebar
      {...sidebarProps}
      items={navigation}
      activeItemId={activeItemId}
      onItemSelect={(item) => {
        if (!item.href) selectRoute(item.id)
        sidebarProps?.onItemSelect?.(item)
      }}
      header={sidebarProps?.header ?? sidebarHeader ?? brand}
      footer={sidebarProps?.footer ?? sidebarFooter}
      unstyled={unstyled || sidebarProps?.unstyled}
      classNames={sidebarProps?.classNames}
      styles={sidebarProps?.styles}
    />
  )

  const header = (
    <NHeader
      variant="app"
      sticky
      surface="outline"
      showThemeToggle
      {...headerProps}
      items={headerNavigation}
      activeItemId={activeItemId}
      onItemSelect={(item) => {
        if (!item.href) selectRoute(item.id)
        headerProps?.onItemSelect?.(item)
      }}
      brand={headerProps?.brand ?? brand}
      extra={headerProps?.extra ?? <Text fontWeight="semibold" truncate>{activeTitle}</Text>}
      unstyled={unstyled || headerProps?.unstyled}
      classNames={headerProps?.classNames}
      styles={{
        ...headerProps?.styles,
        content: { ...headerContentInset, ...headerProps?.styles?.content },
      }}
    />
  )

  return (
    <Box display="contents" className={classNames?.root} css={styles?.root} data-scope="n-layout" data-part="root">
      <NAppShell
        {...shellProps}
        header={<Box display="contents" className={classNames?.header} css={styles?.header} data-part="header">{header}</Box>}
        sidebar={<Box display="contents" className={classNames?.sidebar} css={styles?.sidebar} data-part="sidebar">{sidebar}</Box>}
        footer={footer ? <Box className={classNames?.footer} css={styles?.footer} data-part="footer">{footer}</Box> : undefined}
        unstyled={unstyled || shellProps?.unstyled}
        classNames={shellProps?.classNames}
        styles={shellProps?.styles}
      >
        <Box className={classNames?.content} css={styles?.content} data-part="content">
          <NRouteOutlet<TData, TContext>
            pendingFallback={pendingFallback}
            notFoundFallback={notFoundFallback}
            forbiddenFallback={forbiddenFallback}
            errorFallback={errorFallback}
            unstyled={unstyled}
            classNames={{ root: classNames?.outlet }}
            styles={{ root: styles?.outlet }}
            render={(routeMatch, element) => {
              const route = routeMatch.route as NlayoutRoute<TData, TContext>
              const pageHeader = route.pageHeader
              const pageHeaderConfig = pageHeader === false ? undefined : pageHeader
              const title = typeof route.title === "function" ? route.title(routeMatch) : route.title
              const derivedBreadcrumbs = routeMatch.branch.map((entry, index) => {
                const routeBreadcrumb = entry.route.breadcrumb
                const label = typeof routeBreadcrumb === "function"
                  ? routeBreadcrumb({ ...routeMatch, route: entry.route })
                  : routeBreadcrumb ?? (typeof entry.route.title === "function"
                    ? entry.route.title({ ...routeMatch, route: entry.route })
                    : entry.route.title)
                return {
                  id: entry.route.id,
                  label,
                  href: index === routeMatch.branch.length - 1 ? undefined : resolvePatternPath(entry.pathname, routeMatch.params),
                  current: index === routeMatch.branch.length - 1,
                }
              })
              const breadcrumbs = pageHeaderConfig?.breadcrumbs?.length ? pageHeaderConfig.breadcrumbs : derivedBreadcrumbs
              return (
                <Stack gap={{ base: "6", md: "8" }}>
                  {pageHeader !== false ? (
                    <Box className={classNames?.pageHeader} css={styles?.pageHeader} data-part="page-header">
                      <NPageHeader
                        {...pageHeaderConfig}
                        title={title}
                        breadcrumbs={breadcrumbs.length > 1 ? <NBreadcrumbs items={breadcrumbs} /> : undefined}
                        unstyled={unstyled || pageHeaderConfig?.unstyled}
                      />
                    </Box>
                  ) : null}
                  {element}
                </Stack>
              )
            }}
          />
        </Box>
      </NAppShell>
    </Box>
  )
}

/** Layout de aplicación que armoniza navegación, encabezados, tema y rutas SPA. */
export function Nlayout<TData = unknown, TContext = unknown>({
  routeStrategy = "history",
  routeRouter,
  routeContext,
  routeBasePath,
  path,
  location,
  defaultPath,
  onPathChange,
  routeLabels,
  routeProgress = false,
  routeProgressDelay,
  scrollRestoration,
  provideTheme = true,
  themeProviderProps,
  ...frameProps
}: NlayoutProps<TData>) {
  const content = (
    <Nroutes
      routes={frameProps.routes}
      strategy={routeStrategy}
      router={routeRouter}
      context={routeContext}
      basePath={routeBasePath}
      path={path}
      location={location}
      defaultPath={defaultPath}
      onPathChange={onPathChange}
      labels={routeLabels}
      pendingFallback={frameProps.pendingFallback}
      notFoundFallback={frameProps.notFoundFallback}
      forbiddenFallback={frameProps.forbiddenFallback}
      errorFallback={frameProps.errorFallback}
      progress={routeProgress}
      progressDelay={routeProgressDelay}
      scrollRestoration={scrollRestoration}
    >
      <NlayoutFrame {...frameProps} />
    </Nroutes>
  )

  return provideTheme ? <NThemeProvider {...themeProviderProps}>{content}</NThemeProvider> : content
}
