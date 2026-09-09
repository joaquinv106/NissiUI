import type { NHeaderNavItem, ResolvedHeaderNavItem } from "./types"
import type { NPermissionMode } from "../permissions/types"

/** Aplana el árbol de navegación de NHeader asignando ids estables por posición. */
export function resolveHeaderItems<TData>(
  items: NHeaderNavItem<TData>[],
  getItemId?: (item: NHeaderNavItem<TData>, index: number) => string,
): ResolvedHeaderNavItem<TData>[] {
  let index = 0
  const resolve = (nodes: NHeaderNavItem<TData>[], path: string): ResolvedHeaderNavItem<TData>[] =>
    nodes.map((item, localIndex) => {
      const currentIndex = index++
      const id = item.id ?? getItemId?.(item, currentIndex) ?? `${path}-${localIndex}`
      return {
        id,
        item,
        children: resolve(item.children ?? [], id),
      }
    })
  return resolve(items, "header")
}

/** Cuenta las notificaciones marcadas como no leídas. */
export function countUnreadNotifications(notifications: readonly { unread?: boolean }[]): number {
  return notifications.filter((notification) => notification.unread).length
}

/** Aplica la misma política de capacidades usada por NSidebar y elimina grupos vacíos. */
export function filterHeaderItemsByPermission<TData>(
  items: ResolvedHeaderNavItem<TData>[],
  can: (required: string | string[], mode?: NPermissionMode) => boolean,
): ResolvedHeaderNavItem<TData>[] {
  return items.reduce<ResolvedHeaderNavItem<TData>[]>((visible, resolved) => {
    const { requiredPermission, permissionMode } = resolved.item
    if (requiredPermission && !can(requiredPermission, permissionMode)) return visible
    const children = filterHeaderItemsByPermission(resolved.children, can)
    if ((resolved.item.children?.length ?? 0) > 0 && children.length === 0) return visible
    visible.push({ ...resolved, children })
    return visible
  }, [])
}
