import type { ReactNode } from "react"

import type { NHeaderNavItem } from "../header"
import type { NSidebarItem } from "../sidebar"
import type { NComponentStyleProps } from "../styling"
export type NFactureSlot = "root" | "navigation" | "content" | "loading" | "error"

export type NFactureRole = "admin" | "operator" | "pos"
export type NFactureView = "dashboard" | "issue" | "history" | "ticket" | "certificates" | "catalogs" | "integrations" | "docs"
export type NFactureEnvironment = "sandbox" | "production"

export interface NFactureCustomer extends Record<string, unknown> {
  id: string
  rfc: string
  name: string
  postalCode: string
  taxRegime: string
  email?: string
}

export interface NFactureCustomerDraft extends Record<string, unknown> {
  rfc: string
  name: string
  postalCode: string
  taxRegime: string
  email?: string
}

export interface NFactureCustomerResult extends NFactureOperationResult {
  customer?: NFactureCustomer
}

export interface SATItem extends Record<string, unknown> {
  id: string
  sku: string
  description: string
  productServiceKey: string
  unitKey: string
  unitLabel?: string
  unitPrice: number
  vatRate?: number
  iepsRate?: number
}

export interface NFactureLine {
  id: string
  itemId: string
  sku: string
  description: string
  productServiceKey: string
  unitKey: string
  quantity: number
  unitPrice: number
  discount: number
  vatRate: number
  iepsRate: number
}

export interface NFactureTotals {
  subtotal: number
  discount: number
  vat: number
  ieps: number
  total: number
}

export interface NFactureDraft {
  customerId: string
  customer?: NFactureCustomer
  lines: readonly NFactureLine[]
  cfdiUse: string
  paymentForm: string
  paymentMethod: "PUE" | "PPD"
  currency: string
  totals: NFactureTotals
  sourceTicketId?: string
}

export interface NFactureRecord extends Record<string, unknown> {
  id: string
  uuid: string
  series: string
  folio: string
  issuedAt: string
  customerName: string
  customerRfc: string
  total: number
  status: "stamped" | "pending" | "cancelled" | "error"
  xmlUrl?: string
  pdfUrl?: string
  actions?: string
}

export interface NFactureTicket {
  id: string
  folio: string
  issuedAt: string
  total: number
  lines: readonly NFactureLine[]
  invoiced?: boolean
}

export interface CSDConfig {
  certificateFileName?: string
  privateKeyFileName?: string
  certificateNumber?: string
  rfc?: string
  validFrom?: string
  validUntil?: string
  status?: "missing" | "valid" | "expired" | "invalid"
}

export interface NFactureFiscalProfile {
  rfc: string
  name: string
  postalCode: string
  taxRegime: string
}

export interface NFacturePacConfig {
  providerId?: string
  environment: NFactureEnvironment
  configured: boolean
}

export interface NFactureIntegration extends Record<string, unknown> {
  id: string
  label: string
  type: "api-key" | "webhook"
  environment: NFactureEnvironment
  status: "active" | "inactive" | "error"
  endpoint?: string
  maskedSecret?: string
}

export interface NFactureCatalogs {
  cfdiUses: readonly { value: string; label: string; compatibleRegimes?: readonly string[] }[]
  paymentForms: readonly { value: string; label: string }[]
  paymentMethods: readonly { value: "PUE" | "PPD"; label: string }[]
}

export interface NFactureData {
  customers: readonly NFactureCustomer[]
  items: readonly SATItem[]
  invoices: readonly NFactureRecord[]
  tickets: readonly NFactureTicket[]
  csd?: CSDConfig
  pac?: NFacturePacConfig
  integrations?: readonly NFactureIntegration[]
  catalogs: NFactureCatalogs
}

export interface NFactureOperationResult {
  success: boolean
  message?: string
  invoice?: NFactureRecord
  fieldErrors?: Record<string, string>
}

export interface NFactureDataAdapter {
  load?: () => Partial<NFactureData> | Promise<Partial<NFactureData>>
  findTicket?: (folio: string) => NFactureTicket | undefined | Promise<NFactureTicket | undefined>
  stampInvoice?: (draft: NFactureDraft) => NFactureOperationResult | Promise<NFactureOperationResult>
  inspectCertificate?: (certificate: File, privateKey?: File, password?: string) => CSDConfig | Promise<CSDConfig>
  inspectTaxStatus?: (taxStatusFile: File) => NFactureFiscalProfile | Promise<NFactureFiscalProfile>
  savePac?: (config: NFacturePacConfig & { apiKey?: string }) => NFactureOperationResult | Promise<NFactureOperationResult>
  createApiKey?: (environment: NFactureEnvironment) => { secret: string } | Promise<{ secret: string }>
  saveWebhook?: (endpoint: string, environment: NFactureEnvironment) => NFactureOperationResult | Promise<NFactureOperationResult>
  resendInvoice?: (invoice: NFactureRecord) => NFactureOperationResult | Promise<NFactureOperationResult>
  createCustomer?: (customer: NFactureCustomerDraft) => NFactureCustomerResult | Promise<NFactureCustomerResult>
}

export interface NFactureProviderProps {
  data?: Partial<NFactureData>
  adapter?: NFactureDataAdapter
  children: ReactNode
}

export interface NFactureContextValue {
  data?: Partial<NFactureData>
  adapter?: NFactureDataAdapter
}

export interface NFactureNavigationData {
  view: NFactureView
}

export interface NFactureNavigationOptions {
  basePath?: string
  role?: NFactureRole
  permissions?: readonly string[]
  labels?: Partial<NFactureLabels>
}

export interface NFactureLabels {
  moduleName: string
  moduleDescription: string
  navigationLabel: string
  dashboard: string
  issue: string
  history: string
  ticket: string
  administration: string
  certificates: string
  catalogs: string
  integrations: string
  documentation: string
  roleLabel: string
  adminRole: string
  operatorRole: string
  posRole: string
  loading: string
  loadError: string
  retry: string
  stampedMetric: string
  cancelledMetric: string
  pendingMetric: string
  errorMetric: string
  recentInvoices: string
  customer: string
  customerPlaceholder: string
  customerHelp: string
  addCustomer: string
  newCustomerTitle: string
  newCustomerDescription: string
  customerName: string
  postalCode: string
  taxRegime: string
  email: string
  saveCustomer: string
  customerCreated: string
  customerCreateError: string
  invalidRfc: string
  concepts: string
  cfdiUse: string
  paymentForm: string
  paymentMethod: string
  currency: string
  subtotal: string
  discount: string
  vat: string
  ieps: string
  total: string
  stamp: string
  stamping: string
  stampSuccess: string
  stampError: string
  missingCustomer: string
  missingLines: string
  incompatibleUse: string
  invoiceGrid: string
  ticketFolio: string
  ticketPlaceholder: string
  searchTicket: string
  searchingTicket: string
  ticketNotFound: string
  ticketAlreadyInvoiced: string
  ticketReady: string
  certificateTitle: string
  certificateDescription: string
  certificateFile: string
  privateKeyFile: string
  privateKeyPassword: string
  inspectCertificate: string
  inspectingCertificate: string
  certificateHint: string
  validCertificate: string
  invalidCertificate: string
  pacTitle: string
  pacDescription: string
  pacProvider: string
  environment: string
  sandbox: string
  production: string
  apiKey: string
  savePac: string
  pacSaved: string
  mappingTitle: string
  mappingDescription: string
  integrationTitle: string
  integrationDescription: string
  noData: string
  statusStamped: string
  statusPending: string
  statusCancelled: string
  statusError: string
  folio: string
  issuedAt: string
  rfc: string
  status: string
  satKey: string
  quantity: string
  unitPrice: string
  sku: string
  productOrService: string
  productServiceKey: string
  unitKey: string
  actions: string
  downloadPdf: string
  downloadXml: string
  resendEmail: string
  viewDocument: string
  documentPreview: string
  taxStatusFile: string
  inspectTaxStatus: string
  fiscalProfileReady: string
  generateApiKey: string
  generatedApiKey: string
  webhookEndpoint: string
  saveWebhook: string
  integration: string
  integrationType: string
  openConfiguration: string
  manageCatalogs: string
  viewDocumentation: string
  documentationTitle: string
  documentationDescription: string
  docsIntegration: string
  docsNavigation: string
  docsSecurity: string
  docsIntegrationBody: string
  docsNavigationBody: string
  docsSecurityBody: string
  fiscalNotice: string
}

export interface NFactureProps extends NComponentStyleProps<NFactureSlot> {
  role?: NFactureRole
  permissions?: readonly string[]
  data?: Partial<NFactureData>
  adapter?: NFactureDataAdapter
  view?: NFactureView
  defaultView?: NFactureView
  onViewChange?: (view: NFactureView) => void
  showNavigation?: boolean
  /** Oculta el encabezado propio cuando el host ya usa `NPageHeader`, por ejemplo dentro de `Nlayout`. */
  showHeader?: boolean
  navigation?: NSidebarItem<NFactureNavigationData>[]
  /** Limita el alto de la vista y mantiene el desplazamiento dentro del módulo. */
  contentMaxHeight?: string
  colorPalette?: string
  labels?: Partial<NFactureLabels>
}

export interface NFactureDashboardProps extends NComponentStyleProps<"root"> {
  invoices: readonly NFactureRecord[]
  labels: NFactureLabels
  adapter?: NFactureDataAdapter
}
export interface NFactureHistoryProps extends NFactureDashboardProps { title?: string }
export interface NFactureIssuerProps extends NComponentStyleProps<"root"> {
  data: NFactureData
  adapter?: NFactureDataAdapter
  labels: NFactureLabels
  colorPalette: string
  initialTicket?: NFactureTicket
}
export interface NFactureTicketViewProps extends NComponentStyleProps<"root"> {
  tickets: readonly NFactureTicket[]
  adapter?: NFactureDataAdapter
  labels: NFactureLabels
  onUseTicket: (ticket: NFactureTicket) => void
}
export interface NFactureDocumentationProps extends NComponentStyleProps<"root"> { labels: NFactureLabels }

/** Alias solicitado por integraciones que nombran el contrato por dominio. */
export type InvoiceProps = NFactureProps

export type NFactureHeaderNavigation = NHeaderNavItem<NFactureNavigationData>[]
