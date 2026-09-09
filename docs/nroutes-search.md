# Search params tipados

Nroutes permite decodificar query params de forma opcional y sin Zod ni otra dependencia. `URLSearchParams`, `useNSearchParams()` y los targets por URL permanecen disponibles sin cambios.

## Schema y lectura

```tsx
import {
  createNRouteSearchHook,
  defineNRouteSearch,
  defineNroutes,
  enumParam,
  numberParam,
  stringParam,
} from "nissi-ui/routes"

const invoiceSearch = defineNRouteSearch({
  page: numberParam().default(1),
  status: enumParam(["all", "pending", "paid"] as const).default("all"),
  query: stringParam(),
})

const useInvoiceSearch = createNRouteSearchHook(invoiceSearch)

const routes = defineNroutes([{
  id: "invoices",
  path: "/invoices",
  title: "Facturas",
  search: invoiceSearch,
  reloadOnSearch: ["page", "status"],
  element: <Invoices />,
}] as const)

function Invoices() {
  const search = useInvoiceSearch()
  // page: number; status: "all" | "pending" | "paid"; query: string | undefined
  return <InvoiceTable page={search.page} status={search.status} />
}
```

`useNRouteSearch()` sin argumentos lee el schema de la ruta hoja activa. Para conservar inferencia exacta sin code generation, `createNRouteSearchHook(schema)` crea un hook sin argumentos ligado al schema. También puede usarse `useNRouteSearch(schema)` directamente.

## Codecs incluidos

- `stringParam()` conserva el primer valor o entrega `undefined`.
- `numberParam()` acepta números finitos; un valor vacío o inválido entrega `undefined`.
- `booleanParam()` reconoce `true`, `false`, `1` y `0`.
- `enumParam(values)` limita el resultado a los literales declarados.
- `.default(value)` sustituye exclusivamente valores ausentes o inválidos que el codec represente como `undefined`.

Un codec propio sólo implementa `parse(values)` y `serialize(value)`:

```ts
const dateParam = createNRouteSearchCodec<Date | undefined>({
  parse: ([value]) => value ? new Date(`${value}T00:00:00Z`) : undefined,
  serialize: (value) => value?.toISOString().slice(0, 10),
})
```

`parseNRouteSearch()` y `serializeNRouteSearch()` permiten usar el mismo contrato fuera de React. `defaultNRouteSearchParam(codec, value)` agrega default a codecs propios.

## Navegación tipada

Cuando el manifest usa `defineNroutes()`, el objeto `search` de un target por route id acepta exclusivamente las claves y valores del schema:

```ts
router.navigate({
  route: "invoices",
  search: { page: 2, status: "pending" },
})
```

También se admiten `string` y `URLSearchParams` para migración gradual, adapters o parámetros externos no modelados.

## Dependencias selectivas

`reloadOnSearch` declara qué claves afectan al guard/loader de esa ruta. Cambiar `view=grid` no recarga el ejemplo anterior; cambiar `page` o `status` sí. Las claves de caché usan la misma selección y nunca incluyen el hash.

Un schema no implica dependencia automática: permite leer y escribir tipos, mientras `reloadOnSearch` expresa el costo de datos. En desarrollo se advierte si una dependencia declarada no existe en el schema.

## Límites

Los codecs procesan la URL del cliente; no sustituyen validación, autorización ni normalización en backend. No crean un caché de queries y no cambian la propiedad de la URL cuando se usa `NRouterAdapter` con Next.js u otro framework.
