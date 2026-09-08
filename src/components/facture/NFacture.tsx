"use client"

import {
  Badge,
  Box,
  Button,
  Card,
  Field,
  Flex,
  Heading,
  HStack,
  Input,
  Link,
  NativeSelect,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
} from "@chakra-ui/react"
import { AlertTriangle, CheckCircle2, FileCheck2, FileX2, Hourglass, PlugZap, ReceiptText, ShieldCheck } from "lucide-react"
import { type ReactNode, useEffect, useMemo, useState } from "react"

import { NDashboardGrid, NStatCard } from "../dashboard"
import { NDocumentView } from "../document-view"
import { NForm, type NFormConfig } from "../form"
import { NLineItemEditor, type NLineItemField } from "../line-item-editor"
import { NPageHeader } from "../page"
import { NPanel } from "../panel"
import { NPermissionsProvider } from "../permissions"
import { NSidebar } from "../sidebar"
import { NTable, type NTableColumn } from "../table"
import { resolveNFactureLabels } from "./labels"
import { createNFactureNavigation } from "./navigation"
import { useNFacture } from "./NissiInvoicingProvider"
import type {
  CSDConfig,
  NFactureCatalogs,
  NFactureCustomer,
  NFactureCustomerDraft,
  NFactureCustomerResult,
  NFactureData,
  NFactureDataAdapter,
  NFactureDashboardProps,
  NFactureDocumentationProps,
  NFactureDraft,
  NFactureLabels,
  NFactureHistoryProps,
  NFactureIssuerProps,
  NFactureLine,
  NFactureFiscalProfile,
  NFacturePacConfig,
  NFactureProps,
  NFactureRecord,
  NFactureTicket,
  NFactureTicketViewProps,
  NFactureView,
  SATItem,
} from "./types"
import { calculateNFactureTotals, canUseNFactureView, getNFacturePermissions, isValidMexicanRfc } from "./utils"

const emptyCatalogs: NFactureCatalogs = { cfdiUses: [], paymentForms: [], paymentMethods: [] }
const emptyData: NFactureData = { customers: [], items: [], invoices: [], tickets: [], catalogs: emptyCatalogs }
const currency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" })

function mergeData(...sources: (Partial<NFactureData> | undefined)[]): NFactureData {
  return sources.reduce<NFactureData>((result, source) => ({ ...result, ...source, catalogs: { ...result.catalogs, ...source?.catalogs } }), emptyData)
}

function statusLabel(status: NFactureRecord["status"], labels: NFactureLabels) {
  if (status === "stamped") return labels.statusStamped
  if (status === "cancelled") return labels.statusCancelled
  if (status === "pending") return labels.statusPending
  return labels.statusError
}

function statusPalette(status: NFactureRecord["status"]) {
  if (status === "stamped") return "green"
  if (status === "cancelled") return "gray"
  if (status === "pending") return "orange"
  return "red"
}

export function NFactureDashboard({ invoices, labels, adapter, unstyled = false, classNames, styles }: NFactureDashboardProps) {
  const count = (status: NFactureRecord["status"]) => invoices.filter((invoice) => invoice.status === status).length
  return (
    <Stack gap={unstyled ? undefined : "6"} className={classNames?.root} css={styles?.root} data-scope="n-facture-dashboard" data-part="root">
      <NDashboardGrid columns={4} minItemWidth="12rem">
        <NStatCard label={labels.stampedMetric} value={count("stamped")} icon={<FileCheck2 aria-hidden size={20} />} colorPalette="green" />
        <NStatCard label={labels.cancelledMetric} value={count("cancelled")} icon={<FileX2 aria-hidden size={20} />} colorPalette="gray" />
        <NStatCard label={labels.pendingMetric} value={count("pending")} icon={<Hourglass aria-hidden size={20} />} colorPalette="orange" />
        <NStatCard label={labels.errorMetric} value={count("error")} icon={<AlertTriangle aria-hidden size={20} />} colorPalette="red" />
      </NDashboardGrid>
      <NFactureHistory invoices={invoices.slice(0, 5)} labels={labels} adapter={adapter} title={labels.recentInvoices} />
    </Stack>
  )
}

export function NFactureHistory({ invoices, labels, adapter, title, unstyled = false, classNames, styles }: NFactureHistoryProps) {
  const [selected, setSelected] = useState<NFactureRecord>()
  const headers: NTableColumn<NFactureRecord>[] = [
    { key: "folio", header: labels.folio },
    { key: "issuedAt", header: labels.issuedAt, type: "datetime" },
    { key: "customerName", header: labels.customer },
    { key: "customerRfc", header: labels.rfc },
    { key: "total", header: labels.total, type: "currency", currency: "MXN", align: "end" },
    { key: "status", header: labels.status, format: (value) => <Badge colorPalette={statusPalette(value as NFactureRecord["status"])}>{statusLabel(value as NFactureRecord["status"], labels)}</Badge> },
    { key: "actions", header: labels.actions, sortable: false, filterable: false, hideable: false, format: (_value, row) => <HStack gap="1"><Button size="xs" variant="ghost" onClick={() => setSelected(row)}>{labels.viewDocument}</Button>{row.pdfUrl ? <Link href={row.pdfUrl} download aria-label={labels.downloadPdf} fontSize="sm">PDF</Link> : null}{row.xmlUrl ? <Link href={row.xmlUrl} download aria-label={labels.downloadXml} fontSize="sm">XML</Link> : null}{adapter?.resendInvoice ? <Button size="xs" variant="ghost" aria-label={labels.resendEmail} onClick={() => void adapter.resendInvoice?.(row)}>{labels.resendEmail}</Button> : null}</HStack> },
  ]
  return <Stack gap={unstyled ? undefined : "5"} className={classNames?.root} css={styles?.root} data-scope="n-facture-history" data-part="root"><NTable title={title ?? labels.history} config={{ headers, data: [...invoices] }} getRowId={(row) => row.id} searchable filterable pagination responsive="stack" emptyMessage={labels.noData} /><NPanel open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(undefined) }} title={labels.documentPreview} contentKey={selected?.id}><NDocumentView document={selected} getDocumentId={(invoice) => invoice.id} getDocumentTitle={(invoice) => `${invoice.series}${invoice.folio}`} getDocumentSubtitle={(invoice) => invoice.uuid} getDocumentStatus={(invoice) => statusLabel(invoice.status, labels)} getStatusColorPalette={(invoice) => statusPalette(invoice.status)} fields={[{ id: "customer", label: labels.customer, getValue: (invoice) => invoice.customerName }, { id: "rfc", label: labels.rfc, getValue: (invoice) => invoice.customerRfc }, { id: "issued", label: labels.issuedAt, getValue: (invoice) => new Date(invoice.issuedAt).toLocaleString("es-MX") }, { id: "total", label: labels.total, getValue: (invoice) => currency.format(invoice.total) }]} showPrint labels={{ documentLabel: labels.documentPreview }} /></NPanel></Stack>
}

function Totals({ lines, labels }: { lines: readonly NFactureLine[]; labels: NFactureLabels }) {
  const totals = calculateNFactureTotals(lines)
  const rows = [[labels.subtotal, totals.subtotal], [labels.discount, -totals.discount], [labels.vat, totals.vat], [labels.ieps, totals.ieps]] as const
  return (
    <Card.Root variant="outline" bg="bg.panel"><Card.Body gap="2">
      {rows.map(([label, value]) => <Flex key={label} justify="space-between" gap="4"><Text color="fg.muted">{label}</Text><Text>{currency.format(value)}</Text></Flex>)}
      <Flex justify="space-between" gap="4" pt="3" mt="1" borderTopWidth="1px" borderColor="border"><Text fontWeight="bold">{labels.total}</Text><Text fontWeight="bold" textStyle="xl">{currency.format(totals.total)}</Text></Flex>
    </Card.Body></Card.Root>
  )
}

export function NFactureIssuer({ data, adapter, labels, colorPalette, initialTicket, unstyled = false, classNames, styles }: NFactureIssuerProps) {
  const [customerId, setCustomerId] = useState("")
  const [lines, setLines] = useState<readonly NFactureLine[]>(initialTicket?.lines ?? [])
  const [cfdiUse, setCfdiUse] = useState(data.catalogs.cfdiUses[0]?.value ?? "")
  const [paymentForm, setPaymentForm] = useState(data.catalogs.paymentForms[0]?.value ?? "")
  const [paymentMethod, setPaymentMethod] = useState<"PUE" | "PPD">(data.catalogs.paymentMethods[0]?.value ?? "PUE")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string }>()
  const [customerPanelOpen, setCustomerPanelOpen] = useState(false)
  const [customers, setCustomers] = useState<readonly NFactureCustomer[]>(data.customers)
  const customer = customers.find((entry) => entry.id === customerId)
  const totals = useMemo(() => calculateNFactureTotals(lines), [lines])

  useEffect(() => {
    if (initialTicket) setLines(initialTicket.lines)
  }, [initialTicket])
  useEffect(() => setCustomers(data.customers), [data.customers])

  const customerForm: NFormConfig<NFactureCustomerDraft> = {
    sections: [{ id: "fiscal", columns: 2 }],
    fields: [
      { key: "rfc", label: labels.rfc, section: "fiscal", validation: { required: true, validate: (value) => isValidMexicanRfc(String(value)) ? undefined : labels.invalidRfc } },
      { key: "name", label: labels.customerName, section: "fiscal", validation: { required: true } },
      { key: "postalCode", label: labels.postalCode, section: "fiscal", validation: { required: true, pattern: /^\d{5}$/ } },
      { key: "taxRegime", label: labels.taxRegime, section: "fiscal", validation: { required: true } },
      { key: "email", label: labels.email, type: "email", section: "fiscal", colSpan: "full" },
    ],
  }

  const createCustomer = async (values: NFactureCustomerDraft) => {
    try {
      const result: NFactureCustomerResult = adapter?.createCustomer
        ? await adapter.createCustomer(values)
        : { success: true, customer: { id: `customer-${Date.now()}`, rfc: values.rfc, name: values.name, postalCode: values.postalCode, taxRegime: values.taxRegime, email: values.email } }
      if (!result.success || !result.customer) return { success: false, message: result.message ?? labels.customerCreateError, errors: result.fieldErrors }
      setCustomers((current) => [...current, result.customer!])
      setCustomerId(result.customer.id)
      setCustomerPanelOpen(false)
      return { success: true, message: result.message ?? labels.customerCreated }
    } catch {
      return { success: false, message: labels.customerCreateError }
    }
  }

  const fields: NLineItemField<NFactureLine>[] = [
    { id: "sat", header: labels.satKey, getValue: (line) => line.productServiceKey, width: "7rem" },
    { id: "quantity", header: labels.quantity, getValue: (line) => line.quantity, setValue: (line, value) => ({ ...line, quantity: Number(value) }), inputType: "number", min: 0.000001, step: 1, width: "6rem" },
    { id: "unitPrice", header: labels.unitPrice, getValue: (line) => line.unitPrice, setValue: (line, value) => ({ ...line, unitPrice: Number(value) }), inputType: "number", min: 0, step: 0.01, width: "8rem", align: "end", formatValue: (value) => currency.format(Number(value)) },
    { id: "discount", header: labels.discount, getValue: (line) => line.discount, setValue: (line, value) => ({ ...line, discount: Number(value) }), inputType: "number", min: 0, step: 0.01, width: "8rem", align: "end" },
  ]

  const createLine = (item: SATItem): NFactureLine => ({
    id: `${item.id}-${Date.now()}`, itemId: item.id, sku: item.sku, description: item.description,
    productServiceKey: item.productServiceKey, unitKey: item.unitKey, quantity: 1, unitPrice: item.unitPrice,
    discount: 0, vatRate: item.vatRate ?? 0, iepsRate: item.iepsRate ?? 0,
  })

  const stamp = async () => {
    if (!customer) { setMessage({ kind: "error", text: labels.missingCustomer }); return }
    if (!isValidMexicanRfc(customer.rfc)) { setMessage({ kind: "error", text: labels.invalidRfc }); return }
    if (lines.length === 0) { setMessage({ kind: "error", text: labels.missingLines }); return }
    const use = data.catalogs.cfdiUses.find((entry) => entry.value === cfdiUse)
    if (use?.compatibleRegimes?.length && !use.compatibleRegimes.includes(customer.taxRegime)) { setMessage({ kind: "error", text: labels.incompatibleUse }); return }
    if (!adapter?.stampInvoice) { setMessage({ kind: "error", text: labels.stampError }); return }
    const draft: NFactureDraft = { customerId, customer, lines, cfdiUse, paymentForm, paymentMethod, currency: "MXN", totals, sourceTicketId: initialTicket?.id }
    setBusy(true)
    setMessage(undefined)
    try {
      const result = await adapter.stampInvoice(draft)
      setMessage({ kind: result.success ? "success" : "error", text: result.message ?? (result.success ? labels.stampSuccess : labels.stampError) })
    } catch {
      setMessage({ kind: "error", text: labels.stampError })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Stack gap={unstyled ? undefined : "6"} className={classNames?.root} css={styles?.root} data-scope="n-facture-issuer" data-part="root">
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="5">
        <Field.Root required><Field.Label>{labels.customer}</Field.Label><HStack align="stretch"><NativeSelect.Root flex="1"><NativeSelect.Field aria-label={labels.customer} value={customerId} onChange={(event) => setCustomerId(event.target.value)}><option value="">{labels.customerPlaceholder}</option>{customers.map((entry: NFactureCustomer) => <option key={entry.id} value={entry.id}>{entry.rfc} · {entry.name}</option>)}</NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root><Button variant="outline" onClick={() => setCustomerPanelOpen(true)}>{labels.addCustomer}</Button></HStack><Field.HelperText>{labels.customerHelp}</Field.HelperText></Field.Root>
        <SimpleGrid columns={{ base: 1, sm: 3 }} gap="3">
          <Field.Root required><Field.Label>{labels.cfdiUse}</Field.Label><NativeSelect.Root><NativeSelect.Field value={cfdiUse} onChange={(event) => setCfdiUse(event.target.value)}>{data.catalogs.cfdiUses.map((entry) => <option key={entry.value} value={entry.value}>{entry.value} · {entry.label}</option>)}</NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root></Field.Root>
          <Field.Root required><Field.Label>{labels.paymentForm}</Field.Label><NativeSelect.Root><NativeSelect.Field value={paymentForm} onChange={(event) => setPaymentForm(event.target.value)}>{data.catalogs.paymentForms.map((entry) => <option key={entry.value} value={entry.value}>{entry.value} · {entry.label}</option>)}</NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root></Field.Root>
          <Field.Root required><Field.Label>{labels.paymentMethod}</Field.Label><NativeSelect.Root><NativeSelect.Field value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as "PUE" | "PPD")}>{data.catalogs.paymentMethods.map((entry) => <option key={entry.value} value={entry.value}>{entry.value} · {entry.label}</option>)}</NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root></Field.Root>
        </SimpleGrid>
      </SimpleGrid>
      <NLineItemEditor items={data.items} getItemId={(item) => item.id} getItemLabel={(item) => item.description} createLine={createLine} getLineId={(line) => line.id} getLineLabel={(line) => line.description} getLineDescription={(line) => `${line.sku} · ${line.productServiceKey} · ${line.unitKey}`} fields={fields} lines={lines} onLinesChange={setLines} pickerProps={{ searchable: true, getSearchText: (item) => `${item.sku} ${item.productServiceKey}`, maxHeight: "20rem" }} labels={{ editorLabel: labels.invoiceGrid, addItems: labels.concepts }} />
      <Flex direction={{ base: "column", lg: "row" }} align={{ lg: "end" }} justify="space-between" gap="5">
        <Box maxW="2xl"><Text fontSize="sm" color="fg.muted"><ShieldCheck aria-hidden size={16} style={{ display: "inline", marginRight: "0.4rem" }} />{labels.fiscalNotice}</Text></Box>
        <Stack minW={{ lg: "22rem" }} gap="3"><Totals lines={lines} labels={labels} /><Button colorPalette={colorPalette} size="lg" loading={busy} loadingText={labels.stamping} onClick={() => void stamp()}>{labels.stamp}</Button></Stack>
      </Flex>
      {message ? <Box role={message.kind === "error" ? "alert" : "status"} p="3" rounded="md" bg={message.kind === "error" ? "bg.error" : "bg.success"} color={message.kind === "error" ? "fg.error" : "fg.success"}>{message.text}</Box> : null}
      <NPanel open={customerPanelOpen} onOpenChange={setCustomerPanelOpen} title={labels.newCustomerTitle} description={labels.newCustomerDescription} desktopWidth="clamp(28rem, 42vw, 42rem)"><NForm<NFactureCustomerDraft> config={customerForm} card={false} columns={2} onSubmit={createCustomer} labels={{ create: labels.saveCustomer }} /></NPanel>
    </Stack>
  )
}

export function NFactureTicketView({ tickets, adapter, labels, onUseTicket, unstyled = false, classNames, styles }: NFactureTicketViewProps) {
  const [folio, setFolio] = useState("")
  const [ticket, setTicket] = useState<NFactureTicket>()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const search = async () => {
    setBusy(true); setMessage(""); setTicket(undefined)
    try {
      const result = adapter?.findTicket ? await adapter.findTicket(folio) : tickets.find((entry) => entry.folio.toLocaleLowerCase() === folio.trim().toLocaleLowerCase())
      if (!result) setMessage(labels.ticketNotFound)
      else if (result.invoiced) setMessage(labels.ticketAlreadyInvoiced)
      else { setTicket(result); setMessage(labels.ticketReady) }
    } catch { setMessage(labels.ticketNotFound) } finally { setBusy(false) }
  }
  return (
    <Stack gap={unstyled ? undefined : "5"} maxW="3xl" className={classNames?.root} css={styles?.root} data-scope="n-facture-ticket-view" data-part="root">
      <Field.Root required><Field.Label>{labels.ticketFolio}</Field.Label><HStack align="stretch"><Input value={folio} placeholder={labels.ticketPlaceholder} onChange={(event) => setFolio(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void search() }} /><Button loading={busy} loadingText={labels.searchingTicket} onClick={() => void search()}>{labels.searchTicket}</Button></HStack></Field.Root>
      {message ? <Box role={ticket ? "status" : "alert"} p="3" rounded="md" bg={ticket ? "bg.success" : "bg.error"} color={ticket ? "fg.success" : "fg.error"}>{message}</Box> : null}
      {ticket ? <Card.Root variant="outline"><Card.Body gap="3"><Flex justify="space-between"><Stack gap="1"><Heading as="h2" size="md">{ticket.folio}</Heading><Text color="fg.muted">{new Date(ticket.issuedAt).toLocaleString("es-MX")}</Text></Stack><Text textStyle="2xl" fontWeight="bold">{currency.format(ticket.total)}</Text></Flex><Text color="fg.muted">{ticket.lines.length} {labels.concepts.toLocaleLowerCase()}</Text><Button alignSelf="start" onClick={() => onUseTicket(ticket)}>{labels.issue}</Button></Card.Body></Card.Root> : null}
    </Stack>
  )
}

function Certificates({ adapter, labels }: { adapter?: NFactureDataAdapter; labels: NFactureLabels }) {
  const [certificate, setCertificate] = useState<File>()
  const [privateKey, setPrivateKey] = useState<File>()
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<CSDConfig>()
  const [error, setError] = useState("")
  const [taxStatus, setTaxStatus] = useState<File>()
  const [profile, setProfile] = useState<NFactureFiscalProfile>()
  const inspect = async () => {
    if (!certificate || !privateKey || !certificate.name.toLocaleLowerCase().endsWith(".cer") || !privateKey.name.toLocaleLowerCase().endsWith(".key") || !adapter?.inspectCertificate) { setError(labels.invalidCertificate); return }
    setBusy(true); setError("")
    try { setResult(await adapter.inspectCertificate(certificate, privateKey, password)) } catch { setError(labels.invalidCertificate) } finally { setBusy(false) }
  }
  const inspectTaxStatus = async () => {
    if (!taxStatus || !adapter?.inspectTaxStatus) { setError(labels.invalidCertificate); return }
    setBusy(true); setError("")
    try { setProfile(await adapter.inspectTaxStatus(taxStatus)) } catch { setError(labels.invalidCertificate) } finally { setBusy(false) }
  }
  return <Stack gap="5"><NPageHeader level={2} title={labels.certificateTitle} subtitle={labels.certificateDescription} /><SimpleGrid columns={{ base: 1, md: 2 }} gap="4"><Field.Root required><Field.Label>{labels.certificateFile}</Field.Label><Input type="file" accept=".cer" onChange={(event) => setCertificate(event.target.files?.[0])} /></Field.Root><Field.Root required><Field.Label>{labels.privateKeyFile}</Field.Label><Input type="file" accept=".key" onChange={(event) => setPrivateKey(event.target.files?.[0])} /></Field.Root></SimpleGrid><Field.Root maxW="md"><Field.Label>{labels.privateKeyPassword}</Field.Label><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></Field.Root><Text color="fg.muted" fontSize="sm">{labels.certificateHint}</Text><Button alignSelf="start" loading={busy} loadingText={labels.inspectingCertificate} onClick={() => void inspect()}>{labels.inspectCertificate}</Button>{error ? <Box role="alert" color="fg.error">{error}</Box> : null}{result ? <Card.Root variant="outline"><Card.Body><HStack><CheckCircle2 aria-hidden /><Text fontWeight="semibold">{labels.validCertificate}</Text></HStack><Text color="fg.muted">{result.rfc} · {result.certificateNumber} · {result.validUntil}</Text></Card.Body></Card.Root> : null}<Card.Root variant="outline"><Card.Body gap="3"><Field.Root><Field.Label>{labels.taxStatusFile}</Field.Label><Input type="file" accept="application/pdf,.pdf" onChange={(event) => setTaxStatus(event.target.files?.[0])} /></Field.Root><Button alignSelf="start" variant="outline" loading={busy} onClick={() => void inspectTaxStatus()}>{labels.inspectTaxStatus}</Button>{profile ? <Box role="status"><Text fontWeight="semibold">{labels.fiscalProfileReady}</Text><Text color="fg.muted">{profile.rfc} · {profile.name} · {profile.postalCode} · {profile.taxRegime}</Text></Box> : null}</Card.Body></Card.Root></Stack>
}

function CatalogMapping({ items, labels }: { items: readonly SATItem[]; labels: NFactureLabels }) {
  return <Stack gap="5"><NPageHeader level={2} title={labels.mappingTitle} subtitle={labels.mappingDescription} /><NTable config={{ headers: [{ key: "sku", header: labels.sku }, { key: "description", header: labels.productOrService }, { key: "productServiceKey", header: labels.productServiceKey }, { key: "unitKey", header: labels.unitKey }], data: [...items] }} getRowId={(item) => item.id} searchable filterable responsive="stack" emptyMessage={labels.noData} /></Stack>
}

function Integrations({ adapter, integrations, labels }: { adapter?: NFactureDataAdapter; integrations: NonNullable<NFactureData["integrations"]>; labels: NFactureLabels }) {
  const [providerId, setProviderId] = useState("")
  const [environment, setEnvironment] = useState<NFacturePacConfig["environment"]>("sandbox")
  const [apiKey, setApiKey] = useState("")
  const [message, setMessage] = useState("")
  const [webhook, setWebhook] = useState("")
  const [generatedKey, setGeneratedKey] = useState("")
  const save = async () => { const result = await adapter?.savePac?.({ providerId, environment, apiKey, configured: true }); setMessage(result?.message ?? (result?.success ? labels.pacSaved : labels.stampError)) }
  const generateKey = async () => { if (adapter?.createApiKey) setGeneratedKey((await adapter.createApiKey(environment)).secret) }
  const saveWebhook = async () => { const result = await adapter?.saveWebhook?.(webhook, environment); setMessage(result?.message ?? (result?.success ? labels.pacSaved : labels.stampError)) }
  return <Stack gap="6"><NPageHeader level={2} title={labels.integrationTitle} subtitle={labels.integrationDescription} leading={<PlugZap />} /><Card.Root variant="outline"><Card.Body gap="4"><Heading as="h3" size="md">{labels.pacTitle}</Heading><Text color="fg.muted">{labels.pacDescription}</Text><SimpleGrid columns={{ base: 1, md: 3 }} gap="4"><Field.Root><Field.Label>{labels.pacProvider}</Field.Label><Input value={providerId} onChange={(event) => setProviderId(event.target.value)} /></Field.Root><Field.Root><Field.Label>{labels.environment}</Field.Label><NativeSelect.Root><NativeSelect.Field value={environment} onChange={(event) => setEnvironment(event.target.value as NFacturePacConfig["environment"])}><option value="sandbox">{labels.sandbox}</option><option value="production">{labels.production}</option></NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root></Field.Root><Field.Root><Field.Label>{labels.apiKey}</Field.Label><Input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} /></Field.Root></SimpleGrid><HStack wrap="wrap"><Button onClick={() => void save()}>{labels.savePac}</Button><Button variant="outline" onClick={() => void generateKey()}>{labels.generateApiKey}</Button></HStack>{generatedKey ? <Box role="status" p="3" bg="bg.warning" color="fg.warning" rounded="md"><Text fontWeight="semibold">{generatedKey}</Text><Text fontSize="sm">{labels.generatedApiKey}</Text></Box> : null}<Field.Root><Field.Label>{labels.webhookEndpoint}</Field.Label><HStack align="stretch"><Input type="url" value={webhook} onChange={(event) => setWebhook(event.target.value)} /><Button variant="outline" onClick={() => void saveWebhook()}>{labels.saveWebhook}</Button></HStack></Field.Root>{message ? <Text role="status" color="fg.success">{message}</Text> : null}</Card.Body></Card.Root><NTable config={{ headers: [{ key: "label", header: labels.integration }, { key: "type", header: labels.integrationType }, { key: "environment", header: labels.environment }, { key: "status", header: labels.status, presentation: "badge" }], data: [...integrations] }} getRowId={(row) => row.id} responsive="stack" emptyMessage={labels.noData} /></Stack>
}

function PanelRoute({ title, description, actionLabel, children }: { title: string; description: string; actionLabel: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Card.Root variant="outline" bg="bg.panel" maxW="3xl"><Card.Body gap="4"><Heading as="h2" size="lg">{title}</Heading><Text color="fg.muted">{description}</Text><Button alignSelf="start" onClick={() => setOpen(true)}>{actionLabel}</Button></Card.Body></Card.Root>
      <NPanel open={open} onOpenChange={setOpen} title={title} description={description}>{children}</NPanel>
    </>
  )
}

export function NFactureDocumentation({ labels, unstyled = false, classNames, styles }: NFactureDocumentationProps) {
  const sections = [
    { id: "integration", label: labels.docsIntegration, body: labels.docsIntegrationBody },
    { id: "navigation", label: labels.docsNavigation, body: labels.docsNavigationBody },
    { id: "security", label: labels.docsSecurity, body: labels.docsSecurityBody },
  ]
  return (
    <Stack gap={unstyled ? undefined : "5"} maxW="4xl" className={classNames?.root} css={styles?.root} data-scope="n-facture-documentation" data-part="root">
      <NPageHeader level={2} title={labels.documentationTitle} subtitle={labels.documentationDescription} />
      <Tabs.Root defaultValue="integration" variant="subtle"><Tabs.List flexWrap="wrap">{sections.map((section) => <Tabs.Trigger key={section.id} value={section.id}>{section.label}</Tabs.Trigger>)}</Tabs.List>{sections.map((section) => <Tabs.Content key={section.id} value={section.id}><Card.Root variant="outline"><Card.Body><Text color="fg.muted">{section.body}</Text></Card.Body></Card.Root></Tabs.Content>)}</Tabs.Root>
    </Stack>
  )
}

export function NFacture({ role = "operator", permissions, data: dataProp, adapter: adapterProp, view, defaultView = "dashboard", onViewChange, showNavigation = false, navigation: navigationProp, contentMaxHeight = "calc(100dvh - 10rem)", colorPalette = "blue", labels: labelsProp, unstyled = false, classNames, styles }: NFactureProps) {
  const context = useNFacture()
  const labels = useMemo(() => resolveNFactureLabels(labelsProp), [labelsProp])
  const adapter = adapterProp ?? context.adapter
  const [loaded, setLoaded] = useState<Partial<NFactureData>>()
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [internalView, setInternalView] = useState<NFactureView>(defaultView)
  const [ticket, setTicket] = useState<NFactureTicket>()
  const activeView = view ?? internalView
  const data = useMemo(() => mergeData(context.data, dataProp, loaded), [context.data, dataProp, loaded])
  const granted = useMemo(() => getNFacturePermissions(role, permissions), [permissions, role])
  const navigation = useMemo(() => navigationProp ?? createNFactureNavigation({ role, permissions: granted, labels }), [granted, labels, navigationProp, role])

  const load = async () => {
    if (!adapter?.load) return
    setLoading(true); setLoadError(false)
    try { setLoaded(await adapter.load()) } catch { setLoadError(true) } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [adapter])

  const changeView = (next: NFactureView) => {
    if (!canUseNFactureView(role, next, granted)) return
    if (view === undefined) setInternalView(next)
    onViewChange?.(next)
  }
  const resolvedView = canUseNFactureView(role, activeView, granted) ? activeView : "dashboard"
  const content = resolvedView === "dashboard" ? <NFactureDashboard invoices={data.invoices} labels={labels} adapter={adapter} />
    : resolvedView === "issue" ? <NFactureIssuer data={data} adapter={adapter} labels={labels} colorPalette={colorPalette} initialTicket={ticket} />
      : resolvedView === "history" ? <NFactureHistory invoices={data.invoices} labels={labels} adapter={adapter} />
        : resolvedView === "ticket" ? <NFactureTicketView tickets={data.tickets} adapter={adapter} labels={labels} onUseTicket={(next) => { setTicket(next); changeView("issue") }} />
          : resolvedView === "certificates" ? <PanelRoute title={labels.certificateTitle} description={labels.certificateDescription} actionLabel={labels.openConfiguration}><Certificates adapter={adapter} labels={labels} /></PanelRoute>
            : resolvedView === "catalogs" ? <PanelRoute title={labels.mappingTitle} description={labels.mappingDescription} actionLabel={labels.manageCatalogs}><CatalogMapping items={data.items} labels={labels} /></PanelRoute>
              : resolvedView === "integrations" ? <PanelRoute title={labels.integrationTitle} description={labels.integrationDescription} actionLabel={labels.openConfiguration}><Integrations adapter={adapter} integrations={data.integrations ?? []} labels={labels} /></PanelRoute>
                : <NFactureDocumentation labels={labels} />

  return (
    <NPermissionsProvider permissions={granted}>
      <Stack as="section" aria-label={labels.moduleName} gap={unstyled ? undefined : "5"} minW="0" colorPalette={colorPalette} className={classNames?.root} css={styles?.root} data-scope="n-facture" data-part="root">
        <NPageHeader title={labels.moduleName} subtitle={labels.moduleDescription} metadata={<Badge colorPalette={role === "admin" ? "purple" : role === "operator" ? "blue" : "green"}>{role === "admin" ? labels.adminRole : role === "operator" ? labels.operatorRole : labels.posRole}</Badge>} />
        {loading ? <Box role="status" className={classNames?.loading} css={styles?.loading} data-part="loading">{labels.loading}</Box> : null}
        {loadError ? <HStack role="alert" className={classNames?.error} css={styles?.error} data-part="error"><Text color="fg.error">{labels.loadError}</Text><Button size="sm" onClick={() => void load()}>{labels.retry}</Button></HStack> : null}
        <Flex align="stretch" direction={{ base: "column", lg: "row" }} gap="6" minW="0">
          {showNavigation ? <Box flex="0 0 17rem" minH={{ lg: "32rem" }} className={classNames?.navigation} css={styles?.navigation} data-part="navigation"><NSidebar items={navigation[0]?.children ?? navigation} activeItemId={`facture-${resolvedView}`} onItemSelect={(item) => item.data?.view && changeView(item.data.view)} responsive="push" showMobileTrigger={false} collapsible={false} variant="outline" labels={{ navigationLabel: labels.navigationLabel }} unstyled={unstyled} /></Box> : null}
          <Box flex="1" minW="0" maxH={contentMaxHeight} overflowY="auto" overscrollBehavior="contain" pe={{ base: "1", md: "2" }} className={classNames?.content} css={styles?.content} data-part="content">{content}</Box>
        </Flex>
      </Stack>
    </NPermissionsProvider>
  )
}
