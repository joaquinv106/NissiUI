import { BookKey, BookOpen, FileClock, FilePlus2, KeyRound, LayoutDashboard, PlugZap, ReceiptText, Settings2 } from "lucide-react"
import type { ReactNode } from "react"

import type { NSidebarItem } from "../sidebar"
import type { NHeaderNavItem } from "../header"
import { resolveNFactureLabels } from "./labels"
import type { NFactureNavigationData, NFactureNavigationOptions, NFactureView } from "./types"
import { canUseNFactureView, NFACTURE_PERMISSIONS } from "./utils"

export function createNFactureNavigation(options: NFactureNavigationOptions = {}): NSidebarItem<NFactureNavigationData>[] {
  const labels = resolveNFactureLabels(options.labels)
  const role = options.role ?? "admin"
  const base = options.basePath?.replace(/\/$/, "") ?? ""
  const item = (id: NFactureView, label: string, icon: ReactNode, requiredPermission: string): NSidebarItem<NFactureNavigationData> => ({
    id: `facture-${id}`,
    label,
    icon,
    href: base ? `${base}/${id}` : undefined,
    data: { view: id },
    requiredPermission,
  })
  const operational = [
    item("dashboard", labels.dashboard, <LayoutDashboard size={17} />, NFACTURE_PERMISSIONS.view),
    item("issue", labels.issue, <FilePlus2 size={17} />, NFACTURE_PERMISSIONS.issue),
    item("history", labels.history, <FileClock size={17} />, NFACTURE_PERMISSIONS.history),
    item("ticket", labels.ticket, <ReceiptText size={17} />, NFACTURE_PERMISSIONS.ticket),
    item("docs", labels.documentation, <BookOpen size={17} />, NFACTURE_PERMISSIONS.view),
  ]
  const admin = [
    item("certificates", labels.certificates, <KeyRound size={17} />, NFACTURE_PERMISSIONS.admin),
    item("catalogs", labels.catalogs, <BookKey size={17} />, NFACTURE_PERMISSIONS.admin),
    item("integrations", labels.integrations, <PlugZap size={17} />, NFACTURE_PERMISSIONS.admin),
  ]
  const visible = (entry: NSidebarItem<NFactureNavigationData>) => canUseNFactureView(role, entry.data?.view ?? "dashboard", options.permissions)
  return [{
    id: "facture",
    label: labels.moduleName,
    icon: <Settings2 size={18} />,
    requiredPermission: NFACTURE_PERMISSIONS.view,
    children: [...operational.filter(visible), ...admin.filter(visible)],
  }]
}

/** Genera el mismo árbol funcional para el menú desplegable de NHeader. */
export function createNFactureHeaderNavigation(options: NFactureNavigationOptions = {}): NHeaderNavItem<NFactureNavigationData>[] {
  const toHeaderItem = (item: NSidebarItem<NFactureNavigationData>): NHeaderNavItem<NFactureNavigationData> => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
    href: item.href,
    disabled: item.disabled,
    data: item.data,
    children: item.children?.map(toHeaderItem),
  })
  return createNFactureNavigation(options).map(toHeaderItem)
}
