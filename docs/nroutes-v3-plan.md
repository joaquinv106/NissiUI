# Nroutes v3 — auditoría y plan de implementación

> Estado: **auditoría y fases 1–7 completadas; fases 8–22 pendientes**.
>
> Este documento es la fuente canónica de Nroutes v3. Describe exclusivamente el estado comprobado del repositorio y separa las capacidades vigentes de las propuestas.

## Objetivo

Evolucionar `Nroutes` hacia un router SPA empresarial explícito, incremental, observable y rápido, sin reemplazarlo con React Router, TanStack Router, Next Router ni una dependencia equivalente. La API plana actual debe seguir funcionando y las capacidades nuevas se incorporarán progresivamente.

Nroutes seguirá siendo un router cliente. Next.js u otro framework puede conservar la propiedad de la URL mediante `NRouterAdapter`; Nroutes v3 no pretende convertirse en un framework SSR ni en un router de React Server Components.

## Línea base validada

Auditoría realizada sobre `main` en el commit `255d9b0` con Node `v24.15.0` en `win32-x64`.

| Validación | Resultado base |
| --- | --- |
| `npm run typecheck` | Aprobada |
| `npm test` | 45 archivos, 293 pruebas aprobadas |
| `npm run build` | ESM, CommonJS y declaraciones aprobados |
| `npm run check:package` | ESM, CommonJS, NodeNext/Bundler, SSR y tree shaking aprobados |
| `npm run pack:check` | 925 archivos; 966.4 kB comprimidos; 3.5 MB sin comprimir |

Los tres mensajes `Not implemented: navigation to another Document` de jsdom provienen de pruebas que verifican navegación nativa para enlaces externos, `target` y `download`; no representan fallos de la suite.

## Arquitectura encontrada

```text
Nroutes
  ├─ location.ts       parseo, normalización, targets y href
  ├─ matcher.ts        compilación de branches, ranking y matching
  ├─ Nroutes.tsx       history, transición, guards, loaders, caché,
  │                    prefetch, scroll, render y boundaries
  ├─ context.ts        contexto público y profundidad del outlet
  ├─ hooks.ts          hooks especializados
  ├─ NLink.tsx         enlace SPA y prefetch por intención
  ├─ types.ts          contrato público
  └─ labels.ts         textos predeterminados
```

Flujo vigente:

```text
location
  → matchRoutes(branches ordenadas)
  → permiso de toda la branch
  → loadMatch()
      → guard padre
      → loader padre
      → guard hijo
      → loader hijo
  → reemplazo completo del match
  → NRouteOutlet con key de URL completa
```

Integraciones comprobadas:

- `Nlayout` consume el match y conserva `NAppShell`, `NSidebar` y `NHeader` fuera del outlet.
- Sidebar, header y router reutilizan `usePermissions()`; no se debe crear un segundo motor de capacidades.
- `NRouterAdapter` delega `location`, `navigate`, `createHref` y `prefetch` a un router externo.
- El build preserva módulos ESM/CommonJS y directivas `"use client"`; `sideEffects` es `false`.

## Capacidades existentes que deben preservarse

- Estrategias `history`, `hash` y `memory`.
- `basePath` y location con pathname, search, hash, state y key.
- Rutas planas y anidadas, params, wildcard, ranking y `NOutlet`.
- Permisos, guards, redirects y loaders con `AbortSignal`.
- Protección contra commits de navegaciones obsoletas.
- Loader data y error boundary más cercano.
- `NLink`, hooks especializados y prefetch por intención.
- Scroll restoration, gestión de foco, anuncios accesibles y reduced motion.
- Breadcrumbs derivados e integración con `Nlayout`.
- Adaptadores externos para Next.js u otros routers.
- `unstyled`, `classNames`, `styles` y textos configurables mediante `labels`.

## Problemas reales encontrados

| Área | Evidencia actual | Consecuencia |
| --- | --- | --- |
| Transición | No existe diff entre branch actual y siguiente | Padres retenidos vuelven a ejecutar guard y loader |
| Params por nivel | Cada `NRouteMatchEntry` recibe los params combinados de la hoja | No se puede identificar con precisión qué segmento cambió |
| Scheduler | `loadMatch()` usa un `for` con `await` para guard y loader | Waterfall obligatorio aun entre loaders independientes |
| Caché | Dos `Map` privados viven en `Nroutes.tsx` | Sin política, inspección, invalidación ni ciclo de vida reutilizable |
| Clave de caché | Incluye `locationPath`, incluido hash | Un cambio visual de hash invalida trabajo de datos |
| Retención | El resultado del loader se elimina tras una navegación normal | El caché sólo beneficia parcialmente al prefetch inmediato |
| Prefetch | Su `AbortController` es local y no se expone ni cancela | Trabajo innecesario puede continuar después de perder intención |
| Render | `NRouteOutlet` usa la URL completa como `key` | Search o hash remonta toda la página y los layouts anidados |
| Tipado | `defineNroutes()` conserva el arreglo, pero `navigate` sólo acepta targets por URL | No hay route IDs tipados ni validación de params obligatorios |
| Lazy routes | Sólo existe `preload`; no existe contrato de route module | No hay code splitting de ruta first-class ni retry de chunk |
| Blockers | No hay registro o estado de bloqueo | Cambios sin guardar no pueden interceptar toda navegación |
| Intención | `navigation.status` sólo admite `idle/loading` | No distingue prefetch, bloqueo, action o revalidación |
| Mutaciones | No existen actions de ruta | Invalidación y concurrencia quedan fuera del lifecycle |
| Estado | No existe `statePolicy` ni keep-alive | No se puede declarar preservación o reset de forma explícita |
| Observabilidad | No existen eventos ni manifest público | No es posible explicar por qué corrió un loader o qué vino del caché |
| Escala del matcher | Recorre branches hasta encontrar coincidencia | El peor caso crece linealmente y llega a milisegundos con 1,000 rutas |
| Monolito | `Nroutes.tsx` supera 580 líneas y contiene seis responsabilidades | Aumenta el riesgo al incorporar las fases restantes |
| Catálogo | `LayoutRoutesView` sólo demuestra la generación actual | La documentación web aún no explica lifecycle, caché, actions o DevTools |

## Decisiones de arquitectura

### Runtime independiente del render

El estado mutable se concentrará en una instancia por `<Nroutes>` y no en singletons globales:

```text
routes/core       compile, manifest, match, transition
routes/navigation navigator, blockers, history, events
routes/data       scheduler, cache, loaders, actions, prefetch
routes/rendering  outlets, boundaries, preservation, transitions
routes/typing     route ids, paths, params y search
routes/devtools   UI opcional de desarrollo
```

El componente React será el adaptador del runtime al árbol visual. Esto permitirá pruebas unitarias deterministas, invalidación programática y DevTools sin continuar creciendo el monolito.

### Transición incremental explícita

La unidad de navegación será `NRouteTransition`:

```ts
interface NRouteTransition<TData = unknown, TContext = unknown> {
  from?: NRouteMatch<TData, TContext>
  to: NRouteMatch<TData, TContext>
  retained: readonly NRouteTransitionEntry<TData, TContext>[]
  entering: readonly NRouteMatchEntry<TData, TContext>[]
  leaving: readonly NRouteMatchEntry<TData, TContext>[]
  changes: {
    pathname: boolean
    search: ReadonlySet<string>
    hash: boolean
  }
}
```

Una entrada se retiene cuando conserva route id y los params relevantes. Retener no significa necesariamente omitir trabajo: la política de revalidación decide guard y loader por separado.

### Política de revalidación

API propuesta, aditiva:

```ts
type NRouteRevalidationPolicy =
  | "always"
  | "params"
  | "search"
  | "never"
  | ((details: NRouteShouldReloadDetails) => boolean)

interface NRouteDefinition {
  revalidate?: NRouteRevalidationPolicy
  reloadOnSearch?: readonly string[]
}
```

Default propuesto: rutas nuevas o con params modificados se ejecutan; rutas retenidas no se ejecutan por cambios de hash y sólo responden al search declarado en `reloadOnSearch`. `revalidate="always"` conserva una salida explícita. La fase 1 cerrará el nombre definitivo con pruebas de tipos.

### Scheduler con dependencias declaradas

Los guards necesarios conservan orden padre→hijo para impedir que trabajo sensible se adelante a una denegación. Después, loaders autorizados se organizan como un grafo acíclico:

```ts
{
  id: "invoice",
  loader: loadInvoice,
  dependsOn: ["tenant"],
}
```

Los loaders sin dependencias se ejecutan en paralelo. Un id ausente, dependencia circular o dependencia fuera de la branch produce una advertencia de desarrollo y un error tipado durante la compilación cuando pueda inferirse.

### Caché limitado al ciclo de rutas

```ts
interface NRouteCachePolicy {
  mode?: "cache-first" | "network-first" | "stale-while-revalidate"
  staleTime?: number
  gcTime?: number
  tags?: readonly string[]
}
```

La clave se construirá con route id, params relevantes y search declarado; nunca con hash. El motor soportará deduplicación, estado fresh/stale, garbage collection, tags e invalidación, pero no normalizará entidades ni sustituirá un caché de consultas.

### Route modules lazy

```ts
{
  id: "treasury",
  path: "/treasury",
  lazy: () => import("./routes/treasury.route"),
}
```

El módulo podrá aportar `Component`, `loader`, `ErrorBoundary`, `pendingElement`, `action` y metadata. El import se deduplicará en un registro independiente; el prefetch cargará explícitamente código antes de datos. Un fallo no quedará cacheado para siempre y podrá reintentarse. No se dependerá de heurísticas de `React.lazy()`.

### Routing tipado progresivo

`NRouteDefinition[]` continuará aceptándose. Cuando el consumidor use `defineNroutes()` se inferirán ids y params:

```ts
const routes = defineNroutes([
  { id: "invoice-detail", path: "/invoices/:folio", title: "Factura", element: <Invoice /> },
] as const)

router.href({ route: "invoice-detail", params: { folio: "A-100" } })
router.navigate({ route: "invoice-detail", params: { folio: "A-100" } })
```

La navegación por string seguirá disponible. Los tests de tipos usarán `@ts-expect-error` para params desconocidos y faltantes; no se usarán `any` ni `@ts-ignore`.

### Blockers componibles

`useNBlocker(condition)` registra el bloqueo en el runtime y devuelve `idle/blocked`, locations, action y `proceed/reset`. NLink, navegación programática y traversal comparten el mismo pipeline. `beforeunload` funciona como complemento del navegador; la UI interna no depende de `window.confirm()` y puede componerse con `NConfirmDialog`. Los límites y adapters externos están documentados en [Navigation blockers](./nroutes-blockers.md).

### Actions e invalidación

Las actions serán mutaciones de ruta explícitas con estados `idle/submitting/success/error`, `AbortSignal` e invalidación declarada. El estado optimista será opt-in y exigirá rollback o función inversa; no se inferirá automáticamente.

### Render y preservación

El outlet no se keyará por URL completa. Cada nivel tendrá identidad por route id y política:

```ts
statePolicy?: "reset" | "preserve" | { mode: "lru"; maxEntries: number }
```

`reset` desmonta al abandonar o cambiar su identidad; `preserve` mantiene el subárbol; `lru` limita memoria. Los padres retenidos no deben remontarse al cambiar entre hijos.

### Slots, rutas modales y observabilidad

Named outlets y presentaciones modales pertenecen a P2. Se implementarán sobre el mismo matcher, scheduler, cache y boundaries; no crearán un segundo router. Cada runtime tendrá `subscribe(listener)` y un stream estructurado, nunca global. DevTools será una entry opcional sólo de desarrollo y no se importará desde el barrel productivo principal.

## Ciclo objetivo

```text
intent
  → resolve target / typed href
  → match manifest
  → diff current and next branches
  → blockers
  → permissions
  → required guards parent→child
  → lazy modules needed for this transition
  → loader dependency graph
  → route cache lookup
  → parallel execution of ready loaders
  → stale-navigation guard
  → minimal commit
  → focus / scroll / view-transition enhancement
```

## Fases de entrega

Cada fase actualiza implementación, tipos públicos, pruebas, documentación Markdown y catálogo cuando haya una API visible. Ninguna fase se marcará completa sin sus gates.

| Fase | Prioridad | Entrega verificable | Estado |
| --- | --- | --- | --- |
| 0 | Auditoría | Estado real, decisiones, riesgos y benchmark base | Completada |
| 1 | P0 | Branch diff, retained/entering/leaving y política de revalidación | Completada |
| 2 | P0 | Scheduler paralelo y `dependsOn` | Completada |
| 3 | P0 | Route cache, SWR, GC e invalidación | Completada |
| 4 | P0 | Route modules lazy, retry y prefetch de código | Completada |
| 5 | P0 | Route ids, params y href tipados | Completada |
| 6 | P0 | Search codecs opcionales y dependencias selectivas | Completada |
| 7 | P0 | Navigation blockers y `beforeunload` | Completada |
| 8 | P1 | Navigation intent enriquecido | Pendiente |
| 9 | P1 | Route actions e invalidación automática | Pendiente |
| 10 | P1 | Estado optimista explícito y rollback | Pendiente |
| 11 | P2 | Named/parallel outlets | Pendiente |
| 12 | P2 | Rutas modal/intercepted con deep link completo | Pendiente |
| 13 | P1 | `statePolicy`, keep-alive y LRU | Pendiente |
| 14 | P0 | Navegación shallow/selectiva | Pendiente |
| 15 | P1 | Scheduler de prefetch y prioridades | Pendiente |
| 16 | P1 | Layouts persistentes con pruebas de mount/unmount | Pendiente |
| 17 | P2 | View transitions como progressive enhancement | Pendiente |
| 18 | P1 | Sistema de eventos estructurados | Pendiente |
| 19 | P1 | Nroutes DevTools opcional y tree-shakeable | Pendiente |
| 20 | P1 | Manifest e inspección (`routes`, `match`, `href`, `isActive`) | Pendiente |
| 21 | P2 | Registro controlado de módulos empresariales | Pendiente |
| 22 | Cierre | Documentación web integral, benchmarks finales y publicación en GitHub | Pendiente |

Aunque la numeración funcional se conserva, el orden de trabajo será P0 → P1 → P2. Fase 14 se completa dentro de P0 porque depende directamente del branch diff y las dependencias de search.

## Gates por iteración

1. Pruebas unitarias del motor sin React.
2. Pruebas de integración React y regresión de API plana.
3. Pruebas de tipos positivas y negativas.
4. Accesibilidad, foco, enlaces nativos y reduced motion cuando aplique.
5. `npm run typecheck`.
6. `npm test`.
7. `npm run build`.
8. `npm run check:package`.
9. `npm run pack:check` en hitos de exports/empaquetado.
10. Si cambia el catálogo: build/URL real y prueba de render de la vista.

## Benchmarks base

El script reproducible es `npm run bench:nroutes`. Requiere un `dist` generado por `npm run build`; usa 30 muestras de compilación y siete rondas calientes de matching. Se informa la mediana y se busca deliberadamente la última ruta para medir el peor recorrido actual.

Resultados de referencia de la auditoría, Node `v24.15.0`, Windows x64:

| Rutas | Iteraciones/ronda | Compilación mediana | Match mediano | Operaciones/s |
| ---: | ---: | ---: | ---: | ---: |
| 10 | 100,000 | 0.027 ms | 38.854 µs | 25,737 |
| 100 | 20,000 | 0.193 ms | 220.675 µs | 4,532 |
| 1,000 | 2,000 | 1.995 ms | 2,435.288 µs | 411 |

Estas cifras no se comparan con otros routers y no constituyen promesas de producto. Sirven para detectar regresiones en la misma máquina. El runner crecerá, conforme existan las capacidades, con navegación sibling, cambio entre ramas, cache hit, lazy cold y lazy prefetched. No se publicarán resultados simulados.

## Estrategia de documentación web

El cierre no será sólo Markdown. La sección de Nroutes en la página de presentación incluirá:

- guía de inicio rápido y compatibilidad plana;
- diagrama del lifecycle y tabla de políticas usando componentes NissiUI;
- explorador real de branches, params y search;
- demo empresarial `tenant → treasury → payments/accounts/invoices`;
- tabla de facturas con `NTable`/`NDataTable`;
- flujo factura → modal → edición → action → invalidación → listado actualizado;
- caché, prefetch, blockers y actions con estados visibles;
- integración con `Nlayout`, permisos, Next.js y React Server Components;
- inspector/DevTools sólo de desarrollo;
- tablas completas de APIs, defaults, accesibilidad, errores y migración;
- enlaces a `nroutes-architecture`, `nroutes-cache`, `nroutes-typed-routing` y `nroutes-navigation-lifecycle`.

Todo texto visible nuevo pertenecerá a labels o a contenido documental del catálogo. La vista se comprobará en los cuatro temas, móvil/escritorio, teclado y reduced motion.

## Compatibilidad y migración

Este contrato permanece obligatorio:

```tsx
const routes: NRouteDefinition[] = [
  { id: "home", path: "/", title: "Inicio", element: <Home /> },
]

<Nroutes routes={routes} />
```

Y también:

```ts
const { path, match, navigate, createLinkProps } = useNroutes()
```

Las APIs por route id serán overloads adicionales; las rutas por string no desaparecen. Si una fase descubre una incompatibilidad inevitable, se documentarán API anterior, API nueva, migración y deprecación antes de eliminar comportamiento.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Complejidad genérica excesiva | Mantener una API simple y activar inferencia avanzada con helpers |
| Caché convertido en query client | Limitarlo a resultados de loader por ruta y documentar sus límites |
| Carrera entre loader/action/prefetch | Generaciones, AbortSignal y commits monotónicos en un runtime |
| Loader sensible antes de autorización | Permisos y guards terminan antes de agendar loaders |
| Ciclos en `dependsOn` | Validación del grafo antes de ejecutar |
| Consumo de memoria por preserve/LRU | Defaults de reset, límites explícitos y métricas de DevTools |
| Bundle productivo con DevTools | Entry/subruta separada y gate de tree shaking |
| Dos routers escribiendo History API | Adapter controlado; el framework externo conserva propiedad exclusiva |
| APIs web no universales | Feature detection, SSR safety y fallbacks seguros |
| Documentación adelantada al código | Ejemplos publicados sólo tras implementación y pruebas |

## Definition of Done v3

Nroutes v3 sólo podrá declararse terminado cuando las 21 fases funcionales, el cierre documental y todos los casos obligatorios estén implementados y probados. En particular:

- padres retenidos no reprocesan trabajo sin causa;
- loaders independientes corren en paralelo;
- cache, invalidación, lazy modules, typed routing y blockers son first-class;
- actions, estado optimista y preservación explícita están integrados;
- query-only navigation puede omitir loaders no afectados;
- prefetch es cancelable, deduplicado y consciente del cache/lazy code;
- eventos y DevTools explican cada transición;
- outlets nombrados, modal routes, transitions y módulos empresariales conservan seguridad y concurrencia;
- accesibilidad, SSR, exports, tree shaking y compatibilidad plana permanecen aprobados;
- los ocho benchmarks son reproducibles y no usan resultados inventados;
- README, AI context, project context, changelog, guías especializadas y página de presentación están completos;
- el repositorio GitHub se actualiza sólo después de superar la auditoría final.
