import type { NPermissionMode } from "../permissions/types"
import type { NSidebarItem, ResolvedSidebarItem } from "./types"

/** Identidad por defecto de un ítem: su `id` o el índice aplanado si no tiene uno. */
export function defaultSidebarItemId<TData>(item: NSidebarItem<TData>, index: number): string {
  return item.id ?? String(index)
}

/** Aplana el árbol de `NSidebarItem` a un árbol de nodos resueltos con id, índice y padre. */
export function resolveSidebarItems<TData>(
  items: NSidebarItem<TData>[],
  getItemId?: (item: NSidebarItem<TData>, index: number) => string,
): ResolvedSidebarItem<TData>[] {
  let index = 0
  const visit = (nodes: NSidebarItem<TData>[], parentId?: string): ResolvedSidebarItem<TData>[] =>
    nodes.map((item) => {
      const itemIndex = index++
      const id = getItemId?.(item, itemIndex) ?? defaultSidebarItemId(item, itemIndex)
      return {
        id,
        index: itemIndex,
        item,
        parentId,
        children: visit(item.children ?? [], id),
      }
    })
  return visit(items)
}

/** Quita elementos sin la capacidad requerida; un grupo se oculta si se queda sin hijos visibles. */
export function filterSidebarItemsByPermission<TData>(
  items: ResolvedSidebarItem<TData>[],
  can: (required: string | string[], mode?: NPermissionMode) => boolean,
): ResolvedSidebarItem<TData>[] {
  return items.reduce<ResolvedSidebarItem<TData>[]>((acc, resolved) => {
    const { requiredPermission, permissionMode } = resolved.item
    if (requiredPermission && !can(requiredPermission, permissionMode)) return acc
    const children = filterSidebarItemsByPermission(resolved.children, can)
    if ((resolved.item.children?.length ?? 0) > 0 && children.length === 0) return acc
    acc.push({ ...resolved, children })
    return acc
  }, [])
}

/** Convierte el árbol resuelto en una lista plana (ítem + todos sus descendientes). */
export function flattenSidebarItems<TData>(
  items: ResolvedSidebarItem<TData>[],
): ResolvedSidebarItem<TData>[] {
  return items.flatMap((item) => [item, ...flattenSidebarItems(item.children)])
}

/** Normaliza texto para búsqueda: quita acentos, mayúsculas y espacios sobrantes. */
function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim()
}

/** Filtra el árbol por coincidencia de etiqueta, conservando la jerarquía de los resultados. */
export function filterSidebarItems<TData>(
  items: ResolvedSidebarItem<TData>[],
  search: string,
): ResolvedSidebarItem<TData>[] {
  const term = normalizeSearch(search)
  if (!term) return items

  return items.flatMap((resolved) => {
    if (normalizeSearch(resolved.item.label).includes(term)) return [resolved]
    const children = filterSidebarItems(resolved.children, search)
    return children.length > 0 ? [{ ...resolved, children }] : []
  })
}

/** Busca un nodo por id en todo el árbol (incluye descendientes). */
export function findSidebarItem<TData>(
  items: ResolvedSidebarItem<TData>[],
  id: string,
): ResolvedSidebarItem<TData> | undefined {
  for (const item of items) {
    if (item.id === id) return item
    const child = findSidebarItem(item.children, id)
    if (child) return child
  }
  return undefined
}

/** Devuelve la ruta de ancestros hasta el nodo con el id indicado, usada para abrir sus grupos. */
export function findSidebarPath<TData>(
  items: ResolvedSidebarItem<TData>[],
  id: string,
  ancestors: ResolvedSidebarItem<TData>[] = [],
): ResolvedSidebarItem<TData>[] {
  for (const item of items) {
    const path = [...ancestors, item]
    if (item.id === id) return path
    const childPath = findSidebarPath(item.children, id, path)
    if (childPath.length > 0) return childPath
  }
  return []
}
