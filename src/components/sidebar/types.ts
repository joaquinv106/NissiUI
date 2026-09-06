import type { ReactNode } from "react"

import type { NPermissionCapability, NPermissionMode } from "../permissions/types"

export interface NSidebarItem<TData = unknown> {
  id?: string
  label: string
  icon?: ReactNode
  href?: string
  onClick?: (item: NSidebarItem<TData>) => void
  badge?: ReactNode
  children?: NSidebarItem<TData>[]
  disabled?: boolean
  data?: TData
  /** Oculta el elemento (y su grupo si queda vacío) cuando el usuario no tiene esta capacidad. */
  requiredPermission?: NPermissionCapability | NPermissionCapability[]
  permissionMode?: NPermissionMode
}

export interface NSidebarGroup<TData = unknown> extends NSidebarItem<TData> {
  children: NSidebarItem<TData>[]
}

export interface NSidebarLabels {
  navigationLabel: string
  collapseSidebar: string
  expandSidebar: string
  openMobileMenu: string
  closeMobileMenu: string
  searchPlaceholder: string
  searchAriaLabel: string
  emptySearch: string
  expandGroup: (group: string) => string
  collapseGroup: (group: string) => string
}

export interface NSidebarProps<TData = unknown> {
  items: NSidebarItem<TData>[]
  activeItemId?: string
  defaultActiveItemId?: string
  onItemSelect?: (item: NSidebarItem<TData>) => void
  collapsible?: boolean
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  collapsedWidth?: string
  expandedWidth?: string
  variant?: "elevated" | "outline" | "plain"
  colorPalette?: string
  position?: "start" | "end"
  responsive?: "overlay" | "push" | "hidden"
  /** Muestra el botón flotante que abre el Drawer en móvil. Activo por defecto. */
  showMobileTrigger?: boolean
  /** Estado controlado del Drawer móvil. */
  mobileOpen?: boolean
  /** Estado inicial del Drawer móvil no controlado. */
  defaultMobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
  searchable?: boolean
  header?: ReactNode
  footer?: ReactNode
  getItemId?: (item: NSidebarItem<TData>, index: number) => string
  labels?: Partial<NSidebarLabels>
  multipleGroupsOpen?: boolean
}

export interface ResolvedSidebarItem<TData = unknown> {
  id: string
  index: number
  item: NSidebarItem<TData>
  parentId?: string
  children: ResolvedSidebarItem<TData>[]
}
