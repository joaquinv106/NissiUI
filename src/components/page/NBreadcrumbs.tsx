import { Box, Link, Menu, Portal } from "@chakra-ui/react"
import { ChevronRight, Ellipsis } from "lucide-react"
import { Fragment, useMemo } from "react"

import { defaultNBreadcrumbsLabels, resolveLabels } from "./labels"
import type { NBreadcrumbItem, NBreadcrumbsProps } from "./types"

function BreadcrumbControl({ item }: { item: NBreadcrumbItem }) {
  if (item.current || (!item.href && !item.onClick)) return <Box as="span" aria-current={item.current ? "page" : undefined} color={item.current ? "fg" : "fg.muted"} fontWeight={item.current ? "semibold" : undefined}>{item.icon}{item.label}</Box>
  return <Link href={item.href} color="fg.muted" aria-disabled={item.disabled || undefined} pointerEvents={item.disabled ? "none" : undefined} onClick={(event) => { if (item.onClick) { event.preventDefault(); item.onClick() } }}>{item.icon}{item.label}</Link>
}

/** Ruta jerárquica con colapso accesible de niveles intermedios. */
export function NBreadcrumbs({ items, maxItems = 4, separator = <ChevronRight aria-hidden="true" size={14} />, labels: labelsProp }: NBreadcrumbsProps) {
  const labels = useMemo(() => resolveLabels(defaultNBreadcrumbsLabels, labelsProp), [labelsProp])
  const shouldCollapse = items.length > Math.max(2, maxItems)
  const hidden = shouldCollapse ? items.slice(1, -(Math.max(2, maxItems) - 1)) : []
  const visible = shouldCollapse ? [items[0], null, ...items.slice(-Math.max(1, maxItems - 2))] : [...items]

  return (
    <Box as="nav" aria-label={labels.navigationLabel} overflowX="auto">
      <Box as="ol" display="flex" alignItems="center" gap="2" listStyleType="none" m="0" p="0" whiteSpace="nowrap" fontSize="sm">
        {visible.map((item, index) => (
          <Fragment key={item?.id ?? "overflow"}>
            {index > 0 ? <Box as="li" aria-hidden="true" color="fg.muted">{separator}</Box> : null}
            <Box as="li">
              {item ? <BreadcrumbControl item={item} /> : (
                <Menu.Root>
                  <Menu.Trigger asChild><button type="button" aria-label={labels.overflowLabel}><Ellipsis aria-hidden="true" size={18} /></button></Menu.Trigger>
                  <Portal><Menu.Positioner><Menu.Content>{hidden.map((entry) => <Menu.Item key={entry.id} value={entry.id} disabled={entry.disabled} asChild={Boolean(entry.href)}>{entry.href ? <a href={entry.href} onClick={(event) => { if (entry.onClick) { event.preventDefault(); entry.onClick() } }}>{entry.label}</a> : <button type="button" onClick={entry.onClick}>{entry.label}</button>}</Menu.Item>)}</Menu.Content></Menu.Positioner></Portal>
                </Menu.Root>
              )}
            </Box>
          </Fragment>
        ))}
      </Box>
    </Box>
  )
}
