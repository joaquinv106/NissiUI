import { Badge, Button, Card, Flex, Heading, HStack, Stack, Text } from "@chakra-ui/react"
import { ArrowLeftRight, CreditCard, ReceiptText } from "lucide-react"
import { useRef, useState } from "react"

import {
  NCheckout,
  NPanel,
  NReceipt,
  type NAmountAllocation,
} from "../index"
import { ComponentDocs } from "./ComponentDocs"

interface PaymentMethod {
  id: string
  name: string
  description: string
}

interface ReceiptLine {
  id: string
  name: string
  quantity: number
  unitPrice: number
}

interface ReceiptData {
  id: string
  folio: string
  date: Date
  status: string
  lines: ReceiptLine[]
  subtotal: number
  tax: number
  total: number
}

type PanelContent = "checkout" | "receipt"

const methods: PaymentMethod[] = [
  { id: "cash", name: "Efectivo", description: "Pago recibido en caja" },
  { id: "card", name: "Tarjeta", description: "Terminal bancaria" },
]

const receipt: ReceiptData = {
  id: "receipt-panel-demo",
  folio: "V-2051",
  date: new Date("2026-09-06T20:30:00.000Z"),
  status: "Pagado",
  lines: [
    { id: "coffee", name: "Café de especialidad", quantity: 2, unitPrice: 85 },
    { id: "bread", name: "Pan artesanal", quantity: 1, unitPrice: 48 },
  ],
  subtotal: 218,
  tax: 34.88,
  total: 252.88,
}

const money = (amount: number) => new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
}).format(amount)

const receiptProps = {
  receipt,
  getReceiptId: (value: ReceiptData) => value.id,
  getReceiptNumber: (value: ReceiptData) => value.folio,
  getReceiptDate: (value: ReceiptData) => value.date,
  getReceiptStatus: (value: ReceiptData) => value.status,
  getLines: (value: ReceiptData) => value.lines,
  getLineId: (line: ReceiptLine) => line.id,
  getLineLabel: (line: ReceiptLine) => line.name,
  getLineQuantity: (line: ReceiptLine) => line.quantity,
  getLineUnitAmount: (line: ReceiptLine) => line.unitPrice,
  getLineTotal: (line: ReceiptLine) => line.quantity * line.unitPrice,
  getSummaryRows: (value: ReceiptData) => [
    { id: "subtotal", label: "Subtotal", amount: value.subtotal },
    { id: "tax", label: "IVA", amount: value.tax },
  ],
  getTotal: (value: ReceiptData) => value.total,
  formatAmount: money,
}

function PanelDemo({ compact = false, initialOpen = false }: { compact?: boolean; initialOpen?: boolean }) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState<PanelContent>("checkout")
  const [allocations, setAllocations] = useState<readonly NAmountAllocation<PaymentMethod>[]>([])
  const checkoutTriggerRef = useRef<HTMLButtonElement>(null)
  const receiptTriggerRef = useRef<HTMLButtonElement>(null)

  const show = (next: PanelContent) => {
    setContent(next)
    setOpen(true)
  }

  const activeTriggerRef = content === "checkout" ? checkoutTriggerRef : receiptTriggerRef

  return (
    <Stack gap="4">
      <Flex gap="3" wrap="wrap">
        <Button ref={checkoutTriggerRef} onClick={() => show("checkout")}>
          <CreditCard aria-hidden="true" size={17} />Abrir pago
        </Button>
        <Button ref={receiptTriggerRef} variant="outline" onClick={() => show("receipt")}>
          <ReceiptText aria-hidden="true" size={17} />Abrir recibo
        </Button>
      </Flex>

      {!compact ? (
        <Text color="fg.muted" fontSize="sm">
          El panel toma el lado opuesto al menú principal y puede cambiar de herramienta sin cerrarse.
        </Text>
      ) : null}

      <NPanel
        open={initialOpen || open}
        onOpenChange={initialOpen ? undefined : setOpen}
        returnFocusRef={activeTriggerRef}
        contentKey={content}
        title={content === "checkout" ? "Finalizar operación" : "Comprobante de venta"}
        description={content === "checkout" ? "Distribuye el total y confirma el pago." : "Consulta o imprime el resultado de la operación."}
      >
        <Stack gap="6">
          <HStack gap="2" flexWrap="wrap" aria-label="Contenido del panel">
            <Button size="xs" variant={content === "checkout" ? "solid" : "outline"} onClick={() => setContent("checkout")}>
              <CreditCard aria-hidden="true" size={15} />Pago
            </Button>
            <Button size="xs" variant={content === "receipt" ? "solid" : "outline"} onClick={() => setContent("receipt")}>
              <ReceiptText aria-hidden="true" size={15} />Recibo
            </Button>
          </HStack>

          {content === "checkout" ? (
            <NCheckout
              checkoutKey="panel-sale"
              total={receipt.total}
              methods={methods}
              getMethodId={(method) => method.id}
              getMethodLabel={(method) => method.name}
              getMethodDescription={(method) => method.description}
              allocations={allocations}
              onAllocationsChange={setAllocations}
              formatOptions={{ style: "currency", currency: "MXN" }}
              review={<Flex justify="space-between" gap="4"><Text>Venta V-2051</Text><Text fontWeight="semibold">{money(receipt.total)}</Text></Flex>}
              onComplete={async () => ({ success: true, message: "Pago confirmado en el ejemplo." })}
            />
          ) : (
            <NReceipt {...receiptProps} variant="plain" showPrint onPrint={() => undefined} />
          )}
        </Stack>
      </NPanel>
    </Stack>
  )
}

export function PanelView() {
  const openVisualPreview = typeof window !== "undefined"
    && new URLSearchParams(window.location.search).get("panelPreview") === "open"

  return (
    <Stack gap="8">
      <Stack gap="2" maxW="4xl">
        <Text color="colorPalette.fg" fontSize="sm" fontWeight="semibold" textTransform="uppercase">Estructura y navegación · Plus</Text>
        <Heading as="h1" size={{ base: "2xl", md: "3xl" }}>NPanel</Heading>
        <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }}>
          Panel modal lateral para presentar procesos, formularios o detalles sin abandonar el contexto de la pantalla actual.
        </Text>
      </Stack>

      <Card.Root variant="outline">
        <Card.Body gap="5">
          <HStack gap="3"><Badge colorPalette="blue">Reactivo</Badge><Text fontWeight="semibold">Alterna el contenido con el panel abierto</Text></HStack>
          <PanelDemo initialOpen={openVisualPreview} />
        </Card.Body>
      </Card.Root>

      <ComponentDocs
        purpose="NPanel encapsula la interacción modal de una superficie lateral: portal, overlay, foco, Escape, scroll, cierre y animación. La aplicación controla qué componente se muestra y cuándo cambia."
        steps={["Conserva la vista activa en el estado de tu aplicación.", "Abre el panel mediante open/onOpenChange o con trigger.", "Entrega el componente activo como children y usa contentKey si debe reiniciar su estado.", "Configura sidebarPosition sólo cuando NPanel viva fuera de NAppShell."]}
        variants={[{ name: "auto", description: "Se abre al lado opuesto del sidebar de NAppShell." }, { name: "start / end", description: "Fija explícitamente el borde de entrada." }, { name: "controlled", description: "Una señal externa abre, cierra y reemplaza el contenido." }, { name: "uncontrolled", description: "trigger y defaultOpen administran una interacción local." }]}
        variantExamples={[
          { id: "controlled", label: "Controlado", summary: "open + onOpenChange", preview: <PanelDemo compact />, code: `<NPanel open={open} onOpenChange={setOpen} title="Finalizar operación"><NCheckout {...checkoutProps} /></NPanel>` },
          { id: "uncontrolled", label: "Disparador", summary: "trigger", preview: <NPanel trigger={<Button>Abrir panel local</Button>} title="Detalle rápido"><Text>Contenido desacoplado de la navegación.</Text></NPanel>, code: `<NPanel trigger={<Button>Abrir</Button>} title="Detalle"><Detail /></NPanel>` },
        ]}
        propExamples={[{ label: "Cambio dinámico", code: `<NPanel open={open} contentKey={activeView} title={titles[activeView]}>{views[activeView]}</NPanel>` }, { label: "Sidebar a la derecha", code: `<NPanel sidebarPosition="end">{/* aparece a la izquierda */}</NPanel>` }, { label: "Proceso no descartable", code: `<NPanel closeOnEscape={false} closeOnInteractOutside={false}>...</NPanel>` }]}
        code={`const [panel, setPanel] = useState<"checkout" | "receipt" | null>(null)

<NPanel
  open={panel !== null}
  onOpenChange={(open) => !open && setPanel(null)}
  contentKey={panel ?? "closed"}
  title={panel === "checkout" ? "Finalizar pago" : "Recibo"}
>
  {panel === "checkout" ? <NCheckout {...checkoutProps} /> : <NReceipt {...receiptProps} />}
</NPanel>`}
      />
    </Stack>
  )
}
