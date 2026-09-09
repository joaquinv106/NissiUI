import type { ReactNode } from "react"

import type { NAppShellProps } from "../app-shell"
import type { NHeaderProps } from "../header"
import type { NBreadcrumbItem, NPageHeaderProps } from "../page"
import type { NRouteDefinition, NRouteLocation, NRouteMatch, NRouteStrategy, NRouterAdapter, NroutesLabels } from "../routes"
import type { NSidebarItem, NSidebarProps } from "../sidebar"
import type { NComponentStyleProps } from "../styling"
import type { NThemeProviderProps } from "../theme"

export type NlayoutSlot = "root" | "header" | "sidebar" | "content" | "pageHeader" | "outlet" | "footer"

export interface NlayoutPageHeaderConfig extends Omit<NPageHeaderProps, "title" | "breadcrumbs"> {
  breadcrumbs?: readonly NBreadcrumbItem[]
}

export type NlayoutRoute<TData = unknown, TContext = unknown> = Omit<NRouteDefinition<TData, TContext>, "children"> & {
  /** `false` elimina el encabezado; si se omite se muestra al menos el título de la ruta. */
  pageHeader?: NlayoutPageHeaderConfig | false
  children?: readonly NlayoutRoute<TData, TContext>[]
}

export interface NlayoutProps<TData = unknown, TContext = unknown> extends NComponentStyleProps<NlayoutSlot> {
  routes: readonly NlayoutRoute<TData, TContext>[]
  navigation: NSidebarItem<TData>[]
  headerNavigation?: NHeaderProps<TData>["items"]
  brand?: ReactNode
  sidebarHeader?: ReactNode
  sidebarFooter?: ReactNode
  footer?: ReactNode
  sidebarProps?: Omit<NSidebarProps<TData>, "items" | "activeItemId">
  headerProps?: Omit<NHeaderProps<TData>, "items" | "activeItemId">
  shellProps?: Omit<NAppShellProps, "header" | "sidebar" | "footer" | "children">
  routeStrategy?: NRouteStrategy
  /** Permite que Next.js u otro framework sea dueño de la URL y la navegación. */
  routeRouter?: NRouterAdapter
  routeContext?: TContext
  routeBasePath?: string
  path?: string
  location?: string | NRouteLocation
  defaultPath?: string
  onPathChange?: (path: string, match?: NRouteMatch<TData>) => void
  routeLabels?: Partial<NroutesLabels>
  pendingFallback?: ReactNode
  notFoundFallback?: ReactNode
  forbiddenFallback?: ReactNode
  errorFallback?: ReactNode | ((error: unknown, match?: NRouteMatch<TData, TContext>) => ReactNode)
  routeProgress?: boolean
  routeProgressDelay?: number
  scrollRestoration?: false | "top" | "restore"
  /** Reserva configurable del trigger overlay del sidebar en móvil. */
  mobileSidebarTriggerInset?: string
  /** Instala NThemeProvider. Desactívalo cuando la aplicación ya tenga uno en la raíz. */
  provideTheme?: boolean
  themeProviderProps?: Omit<NThemeProviderProps, "children">
}
