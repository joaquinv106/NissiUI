# Route modules y code splitting

Nroutes permite separar el código de una ruta con un import dinámico explícito. El matcher conserva eager únicamente lo necesario para descubrir y proteger la ruta; UI y lifecycle pueden vivir en el chunk.

## Definición

```tsx
const routes = defineNroutes([
  {
    id: "treasury",
    path: "/treasury",
    title: "Tesorería",
    requiredPermission: "treasury:view",
    pendingElement: <RouteSkeleton />,
    lazy: () => import("./routes/treasury.route"),
  },
])
```

`id`, `path`, `title`, `requiredPermission`, `permissionMode` y `children` permanecen en el manifest eager. Así se puede hacer matching y rechazar deep links sin descargar código protegido.

## Contrato del módulo

```tsx
export function Component() {
  const data = useNLoaderData<TreasuryData>()
  return <TreasuryDashboard data={data} />
}

export async function loader({ context, signal }: NRouteTransitionContext<AppContext>) {
  return context.api.treasury({ signal })
}

export function ErrorBoundary({ error }: { error: unknown }) {
  return <TreasuryError error={error} />
}

export const pendingElement = <TreasurySkeleton />
export const data = { area: "finance" }
```

Un `NRouteModule` puede exportar `Component`, `loader`, `beforeEnter`, `ErrorBoundary`, `pendingElement`, `data`, `breadcrumb` y `preload`. `Component` se renderiza sin props y usa los hooks de rutas. La seguridad del manifest no puede diferirse al módulo.

## Orden de carga

```text
match eager
  → permisos eager
  → imports lazy requeridos en paralelo
  → preload de metadata/recurso opcional durante prefetch
  → guards
  → scheduler/cache de loaders
  → commit
```

`NRouteModuleRegistry` deduplica imports por `route.id` dentro de cada instancia de router. Un import dinámico no se puede cancelar en el navegador; abortar una navegación deja terminar y cachear el chunk, pero impide que esa navegación haga commit.

## Prefetch

`<NLink prefetch="intent">` carga expresamente el route module antes de ejecutar `preload` y loaders. Navegar después reutiliza el código y los datos fresh; Nroutes no intenta inspeccionar ni precargar mágicamente un `React.lazy()`.

## Errores y retry

Un fallo de import no se memoriza: el siguiente intento vuelve a ejecutar `lazy`. El error usa el boundary eager más cercano. Desde la UI se puede forzar el retry de la branch:

```tsx
function ChunkError() {
  const router = useNroutes()
  return <button onClick={() => router.retryRouteModule("treasury")}>Reintentar</button>
}
```

`retryRouteModule()` sin id vacía todo el registro lazy de esa instancia. El loader cache es independiente; usa sus APIs de invalidación cuando también deban renovarse datos.

## SSR y tree shaking

Los imports sólo comienzan durante una navegación o prefetch, nunca al declarar/compilar rutas. El render de servidor puede emitir el `pendingElement` eager sin ejecutar el chunk. Cada llamada `import()` conserva un límite de code splitting visible para el bundler; evita barrels que importen anticipadamente el módulo lazy.
