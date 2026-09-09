import type { ReactNode } from "react"

import type { NAppShellProps } from "../app-shell"
import type { NHeaderProps } from "../header"
import type { NBreadcrumbItem, NPageHeaderProps } from "../page"
import type { NRouteDefinition, NRouteMatch, NRouteStrategy, NroutesLabels } from "../routes"
import type { NSidebarItem, NSidebarProps } from "../sidebar"
import type { NComponentStyleProps } from "../styling"
import type { NThemeProviderProps } from "../theme"

export type NlayoutSlot = "root" | "header" | "sidebar" | "content" | "pageHeader" | "outlet" | "footer"

export interface NlayoutPageHeaderConfig extends Omit<NPageHeaderProps, "title" | "breadcrumbs"> {
  breadcrumbs?: readonly NBreadcrumbItem[]
}

export type NlayoutRoute<TData = unknown> = NRouteDefinition<TData> & {
  /** `false` elimina el encabezado; si se omite se muestra al menos el título de la ruta. */
  pageHeader?: NlayoutPageHeaderConfig | false
}

export interface NlayoutProps<TData = unknown> extends NComponentStyleProps<NlayoutSlot> {
  routes: readonly NlayoutRoute<TData>[]
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
  routeBasePath?: string
  path?: string
  defaultPath?: string
  onPathChange?: (path: string, match?: NRouteMatch<TData>) => void
  routeLabels?: Partial<NroutesLabels>
  pendingFallback?: ReactNode
  notFoundFallback?: ReactNode
  /** Instala NThemeProvider. Desactívalo cuando la aplicación ya tenga uno en la raíz. */
  provideTheme?: boolean
  themeProviderProps?: Omit<NThemeProviderProps, "children">
}
