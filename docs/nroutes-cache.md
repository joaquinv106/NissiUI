# Caché de rutas de Nroutes

`NRouteCache` conserva exclusivamente resultados de loaders durante el lifecycle de navegación. Deduplica solicitudes, acelera prefetch y revisitas y permite invalidar datos relacionados; no normaliza entidades ni reemplaza TanStack Query u otro caché de negocio.

## Configuración por ruta

```tsx
const routes = defineNroutes([
  {
    id: "invoice-detail",
    path: "/invoices/:folio",
    title: "Factura",
    element: <Invoice />,
    loader: ({ params, signal }) => api.invoice(params.folio, { signal }),
    cache: {
      mode: "stale-while-revalidate",
      staleTime: 30_000,
      gcTime: 300_000,
      tags: ["invoices"],
    },
  },
])
```

Sin configuración se usa `cache-first`, 30 segundos fresh y 5 minutos de retención. `cache={false}` omite el caché para loaders que siempre deben consultar su origen.

## Modos

| Modo | Fresh | Stale | Fallo de red |
| --- | --- | --- | --- |
| `cache-first` | entrega caché | espera red | propaga error |
| `network-first` | intenta red | intenta red | entrega el último valor disponible |
| `stale-while-revalidate` | entrega caché | entrega caché y actualiza en background | conserva el valor disponible |

Las llamadas concurrentes con la misma clave comparten una sola ejecución. Cada consumidor conserva su propio aborto; el trabajo común sólo se cancela cuando ya no queda ningún consumidor.

## Clave estable

`createNRouteCacheKey()` combina:

- `route.id`;
- params acumulados del nivel;
- search params declarados en `reloadOnSearch`, o todo search para `revalidate="search"`.

El hash nunca participa. Cambiar un parámetro no relacionado tampoco invalida una ruta padre cuya clave no lo contiene.

## Invalidación desde el router

```tsx
function InvoiceActions() {
  const router = useNroutes()

  async function save() {
    await api.saveInvoice()
    router.invalidate({ tags: ["invoices"] })
    router.revalidate()
  }

  return <button onClick={save}>Guardar</button>
}
```

- `invalidate({ tags, routeIds })` elimina las entradas coincidentes.
- `invalidateRoute(id)` elimina todas las variantes de params/search de una ruta.
- `revalidate()` invalida y vuelve a resolver la branch activa.
- `clearCache()` vacía resultados y prefetch internos.

La invalidación aborta solicitudes pendientes afectadas. Invalidar no navega ni vuelve a renderizar por sí solo; usa `revalidate()` cuando la pantalla activa debe consultar inmediatamente.

## Prefetch

`<NLink prefetch="intent">` carga primero el recurso de código declarado con `preload` y después los loaders. Al navegar se reutilizan los resultados fresh con la misma clave.

## SWR y UI

Cuando un loader `stale-while-revalidate` entrega un dato stale, la ruta se muestra inmediatamente. Si la revalidación en background termina y la misma clave sigue activa, Nroutes actualiza `loaderData` sin reemplazar el shell ni la branch. Un resultado de otra ruta o params ya abandonados se descarta para la vista, aunque puede quedar disponible en caché.

## Límites

- El caché vive dentro de cada instancia de `Nroutes`; no es global.
- No persiste en storage ni cruza recargas del documento.
- No fusiona respuestas ni conoce entidades.
- Autorización, tenant y permisos siguen validándose en backend. Al cambiar sesión o tenant, invalida las tags/rutas afectadas o usa `clearCache()`.
