import { Badge, Box, Button, Card, Flex, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import { ReceiptText, RotateCcw, ShoppingCart, WifiOff } from "lucide-react"
import { useState } from "react"

import {
  NCart,
  NCheckout,
  NCodeCapture,
  NOfflineBoundary,
  NReceipt,
  NSyncStatus,
  NThermalPrint,
  type NAmountAllocation,
  type NCartSummary,
  type NLineItemField,
  type NSyncState,
  type NThermalPrintAdapter,
} from "../index"
import { ComponentDocs } from "./ComponentDocs"

interface DemoProduct { id: string; sku: string; name: string; price: number }
interface DemoCartLine extends DemoProduct { lineId: string; quantity: number }
interface DemoPaymentMethod { id: string; name: string; description: string }
interface DemoReceipt { id: string; folio: string; createdAt: Date; status: string; lines: DemoCartLine[]; subtotal: number; tax: number; total: number }

const demoProducts: DemoProduct[] = [
  { id: "coffee", sku: "7501001", name: "Café de especialidad", price: 85 },
  { id: "bread", sku: "7501002", name: "Pan artesanal", price: 48 },
  { id: "bottle", sku: "7501003", name: "Botella térmica", price: 320 },
]

const paymentMethods: DemoPaymentMethod[] = [
  { id: "cash", name: "Efectivo", description: "Pago recibido en caja" },
  { id: "card", name: "Tarjeta", description: "Terminal bancaria" },
]

const quantityField: NLineItemField<DemoCartLine> = {
  id: "quantity",
  header: "Cantidad",
  inputType: "number",
  min: 1,
  step: 1,
  width: "8rem",
  getValue: (line) => line.quantity,
  setValue: (line, value) => ({ ...line, quantity: Math.max(1, Number(value)) }),
  validate: (value) => Number(value) >= 1 ? undefined : "La cantidad debe ser mayor que cero.",
}

const money = (amount: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount)

function saleSummary(lines: readonly DemoCartLine[]): NCartSummary {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
  const tax = Math.round(subtotal * 0.16 * 100) / 100
  return { subtotal, rows: [{ id: "tax", label: "IVA configurado por la aplicación", amount: tax }], total: subtotal + tax }
}

function createLine(item: DemoProduct): DemoCartLine {
  return { ...item, lineId: `line-${item.id}`, quantity: 1 }
}

function resolveCartAdd(lines: readonly DemoCartLine[], next: DemoCartLine): readonly DemoCartLine[] {
  const existing = lines.find((line) => line.id === next.id)
  return existing
    ? lines.map((line) => line.id === next.id ? { ...line, quantity: line.quantity + 1 } : line)
    : [...lines, next]
}

function PhaseIntro({ title, description }: { title: string; description: string }) {
  return <Stack gap="2"><Text color="colorPalette.fg" fontSize="sm" fontWeight="semibold" textTransform="uppercase">Flujos generalizables · Fase 7</Text><Heading as="h1" size={{ base: "2xl", md: "3xl" }}>{title}</Heading><Text color="fg.muted" fontSize={{ base: "md", md: "lg" }} maxW="4xl">{description}</Text></Stack>
}

const cartBaseProps = {
  items: demoProducts,
  getItemId: (item: DemoProduct) => item.id,
  getItemLabel: (item: DemoProduct) => item.name,
  createLine: (item: DemoProduct) => createLine(item),
  getLineId: (line: DemoCartLine) => line.lineId,
  getLineLabel: (line: DemoCartLine) => line.name,
  getLineDescription: (line: DemoCartLine) => `${line.sku} · ${money(line.price)} por unidad`,
  getLineAmount: (line: DemoCartLine) => line.price * line.quantity,
  fields: [quantityField],
  calculateSummary: saleSummary,
  formatAmount: money,
  resolveAdd: ({ lines, line }: { lines: readonly DemoCartLine[]; line: DemoCartLine }) => resolveCartAdd(lines, line),
}

export function CartView() {
  return <Stack gap="8">
    <PhaseIntro title="NCart" description="Preset de carrito que compone selección, edición de partidas y resumen sin incorporar impuestos, descuentos o reglas de inventario al núcleo." />
    <Card.Root variant="outline"><Card.Body><NCart {...cartBaseProps} defaultLines={[createLine(demoProducts[0])]} defaultPickerOpen /></Card.Body></Card.Root>
    <ComponentDocs
      purpose="NCart coordina NLineItemEditor y una superficie de totales. La aplicación conserva el modelo de partida y entrega calculateSummary, por lo que el preset sirve para ventas sin trasladar reglas fiscales al design system."
      steps={["Adapta artículos y partidas con los extractores existentes.", "Calcula importes por línea con getLineAmount.", "Inyecta impuestos, descuentos o cargos mediante calculateSummary.", "Persiste los cambios publicados por onLinesChange."]}
      variants={[{ name: "uncontrolled", description: "Administra un borrador local mediante defaultLines." }, { name: "controlled", description: "El store de la venta conserva lines como fuente de verdad." }, { name: "readOnly", description: "Presenta el carrito sin controles de edición." }]}
      variantExamples={[{ id: "editable", label: "Editable", summary: "selector + cantidad", preview: <NCart {...cartBaseProps} defaultLines={[createLine(demoProducts[0])]} />, code: `<NCart defaultLines={lines} {...cartAdapters} />` }, { id: "empty", label: "Vacío", summary: "sin partidas", preview: <NCart {...cartBaseProps} />, code: `<NCart defaultLines={[]} {...cartAdapters} />` }, { id: "readonly", label: "Lectura", summary: "readOnly", preview: <NCart {...cartBaseProps} lines={[createLine(demoProducts[1])]} readOnly />, code: `<NCart lines={lines} readOnly {...cartAdapters} />` }]}
      propExamples={[{ label: "Resumen comercial", code: `<NCart calculateSummary={(lines) => pricing.quote(lines)} {...props} />` }, { label: "Estado controlado", code: `<NCart lines={lines} onLinesChange={setLines} {...props} />` }]}
      code={`<NCart
  items={products}
  lines={lines}
  onLinesChange={setLines}
  getLineAmount={(line) => line.quantity * line.unitPrice}
  calculateSummary={pricing.calculate}
  {...lineAdapters}
/>`}
    />
  </Stack>
}

const checkoutBaseProps = {
  total: 232,
  methods: paymentMethods,
  getMethodId: (method: DemoPaymentMethod) => method.id,
  getMethodLabel: (method: DemoPaymentMethod) => method.name,
  getMethodDescription: (method: DemoPaymentMethod) => method.description,
  locale: "es-MX",
  formatOptions: { style: "currency", currency: "MXN" } as Intl.NumberFormatOptions,
}

export function CheckoutView() {
  const [allocations, setAllocations] = useState<readonly NAmountAllocation<DemoPaymentMethod>[]>([])
  return <Stack gap="8">
    <PhaseIntro title="NCheckout" description="Preset de finalización que reutiliza la distribución precisa de importes y sólo completa cuando el consumidor confirma la transacción." />
    <Card.Root variant="outline"><Card.Body><NCheckout {...checkoutBaseProps} allocations={allocations} onAllocationsChange={setAllocations} review={<Flex justify="space-between"><Text>Venta de demostración</Text><Text fontWeight="semibold">{money(232)}</Text></Flex>} onComplete={async () => ({ success: true, message: "Pago confirmado por el adaptador de demostración." })} /></Card.Body></Card.Root>
    <ComponentDocs
      purpose="NCheckout compone NAmountAllocator, validación y confirmación asíncrona. No procesa tarjetas ni registra ventas por sí mismo: onComplete conecta la pasarela, API o cola local del producto."
      steps={["Entrega el total confirmado por el motor comercial.", "Configura los métodos y sus restricciones.", "Distribuye el importe completo.", "Valida y confirma mediante onComplete."]}
      variants={[{ name: "controlled", description: "allocations vive en el estado de la operación." }, { name: "split", description: "Permite distribuir el total entre varios métodos." }, { name: "readOnly", description: "Presenta la distribución ya confirmada." }]}
      variantExamples={[{ id: "pending", label: "Pendiente", summary: "sin asignación", preview: <NCheckout {...checkoutBaseProps} onComplete={() => true} />, code: `<NCheckout total={total} methods={methods} onComplete={pay} />` }, { id: "balanced", label: "Balanceado", summary: "pago completo", preview: <NCheckout {...checkoutBaseProps} defaultAllocations={[{ method: paymentMethods[0], amount: 232 }]} onComplete={() => true} />, code: `<NCheckout defaultAllocations={payments} {...props} />` }, { id: "readonly", label: "Lectura", summary: "confirmado", preview: <NCheckout {...checkoutBaseProps} allocations={[{ method: paymentMethods[1], amount: 232 }]} readOnly onComplete={() => true} />, code: `<NCheckout allocations={payments} readOnly {...props} />` }]}
      propExamples={[{ label: "Validación remota", code: `<NCheckout validate={(details) => api.validate(details)} {...props} />` }, { label: "Identidad estable", code: `<NCheckout checkoutKey={saleId} {...props} />` }]}
      code={`<NCheckout
  total={cart.total}
  methods={paymentMethods}
  allocations={payments}
  onAllocationsChange={setPayments}
  onComplete={(details) => sales.confirm(details)}
/>`}
    />
  </Stack>
}

const demoReceipt: DemoReceipt = {
  id: "receipt-demo",
  folio: "V-2048",
  createdAt: new Date("2026-09-06T18:00:00.000Z"),
  status: "Pagado",
  lines: [{ ...createLine(demoProducts[0]), quantity: 2 }],
  subtotal: 170,
  tax: 27.2,
  total: 197.2,
}

const receiptBaseProps = {
  getReceiptId: (receipt: DemoReceipt) => receipt.id,
  getReceiptNumber: (receipt: DemoReceipt) => receipt.folio,
  getReceiptDate: (receipt: DemoReceipt) => receipt.createdAt,
  getReceiptStatus: (receipt: DemoReceipt) => receipt.status,
  getLines: (receipt: DemoReceipt) => receipt.lines,
  getLineId: (line: DemoCartLine) => line.lineId,
  getLineLabel: (line: DemoCartLine) => line.name,
  getLineDescription: (line: DemoCartLine) => line.sku,
  getLineQuantity: (line: DemoCartLine) => line.quantity,
  getLineUnitAmount: (line: DemoCartLine) => line.price,
  getLineTotal: (line: DemoCartLine) => line.price * line.quantity,
  getSummaryRows: (receipt: DemoReceipt) => [{ id: "subtotal", label: "Subtotal", amount: receipt.subtotal }, { id: "tax", label: "IVA", amount: receipt.tax }],
  getTotal: (receipt: DemoReceipt) => receipt.total,
  formatAmount: money,
}

export function ReceiptView() {
  return <Stack gap="8">
    <PhaseIntro title="NReceipt" description="Preset de recibo imprimible que transforma modelos propios en una presentación consistente mediante NDocumentView." />
    <NReceipt {...receiptBaseProps} receipt={demoReceipt} showPrint onPrint={() => undefined} afterLines={<Text color="fg.muted" fontSize="sm">Gracias por su compra.</Text>} />
    <ComponentDocs
      purpose="NReceipt adapta un comprobante a NDocumentView. Los extractores conservan el modelo del consumidor y los importes llegan ya calculados; el preset sólo organiza folio, fecha, partidas y totales."
      steps={["Adapta identidad, folio, fecha y estado.", "Extrae partidas y valores ya calculados.", "Agrega filas de resumen y total.", "Conecta impresión y acciones documentales."]}
      variants={[{ name: "paper", description: "Documento elevado e imprimible." }, { name: "plain", description: "Recibo embebido en otra superficie." }, { name: "unstyled", description: "Conserva semántica y comportamiento sin decoración predeterminada." }, { name: "custom", description: "Metadata, secciones, encabezado y pie ampliables." }]}
      variantExamples={[{ id: "paper", label: "Papel", summary: "variant=paper", preview: <NReceipt {...receiptBaseProps} receipt={demoReceipt} />, code: `<NReceipt receipt={receipt} {...adapters} />` }, { id: "plain", label: "Plano", summary: "variant=plain", preview: <NReceipt {...receiptBaseProps} receipt={demoReceipt} variant="plain" />, code: `<NReceipt variant="plain" receipt={receipt} {...adapters} />` }, { id: "unstyled", label: "Sin estilo", summary: "unstyled + styles", preview: <NReceipt {...receiptBaseProps} receipt={demoReceipt} unstyled styles={{ document: { borderWidth: "1px", borderColor: "border", p: "4" }, total: { color: "colorPalette.fg" } }} />, code: `<NReceipt unstyled styles={{ document: { p: "4" }, total: { fontWeight: "bold" } }} {...props} />` }, { id: "empty", label: "Vacío", summary: "receipt=null", preview: <NReceipt {...receiptBaseProps} receipt={null} />, code: `<NReceipt receipt={null} {...adapters} />` }]}
      propExamples={[{ label: "Totales propios", code: `<NReceipt getSummaryRows={(receipt) => receipt.totals} {...props} />` }, { label: "Impresión propia", code: `<NReceipt showPrint onPrint={printReceipt} {...props} />` }]}
      code={`<NReceipt
  receipt={receipt}
  getLines={(receipt) => receipt.lines}
  getLineTotal={(line) => line.total}
  getSummaryRows={(receipt) => receipt.summary}
  getTotal={(receipt) => receipt.total}
  {...receiptAdapters}
/>`}
    />
  </Stack>
}

export function ThermalPrintView() {
  const [lastJob, setLastJob] = useState("Ningún trabajo enviado.")
  const demoAdapter: NThermalPrintAdapter = async ({ configuration }) => {
    setLastJob(`${configuration.paperWidthMm} mm · ${configuration.job.copies} copia(s) · corte ${configuration.job.cut}`)
  }

  return <Stack gap="8">
    <PhaseIntro title="NThermalPrint" description="Complemento que aísla contenido para rollos térmicos y permite sustituir el diálogo del navegador por un adaptador local o de escritorio." />
    <Text role="status" color="fg.muted" fontSize="sm">{lastJob}</Text>
    <NThermalPrint adapter={demoAdapter} paperWidthMm={80} job={{ cut: "partial" }}>
      <NReceipt {...receiptBaseProps} receipt={demoReceipt} afterLines={<Text color="fg.muted" fontSize="sm">Gracias por su compra.</Text>} />
    </NThermalPrint>
    <ComponentDocs
      purpose="NThermalPrint prepara cualquier fragmento React para papel térmico. El navegador es el transporte predeterminado y adapter permite conectar QZ Tray, ESC/POS, Electron, Tauri o un servicio local sin acoplar dependencias al paquete."
      steps={["Envuelve el recibo o documento que debe imprimirse.", "Configura ancho, margen y tipografía base.", "Reutiliza print desde el render prop o el ref.", "Inyecta un adapter cuando el producto necesite impresión directa y capacidades de hardware."]}
      variants={[{ name: "80 mm", description: "Rollo predeterminado con 74 mm disponibles." }, { name: "58 mm", description: "Formato compacto con 52 mm disponibles." }, { name: "adapter", description: "Delega transporte, copias, corte y cajón a la aplicación." }]}
      variantExamples={[
        { id: "80mm", label: "80 mm", summary: "margen 3 mm", preview: <NThermalPrint adapter={demoAdapter}><Text>Ticket estándar de 80 mm</Text></NThermalPrint>, code: `<NThermalPrint paperWidthMm={80}><Receipt /></NThermalPrint>` },
        { id: "58mm", label: "58 mm", summary: "margen 3 mm", preview: <NThermalPrint adapter={demoAdapter} paperWidthMm={58}><Text>Ticket compacto de 58 mm</Text></NThermalPrint>, code: `<NThermalPrint paperWidthMm={58}><Receipt /></NThermalPrint>` },
        { id: "bridge", label: "Adaptador", summary: "corte + cajón", preview: <NThermalPrint adapter={demoAdapter} job={{ cut: "partial", openCashDrawer: true }}><Text>Trabajo delegado al puente local</Text></NThermalPrint>, code: `<NThermalPrint adapter={posAdapter} job={{ cut: "partial", openCashDrawer: true }}><Receipt /></NThermalPrint>` },
        { id: "unstyled", label: "Sin estilo", summary: "unstyled + slots", preview: <NThermalPrint unstyled adapter={demoAdapter} styles={{ trigger: { borderWidth: "1px", borderColor: "border", px: "3", py: "2" } }}><Text>Impresión con apariencia propia</Text></NThermalPrint>, code: `<NThermalPrint unstyled classNames={{ trigger: "print-button" }}><Receipt /></NThermalPrint>` },
      ]}
      propExamples={[{ label: "Botón de NReceipt", code: `<NThermalPrint showTrigger={false}>{({ print }) => <NReceipt showPrint onPrint={() => void print()} {...props} />}</NThermalPrint>` }, { label: "Control externo", code: `<NThermalPrint ref={printerRef}><Receipt /></NThermalPrint>` }]}
      code={`<NThermalPrint
  paperWidthMm={80}
  marginMm={3}
  adapter={posAdapter}
  job={{ copies: 1, cut: "partial" }}
>
  <NReceipt receipt={receipt} {...receiptAdapters} />
</NThermalPrint>`}
    />
  </Stack>
}

export function PosExampleView() {
  const [lines, setLines] = useState<readonly DemoCartLine[]>([createLine(demoProducts[0])])
  const [allocations, setAllocations] = useState<readonly NAmountAllocation<DemoPaymentMethod>[]>([])
  const [online, setOnline] = useState(true)
  const [syncStatus, setSyncStatus] = useState<NSyncState>("synced")
  const [receipt, setReceipt] = useState<DemoReceipt | null>(null)
  const summary = saleSummary(lines)

  const addByCode = (code: string) => {
    const product = demoProducts.find((item) => item.sku === code)
    if (!product) return { success: false, message: "No se encontró un artículo con ese código." }
    setLines((current) => resolveCartAdd(current, createLine(product)))
    return { success: true, message: `${product.name} agregado.` }
  }

  const finishSale = () => {
    const nextReceipt: DemoReceipt = { id: `receipt-${Date.now()}`, folio: `V-${2048 + lines.length}`, createdAt: new Date(), status: online ? "Pagado" : "Pendiente de sincronizar", lines: [...lines], subtotal: summary.subtotal, tax: summary.rows[0]?.amount ?? 0, total: summary.total }
    setReceipt(nextReceipt)
    setSyncStatus(online ? "synced" : "pending")
    return { success: true, message: online ? "Venta confirmada." : "Venta conservada en la cola de demostración." }
  }

  const reset = () => { setLines([]); setAllocations([]); setReceipt(null); setSyncStatus(online ? "synced" : "offline") }

  return <Stack gap="8">
    <PhaseIntro title="Ejemplo POS integrado" description="Flujo funcional que compone captura, carrito, pago, recibo y resiliencia. Es una referencia de integración; la persistencia y las reglas comerciales continúan fuera de Nissi UI." />
    <Flex gap="2" wrap="wrap"><Button size="sm" variant="outline" onClick={() => { setOnline((current) => !current); setSyncStatus(online ? "offline" : receipt ? "pending" : "synced") }}><WifiOff aria-hidden size={16} />{online ? "Simular sin conexión" : "Restablecer conexión"}</Button><Button size="sm" variant="ghost" onClick={reset}><RotateCcw aria-hidden size={16} />Nueva venta</Button></Flex>
    <NSyncStatus status={syncStatus} pendingCount={syncStatus === "pending" ? 1 : 0} variant="compact" onRetry={syncStatus === "pending" ? async () => { if (!online) return { success: false, message: "Restablece la conexión antes de sincronizar." }; setSyncStatus("syncing"); await new Promise((resolve) => window.setTimeout(resolve, 400)); setSyncStatus("synced"); return true } : undefined} />
    <NOfflineBoundary online={online} queuedCount={syncStatus === "pending" ? 1 : 0} onOnlineChange={setOnline} onCheckConnectivity={async () => { setOnline(true); setSyncStatus(receipt ? "pending" : "synced"); return true }}>
      {receipt ? <Stack gap="4"><NReceipt {...receiptBaseProps} receipt={receipt} showPrint onPrint={() => undefined} /><Button alignSelf="start" onClick={reset}><ShoppingCart aria-hidden size={16} />Iniciar otra venta</Button></Stack> : <SimpleGrid columns={{ base: 1, xl: 2 }} gap="6" alignItems="start">
        <Stack gap="5">
          <Card.Root variant="outline"><Card.Body><NCodeCapture allowDuplicate onCapture={(code) => addByCode(code)} labels={{ helperText: "Prueba 7501001, 7501002 o 7501003 y presiona Enter." }} /></Card.Body></Card.Root>
          <Card.Root variant="outline"><Card.Body><NCart {...cartBaseProps} lines={lines} onLinesChange={(next) => { setLines([...next]); setAllocations([]) }} /></Card.Body></Card.Root>
        </Stack>
        <Card.Root variant="outline" position={{ xl: "sticky" }} top={{ xl: "5rem" }}><Card.Body><NCheckout {...checkoutBaseProps} checkoutKey={`sale-${lines.map((line) => `${line.id}:${line.quantity}`).join("|")}`} total={summary.total} allocations={allocations} onAllocationsChange={setAllocations} disabled={lines.length === 0} review={<Stack gap="2"><Flex justify="space-between"><Text color="fg.muted">Partidas</Text><Badge>{lines.length}</Badge></Flex><Flex justify="space-between"><Text fontWeight="semibold">Total a cobrar</Text><Text fontWeight="bold">{money(summary.total)}</Text></Flex></Stack>} onComplete={finishSale} /></Card.Body></Card.Root>
      </SimpleGrid>}
    </NOfflineBoundary>
    <Card.Root variant="outline" bg="bg.subtle"><Card.Body><Flex gap="3" align="start"><ReceiptText aria-hidden /><Box><Heading as="h2" size="sm">Límite del ejemplo</Heading><Text color="fg.muted" fontSize="sm">La cola es temporal y demostrativa. Un producto real debe conectar IndexedDB o SQLite, un motor de sincronización y una API que revalide precios, impuestos, inventario, permisos e idempotencia.</Text></Box></Flex></Card.Body></Card.Root>
  </Stack>
}
