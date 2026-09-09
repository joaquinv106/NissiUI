"use client"

import {
  Badge,
  Box,
  Button,
  Card,
  Code,
  Grid,
  Heading,
  HStack,
  Menu,
  Portal,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import { ArrowRight, Check, ChevronDown, Eye, Layers3, Palette, ShieldCheck, Sparkles } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"

import { NDocumentView, NPanel, NReceipt, NThermalPrint, NTheme } from "../index"
import "./accessibility.css"

export type PaletteId = "aurora" | "coral" | "cobalt"

export type CatalogExample = {
  id: string
  label: string
}

export function EmbeddedVisualPalette({ paletteId, children }: { paletteId: PaletteId; children: ReactNode }) {
  useEffect(() => {
    const body = document.body
    const hadScope = body.classList.contains("visual-system-embed")
    const previousPalette = body.getAttribute("data-palette")

    body.classList.add("visual-system-embed")
    body.setAttribute("data-palette", paletteId)

    return () => {
      if (!hadScope) body.classList.remove("visual-system-embed")
      if (previousPalette == null) body.removeAttribute("data-palette")
      else body.setAttribute("data-palette", previousPalette)
    }
  }, [paletteId])

  return (
    <Box className="visual-system-embed" data-palette={paletteId} minH="100dvh" bg="bg" color="fg" p={{ base: "4", md: "6" }}>
      {children}
    </Box>
  )
}

type CatalogFamily = {
  id: string
  label: string
  menuLabel: string
  description: string
  examples: readonly CatalogExample[]
}

interface DashboardPalette {
  id: PaletteId
  name: string
  description: string
  canvas: string
  surface: string
  surfaceRaised: string
  accent: string
  accentSoft: string
  secondary: string
  text: string
  muted: string
  border: string
}

interface OperationsReport {
  id: string
  period: string
  owner: string
  region: string
  objective: string
}

interface DemoReceiptLine {
  id: string
  label: string
  quantity: number
  unitPrice: number
}

interface DemoStyledReceipt {
  id: string
  number: string
  date: string
  lines: DemoReceiptLine[]
  subtotal: number
  tax: number
  total: number
}

const palettes: readonly DashboardPalette[] = [
  {
    id: "aurora",
    name: "Aurora",
    description: "Turquesa e índigo para operación y tecnología.",
    canvas: "#071421",
    surface: "#0c2032",
    surfaceRaised: "#12304a",
    accent: "#5eead4",
    accentSoft: "#123f46",
    secondary: "#a5b4fc",
    text: "#f8fafc",
    muted: "#b6c6d8",
    border: "#28506a",
  },
  {
    id: "coral",
    name: "Coral nocturno",
    description: "Coral y rosa para productos cálidos y editoriales.",
    canvas: "#1b101b",
    surface: "#2a1727",
    surfaceRaised: "#3a2036",
    accent: "#fdba74",
    accentSoft: "#4a2b2b",
    secondary: "#f9a8d4",
    text: "#fff7ed",
    muted: "#d7bdca",
    border: "#624055",
  },
  {
    id: "cobalt",
    name: "Cobalto",
    description: "Azul y lima para analítica y finanzas.",
    canvas: "#071329",
    surface: "#0d2242",
    surfaceRaised: "#14315d",
    accent: "#93c5fd",
    accentSoft: "#17375d",
    secondary: "#bef264",
    text: "#f8fafc",
    muted: "#b8c8df",
    border: "#31527c",
  },
]

const catalogFamilies: readonly CatalogFamily[] = [
  {
    id: "foundation",
    label: "Fundación y navegación",
    menuLabel: "Fundación",
    description: "Tema, shell, navegación, permisos y productividad.",
    examples: [
      { id: "theme", label: "NTheme" }, { id: "app-shell", label: "NAppShell" },
      { id: "header", label: "NHeader" }, { id: "sidebar", label: "NSidebar" },
      { id: "modules", label: "NModuleRegistry" }, { id: "workspaces", label: "NWorkspaceSwitcher" },
      { id: "permissions", label: "NPermissionGate" }, { id: "panel", label: "NPanel" },
      { id: "ctrl", label: "NCtrl" },
    ],
  },
  {
    id: "data-forms",
    label: "Datos, formularios e inputs",
    menuLabel: "Datos e inputs",
    description: "Tablas, formularios, captura y selección.",
    examples: [
      { id: "table", label: "NTable" }, { id: "datatable", label: "NDataTable" },
      { id: "form", label: "NForm" }, { id: "amount-input", label: "NAmountInput" },
      { id: "amount-allocator", label: "NAmountAllocator" }, { id: "item-picker", label: "NItemPicker" },
      { id: "line-item-editor", label: "NLineItemEditor" }, { id: "code-capture", label: "NCodeCapture" },
    ],
  },
  {
    id: "workflows",
    label: "Flujos y operación",
    menuLabel: "Flujos",
    description: "Pasos, aprobaciones, balances, ajustes y resiliencia.",
    examples: [
      { id: "step-flow", label: "NStepFlow" }, { id: "approval-flow", label: "NApprovalFlow" },
      { id: "balance-session", label: "NBalanceSession" }, { id: "adjustment-editor", label: "NAdjustmentEditor" },
      { id: "document-view", label: "NDocumentView" }, { id: "sync-status", label: "NSyncStatus" },
      { id: "offline-boundary", label: "NOfflineBoundary" },
    ],
  },
  {
    id: "commerce",
    label: "Comercio e impresión",
    menuLabel: "Comercio",
    description: "Carrito, cobro, recibos y punto de venta.",
    examples: [
      { id: "cart", label: "NCart" }, { id: "checkout", label: "NCheckout" },
      { id: "receipt", label: "NReceipt" }, { id: "thermal-print", label: "NThermalPrint" },
      { id: "pos-example", label: "Ejemplo POS" },
    ],
  },
  {
    id: "patterns",
    label: "Patrones visuales completos",
    menuLabel: "Patrones",
    description: "Estados, filtros, actividad, dashboards, SaaS y verticales.",
    examples: [
      { id: "page-patterns", label: "Página y estados" }, { id: "data-patterns", label: "Filtros y detalle" },
      { id: "activity-patterns", label: "Archivos y actividad" }, { id: "dashboard-patterns", label: "KPIs y gráficas" },
      { id: "saas-patterns", label: "Administración SaaS" }, { id: "vertical-patterns", label: "Kanban, agenda y mapa" },
    ],
  },
  {
    id: "projects",
    label: "Proyectos verticales",
    menuLabel: "Proyectos",
    description: "Composiciones completas construidas con la librería.",
    examples: [{ id: "facture", label: "NFacture" }],
  },
]

export const defaultCatalogExample: CatalogExample = { id: "datatable", label: "NDataTable" }

const report: OperationsReport = {
  id: "OPS-0926",
  period: "Septiembre 2026",
  owner: "Equipo de operaciones",
  region: "México · Centro",
  objective: "96%",
}

const styledReceipt: DemoStyledReceipt = {
  id: "sale-1842",
  number: "V-001842",
  date: "2026-09-07T15:30:00-06:00",
  lines: [
    { id: "line-1", label: "Suscripción Pro", quantity: 1, unitPrice: 1299 },
    { id: "line-2", label: "Implementación", quantity: 2, unitPrice: 450 },
  ],
  subtotal: 2199,
  tax: 351.84,
  total: 2550.84,
}

const implementationCode = `const styles = {
  document: {
    bg: "var(--dashboard-surface)",
    borderColor: "var(--dashboard-border)",
    borderWidth: "1px",
    borderRadius: "24px",
  },
  title: { color: "var(--dashboard-text)" },
  metadata: { color: "var(--dashboard-muted)" },
}

<NDocumentView
  unstyled
  document={report}
  classNames={{
    document: "a11y-dashboard__document",
    title: "a11y-dashboard__title",
  }}
  styles={styles}
  {...documentAdapters}
/>

<NPanel
  classNames={{ content: "operations-panel" }}
  styles={{ content: { bg: "bg.panel", roundedStart: "3xl" } }}
  {...panelProps}
/>`

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <Stack gap="2" maxW="4xl">
      <Text color="colorPalette.fg" fontWeight="semibold" fontSize="sm" letterSpacing="wide" textTransform="uppercase">
        {eyebrow}
      </Text>
      <Heading as="h1" size={{ base: "2xl", md: "3xl" }} letterSpacing="tight">{title}</Heading>
      <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }}>{description}</Text>
    </Stack>
  )
}

function KpiCard({ label, value, detail, palette }: { label: string; value: string; detail: string; palette: DashboardPalette }) {
  return (
    <Box
      as="article"
      bg={palette.surface}
      borderWidth="1px"
      borderColor={palette.border}
      rounded="2xl"
      p="5"
      minW="0"
    >
      <Text color={palette.muted} fontSize="sm">{label}</Text>
      <Text color={palette.text} fontSize="3xl" fontWeight="bold" letterSpacing="tight" mt="1">{value}</Text>
      <HStack gap="2" mt="3">
        <Box aria-hidden width="2" height="2" rounded="full" bg={palette.accent} />
        <Text color={palette.muted} fontSize="xs">{detail}</Text>
      </HStack>
    </Box>
  )
}

function DashboardPreview({ palette }: { palette: DashboardPalette }) {
  return (
    <Box
      className="a11y-dashboard"
      as="section"
      aria-labelledby="dashboard-preview-title"
      bg={palette.canvas}
      color={palette.text}
      borderWidth="1px"
      borderColor={palette.border}
      rounded={{ base: "2xl", md: "3xl" }}
      p={{ base: "4", md: "7" }}
      overflow="hidden"
    >
      <Stack gap="6">
        <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap="4">
          <Box>
            <Text color={palette.accent} fontSize="xs" fontWeight="bold" letterSpacing="widest" textTransform="uppercase">Centro de control</Text>
            <Heading id="dashboard-preview-title" as="h2" size="xl" color={palette.text} mt="1">Operación saludable</Heading>
            <Text color={palette.muted} mt="1">Un dashboard expresivo que conserva contraste, jerarquía y foco.</Text>
          </Box>
          <Badge bg={palette.accentSoft} color={palette.accent} borderWidth="1px" borderColor={palette.border} rounded="full" px="3" py="1.5">
            Datos actualizados
          </Badge>
        </Stack>

        <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4">
          <KpiCard label="Ventas netas" value="$842k" detail="12.4% arriba" palette={palette} />
          <KpiCard label="Conversión" value="8.6%" detail="Meta superada" palette={palette} />
          <KpiCard label="Órdenes" value="1,284" detail="38 por confirmar" palette={palette} />
          <KpiCard label="Satisfacción" value="4.9" detail="Últimos 30 días" palette={palette} />
        </SimpleGrid>

        <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1.7fr) minmax(16rem, .7fr)" }} gap="4">
          <NDocumentView
            unstyled
            document={report}
            getDocumentId={(item) => item.id}
            getDocumentTitle={() => "Resumen ejecutivo"}
            getDocumentSubtitle={(item) => item.period}
            getDocumentStatus={() => "En objetivo"}
            fields={[
              { id: "owner", label: "Responsable", getValue: (item) => item.owner },
              { id: "region", label: "Cobertura", getValue: (item) => item.region },
              { id: "objective", label: "Cumplimiento", getValue: (item) => item.objective },
            ]}
            sections={[
              {
                id: "trend",
                title: "Tendencia semanal",
                description: "La forma y el texto complementan al color.",
                render: () => (
                  <HStack align="end" gap="2" height="8rem" aria-label="Tendencia ascendente de siete semanas">
                    {[38, 52, 46, 68, 64, 82, 94].map((height, index) => (
                      <Box key={height + index} flex="1" height={`${height}%`} minW="5" roundedTop="md" bg={index === 6 ? palette.accent : palette.secondary} opacity={index === 6 ? 1 : 0.62} />
                    ))}
                  </HStack>
                ),
              },
            ]}
            classNames={{
              document: "a11y-dashboard__document",
              title: "a11y-dashboard__title",
              metadata: "a11y-dashboard__metadata",
              section: "a11y-dashboard__section",
            }}
            styles={{
              root: { minW: "0" },
              document: { bg: palette.surface, borderColor: palette.border, color: palette.text },
              documentHeader: { alignItems: "flex-start" },
              title: { color: palette.text },
              metadata: { color: palette.muted },
              section: { borderColor: palette.border },
            }}
          />

          <Stack gap="4">
            <Box bg={palette.surfaceRaised} borderWidth="1px" borderColor={palette.border} rounded="2xl" p="5">
              <HStack justify="space-between">
                <Text fontWeight="semibold">Salud del sistema</Text>
                <ShieldCheck aria-hidden size={19} color={palette.accent} />
              </HStack>
              <Stack gap="4" mt="5">
                {[["Disponibilidad", "99.98%", 99], ["Sincronización", "94%", 94], ["Inventario", "88%", 88]].map(([label, value, width]) => (
                  <Box key={String(label)}>
                    <HStack justify="space-between" fontSize="sm"><Text color={palette.muted}>{label}</Text><Text fontWeight="semibold">{value}</Text></HStack>
                    <Box mt="2" height="2" bg={palette.canvas} rounded="full" overflow="hidden"><Box height="full" width={`${width}%`} bg={palette.accent} rounded="full" /></Box>
                  </Box>
                ))}
              </Stack>
            </Box>

            <NPanel
              trigger={<Button width="full" bg={palette.accent} color={palette.canvas} _hover={{ bg: palette.secondary }}>Abrir detalle accesible <ArrowRight aria-hidden size={17} /></Button>}
              title="Detalle de operación"
              description="El panel conserva foco, teclado y semántica aunque cambie su superficie."
              desktopWidth="34rem"
              classNames={{ content: "a11y-operations-panel", body: "a11y-operations-panel__body" }}
              styles={{
                backdrop: { bg: "blackAlpha.700", backdropFilter: "blur(6px)" },
                content: { bg: palette.surface, color: palette.text, borderColor: palette.border, roundedStart: { base: "none", md: "3xl" } },
                header: { borderColor: palette.border },
                title: { color: palette.text, fontSize: "xl", fontWeight: "bold" },
                description: { color: palette.muted },
                body: { bg: palette.canvas },
                footer: { borderColor: palette.border },
                closeTrigger: { color: palette.text, _hover: { bg: palette.surfaceRaised } },
              }}
              footer={<Text color={palette.muted} fontSize="sm">Escape también cierra este panel.</Text>}
            >
              <Stack gap="4">
                <Badge alignSelf="start" bg={palette.accentSoft} color={palette.accent}>Prioridad media</Badge>
                <Heading as="h3" size="md" color={palette.text}>38 órdenes requieren confirmación</Heading>
                <Text color={palette.muted}>La personalización visual no elimina el diálogo, el foco atrapado, el cierre con Escape ni la restauración del foco.</Text>
                <Button alignSelf="start" variant="outline" borderColor={palette.border} color={palette.text}>Revisar órdenes</Button>
              </Stack>
            </NPanel>
          </Stack>
        </Grid>
      </Stack>
    </Box>
  )
}

function StyledComponentsGallery({ palette }: { palette: DashboardPalette }) {
  const [printStatus, setPrintStatus] = useState("Listo para enviar al adaptador de impresión.")
  const money = (value: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value)

  return (
    <Stack as="section" aria-labelledby="styled-components-title" gap="5">
      <Stack gap="2" maxW="3xl">
        <Badge alignSelf="start" colorPalette="blue" variant="subtle">Cobertura completa</Badge>
        <Heading id="styled-components-title" as="h2" size="xl">Todos los componentes del nuevo contrato visual</Heading>
        <Text color="fg.muted">Cada ejemplo usa slots públicos reales. Cambia la paleta de arriba y la misma dirección visual se propaga al documento, recibo, impresión y panel.</Text>
      </Stack>

      <SimpleGrid columns={{ base: 1, xl: 2 }} gap="5" alignItems="start">
        <Stack gap="3" minW="0">
          <HStack justify="space-between" align="start">
            <Box><Text fontWeight="semibold">NReceipt</Text><Text color="fg.muted" fontSize="sm">Documento, partidas, resumen y total personalizados.</Text></Box>
            <Code colorPalette="blue">unstyled</Code>
          </HStack>
          <NReceipt
            unstyled
            receipt={styledReceipt}
            getReceiptId={(receipt) => receipt.id}
            getReceiptNumber={(receipt) => receipt.number}
            getReceiptTitle={() => "Recibo de servicio"}
            getReceiptDate={(receipt) => receipt.date}
            getReceiptStatus={() => "Pagado"}
            getLines={(receipt) => receipt.lines}
            getLineId={(line) => line.id}
            getLineLabel={(line) => line.label}
            getLineQuantity={(line) => line.quantity}
            getLineUnitAmount={(line) => line.unitPrice}
            getLineTotal={(line) => line.quantity * line.unitPrice}
            getSummaryRows={(receipt) => [
              { id: "subtotal", label: "Subtotal", amount: receipt.subtotal },
              { id: "tax", label: "IVA", amount: receipt.tax },
            ]}
            getTotal={(receipt) => receipt.total}
            formatAmount={money}
            classNames={{
              document: "a11y-dashboard__document",
              title: "a11y-dashboard__title",
              lines: "a11y-receipt__lines",
              line: "a11y-receipt__line",
              total: "a11y-receipt__total",
            }}
            styles={{
              document: { bg: palette.surface, borderWidth: "1px", borderColor: palette.border, color: palette.text },
              documentHeader: { borderBottomWidth: "1px", borderColor: palette.border, pb: "4" },
              title: { color: palette.text },
              metadata: { color: palette.muted },
              section: { borderColor: palette.border },
              lines: { color: palette.text },
              line: { borderTopWidth: "1px", borderColor: palette.border, py: "3" },
              lineLabel: { color: palette.text },
              summary: { color: palette.muted },
              total: { color: palette.accent, borderTopWidth: "1px", borderColor: palette.border, pt: "3" },
            }}
          />
        </Stack>

        <Stack gap="5" minW="0">
          <Stack gap="3">
            <HStack justify="space-between" align="start">
              <Box><Text fontWeight="semibold">NThermalPrint</Text><Text color="fg.muted" fontSize="sm">Fuente, disparador y trabajo de 80 mm con estilo propio.</Text></Box>
              <Code colorPalette="blue">styles</Code>
            </HStack>
            <NThermalPrint
              unstyled
              paperWidthMm={80}
              adapter={async ({ configuration }) => {
                setPrintStatus(`Trabajo simulado: ${configuration.paperWidthMm} mm · ${configuration.job.copies} copia`)
              }}
              job={{ copies: 1, cut: "partial" }}
              onAfterPrint={(result) => {
                if (!result.success) setPrintStatus("No fue posible preparar el trabajo.")
              }}
              labels={{ print: "Simular impresión", printing: "Preparando ticket" }}
              classNames={{ root: "a11y-thermal", trigger: "a11y-thermal__trigger", source: "a11y-thermal__source" }}
              styles={{
                root: { bg: palette.surfaceRaised, borderWidth: "1px", borderColor: palette.border, rounded: "2xl", p: "5" },
                trigger: { display: "inline-flex", alignItems: "center", gap: "2", bg: palette.accent, color: palette.canvas, rounded: "lg", px: "4", py: "2.5", fontWeight: "bold", cursor: "pointer", _focusVisible: { outline: "3px solid", outlineColor: palette.text, outlineOffset: "3px" } },
                source: { bg: "white", color: "#111827", width: "min(100%, 20rem)", mx: "auto", mt: "4", p: "5", rounded: "sm", fontFamily: "mono" },
                error: { color: "#fecaca", fontWeight: "semibold" },
              }}
            >
              <Stack gap="3">
                <Box textAlign="center"><Text fontWeight="bold">NISSI STORE</Text><Text fontSize="xs">Ticket #V-001842</Text></Box>
                <Box borderTopWidth="1px" borderBottomWidth="1px" borderStyle="dashed" py="2"><HStack justify="space-between"><Text fontSize="sm">2 servicios</Text><Text fontWeight="bold">{money(styledReceipt.total)}</Text></HStack></Box>
                <Text textAlign="center" fontSize="xs">Gracias por tu compra</Text>
              </Stack>
            </NThermalPrint>
            <Text role="status" color="fg.muted" fontSize="sm">{printStatus}</Text>
          </Stack>

          <Card.Root variant="outline" bg="bg.panel">
            <Card.Body gap="4">
              <HStack justify="space-between" align="start">
                <Box><Text fontWeight="semibold">NThemeProvider + NTheme</Text><Text color="fg.muted" fontSize="sm">El sistema personalizado vive arriba; los componentes consumen intención.</Text></Box>
                <Code colorPalette="blue">system</Code>
              </HStack>
              <NTheme presentation="button" />
              <Box as="pre" bg="bg.muted" rounded="lg" p="4" overflowX="auto" fontSize="xs"><code>{`<NThemeProvider system={companySystem}>\n  <Dashboard />\n</NThemeProvider>`}</code></Box>
            </Card.Body>
          </Card.Root>

          <Card.Root variant="outline" bg="bg.panel">
            <Card.Body gap="3">
              <Text fontWeight="semibold">NPanel</Text>
              <Text color="fg.muted" fontSize="sm">Está integrado en el dashboard superior: abre “Detalle accesible” para comprobar el Drawer personalizado, el foco y Escape.</Text>
            </Card.Body>
          </Card.Root>
        </Stack>
      </SimpleGrid>
    </Stack>
  )
}

interface VisualSystemControlsProps {
  paletteId: PaletteId
  selectedExample: CatalogExample
  onPaletteChange: (palette: PaletteId) => void
  onExampleChange: (example: CatalogExample) => void
}

export function VisualSystemControls({ paletteId, selectedExample, onPaletteChange, onExampleChange }: VisualSystemControlsProps) {
  return (
    <HStack as="nav" aria-label="Componentes y paleta del sistema visual" gap="1" maxW="full" overflowX="auto" py="1" css={{ scrollbarWidth: "thin" }}>
      {catalogFamilies.map((family) => {
        const containsSelection = family.examples.some((example) => example.id === selectedExample.id)
        return (
          <Menu.Root key={family.id} positioning={{ placement: "bottom-start" }}>
            <Menu.Trigger asChild>
              <Button size="xs" variant={containsSelection ? "subtle" : "ghost"} colorPalette={containsSelection ? "blue" : "gray"} flexShrink="0">
                {family.menuLabel}<ChevronDown aria-hidden size={13} />
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content minW="15rem" maxH="min(28rem, calc(100dvh - 6rem))" overflowY="auto" zIndex="dropdown">
                  <Menu.ItemGroup>
                    <Menu.ItemGroupLabel>{family.description}</Menu.ItemGroupLabel>
                    {family.examples.map((example) => (
                      <Menu.Item key={example.id} value={example.id} fontWeight={selectedExample.id === example.id ? "semibold" : undefined} onClick={() => onExampleChange(example)}>
                        {example.label}{selectedExample.id === example.id ? <Check aria-hidden size={14} /> : null}
                      </Menu.Item>
                    ))}
                  </Menu.ItemGroup>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        )
      })}

      <Box aria-hidden width="1px" height="5" bg="border" flexShrink="0" mx="1" />
      <HStack role="group" aria-label="Paleta visual" gap="1" flexShrink="0">
        {palettes.map((palette) => (
          <Button
            key={palette.id}
            size="xs"
            minW="7"
            px="2"
            variant={paletteId === palette.id ? "solid" : "ghost"}
            colorPalette={palette.id === "coral" ? "pink" : palette.id === "cobalt" ? "blue" : "teal"}
            aria-label={`Usar paleta ${palette.name}`}
            aria-pressed={paletteId === palette.id}
            title={palette.name}
            onClick={() => onPaletteChange(palette.id)}
          >
            <Box aria-hidden width="2.5" height="2.5" rounded="full" bg={palette.accent} borderWidth="1px" borderColor="blackAlpha.400" />
            <Text as="span" display={{ base: "none", "2xl": "inline" }} fontSize="xs">{palette.name}</Text>
          </Button>
        ))}
      </HStack>
    </HStack>
  )
}

function CompleteLibraryExplorer({ selectedExample, paletteId }: { selectedExample: CatalogExample; paletteId: PaletteId }) {

  return (
    <Stack as="section" aria-labelledby="complete-library-title" gap="6">
      <Stack gap="2" maxW="4xl">
        <Badge alignSelf="start" colorPalette="purple" variant="subtle">Todo Nissi UI</Badge>
        <Heading id="complete-library-title" as="h2" size="xl">Explorador de todos los componentes y elementos</Heading>
        <Text color="fg.muted">Selecciona cualquier componente para abrir aquí mismo su ejemplo real, variantes, documentación y código. Sólo se monta una vista a la vez para mantener rápido el catálogo y comprensible el foco.</Text>
      </Stack>

      <Card.Root variant="outline" bg="bg.panel" overflow="hidden">
        <Card.Header borderBottomWidth="1px" borderColor="border" py="4">
          <HStack justify="space-between" align={{ base: "start", sm: "center" }} flexDirection={{ base: "column", sm: "row" }} gap="3">
            <Box>
              <Text color="fg.muted" fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">Vista interactiva</Text>
              <Heading as="h3" size="md">{selectedExample.label}</Heading>
            </Box>
            <Badge colorPalette="green" variant="subtle">Componente real</Badge>
          </HStack>
        </Card.Header>
        <iframe
          className="complete-library-frame"
          title={`Ejemplo interactivo de ${selectedExample.label}`}
          src={`?view=${selectedExample.id}&theme=dark&embed=1&palette=${paletteId}`}
          loading="lazy"
        />
      </Card.Root>
    </Stack>
  )
}

interface VisualSystemViewProps {
  paletteId?: PaletteId
  selectedExample?: CatalogExample
  onPaletteChange?: (palette: PaletteId) => void
  onExampleChange?: (example: CatalogExample) => void
  controlsInHeader?: boolean
}

export function VisualSystemView({
  paletteId: controlledPaletteId,
  selectedExample: controlledExample,
  onPaletteChange,
  onExampleChange,
  controlsInHeader = false,
}: VisualSystemViewProps = {}) {
  const [internalPaletteId, setInternalPaletteId] = useState<PaletteId>("aurora")
  const [internalExample, setInternalExample] = useState<CatalogExample>(defaultCatalogExample)
  const paletteId = controlledPaletteId ?? internalPaletteId
  const selectedExample = controlledExample ?? internalExample
  const changePalette = (next: PaletteId) => {
    if (controlledPaletteId === undefined) setInternalPaletteId(next)
    onPaletteChange?.(next)
  }
  const changeExample = (next: CatalogExample) => {
    if (controlledExample === undefined) setInternalExample(next)
    onExampleChange?.(next)
  }
  const palette = palettes.find((item) => item.id === paletteId) ?? palettes[0]

  return (
    <Stack gap="8" colorPalette="blue">
      <PageIntro
        eyebrow="Accesibilidad · Sistema visual"
        title="Todos los componentes, un sistema visual flexible"
        description="Explora tres direcciones de color y observa cómo los nuevos slots permiten transformar la apariencia sin reemplazar el comportamiento accesible de los componentes."
      />

      {!controlsInHeader ? (
        <VisualSystemControls paletteId={paletteId} selectedExample={selectedExample} onPaletteChange={changePalette} onExampleChange={changeExample} />
      ) : (
        <Box display={{ base: "block", md: "none" }}>
          <VisualSystemControls paletteId={paletteId} selectedExample={selectedExample} onPaletteChange={changePalette} onExampleChange={changeExample} />
        </Box>
      )}
      <Text role="status" color="fg.muted" fontSize="sm">
        {palette.name}: {palette.description} Componente activo: {selectedExample.label}.
      </Text>

      <CompleteLibraryExplorer selectedExample={selectedExample} paletteId={paletteId} />

      <Box as="details" borderWidth="1px" borderColor="border" rounded="xl" bg="bg.panel">
        <Box as="summary" cursor="pointer" px="5" py="4" fontWeight="semibold">
          Ver composición completa y ejemplos avanzados
        </Box>
        <Stack gap="8" px={{ base: "4", md: "6" }} pb="6">
          <DashboardPreview palette={palette} />
          <StyledComponentsGallery palette={palette} />
        </Stack>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="4">
        {[
          [<Palette key="palette" aria-hidden />, "Personalidad por capas", "Usa el sistema para decisiones globales; styles para ajustes locales; classNames para CSS de marca."],
          [<Eye key="eye" aria-hidden />, "Contraste antes que moda", "Texto, bordes y foco deben seguir siendo perceptibles en todos los temas y tamaños."],
          [<ShieldCheck key="shield" aria-hidden />, "Comportamiento intacto", "unstyled sólo retira decoración: teclado, roles, estados y callbacks continúan activos."],
        ].map(([icon, title, description]) => (
          <Card.Root key={String(title)} variant="outline" bg="bg.panel">
            <Card.Body gap="3">
              <Box color="colorPalette.fg">{icon}</Box>
              <Heading as="h2" size="sm">{title}</Heading>
              <Text color="fg.muted" fontSize="sm">{description}</Text>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Card.Root variant="outline" bg="bg.panel">
        <Card.Body gap="4">
          <Heading as="h2" size="md">La combinación usada</Heading>
          <Text color="fg.muted">Los nombres de slot son tipados y estables. El código combina CSS propio con objetos de estilo Chakra sin depender de clases internas.</Text>
          <Box as="pre" bg="bg.muted" borderWidth="1px" borderColor="border" rounded="lg" p="4" overflowX="auto" fontSize="xs" lineHeight="1.7"><code>{implementationCode}</code></Box>
        </Card.Body>
      </Card.Root>
    </Stack>
  )
}

const learningSteps = [
  ["1", "Empieza por la estructura", "Define qué debe entender y hacer la persona antes de elegir colores."],
  ["2", "Usa componentes semánticos", "Botones para acciones, enlaces para navegar, headings en orden y Field para formularios."],
  ["3", "Aplica tokens", "Los tokens expresan intención: fondo, texto, borde, éxito o alerta; no sólo un color fijo."],
  ["4", "Personaliza por capas", "Prueba primero props, luego styles, después classNames y usa unstyled sólo cuando necesitas control total."],
  ["5", "Comprueba responsive", "Revisa móvil, teclado, zoom al 200%, textos largos y preferencia de movimiento reducido."],
  ["6", "Valida antes de publicar", "Ejecuta tipos, pruebas, build, SSR, tree shaking y la revisión del paquete."],
] as const

function GuideSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <Box as="section" aria-labelledby={`guide-${number}`} borderTopWidth="1px" borderColor="border" pt="7">
      <Grid templateColumns={{ base: "1fr", md: "12rem minmax(0, 1fr)" }} gap={{ base: "3", md: "8" }}>
        <HStack align="start">
          <Badge colorPalette="blue" rounded="full">{number}</Badge>
          <Heading id={`guide-${number}`} as="h2" size="md">{title}</Heading>
        </HStack>
        <Stack gap="4">{children}</Stack>
      </Grid>
    </Box>
  )
}

export function BeginnerAccessibilityGuideView() {
  return (
    <Stack gap="10" colorPalette="blue">
      <PageIntro
        eyebrow="Accesibilidad · Documentación completa"
        title="Diseño y desarrollo web con Nissi UI, desde cero"
        description="Una ruta práctica para pasar de una idea a una interfaz responsive, personalizable y accesible, aunque sea tu primera experiencia creando un producto web."
      />

      <Box as="nav" aria-label="Contenido de la guía" bg="bg.muted" borderWidth="1px" borderColor="border" rounded="2xl" p={{ base: "5", md: "6" }}>
        <Heading as="h2" size="sm">Lo que aprenderás</Heading>
        <SimpleGrid as="ol" listStyleType="none" columns={{ base: 1, md: 2, xl: 3 }} gap="3" p="0" m="4 0 0">
          {learningSteps.map(([number, title]) => (
            <HStack as="li" key={number} gap="3"><Badge colorPalette="blue" variant="subtle">{number}</Badge><Text fontSize="sm" fontWeight="medium">{title}</Text></HStack>
          ))}
        </SimpleGrid>
      </Box>

      <GuideSection number="01" title="El modelo mental">
        <Text color="fg.muted">Una interfaz no empieza con colores. Empieza con una tarea, información ordenada y una acción principal evidente. Nissi UI aporta bloques reutilizables; tu aplicación aporta los datos, permisos y reglas de negocio.</Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
          {[["Contenido", "Qué necesita saber la persona."], ["Interacción", "Qué puede hacer y qué respuesta recibirá."], ["Presentación", "Cómo la jerarquía visual facilita ambas cosas."]].map(([title, description]) => (
            <Card.Root key={title} variant="outline"><Card.Body><Heading as="h3" size="sm">{title}</Heading><Text color="fg.muted" fontSize="sm">{description}</Text></Card.Body></Card.Root>
          ))}
        </SimpleGrid>
      </GuideSection>

      <GuideSection number="02" title="Instalación mínima">
        <Text color="fg.muted">Instala el paquete y sus dependencias pares. Envuelve la aplicación una sola vez con el proveedor de tema.</Text>
        <Box as="pre" bg="bg.muted" rounded="lg" p="4" overflowX="auto" fontSize="sm"><code>npm install nissi-ui @chakra-ui/react @emotion/react next-themes</code></Box>
        <Box as="pre" bg="bg.muted" rounded="lg" p="4" overflowX="auto" fontSize="xs" lineHeight="1.7"><code>{`import { NThemeProvider } from "nissi-ui/theme"

export function App() {
  return <NThemeProvider><YourProduct /></NThemeProvider>
}`}</code></Box>
      </GuideSection>

      <GuideSection number="03" title="Construye con jerarquía">
        <Text color="fg.muted">Usa un solo título principal por vista, agrupa contenido relacionado y deja que el espacio comunique la estructura. En móvil, una columna clara suele ser mejor que comprimir el escritorio.</Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
          <Box borderWidth="1px" borderColor="border" rounded="xl" p="5"><Badge colorPalette="green" mb="3"><Check aria-hidden size={14} /> Recomendado</Badge><Heading as="h3" size="sm">Una acción principal</Heading><Text color="fg.muted" fontSize="sm" mt="2">El botón más importante destaca; las acciones secundarias usan outline o ghost.</Text></Box>
          <Box borderWidth="1px" borderColor="border" rounded="xl" p="5"><Badge colorPalette="green" mb="3"><Check aria-hidden size={14} /> Recomendado</Badge><Heading as="h3" size="sm">Estados explícitos</Heading><Text color="fg.muted" fontSize="sm" mt="2">Loading, vacío, error y éxito deben explicarse con texto, no únicamente con color.</Text></Box>
        </SimpleGrid>
      </GuideSection>

      <GuideSection number="04" title="Personaliza sin romper">
        <Text color="fg.muted">Escoge el nivel más pequeño que resuelva tu necesidad. Así conservas actualizaciones futuras y reduces CSS difícil de mantener.</Text>
        <Stack gap="3">
          {[
            ["Nivel 1 · Props", "Usa variant, colorPalette, size y las props propias del componente."],
            ["Nivel 2 · styles", "Aplica SystemStyleObject a slots tipados para ajustes locales y adaptativos."],
            ["Nivel 3 · classNames", "Conecta una hoja CSS o metodología de tu organización usando slots estables."],
            ["Nivel 4 · unstyled", "Retira la decoración predeterminada cuando necesitas control visual completo; la interacción permanece."],
            ["Nivel 5 · system", "Inyecta un sistema Chakra propio para tokens y decisiones de marca globales."],
          ].map(([title, description]) => (
            <HStack key={title} align="start" borderWidth="1px" borderColor="border" rounded="lg" p="4" gap="4"><Layers3 aria-hidden size={19} /><Box><Text fontWeight="semibold">{title}</Text><Text color="fg.muted" fontSize="sm">{description}</Text></Box></HStack>
          ))}
        </Stack>
      </GuideSection>

      <GuideSection number="05" title="Accesibilidad práctica">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
          {[
            ["Teclado", "Recorre la vista con Tab, Shift+Tab, Enter, Espacio y Escape sin perder el foco."],
            ["Contraste", "Comprueba texto, iconos, bordes y foco. El color nunca debe ser la única señal."],
            ["Semántica", "Conserva h1–h6 en orden, regiones con nombre, listas reales y labels de formulario."],
            ["Zoom y responsive", "Prueba 320 px de ancho y 200% de zoom sin contenido oculto ni scroll lateral global."],
            ["Movimiento", "Respeta prefers-reduced-motion y evita animaciones indispensables para comprender cambios."],
            ["Mensajes", "Anuncia errores y resultados con roles apropiados y explica cómo resolverlos."],
          ].map(([title, description]) => (
            <Card.Root key={title} variant="outline"><Card.Body gap="2"><HStack><Check aria-hidden size={16} /><Heading as="h3" size="sm">{title}</Heading></HStack><Text color="fg.muted" fontSize="sm">{description}</Text></Card.Body></Card.Root>
          ))}
        </SimpleGrid>
      </GuideSection>

      <GuideSection number="06" title="Producción y publicación">
        <Text color="fg.muted">Importa sólo lo que uses. Las subrutas reducen el trabajo del bundler y los componentes que dependen del navegador conservan la directiva de cliente para Next.js.</Text>
        <Box as="pre" bg="bg.muted" rounded="lg" p="4" overflowX="auto" fontSize="xs" lineHeight="1.7"><code>{`import { NPanel } from "nissi-ui/panel"
import { NThermalPrint } from "nissi-ui/thermal-print"

// Antes de entregar
npm run typecheck
npm test
npm run build
npm run check:package`}</code></Box>
        <Box borderWidth="1px" borderColor="border" rounded="xl" p="5" bg="bg.subtle">
          <HStack align="start"><Sparkles aria-hidden size={19} /><Box><Heading as="h3" size="sm">Regla final</Heading><Text color="fg.muted" fontSize="sm" mt="1">Una interfaz está lista cuando se entiende, funciona con distintos dispositivos y puede recuperarse de errores; no sólo cuando se ve bonita.</Text></Box></HStack>
        </Box>
      </GuideSection>

      <Card.Root variant="outline" bg="bg.panel">
        <Card.Body gap="3">
          <Badge alignSelf="start" colorPalette="blue" variant="subtle">Siguiente paso</Badge>
          <Heading as="h2" size="md">Explora un componente real</Heading>
          <Text color="fg.muted">Abre cualquier ejemplo del menú Componentes. Cada vista incluye propósito, variantes, props y código ejecutable para aprender modificando algo concreto.</Text>
          <HStack flexWrap="wrap"><Code colorPalette="blue">docs/customization.md</Code><Code colorPalette="blue">docs/package-compatibility.md</Code><Code colorPalette="blue">docs/accessibility.md</Code></HStack>
        </Card.Body>
      </Card.Root>
    </Stack>
  )
}
