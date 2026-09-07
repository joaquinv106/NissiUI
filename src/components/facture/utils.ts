import { canAccess } from "../permissions"
import type { NFactureLine, NFactureRole, NFactureTotals } from "./types"

export const NFACTURE_PERMISSIONS = {
  view: "facture:view",
  issue: "facture:issue",
  history: "facture:history",
  ticket: "facture:ticket",
  admin: "facture:admin",
} as const

export function getNFacturePermissions(role: NFactureRole, permissions?: readonly string[]): string[] {
  if (permissions) return [...permissions]
  if (role === "admin") return ["facture:*"]
  if (role === "operator") return [NFACTURE_PERMISSIONS.view, NFACTURE_PERMISSIONS.issue, NFACTURE_PERMISSIONS.history, NFACTURE_PERMISSIONS.ticket]
  return [NFACTURE_PERMISSIONS.view, NFACTURE_PERMISSIONS.issue, NFACTURE_PERMISSIONS.ticket]
}

export function canUseNFactureView(role: NFactureRole, view: string, permissions?: readonly string[]): boolean {
  const required = view === "dashboard" || view === "docs" ? NFACTURE_PERMISSIONS.view
    : view === "issue" ? NFACTURE_PERMISSIONS.issue
      : view === "history" ? NFACTURE_PERMISSIONS.history
        : view === "ticket" ? NFACTURE_PERMISSIONS.ticket
          : NFACTURE_PERMISSIONS.admin
  return canAccess(getNFacturePermissions(role, permissions), required)
}

export function isValidMexicanRfc(value: string): boolean {
  return /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(value.trim().toLocaleUpperCase("es-MX"))
}

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

export function calculateNFactureTotals(lines: readonly NFactureLine[]): NFactureTotals {
  return lines.reduce<NFactureTotals>((totals, line) => {
    const gross = line.quantity * line.unitPrice
    const discount = Math.min(Math.max(line.discount, 0), gross)
    const taxable = gross - discount
    const vat = taxable * line.vatRate
    const ieps = taxable * line.iepsRate
    return {
      subtotal: money(totals.subtotal + gross),
      discount: money(totals.discount + discount),
      vat: money(totals.vat + vat),
      ieps: money(totals.ieps + ieps),
      total: money(totals.total + taxable + vat + ieps),
    }
  }, { subtotal: 0, discount: 0, vat: 0, ieps: 0, total: 0 })
}
