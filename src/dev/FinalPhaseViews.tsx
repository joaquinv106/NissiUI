"use client"

import { Badge, Box, Button, Field, Heading, Input, Stack, Text } from "@chakra-ui/react"
import { Bell, DollarSign, Users } from "lucide-react"
import { useState } from "react"

import {
  NActivityTimeline,
  NAsyncState,
  NAuditLog,
  NBreadcrumbs,
  NChartFrame,
  NConfirmDialog,
  NDashboardGrid,
  NDashboardGridItem,
  NDataTable,
  NDateRangePicker,
  NDescriptionList,
  NDetailPanel,
  NEmptyState,
  NFileUpload,
  NFilterBar,
  NImpersonationBanner,
  NKanban,
  NMapView,
  NNotificationCenter,
  NPageHeader,
  NPlanComparison,
  NScheduler,
  NStatCard,
  NSubscriptionGate,
  type NKanbanColumn,
  type NTableServerQuery,
} from "../index"
import { ComponentDocs } from "./ComponentDocs"

function Intro({ phase, title, children }: { phase: string; title: string; children: React.ReactNode }) {
  return <Stack gap="2"><Text color="colorPalette.fg" fontSize="sm" fontWeight="semibold" textTransform="uppercase">Fase final · {phase}</Text><Heading as="h1" size={{ base: "2xl", md: "3xl" }}>{title}</Heading><Text color="fg.muted" maxW="4xl">{children}</Text></Stack>
}

function Doc({ name, purpose, preview, code }: { name: string; purpose: string; preview: React.ReactNode; code: string }) {
  return <Stack gap="3"><Heading as="h2" size="xl">{name}</Heading><ComponentDocs purpose={purpose} steps={["Importa el componente desde nissi-ui.", "Conecta su estado y callbacks con la lógica de tu aplicación.", "Traduce las etiquetas mediante labels cuando corresponda."]} variants={[{ name: "Componible", description: "API neutral respecto del sector, backend y router." }, { name: "Responsive", description: "Se adapta desde móvil y conserva semántica accesible." }]} variantExamples={[{ id: "live", label: "Interactivo", summary: "Ejemplo funcional", preview, code }]} code={code} /></Stack>
}

const descriptions = [{ id: "folio", label: "Folio", value: "TR-2048" }, { id: "owner", label: "Responsable", value: "María López" }, { id: "status", label: "Estado", value: <Badge colorPalette="green">Aprobado</Badge> }]

export function PagePatternsView() {
  const [status, setStatus] = useState<"loading" | "error" | "empty" | "success">("error")
  return <Stack gap="10"><Intro phase="Estados y navegación" title="Contexto, estados y decisiones coherentes">Patrones de página que evitan repetir encabezados, rutas, estados asíncronos y confirmaciones en cada sistema.</Intro>
    <Doc name="NPageHeader" purpose="Encabezado responsive con contexto, navegación y acciones." preview={<NPageHeader title="Transferencias" subtitle="Operación y conciliación" breadcrumbs={<NBreadcrumbs items={[{ id: "home", label: "Inicio", href: "#" }, { id: "current", label: "Transferencias", current: true }]} />} actions={<Button>Nueva</Button>} />} code={'<NPageHeader title="Transferencias" breadcrumbs={<NBreadcrumbs items={items} />} actions={<Button>Nueva</Button>} />'} />
    <Doc name="NBreadcrumbs" purpose="Ruta semántica que colapsa automáticamente niveles largos." preview={<NBreadcrumbs maxItems={3} items={[{ id: "1", label: "Inicio", href: "#" }, { id: "2", label: "Finanzas", href: "#" }, { id: "3", label: "Tesorería", href: "#" }, { id: "4", label: "Detalle", current: true }]} />} code={'<NBreadcrumbs maxItems={3} items={items} />'} />
    <Doc name="NAsyncState" purpose="Unifica carga, error, vacío y éxito sin ocultar la lógica del consumidor." preview={<Stack><NAsyncState status={status} error="No fue posible cargar" onRetry={() => setStatus("success")}>{status === "success" ? <Text>Información recuperada.</Text> : null}</NAsyncState><Button size="sm" onClick={() => setStatus("loading")}>Simular carga</Button></Stack>} code={'<NAsyncState status={status} onRetry={load}>{children}</NAsyncState>'} />
    <Doc name="NEmptyState" purpose="Vacío orientado a la siguiente acción del usuario." preview={<NEmptyState title="Sin movimientos" description="Registra el primer movimiento para comenzar." primaryAction={<Button>Registrar</Button>} />} code={'<NEmptyState title="Sin movimientos" primaryAction={<Button>Registrar</Button>} />'} />
    <Doc name="NConfirmDialog" purpose="Confirma operaciones síncronas o asíncronas y bloquea envíos duplicados." preview={<NConfirmDialog destructive trigger={<Button colorPalette="red">Eliminar registro</Button>} onConfirm={() => new Promise((resolve) => setTimeout(() => resolve(true), 500))}>Esta acción no se puede deshacer.</NConfirmDialog>} code={'<NConfirmDialog destructive trigger={<Button>Eliminar</Button>} onConfirm={remove}>...</NConfirmDialog>'} />
  </Stack>
}

function ServerTableDemo() {
  const [query, setQuery] = useState<NTableServerQuery>({ pageIndex: 0, pageSize: 5, sorting: [], search: "", filterColumn: "", filterValue: "" })
  return <NDataTable defaultActions={false} selectable={false} reorderableColumns={false} reorderableRows={false} exportOptions={false} server={{ rowCount: 42, query, onQueryChange: setQuery }} config={{ headers: [{ key: "name", header: "Cuenta" }, { key: "balance", header: "Saldo", type: "currency" }], data: [{ id: 1, name: query.search || "Cuenta operativa", balance: 18500 }] }} />
}
export function DataPatternsView() {
  const [panel, setPanel] = useState(false)
  const [filters, setFilters] = useState([{ id: "status", label: "Estado", value: "Activo" }])
  return <Stack gap="10"><Intro phase="Datos server-side" title="Exploración escalable de información">Contratos controlados para grandes volúmenes, filtros compuestos, rangos y detalle contextual.</Intro>
    <Doc name="NDataTable server-side" purpose="Delega consulta, orden y paginación sin descargar todo el conjunto." preview={<ServerTableDemo />} code={'<NDataTable server={{ rowCount, query, onQueryChange }} config={{ headers, data: currentPage }} />'} />
    <Doc name="NFilterBar" purpose="Compone cualquier control de filtro y visualiza criterios activos." preview={<NFilterBar filters={filters.map((filter) => ({ ...filter, onRemove: () => setFilters([]) }))} onClear={() => setFilters([])}><Field.Root maxW="xs"><Field.Label>Buscar</Field.Label><Input /></Field.Root></NFilterBar>} code={'<NFilterBar filters={active} onClear={clear}>{fields}</NFilterBar>'} />
    <Doc name="NDateRangePicker" purpose="Rango nativo, controlable y validado, sin acoplar una librería de fechas." preview={<NDateRangePicker defaultValue={{ start: "2026-09-01", end: "2026-09-30" }} />} code={'<NDateRangePicker value={range} onChange={setRange} />'} />
    <Doc name="NDescriptionList" purpose="Pares término/valor semánticos y responsive." preview={<NDescriptionList items={descriptions} columns={3} dividers />} code={'<NDescriptionList items={items} columns={3} dividers />'} />
    <Doc name="NDetailPanel" purpose="Especializa NPanel para inspeccionar registros sin perder el contexto." preview={<><Button onClick={() => setPanel(true)}>Abrir detalle</Button><NDetailPanel open={panel} onOpenChange={setPanel} title="Transferencia TR-2048" items={descriptions}><Text>Contenido adicional componible.</Text></NDetailPanel></>} code={'<NDetailPanel open={open} onOpenChange={setOpen} items={items} />'} />
  </Stack>
}

export function ActivityPatternsView() {
  const [notifications, setNotifications] = useState([{ id: "1", title: "Depósito conciliado", description: "Cuenta operativa", read: false }])
  return <Stack gap="10"><Intro phase="Actividad y archivos" title="Evidencia y comunicación operativa">Adjuntos, historial y alertas con interacciones verificables.</Intro>
    <Doc name="NFileUpload" purpose="Carga por selector o arrastre con límites, rechazo y lista removible." preview={<NFileUpload accept="image/*,.pdf" maxSize={5_000_000} />} code={'<NFileUpload accept="image/*,.pdf" maxSize={5_000_000} onFilesChange={setFiles} />'} />
    <Doc name="NActivityTimeline" purpose="Secuencia cronológica genérica para actividad, auditoría o estados." preview={<NActivityTimeline items={[{ id: "1", title: "Solicitud creada", timestamp: "09:20" }, { id: "2", title: "Aprobada", description: "Por María López", timestamp: "10:05" }]} />} code={'<NActivityTimeline items={activity} />'} />
    <Doc
      name="NNotificationCenter"
      purpose="Centro compacto con contador, lectura y selección controladas."
      preview={(
        <NNotificationCenter
          notifications={notifications}
          onMarkRead={(id) => setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item))}
          onMarkAllRead={() => setNotifications((current) => current.map((item) => ({ ...item, read: true })))}
        />
      )}
      code={'<NNotificationCenter notifications={items} onMarkRead={markRead} />'}
    />
  </Stack>
}

export function DashboardPatternsView() {
  return <Stack gap="10"><Intro phase="Dashboards" title="Indicadores y visualizaciones componibles">Una rejilla consistente, KPIs y un marco de gráficas que acepta cualquier motor mediante renderer.</Intro>
    <Doc name="NStatCard" purpose="KPI con tendencia, estado de carga, icono y acción opcional." preview={<NStatCard label="Ingresos" value="$128,450" trend={8.4} trendLabel="vs. periodo anterior" icon={<DollarSign size={18} />} />} code={'<NStatCard label="Ingresos" value="$128,450" trend={8.4} />'} />
    <Doc name="NDashboardGrid" purpose="Rejilla autoajustable con spans explícitos en escritorio." preview={<NDashboardGrid columns={3}><NStatCard label="Usuarios" value="1,240" icon={<Users size={18} />} /><NDashboardGridItem colSpan={2}><NStatCard label="Operaciones" value="8,932" /></NDashboardGridItem></NDashboardGrid>} code={'<NDashboardGrid columns={3}><NDashboardGridItem colSpan={2}>...</NDashboardGridItem></NDashboardGrid>'} />
    <Doc name="NChartFrame" purpose="Marco accesible con gráfica base, tabla para lector de pantalla y adaptador externo." preview={<NChartFrame title="Flujo semanal" data={[{ label: "Lun", value: 18 }, { label: "Mar", value: 32 }, { label: "Mié", value: 24 }, { label: "Jue", value: 45 }]} />} code={'<NChartFrame title="Flujo semanal" data={data} renderer={({ data }) => <MyChart data={data} />} />'} />
  </Stack>
}

export function SaasPatternsView() {
  const [allowed, setAllowed] = useState(false)
  return <Stack gap="10"><Intro phase="Administración SaaS" title="Suscripciones, soporte y trazabilidad">Patrones multi-tenant de presentación; la autorización definitiva sigue perteneciendo al servidor.</Intro>
    <Doc name="NSubscriptionGate" purpose="Presenta contenido o una ruta de upgrade sin sustituir la autorización backend." preview={<NSubscriptionGate allowed={allowed} feature="Reportes avanzados" onUpgrade={() => setAllowed(true)}><Text>Reporte desbloqueado.</Text></NSubscriptionGate>} code={'<NSubscriptionGate allowed={entitlements.reports} onUpgrade={openPlans}>...</NSubscriptionGate>'} />
    <Doc name="NPlanComparison" purpose="Matriz flexible para comparar capacidades y valores personalizados." preview={<NPlanComparison features={[{ id: "users", label: "Usuarios" }, { id: "audit", label: "Auditoría" }]} plans={[{ id: "basic", name: "Básico", price: "$199", features: { users: "5", audit: false } }, { id: "pro", name: "Pro", price: "$499", highlighted: true, features: { users: "Ilimitados", audit: true } }]} />} code={'<NPlanComparison plans={plans} features={features} />'} />
    <Doc name="NAuditLog" purpose="Registro inmutable de acciones con severidad y metadatos componibles." preview={<NAuditLog title="Cambios recientes" entries={[{ id: "1", action: "Cambió una cuenta bancaria", actor: "Soporte", target: "Organización Norte", timestamp: "Hace 4 min", severity: "warning" }]} />} code={'<NAuditLog entries={entries} />'} />
    <Doc name="NImpersonationBanner" purpose="Aviso persistente de soporte delegado con salida asíncrona protegida." preview={<Box><NImpersonationBanner sticky={false} subject="Organización Norte" actor="soporte@nissi.mx" onExit={() => Promise.resolve()} /></Box>} code={'<NImpersonationBanner subject={tenant.name} actor={agent.email} onExit={stopImpersonation} />'} />
  </Stack>
}

export function VerticalPatternsView() {
  const [columns, setColumns] = useState<NKanbanColumn[]>([{ id: "todo", title: "Por hacer", cards: [{ id: "c1", title: "Contactar cliente", description: "Seguimiento comercial" }] }, { id: "done", title: "Terminado", cards: [] }])
  return <Stack gap="10"><Intro phase="Patrones verticales" title="Bloques especializados sin contaminar el núcleo">Kanban, agenda y mapas conservan datos y proveedor bajo control de la aplicación.</Intro>
    <Doc name="NKanban" purpose="Tablero horizontal con DnD y alternativa accesible mediante botones." preview={<NKanban columns={columns} onMove={({ cardId, fromColumnId, toColumnId }) => setColumns((current) => { const card = current.find((column) => column.id === fromColumnId)?.cards.find((item) => item.id === cardId); return card ? current.map((column) => column.id === fromColumnId ? { ...column, cards: column.cards.filter((item) => item.id !== cardId) } : column.id === toColumnId ? { ...column, cards: [...column.cards, card] } : column) : current })} />} code={'<NKanban columns={columns} onMove={moveCard} />'} />
    <Doc name="NScheduler" purpose="Agenda responsive basada en fechas y eventos seleccionables." preview={<NScheduler startDate="2026-09-06" days={3} events={[{ id: "1", title: "Visita de campo", start: "2026-09-06T10:00:00", end: "2026-09-06T11:30:00", resource: "Equipo A" }]} />} code={'<NScheduler startDate={date} days={7} events={events} onEventSelect={openEvent} />'} />
    <Doc name="NMapView" purpose="Superficie y listado accesible desacoplados de Google Maps, Mapbox o Leaflet." preview={<NMapView markers={[{ id: "1", latitude: 19.4326, longitude: -99.1332, label: "Sede Centro", description: "3 órdenes activas" }]} renderer={() => <Stack height="full" align="center" justify="center"><Bell /><Text>Vista del proveedor cartográfico</Text></Stack>} />} code={'<NMapView markers={markers} renderer={({ markers, onSelect }) => <ProviderMap ... />} />'} />
  </Stack>
}
