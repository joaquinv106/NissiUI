# Nlayout y Nroutes

`Nroutes` es el router SPA progresivo de Nissi UI. Una aplicación pequeña puede conservar rutas planas; una aplicación empresarial puede agregar branches anidadas, permisos, guards, loaders cancelables, error boundaries y prefetch sin cambiar de router. `Nlayout` compone ese estado con `NAppShell`, `NSidebar`, `NHeader`, `NPageHeader`, breadcrumbs y tema.

## Inicio rápido

```tsx
import { Nlayout, type NlayoutRoute } from "nissi-ui/layout"

const routes: NlayoutRoute[] = [
  {
    id: "dashboard",
    path: "/",
    title: "Resumen",
    navigationId: "dashboard",
    element: <Dashboard />,
  },
  {
    id: "invoices",
    path: "/facturas",
    title: "Facturas",
    navigationId: "invoices",
    element: <Invoices />,
  },
]

const navigation = [
  { id: "dashboard", label: "Resumen", href: "/" },
  { id: "invoices", label: "Facturas", href: "/facturas" },
]

<Nlayout routes={routes} navigation={navigation} />
```

Las rutas planas, `path`, `match`, `navigate` y `createLinkProps` permanecen compatibles con la primera versión.

## Rutas anidadas y ranking

Los hijos usan paths relativos. `NOutlet` renderiza el siguiente nivel de la branch y funciona con cualquier profundidad.

```tsx
import { NOutlet, Nlayout, type NlayoutRoute } from "nissi-ui"

function BillingLayout() {
  return (
    <section>
      <BillingTabs />
      <NOutlet />
    </section>
  )
}

const routes: NlayoutRoute[] = [
  {
    id: "billing",
    path: "/facturas",
    title: "Facturación",
    element: <BillingLayout />,
    children: [
      { id: "invoice-list", path: "", title: "Facturas", element: <Invoices /> },
      { id: "invoice-new", path: "nueva", title: "Nueva factura", element: <NewInvoice /> },
      { id: "invoice-detail", path: ":folio", title: "Detalle", element: <InvoiceDetail /> },
      { id: "invoice-help", path: "*", title: "Ayuda", element: <BillingHelp /> },
    ],
  },
]
```

El árbol se compila y ordena independientemente del arreglo. La precedencia es ruta exacta sobre wildcard y, por segmento, estático sobre `:param` sobre `*`. En desarrollo se advierten ids duplicados y patrones hermanos indistinguibles.

## Location y search params

`useNLocation()` expone `pathname`, `search`, `searchParams`, `hash`, `state` y `key`. La URL completa se conserva en carga inicial, enlaces, navegación programática, back/forward y las estrategias `history`, `hash` y `memory`.

```tsx
import { useNLocation, useNSearchParams } from "nissi-ui/routes"

function InvoiceFilters() {
  const location = useNLocation()
  const [searchParams, setSearchParams] = useNSearchParams()

  return (
    <button
      onClick={() => setSearchParams(
        { estado: "pendiente", pagina: null },
        { mode: "merge", replace: true },
      )}
    >
      Filtrar {location.pathname}: {searchParams.get("estado")}
    </button>
  )
}
```

`mode="replace"` sustituye el query completo; `mode="merge"` conserva los demás parámetros. Un valor `null` o `undefined` elimina la clave.

## Permisos, guards y loaders

Las rutas reutilizan las capacidades de `NPermissionsProvider`. Esto protege enlaces directos además de ocultar navegación en `NSidebar` y `NHeader`; la autorización definitiva sigue perteneciendo al backend.

```tsx
import { redirect, type NRouteDefinition } from "nissi-ui/routes"

type AppContext = {
  session?: { userId: string }
  api: {
    getInvoice: (folio: string, options: { signal: AbortSignal }) => Promise<Invoice>
  }
}

const routes: NRouteDefinition<unknown, AppContext>[] = [{
  id: "invoice",
  path: "/facturas/:folio",
  title: ({ params }) => `Factura ${params.folio}`,
  requiredPermission: "facturacion:ver",
  beforeEnter: ({ context }) => context.session ? true : redirect("/login"),
  loader: ({ params, context, signal }) =>
    context.api.getInvoice(params.folio, { signal }),
  errorElement: (error) => <InvoiceError error={error} />,
  element: <InvoicePage />,
}]

<Nroutes routes={routes} context={appContext} />
```

Los guards se ejecutan de padre a hijo y pueden permitir, denegar o redirigir. Los loaders reciben `AbortSignal`; al comenzar una navegación nueva se cancela la anterior y una respuesta obsoleta nunca reemplaza la pantalla vigente. `route.data` continúa siendo metadata estática y `useNLoaderData()` entrega el resultado remoto.

Todos los guards requeridos terminan antes de iniciar datos. Después, los loaders independientes se ejecutan en paralelo; `dependsOn` declara únicamente los casos que necesitan resultados previos. Cada loader recibe en `loaderData` un snapshot de sus dependencias ya resueltas.

```tsx
{
  id: "invoice",
  dependsOn: ["tenant"],
  loader: ({ params, loaderData, signal }) =>
    api.getInvoice(loaderData.tenant, params.folio, { signal }),
}
```

Dependencias ausentes, sin loader, autorreferentes o cíclicas producen un error determinista y usan el boundary más cercano. Consulta el [lifecycle de navegación](./nroutes-navigation-lifecycle.md).

### Caché de loaders

Cada ruta puede declarar `cache` con modo `cache-first`, `network-first` o `stale-while-revalidate`, además de `staleTime`, `gcTime` y `tags`. El default reutiliza resultados fresh durante 30 segundos y los recolecta tras 5 minutos sin uso; `cache={false}` fuerza consulta en cada ejecución.

```tsx
{
  cache: {
    mode: "stale-while-revalidate",
    staleTime: 30_000,
    gcTime: 300_000,
    tags: ["invoices"],
  },
}
```

`useNroutes()` expone `invalidate`, `invalidateRoute`, `revalidate` y `clearCache`. La referencia y límites están en [Caché de rutas](./nroutes-cache.md).

Los errores de loader o render usan el `errorElement` más cercano de la branch. Si no existe, `errorFallback` resuelve el estado global sin desmontar el shell.

### Ejecución incremental

Nroutes compara la branch activa con la siguiente. Los segmentos compartidos se retienen y conservan su `loaderData`; sólo las rutas entrantes o afectadas vuelven a ejecutar guard/loader. Los params se evalúan por nivel, de modo que cambiar `:folio` no reprocesa padres que dependen únicamente de `:tenant`.

```tsx
{
  id: "invoice-list",
  path: "invoices",
  revalidate: "params",
  reloadOnSearch: ["page", "status"],
  loader: loadInvoices,
}
```

`revalidate` admite `"always"`, `"params"`, `"search"`, `"never"` o una función. Sin declaración, revalida por params propios y por las claves explícitas de `reloadOnSearch`; un cambio exclusivo de hash no ejecuta loaders. `createNRouteTransition(current, next)` permite inspeccionar `retained`, `entering`, `leaving` y los cambios detectados. Consulta [Arquitectura de Nroutes](./nroutes-architecture.md).

## NLink, hooks y prefetch

`NLink` es un `<a>` real: conserva clic medio, modificadores, `target`, `download`, enlaces externos y atributos accesibles. `prefetch="intent"` prepara `preload` y loaders al recibir foco o pointer, deduplicando la operación sin navegar.

Las rutas con `lazy: () => import(...)` cargan su módulo antes de `preload` y datos. El módulo puede aportar `Component`, loader, guard, boundary, pending, metadata y breadcrumb; matching y permisos permanecen eager. Consulta [Route modules y code splitting](./nroutes-route-modules.md).

```tsx
import { NLink } from "nissi-ui/routes"

<NLink to="/facturas/A-100?tab=pagos" prefetch="intent">
  Abrir factura
</NLink>
```

Hooks públicos:

- `useNroutes()` conserva el contexto completo compatible.
- `useNNavigate()` devuelve la función de navegación.
- `useNLocation()` devuelve la location completa.
- `useNRouteParams()` devuelve los params combinados de la branch.
- `useNSearchParams()` permite reemplazar, mezclar y eliminar query params.
- `useNNavigation()` devuelve `idle` o `loading`, locations de origen/destino y el branch diff durante trabajo asíncrono.
- `useNLoaderData(routeId?)` devuelve datos del loader activo.
- `useNRouteMatches()` devuelve toda la branch, incluidos datos por nivel.

`defineNroutes()` conserva los literales del árbol. `useNTypedNroutes(routes)` deriva ids y params obligatorios para `navigate`, `href`, `prefetch` y `createLinkProps`; la navegación tradicional por URL permanece disponible. Consulta [Routing tipado por id](./nroutes-typed-routing.md). `defineNlayoutConfig()` conserva literales al compartir la configuración del layout.

## Estrategias y routers externos

- `history` es el valor predeterminado. El servidor debe entregar la aplicación para rutas profundas; `basePath` permite un prefijo.
- `hash` sirve en hosting estático sin rewrites.
- `memory` no modifica la URL y sirve en previews, tests o componentes embebidos.
- `router`/`routeRouter` permite que Next.js u otro framework controle URL, navegación y prefetch.

Ejemplo de adaptador para Next.js App Router dentro de un Client Component:

```tsx
"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Nlayout } from "nissi-ui/layout"

export function AppFrame() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const location = `${pathname}?${searchParams.toString()}`

  return (
    <Nlayout
      routes={routes}
      navigation={navigation}
      routeRouter={{
        location,
        navigate: (to, options) => options?.replace ? router.replace(to) : router.push(to),
        createHref: (to) => to,
        prefetch: (to) => router.prefetch(to),
      }}
    />
  )
}
```

En Next.js, Next continúa siendo el único dueño del routing y React Server Components puede obtener datos en el servidor y pasar props serializables a componentes cliente de Nissi UI. No deben montarse dos routers que escriban History API simultáneamente.

## Integración con Nlayout

`navigationId` sincroniza la hoja activa con sidebar y header, incluso en rutas anidadas. Cuando `pageHeader.breadcrumbs` no se declara, `Nlayout` deriva las migas desde `breadcrumb` o `title`; el valor explícito siempre tiene prioridad y `pageHeader={false}` elimina el encabezado.

`routeProgress` muestra progreso global con delay anti-parpadeo. `scrollRestoration="top" | "restore"` controla scroll y `mobileSidebarTriggerInset` sustituye la reserva móvil predeterminada. Todas las animaciones respetan `prefers-reduced-motion`.

```tsx
<Nlayout
  routes={routes}
  navigation={navigation}
  routeProgress
  routeProgressDelay={160}
  scrollRestoration="restore"
  mobileSidebarTriggerInset="4.25rem"
/>
```

## Estados, accesibilidad y personalización

`NRouteOutlet` mueve el foco cuando el contenido final está listo, anuncia el título mediante `aria-live` y ofrece fallbacks de pending, not found, forbidden y error. Los textos pertenecen a `NroutesLabels` y tienen español predeterminado.

`Nroutes` y `NRouteOutlet` conservan `unstyled`, `classNames`, `styles` y partes `data-scope`/`data-part`. El progreso usa `role="progressbar"`; los errores y estados completos reciben foco programático.

## Muestra NFacture

`nfacture.html` carga una demostración independiente a pantalla completa con `strategy="hash"`, Nissi Dark, navegación fiscal, encabezados por ruta y `NFacture` sin un segundo sidebar:

```text
http://localhost:5173/nfacture.html#/facturacion/dashboard
```

Los datos e integraciones de la muestra son ficticios. Nissi UI coordina presentación y navegación cliente; autenticación, permisos definitivos, persistencia y reglas de negocio permanecen en la aplicación y su backend.
