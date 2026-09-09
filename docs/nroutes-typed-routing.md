# Routing tipado por id

Nroutes conserva la navegación por URL y añade un contrato opt-in por manifest. `defineNroutes()` preserva literales de `id`, `path` y `children`; `useNTypedNroutes(routes)` los conecta con el router activo.

```tsx
const routes = defineNroutes([
  {
    id: "tenant",
    path: "/tenants/:tenantId",
    title: "Tenant",
    element: <NOutlet />,
    children: [{
      id: "invoice-detail",
      path: "invoices/:folio",
      title: "Factura",
      element: <Invoice />,
    }],
  },
] as const)
```

## Navegación y href

```tsx
function InvoiceLink() {
  const router = useNTypedNroutes(routes)
  const target = {
    route: "invoice-detail",
    params: { tenantId: "acme", folio: "A-100" },
  } as const

  return <a {...router.createLinkProps(target)}>Abrir factura</a>
}
```

El mismo target funciona con:

```ts
router.navigate(target)
router.prefetch(target)
router.href(target)
```

TypeScript exige `tenantId` y `folio`, rechaza params desconocidos y limita `route` a ids del árbol. Las rutas hijas relativas heredan los params del padre; una ruta hija absoluta inicia su propio patrón.

## Search y hash

```ts
router.navigate({
  route: "invoice-detail",
  params: { tenantId: "acme", folio: "A-100" },
  search: { tab: "payments", page: 2 },
  hash: "totals",
})
```

Los params de path se codifican con `encodeURIComponent`. Si la ruta declara un schema, Search valida y serializa sus claves/valores; `string` y `URLSearchParams` siguen disponibles. El hash no forma parte de la clave de loader/cache. Consulta [Search params tipados](./nroutes-search.md).

## Compatibilidad progresiva

Las tres formas pueden coexistir:

```ts
router.navigate("/invoices/A-100")
router.navigate({ pathname: "/invoices/A-100", search: { tab: "payments" } })
router.navigate({ route: "invoice-detail", params: { folio: "A-100" } })
```

`useNroutes()` mantiene su API general cuando una aplicación genera rutas dinámicamente o no desea enlazar el tipo al manifest. Usa `useNTypedNroutes(routes)` en módulos que comparten una declaración `as const`.

## Validación runtime

`resolveNRouteTarget(routes, target)` también es público para adapters o generación de enlaces fuera de React. Lanza un error claro si el id o un param requerido no existe; esto protege datos dinámicos que el compilador no pudo verificar.
