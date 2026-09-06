import type { NHeaderNavItem, ResolvedHeaderNavItem } from "./types"

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
