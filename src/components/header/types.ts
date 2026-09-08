import type { ReactNode } from "react"

import type { NThemePresentation } from "../theme/types"
import type { NComponentStyleProps } from "../styling"
export type NHeaderSlot = "root" | "content" | "brand" | "navigation" | "search" | "actions"

export type NHeaderVariant = "site" | "app"
export type NHeaderResponsive = "overlay" | "push" | "hidden"

export interface NHeaderNavItem<TData = unknown> {
  id?: string
  label: string
  icon?: ReactNode
  href?: string
  badge?: ReactNode
  children?: NHeaderNavItem<TData>[]
  disabled?: boolean
  data?: TData
  onClick?: (item: NHeaderNavItem<TData>) => void
}

export interface NHeaderAction {
  id: string
  label: string
  icon?: ReactNode
  badge?: ReactNode
  href?: string
  disabled?: boolean
  colorPalette?: string
  presentation?: "icon" | "button"
  /** Mantiene la acción visible en la barra compacta móvil. */
  showOnMobile?: boolean
  onClick?: (action: NHeaderAction) => void
}

export interface NHeaderUserAction {
  id: string
  label: string
  icon?: ReactNode
  href?: string
  disabled?: boolean
  colorPalette?: string
  onClick?: (action: NHeaderUserAction) => void
}

export interface NHeaderUser {
  name: string
  role?: string
  avatarSrc?: string
  avatarFallback?: string
  actions?: NHeaderUserAction[]
}

export interface NHeaderNotification {
  id: string
  title: string
  description?: string
  unread?: boolean
  href?: string
  onClick?: (notification: NHeaderNotification) => void
}

export interface NHeaderSearchConfig {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
}

export interface NHeaderLabels {
  navigationLabel: string
  mobileMenuTitle: string
  openMobileMenu: string
  closeMobileMenu: string
  searchPlaceholder: string
  searchAriaLabel: string
  userMenu: (name: string) => string
  notifications: string
  noNotifications: string
  unreadNotifications: (count: number) => string
  switchToLightTheme: string
  switchToDarkTheme: string
}

export interface NHeaderProps<TData = unknown> extends NComponentStyleProps<NHeaderSlot> {
  variant?: NHeaderVariant
  brand?: ReactNode
  items?: NHeaderNavItem<TData>[]
  activeItemId?: string
  defaultActiveItemId?: string
  onItemSelect?: (item: NHeaderNavItem<TData>) => void
  getItemId?: (item: NHeaderNavItem<TData>, index: number) => string
  search?: boolean | ReactNode | NHeaderSearchConfig
  actions?: NHeaderAction[]
  notifications?: NHeaderNotification[]
  user?: NHeaderUser
  extra?: ReactNode
  responsive?: NHeaderResponsive
  mobileOpen?: boolean
  defaultMobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
  showThemeToggle?: boolean
  /** Presentación del selector NTheme cuando existe NThemeProvider. */
  themePresentation?: NThemePresentation
  /** @deprecated Con NThemeProvider puede omitirse; se conserva para el toggle binario legado. */
  theme?: "light" | "dark"
  /** @deprecated Usa onThemeChange en NThemeProvider para sincronizar toda la aplicación. */
  onThemeChange?: (theme: "light" | "dark") => void
  sticky?: boolean
  height?: string
  surface?: "elevated" | "outline" | "plain"
  colorPalette?: string
  labels?: Partial<NHeaderLabels>
}

export interface ResolvedHeaderNavItem<TData = unknown> {
  id: string
  item: NHeaderNavItem<TData>
  children: ResolvedHeaderNavItem<TData>[]
}
