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

type NlayoutFrameProps<TData> = Omit<
  NlayoutProps<TData>,
  "routeStrategy" | "routeBasePath" | "path" | "defaultPath" | "onPathChange" | "routeLabels" | "provideTheme" | "themeProviderProps"
>

function NlayoutFrame<TData>({
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
  unstyled = false,
  classNames,
  styles,
}: NlayoutFrameProps<TData>) {
  const { match, navigate } = useNroutes<TData>()
  const activeItemId = match?.route.navigationId
  const sidebarPosition = shellProps?.sidebarPosition ?? "start"
  const hasMobileSidebarTrigger = (sidebarProps?.responsive ?? "overlay") === "overlay" && sidebarProps?.showMobileTrigger !== false
  const headerContentInset = !unstyled && hasMobileSidebarTrigger
    ? sidebarPosition === "start"
      ? { paddingInlineStart: { base: "4.25rem", md: "6" } }
      : { paddingInlineEnd: { base: "4.25rem", md: "6" } }
    : {}
  const routeByNavigationId = useMemo(() => new Map(
    routes.filter((route) => route.navigationId).map((route) => [route.navigationId!, route]),
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
      extra={headerProps?.extra ?? <Text fontWeight="semibold" truncate>{match?.route.title}</Text>}
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
          <NRouteOutlet<TData>
            pendingFallback={pendingFallback}
            notFoundFallback={notFoundFallback}
            unstyled={unstyled}
            classNames={{ root: classNames?.outlet }}
            styles={{ root: styles?.outlet }}
            render={(routeMatch, element) => {
              const route = routeMatch.route as NlayoutRoute<TData>
              const pageHeader = route.pageHeader
              return (
                <Stack gap={{ base: "6", md: "8" }}>
                  {pageHeader !== false ? (
                    <Box className={classNames?.pageHeader} css={styles?.pageHeader} data-part="page-header">
                      <NPageHeader
                        {...pageHeader}
                        title={route.title}
                        breadcrumbs={pageHeader?.breadcrumbs?.length ? <NBreadcrumbs items={pageHeader.breadcrumbs} /> : undefined}
                        unstyled={unstyled || pageHeader?.unstyled}
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
export function Nlayout<TData = unknown>({
  routeStrategy = "history",
  routeBasePath,
  path,
  defaultPath,
  onPathChange,
  routeLabels,
  provideTheme = true,
  themeProviderProps,
  ...frameProps
}: NlayoutProps<TData>) {
  const content = (
    <Nroutes
      routes={frameProps.routes}
      strategy={routeStrategy}
      basePath={routeBasePath}
      path={path}
      defaultPath={defaultPath}
      onPathChange={onPathChange}
      labels={routeLabels}
    >
      <NlayoutFrame {...frameProps} />
    </Nroutes>
  )

  return provideTheme ? <NThemeProvider {...themeProviderProps}>{content}</NThemeProvider> : content
}
