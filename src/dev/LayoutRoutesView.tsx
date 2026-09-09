import { Box, Button, Card, HStack, Stack, Text } from "@chakra-ui/react"
import { FileText, LayoutDashboard, MoveUpRight } from "lucide-react"

import {
  NLink,
  NOutlet,
  NRouteOutlet,
  NTable,
  Nlayout,
  Nroutes,
  compileRouteBranches,
  createNRouteTransition,
  matchRoutes,
  parseRouteLocation,
  type NlayoutRoute,
} from "../index"
import { ComponentDocs } from "./ComponentDocs"

const previewRoutes: NlayoutRoute[] = [
  {
    id: "preview-home",
    path: "/",
    title: "Resumen",
    navigationId: "preview-home",
    pageHeader: { subtitle: "Indicadores esenciales del espacio." },
    element: <Card.Root variant="subtle"><Card.Body><Text>Contenido del resumen</Text></Card.Body></Card.Root>,
  },
  {
    id: "preview-documents",
    path: "/documentos",
    title: "Documentos",
    navigationId: "preview-documents",
    pageHeader: { subtitle: "Consulta centralizada de documentos." },
    element: <Card.Root variant="subtle"><Card.Body><Text>Contenido de documentos</Text></Card.Body></Card.Root>,
  },
]

const previewNavigation = [
  { id: "preview-home", label: "Resumen", href: "/", icon: <LayoutDashboard size={17} /> },
  { id: "preview-documents", label: "Documentos", href: "/documentos", icon: <FileText size={17} /> },
]

function RoutesOnlyControls() {
  return (
    <Stack gap="4">
      <HStack>
        <Button asChild size="sm" variant="outline"><NLink to="/resumen">Resumen</NLink></Button>
        <Button asChild size="sm" variant="outline"><NLink to="/actividad" prefetch="intent">Actividad</NLink></Button>
      </HStack>
      <NRouteOutlet />
    </Stack>
  )
}

function NestedReports() {
  return <Stack gap="3"><Text fontWeight="semibold">Centro de reportes</Text><NOutlet /></Stack>
}

function TransitionDiffPreview() {
  const routes: NlayoutRoute[] = [{
    id: "tenant",
    path: "/tenant/:tenant",
    title: "Tenant",
    element: <NOutlet />,
    children: [{
      id: "treasury",
      path: "treasury",
      title: "Tesorería",
      element: <NOutlet />,
      children: [{ id: "invoice", path: "invoices/:folio", title: "Factura", element: null }],
    }],
  }]
  const compiled = compileRouteBranches(routes)
  const current = matchRoutes(compiled, parseRouteLocation("/tenant/acme/treasury/invoices/A1"))!
  const next = matchRoutes(compiled, parseRouteLocation("/tenant/acme/treasury/invoices/A2"))!
  const transition = createNRouteTransition(current, next)
  const data = transition.retained.map(({ next: entry, changedParams, shouldReload }) => ({
    id: entry.route.id,
    segment: entry.route.title as string,
    state: "Retenido",
    changes: changedParams.join(", ") || "Ninguno",
    reload: shouldReload ? "Sí" : "No",
  }))

  return (
    <Stack gap="3">
      <Text fontSize="sm" color="fg.muted">
        De A1 a A2, tenant y tesorería conservan su trabajo; sólo el loader dependiente de `folio` se revalida.
      </Text>
      <NTable
        card={false}
        responsive="stack"
        getRowId={(row) => row.id as string}
        config={{
          headers: [
            { key: "segment", header: "Segmento" },
            { key: "state", header: "Estado", presentation: "badge" },
            { key: "changes", header: "Params modificados" },
            { key: "reload", header: "Revalidar" },
          ],
          data,
        }}
      />
    </Stack>
  )
}

function LoaderSchedulerPreview() {
  const data = [
    { id: "tenant", loader: "tenant", dependency: "—", wave: "1 · paralelo" },
    { id: "permissions", loader: "permissions", dependency: "—", wave: "1 · paralelo" },
    { id: "invoice", loader: "invoice", dependency: "tenant", wave: "2 · dependiente" },
  ]
  return (
    <Stack gap="3">
      <Text fontSize="sm" color="fg.muted">
        Las dependencias forman ondas deterministas. Dentro de cada onda, los loaders comienzan juntos.
      </Text>
      <NTable
        card={false}
        responsive="stack"
        getRowId={(row) => row.id as string}
        config={{
          headers: [
            { key: "loader", header: "Loader" },
            { key: "dependency", header: "Depende de" },
            { key: "wave", header: "Ejecución", presentation: "badge" },
          ],
          data,
        }}
      />
    </Stack>
  )
}

function RouteCachePreview() {
  const data = [
    { id: "cache-first", mode: "cache-first", fresh: "Caché", stale: "Red" },
    { id: "network-first", mode: "network-first", fresh: "Red", stale: "Red + fallback" },
    { id: "swr", mode: "stale-while-revalidate", fresh: "Caché", stale: "Caché + background" },
  ]
  return (
    <Stack gap="3">
      <Text fontSize="sm" color="fg.muted">
        El caché pertenece a cada router: acelera loaders y prefetch sin asumir el modelo de datos de la aplicación.
      </Text>
      <NTable
        card={false}
        responsive="stack"
        getRowId={(row) => row.id as string}
        config={{
          headers: [
            { key: "mode", header: "Política", presentation: "badge" },
            { key: "fresh", header: "Dato fresh" },
            { key: "stale", header: "Dato stale" },
          ],
          data,
        }}
      />
    </Stack>
  )
}

function RouteModulesPreview() {
  const data = [
    { id: "manifest", stage: "Manifest eager", content: "id · path · title · permisos" },
    { id: "chunk", stage: "Import lazy", content: "Component · boundary · lifecycle" },
    { id: "data", stage: "Datos", content: "preload → scheduler → cache" },
  ]
  return (
    <Stack gap="3">
      <Text fontSize="sm" color="fg.muted">Código y datos tienen ciclos separados, deduplicados y reintentables.</Text>
      <NTable
        card={false}
        responsive="stack"
        getRowId={(row) => row.id as string}
        config={{ headers: [
          { key: "stage", header: "Etapa", presentation: "badge" },
          { key: "content", header: "Responsabilidad" },
        ], data }}
      />
    </Stack>
  )
}

function TypedRoutesPreview() {
  const data = [
    { id: "route", check: "route", inferred: '"invoice-detail"' },
    { id: "parent", check: "param heredado", inferred: "tenantId" },
    { id: "leaf", check: "param de hoja", inferred: "folio" },
  ]
  return <Stack gap="3">
    <Text fontSize="sm" color="fg.muted">Un solo manifest genera autocomplete y valida enlaces, navegación y prefetch.</Text>
    <NTable card={false} responsive="stack" getRowId={(row) => row.id as string} config={{ headers: [
      { key: "check", header: "Contrato" },
      { key: "inferred", header: "Inferido", presentation: "badge" },
    ], data }} />
  </Stack>
}

export function LayoutRoutesView() {
  return (
    <Stack gap="8">
      <Stack gap="2" maxW="3xl">
        <Text color="colorPalette.fg" fontWeight="semibold" fontSize="sm" letterSpacing="wide" textTransform="uppercase">Arquitectura de aplicación</Text>
        <Text as="h1" fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" lineHeight="shorter">Nlayout + Nroutes</Text>
        <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }}>Una composición lista para producto que conserva navegación, contexto y tema mientras cada ruta cambia sin recargar la página.</Text>
      </Stack>

      <Card.Root variant="outline" bg="bg.panel">
        <Card.Body gap="4">
          <Text fontWeight="semibold">Ejemplo completo: NFacture</Text>
          <Text color="fg.muted">Abre la aplicación independiente para revisar el sidebar, header, breadcrumbs, selector de tema y todas las rutas fiscales a escala real.</Text>
          <Button asChild alignSelf="start" colorPalette="blue">
            <a href="/nfacture.html" target="_blank" rel="noreferrer">Abrir demostración completa <MoveUpRight aria-hidden="true" size={17} /></a>
          </Button>
        </Card.Body>
      </Card.Root>

      <ComponentDocs
        purpose="Nlayout integra shell, navegación, encabezados, breadcrumbs y tema. Nroutes aporta location completa, rutas anidadas, permisos, guards, loaders cancelables y adaptadores para routers externos sin abandonar la API plana."
        steps={[
          "Declara rutas estables; agrega children y NOutlet cuando la interfaz tenga niveles.",
          "Usa loaders y guards con AbortSignal, permisos declarativos y boundaries por ruta.",
          "NLink conserva el enlace nativo y puede precargar por intención; los hooks exponen location, params, search y loader data.",
          "Usa history, hash o memory, o entrega routeRouter para que Next.js u otro framework controle la URL.",
        ]}
        variants={[
          { name: "Nlayout", description: "Composición completa con navegación, encabezados, tema y outlet." },
          { name: "Nroutes", description: "Administrador desacoplado para aplicaciones con un layout propio." },
          { name: "Nested", description: "Branches jerárquicas con ranking y outlets multinivel." },
          { name: "Branch diff", description: "Retiene padres compartidos y revalida únicamente segmentos afectados." },
          { name: "Scheduler", description: "Paraleliza loaders independientes y ordena sólo dependencias declaradas." },
          { name: "NRouteCache", description: "Deduplica loaders y aplica fresh/stale, GC, prefetch e invalidación acotada a rutas." },
          { name: "Route modules", description: "Importa UI y lifecycle por ruta con deduplicación, pending, retry y prefetch explícito." },
          { name: "Typed routing", description: "Infiere ids y params anidados para navigate, href y prefetch sin retirar URLs libres." },
          { name: "history | hash | memory", description: "Estrategias para servidor, hosting estático y entornos contenidos." },
        ]}
        variantExamples={[
          {
            id: "layout",
            label: "Layout completo",
            summary: "Nlayout + memory",
            preview: (
              <Box borderWidth="1px" borderColor="border" rounded="xl" overflow="hidden">
                <Nlayout
                  provideTheme={false}
                  routes={previewRoutes}
                  navigation={previewNavigation}
                  routeStrategy="memory"
                  shellProps={{ minHeight: "26rem", contentPadding: "compact" }}
                  sidebarProps={{ collapsible: false, showMobileTrigger: false, expandedWidth: "12rem" }}
                  headerProps={{ showThemeToggle: true }}
                />
              </Box>
            ),
            code: `<Nlayout\n  routes={routes}\n  navigation={navigation}\n  routeStrategy="history"\n/>`,
          },
          {
            id: "routes",
            label: "Router aislado",
            summary: "Nroutes + NRouteOutlet",
            preview: (
              <Nroutes
                strategy="memory"
                defaultPath="/resumen"
                routes={[
                  { id: "summary", path: "/resumen", title: "Resumen", element: <Text>Vista de resumen</Text> },
                  { id: "activity", path: "/actividad", title: "Actividad", element: <Text>Vista de actividad</Text> },
                ]}
              >
                <RoutesOnlyControls />
              </Nroutes>
            ),
            code: `<Nroutes routes={routes}>\n  <Navigation />\n  <NRouteOutlet />\n</Nroutes>`,
          },
          {
            id: "nested",
            label: "Rutas anidadas",
            summary: "NOutlet multinivel",
            preview: (
              <Nroutes
                strategy="memory"
                defaultPath="/reportes/ventas"
                routes={[{
                  id: "reports",
                  path: "/reportes",
                  title: "Reportes",
                  element: <NestedReports />,
                  children: [{ id: "sales", path: "ventas", title: "Ventas", element: <Text color="fg.muted">Reporte de ventas activo</Text> }],
                }]}
              />
            ),
            code: `{
  path: "/reportes",
  element: <ReportsLayout />,
  children: [{ path: "ventas", element: <SalesReport /> }],
}

function ReportsLayout() {
  return <NOutlet />
}`,
          },
          {
            id: "branch-diff",
            label: "Diff incremental",
            summary: "A1 → A2 · sólo folio cambia",
            preview: <TransitionDiffPreview />,
            code: `const transition = createNRouteTransition(current, next)

transition.retained
transition.entering
transition.leaving

// En la ruta:
{ revalidate: "params", reloadOnSearch: ["page"] }`,
          },
          {
            id: "scheduler",
            label: "Loaders paralelos",
            summary: "Promise.allSettled por ondas",
            preview: <LoaderSchedulerPreview />,
            code: `{
  id: "invoice",
  loader: loadInvoice,
  dependsOn: ["tenant"],
}

// Sin dependsOn, los loaders autorizados
// de la transición se ejecutan en paralelo.`,
          },
          {
            id: "route-cache",
            label: "Caché de rutas",
            summary: "cache-first · network-first · SWR",
            preview: <RouteCachePreview />,
            code: `{
  id: "invoice",
  cache: {
    mode: "stale-while-revalidate",
    staleTime: 30_000,
    gcTime: 300_000,
    tags: ["invoices"],
  },
}

router.invalidate({ tags: ["invoices"] })
router.revalidate()`,
          },
          {
            id: "route-modules",
            label: "Módulos lazy",
            summary: "Código → preload → loader",
            preview: <RouteModulesPreview />,
            code: `{
  id: "treasury",
  path: "/treasury",
  title: "Tesorería",
  requiredPermission: "treasury:view",
  pendingElement: <RouteSkeleton />,
  lazy: () => import("./treasury.route"),
}

// treasury.route.tsx
export const Component = Treasury
export const loader = loadTreasury`,
          },
          {
            id: "typed-routing",
            label: "Routing tipado",
            summary: "ids + params + children",
            preview: <TypedRoutesPreview />,
            code: `const routes = defineNroutes([{
  id: "invoice-detail",
  path: "/invoices/:folio",
  title: "Factura",
  element: <Invoice />,
}] as const)

const router = useNTypedNroutes(routes)
router.navigate({
  route: "invoice-detail",
  params: { folio: "A-100" },
})`,
          },
        ]}
        propExamples={[
          { label: "Ruta con parámetros", code: `{ id: "invoice", path: "/facturas/:folio", title: "Factura", element: ({ params }) => <Invoice folio={params.folio} /> }` },
          { label: "Loader cancelable", code: `loader: ({ params, context, signal }) => context.api.getInvoice(params.folio, { signal })` },
          { label: "Revalidación incremental", code: `{ revalidate: "params", reloadOnSearch: ["page", "status"] }` },
          { label: "Dependencia explícita", code: `{ id: "invoice", dependsOn: ["tenant"], loader: ({ loaderData }) => loadInvoice(loaderData.tenant) }` },
          { label: "Caché e invalidación", code: `{ cache: { mode: "cache-first", staleTime: 30_000, tags: ["invoices"] } }\nrouter.invalidateRoute("invoice")` },
          { label: "Retry de chunk", code: `router.retryRouteModule("treasury")` },
          { label: "Permiso y guard", code: `{ requiredPermission: "facturacion:ver", beforeEnter: ({ context }) => context.session ? true : redirect("/login") }` },
          { label: "Router de Next.js", code: `<Nlayout routeRouter={{ location: pathname, navigate: (to) => router.push(to) }} />` },
          { label: "Provider existente", code: `<NThemeProvider>\n  <Nlayout provideTheme={false} routes={routes} navigation={items} />\n</NThemeProvider>` },
        ]}
        code={`import { Nlayout, type NlayoutRoute } from "nissi-ui/layout"\n\nconst routes: NlayoutRoute[] = [\n  { id: "home", path: "/", title: "Resumen", navigationId: "home", element: <Dashboard /> },\n]\n\n<Nlayout routes={routes} navigation={items} />`}
      />
    </Stack>
  )
}
