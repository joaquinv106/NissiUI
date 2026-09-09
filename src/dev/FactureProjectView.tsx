import { Badge, Box, Button, Card, Field, NativeSelect, Stack, Text } from "@chakra-ui/react"

import { NFacture, NPanel, NissiInvoicingProvider, type CSDConfig, type NFactureData, type NFactureDataAdapter, type NFactureRole, type NFactureView } from "../index"
import { ComponentDocs } from "./ComponentDocs"

export const demoFactureData: NFactureData = {
  customers: [
    { id: "client-1", rfc: "EKU9003173C9", name: "ESCUELA KEMPER URGATE", postalCode: "26015", taxRegime: "601", email: "facturas@kemper.example" },
    { id: "client-2", rfc: "GODE561231GR8", name: "MARÍA GUADALUPE GÓMEZ DEL CAMPO", postalCode: "64000", taxRegime: "612", email: "maria@example.com" },
  ],
  items: [
    { id: "service-1", sku: "CONS-01", description: "Consultoría de experiencia de usuario", productServiceKey: "80101500", unitKey: "E48", unitLabel: "Unidad de servicio", unitPrice: 8500, vatRate: 0.16 },
    { id: "license-1", sku: "LIC-12", description: "Licencia anual de software", productServiceKey: "43231512", unitKey: "E48", unitLabel: "Unidad de servicio", unitPrice: 12400, vatRate: 0.16 },
    { id: "device-1", sku: "SCAN-02", description: "Lector de código de barras", productServiceKey: "43211701", unitKey: "H87", unitLabel: "Pieza", unitPrice: 2190, vatRate: 0.16 },
  ],
  invoices: [
    { id: "invoice-1042", uuid: "7AFC-DEMO-1042", series: "A", folio: "1042", issuedAt: "2026-09-07T10:18:00-06:00", customerName: "ESCUELA KEMPER URGATE", customerRfc: "EKU9003173C9", total: 9860, status: "stamped" },
    { id: "invoice-1041", uuid: "PENDING-1041", series: "A", folio: "1041", issuedAt: "2026-09-07T09:42:00-06:00", customerName: "MARÍA GUADALUPE GÓMEZ DEL CAMPO", customerRfc: "GODE561231GR8", total: 14384, status: "pending" },
    { id: "invoice-1040", uuid: "ERROR-1040", series: "A", folio: "1040", issuedAt: "2026-09-06T17:05:00-06:00", customerName: "ESCUELA KEMPER URGATE", customerRfc: "EKU9003173C9", total: 2540.4, status: "error" },
    { id: "invoice-1039", uuid: "CANCELLED-1039", series: "A", folio: "1039", issuedAt: "2026-09-06T12:15:00-06:00", customerName: "ESCUELA KEMPER URGATE", customerRfc: "EKU9003173C9", total: 9860, status: "cancelled" },
  ],
  tickets: [{ id: "ticket-1048", folio: "TKT-1048", issuedAt: "2026-09-07T11:05:00-06:00", total: 2540.4, lines: [{ id: "ticket-line-1", itemId: "device-1", sku: "SCAN-02", description: "Lector de código de barras", productServiceKey: "43211701", unitKey: "H87", quantity: 1, unitPrice: 2190, discount: 0, vatRate: 0.16, iepsRate: 0 }] }],
  catalogs: {
    cfdiUses: [
      { value: "G03", label: "Gastos en general", compatibleRegimes: ["601", "612"] },
      { value: "S01", label: "Sin efectos fiscales", compatibleRegimes: ["601", "612", "616"] },
    ],
    paymentForms: [{ value: "03", label: "Transferencia electrónica de fondos" }, { value: "04", label: "Tarjeta de crédito" }, { value: "99", label: "Por definir" }],
    paymentMethods: [{ value: "PUE", label: "Pago en una sola exhibición" }, { value: "PPD", label: "Pago en parcialidades o diferido" }],
  },
  csd: { status: "valid", rfc: "EKU9003173C9", certificateNumber: "30001000000500003416", validUntil: "2028-03-17" },
  pac: { providerId: "pac-demo", environment: "sandbox", configured: true },
  integrations: [
    { id: "pos-webhook", label: "Tickets del punto de venta", type: "webhook", environment: "sandbox", status: "active", endpoint: "https://api.example.test/webhooks/tickets" },
    { id: "erp-key", label: "ERP administrativo", type: "api-key", environment: "production", status: "active", maskedSecret: "nsi_••••••••1048" },
  ],
}

export const demoFactureAdapter: NFactureDataAdapter = {
  findTicket: async (folio) => demoFactureData.tickets.find((ticket) => ticket.folio.toLocaleLowerCase() === folio.trim().toLocaleLowerCase()),
  stampInvoice: async (draft) => ({ success: true, message: `CFDI demo timbrado por ${draft.totals.total.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}.` }),
  inspectCertificate: async (certificate): Promise<CSDConfig> => ({ certificateFileName: certificate.name, certificateNumber: "30001000000500003416", rfc: "EKU9003173C9", validFrom: "2024-03-18", validUntil: "2028-03-17", status: "valid" }),
  inspectTaxStatus: async () => ({ rfc: "EKU9003173C9", name: "ESCUELA KEMPER URGATE", postalCode: "26015", taxRegime: "601" }),
  savePac: async () => ({ success: true, message: "Conexión demo guardada en sandbox." }),
  createApiKey: async () => ({ secret: "nsi_demo_4f8a1c1048" }),
  saveWebhook: async () => ({ success: true, message: "Webhook demo guardado." }),
  resendInvoice: async () => ({ success: true, message: "Comprobante demo reenviado." }),
  createCustomer: async (customer) => ({ success: true, message: "Receptor demo registrado.", customer: { ...customer, id: `customer-${Date.now()}` } }),
}

export function FactureProjectView({ view, onViewChange, role, onRoleChange }: { view: NFactureView; onViewChange: (view: NFactureView) => void; role: NFactureRole; onRoleChange: (role: NFactureRole) => void }) {
  return (
    <Stack gap="8">
      <Card.Root variant="outline" bg="bg.panel"><Card.Body gap="4"><Stack direction={{ base: "column", md: "row" }} align={{ md: "end" }} justify="space-between" gap="4"><Box><Badge colorPalette="purple" mb="2">Proyecto vertical</Badge><Text color="fg.muted">Demo operativa con clientes, productos, tickets, comprobantes y configuración ficticios. Ningún archivo ni secreto sale del navegador.</Text></Box><Field.Root maxW="14rem"><Field.Label>Probar nivel de acceso</Field.Label><NativeSelect.Root><NativeSelect.Field value={role} onChange={(event) => onRoleChange(event.target.value as NFactureRole)}><option value="admin">Administrador</option><option value="operator">Operador</option><option value="pos">Punto de venta</option></NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root></Field.Root></Stack></Card.Body></Card.Root>
      <NissiInvoicingProvider data={demoFactureData} adapter={demoFactureAdapter}><NFacture role={role} view={view} onViewChange={onViewChange} showNavigation={false} contentMaxHeight="calc(100dvh - 22rem)" /></NissiInvoicingProvider>
      {view === "docs" ? <NPanel title="Referencia completa de NFacture" desktopWidth="min(56rem, calc(100vw - 4rem))" trigger={<Button alignSelf="start" variant="outline">Abrir referencia completa</Button>}><ComponentDocs
        purpose="NFacture compone las primitivas de Nissi UI para operar CFDI 4.0 sin convertir la librería en autoridad fiscal: el host inyecta datos y un adaptador seguro que valida, genera XML, firma y timbra mediante un PAC autorizado."
        steps={["Inyecta clientes, conceptos ya mapeados y catálogos vigentes mediante NissiInvoicingProvider.", "Implementa NFactureDataAdapter en tu backend/BFF para receptores, CSD, tickets y timbrado.", "Entrega createNFactureNavigation() a NSidebar o createNFactureHeaderNavigation() a NHeader.", "Controla view/onViewChange desde el host y asigna role o permissions; el backend debe repetir toda autorización y validación fiscal."]}
        variants={[{ name: "role=admin", description: "Operación, métricas, CSD, PAC, catálogos e integraciones." }, { name: "role=operator", description: "Emisión, tickets e historial sin secretos administrativos." }, { name: "role=pos", description: "Emisión rápida y conversión de tickets." }, { name: "showNavigation", description: "Activa un menú propio sólo para un widget standalone; por defecto usa la navegación del host." }]}
        variantExamples={[
          { id: "operator", label: "Operador", summary: "role=\"operator\"", preview: <NissiInvoicingProvider data={demoFactureData} adapter={demoFactureAdapter}><NFacture role="operator" defaultView="dashboard" showNavigation /></NissiInvoicingProvider>, code: `<NissiInvoicingProvider data={data} adapter={adapter}>\n  <NFacture role="operator" showNavigation />\n</NissiInvoicingProvider>` },
          { id: "embedded", label: "Embebido", summary: "showNavigation={false}", preview: <NissiInvoicingProvider data={demoFactureData} adapter={demoFactureAdapter}><NFacture role="pos" defaultView="ticket" showNavigation={false} /></NissiInvoicingProvider>, code: `<NFacture role="pos" view="ticket" showNavigation={false} />` },
        ]}
        propExamples={[{ label: "Navegación compartida con NSidebar", code: `const items = createNFactureNavigation({\n  basePath: "/facturacion",\n  role: "admin",\n})\n\n<NSidebar items={[...appItems, ...items]} />` }, { label: "Menú desplegable en NHeader", code: `const items = createNFactureHeaderNavigation({ role: "admin" })\n\n<NHeader items={[...appItems, ...items]} />` }, { label: "Adaptador externo", code: `const adapter: NFactureDataAdapter = {\n  load: () => api.getBillingData(),\n  createCustomer: (customer) => api.createCustomer(customer),\n  findTicket: (folio) => api.getTicket(folio),\n  stampInvoice: (draft) => api.stampCfdi(draft),\n}` }]}
        code={`import { NFacture, NissiInvoicingProvider } from "nissi-ui"\n\n<NissiInvoicingProvider data={billingData} adapter={pacAdapter}>\n  <NFacture role="admin" />\n</NissiInvoicingProvider>`}
      /></NPanel> : null}
    </Stack>
  )
}
