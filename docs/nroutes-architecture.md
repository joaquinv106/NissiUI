# Arquitectura de Nroutes

Esta guía describe la arquitectura implementada del router. El plan y el estado de cada fase viven en [Nroutes v3](./nroutes-v3-plan.md).

## Del target a la vista

```text
string u objeto NRouteTarget
  → resolveRouteTarget()
  → NRouteLocation
  → matchRoutes()
  → NRouteMatch con branch
  → createNRouteTransition()
  → permisos
  → guards afectados padre→hijo
  → scheduler de loaders por ondas
  → commit protegido por generación y AbortSignal
  → NRouteOutlet / NOutlet
```

`location.ts` no depende de React y conserva pathname, search, hash, state y key. `matcher.ts` compila el árbol, ordena branches por especificidad y genera params por nivel. `core/transition.ts` compara el match activo con el siguiente sin ejecutar efectos.

## Branch diff

Una ruta se considera retenida cuando ocupa la misma posición jerárquica y conserva el mismo `route.id`. Los params se comparan en el nivel donde fueron declarados; por eso cambiar `:folio` no invalida un padre que sólo declaró `:tenant`.

```text
/tenant/acme/treasury/invoices/A1
/tenant/acme/treasury/invoices/A2

tenant    retained · no reload
treasury  retained · no reload
invoice   retained · folio changed · reload
```

`NRouteTransition` expone:

- `from` y `to`;
- `retained`, en orden padre→hijo;
- `entering`, en orden padre→hijo;
- `leaving`, en orden hijo→padre;
- cambios de pathname, claves de search y hash.

Puede inspeccionarse sin montar React:

```ts
import {
  compileRouteBranches,
  createNRouteTransition,
  matchRoutes,
  parseRouteLocation,
} from "nissi-ui/routes"

const compiled = compileRouteBranches(routes)
const current = matchRoutes(compiled, parseRouteLocation("/invoices/A1"))!
const next = matchRoutes(compiled, parseRouteLocation("/invoices/A2"))!
const transition = createNRouteTransition(current, next)
```

## Revalidación de segmentos retenidos

`revalidate` controla guards y loaders de una ruta que permanece en la branch:

| Valor | Comportamiento |
| --- | --- |
| Omitido | Revalida por params propios o por claves de `reloadOnSearch` |
| `"params"` | Revalida cuando cambia un param declarado en ese nivel |
| `"search"` | Revalida por cualquier search param o sólo `reloadOnSearch` |
| `"always"` | Revalida en toda transición de la misma ruta |
| `"never"` | No revalida mientras la ruta esté retenida |
| Función | El consumidor decide con locations y cambios detallados |

Las rutas entrantes siempre ejecutan su trabajo. Un cambio exclusivo de hash no revalida por defecto.

```ts
{
  id: "invoice-list",
  path: "/invoices",
  revalidate: "params",
  reloadOnSearch: ["page", "status"],
  loader: loadInvoices,
}
```

## Preservación de loader data

Cuando un segmento retenido no necesita revalidarse, su `loaderData` se copia al match siguiente. Así, una navegación entre hijos no pierde datos de tenant, permisos o configuración ya resueltos.

La preservación inmediata se complementa con `NRouteCache`: sus claves usan route id, params por nivel y search declarado, nunca hash. Las políticas `staleTime`, SWR, GC e invalidación están documentadas en [Caché de rutas](./nroutes-cache.md).

El schema `search` es opt-in e independiente de la política de datos: sus codecs transforman valores de URL para hooks y targets tipados; `reloadOnSearch` declara por separado qué claves revalidan la ruta. Esta separación evita que un filtro puramente visual ejecute loaders. Consulta [Search params tipados](./nroutes-search.md).

## Scheduler de loaders

`data/scheduler.ts` recibe exclusivamente los loaders afectados por el branch diff. Ejecuta en paralelo los que no tienen dependencias pendientes y avanza por ondas según `dependsOn`. El grafo se valida antes de ejecutar; una dependencia inexistente o circular falla explícitamente. La guía completa está en [Lifecycle de navegación](./nroutes-navigation-lifecycle.md).

## Caché de loaders

`data/cache.ts` es independiente del componente React y mantiene resultados por instancia de router. `cache-first`, `network-first` y `stale-while-revalidate` comparten deduplicación y aborto por consumidores; invalidar por route id o tag aborta el trabajo afectado. La API no normaliza entidades ni mantiene estado global.

## Route modules

`modules.tsx` mantiene un registro de imports lazy independiente del caché de datos. El manifest eager conserva matching y permisos; los imports necesarios se ejecutan en paralelo antes de guards/loaders. Los fallos no quedan memorizados y `retryRouteModule()` reinicia la branch. Consulta [Route modules y code splitting](./nroutes-route-modules.md).

## Targets tipados

`defineNroutes()` conserva los literales del árbol y `useNTypedNroutes(routes)` deriva la unión de ids y params, incluidos los heredados de padres relativos. `resolveNRouteTarget()` convierte el contrato por id al pathname que consume el pipeline existente, por lo que no existe un segundo matcher. Consulta [Routing tipado por id](./nroutes-typed-routing.md).

## Seguridad y concurrencia

Los permisos de toda la branch se verifican antes de ejecutar guards/loaders. `requiredPermission` controla interfaz y navegación, no sustituye autorización backend. Cada loader/guard conserva `AbortSignal` y el commit sigue protegido por una generación monotónica: una navegación obsoleta nunca reemplaza una más reciente.

## Compatibilidad

Las rutas planas y la API histórica no cambian:

```tsx
const routes: NRouteDefinition[] = [
  { id: "home", path: "/", title: "Inicio", element: <Home /> },
]

<Nroutes routes={routes} />
```

`useNroutes()` conserva `path`, `match`, `navigate` y `createLinkProps`. La información incremental se agrega en `navigation.transition` durante una navegación con trabajo asíncrono.
