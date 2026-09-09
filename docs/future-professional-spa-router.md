# Nissi Router SPA profesional

> Estado: **implementado en el repositorio para la siguiente publicación**. Este documento conserva la especificación, auditoría y decisiones de la entrega.
>
> La siguiente generación no se documenta como terminada aquí. Su auditoría y fases viven en [Nroutes v3](./nroutes-v3-plan.md).
>
> La siguiente generación no se documenta como terminada aquí. Su auditoría y fases pendientes viven en [Nroutes v3](./nroutes-v3-plan.md).

## Auditoría ejecutada

| Hallazgo inicial | Estado anterior | Solución aplicada |
| --- | --- | --- |
| Location incompleta | `path` eliminaba query y hash | `NRouteLocation` conserva pathname, search, `URLSearchParams`, hash, state y key. |
| Matching por orden | La primera ruta coincidente ganaba | Compilación y ranking: exacta, estática, param y wildcard. |
| Sin jerarquía | Sólo rutas planas absolutas | `children`, branch completa y `NOutlet` multinivel. |
| Deep links sin protección | El sidebar ocultaba, el router renderizaba | Permisos por ruta reutilizando `usePermissions()`, más fallback forbidden. |
| Sin ciclo asíncrono | Suspense era el único pending | Navegación `idle/loading`, guards, redirects, loaders, `AbortSignal` y control stale. |
| Errores derribaban contenido | Sin boundary de ruta | `errorElement` más cercano y fallback global conservando el shell. |
| Enlaces y hooks mínimos | Sólo `createLinkProps()` y `useNroutes()` | `NLink`, hooks especializados, prefetch por intención y helpers TypeScript. |
| Breadcrumbs manuales | Sólo `pageHeader.breadcrumbs` | Derivación desde branch con override explícito. |
| Permisos divergentes | Sidebar sí; header y rutas no | Contrato común en `NSidebar`, `NHeader` y `Nroutes`. |
| Router acoplado al navegador | History/hash/memory internos | `NRouterAdapter` permite que Next.js u otro framework sea dueño de la navegación. |
| Inset móvil rígido | `"4.25rem"` dentro del layout | `mobileSidebarTriggerInset` ofrece una fuente configurable con default compatible. |

## Misión

Evolucionar `Nroutes`, `NRouteOutlet` y `Nlayout` hacia un sistema SPA robusto para aplicaciones empresariales, ERP, SaaS multi-tenant y productos como NissiPlatform/NFacture, sin reemplazar Nissi UI por React Router, TanStack Router, Next Router ni otro router externo.

El resultado debe conservar la filosofía del paquete: APIs progresivas y compatibles, Chakra UI v3, TypeScript estricto, accesibilidad, `prefers-reduced-motion`, i18n mediante `labels`, `unstyled`, `classNames`, `styles`, tree shaking, SSR seguro y ausencia de dependencias innecesarias.

## Regla de inicio para el próximo equipo

Antes de modificar código, leer completos:

1. `AGENTS.md`.
2. `PROJECT_CONTEXT.md`.
3. `AI_CONTEXT.md`.
4. `docs/layout-routes.md`.
5. `docs/permissions.md`.
6. `src/components/routes/**` y sus pruebas.
7. `src/components/layout/**` y sus pruebas.
8. `src/components/sidebar/**`.
9. `src/components/header/**`.
10. `src/components/permissions/**`.

La primera entrega del proyecto debe ser una auditoría del estado real. Las necesidades de este documento son hipótesis de trabajo hasta contrastarlas con el repositorio de ese momento.

Existe una corrección conocida al análisis original: `NSidebar` ya consume `usePermissions()` y filtra elementos con `requiredPermission` y `permissionMode`. No debe duplicarse ese motor. El problema pendiente es proteger deep links y alinear router, header, sidebar y layout con una misma política de navegación cliente. La autorización definitiva siempre corresponde al backend.

## Arquitectura objetivo

```text
URL / location completa
  → árbol compilado de rutas
  → matching ordenado por especificidad
  → permisos y beforeEnter
  → loaders y prefetch
  → branch de matches
  → outlets anidados
  → Nlayout
  → página
```

El router debe modelar una transición de navegación, no sólo reemplazar un string `path`.

## Alcance funcional

### 1. Location y search params

Introducir un concepto de location completa equivalente a:

```ts
interface NRouteLocation {
  pathname: string
  search: string
  searchParams: URLSearchParams
  hash: string
  state?: unknown
  key: string
}
```

Separar parseo, normalización del pathname, serialización y generación de `href`. Los query params deben sobrevivir carga inicial, copia de URL, navegación, back/forward, `history`, `hash`, `memory` y `basePath`.

Agregar un hook especializado equivalente a `useNSearchParams()` con operaciones para reemplazar, mezclar, eliminar y preservar parámetros usando primitivas web estándar, sin imponer schemas.

### 2. Árbol de rutas, ranking y branch

Extender `NRouteDefinition` con rutas hijas relativas, raíz, params, wildcard final y varios niveles. Evaluar index routes tipadas sólo si mantienen una API clara.

```ts
{
  id: "billing",
  path: "/facturas",
  element: <BillingLayout />,
  children: [
    { id: "billing-list", path: "", element: <Invoices /> },
    { id: "billing-detail", path: ":folio", element: <InvoiceDetail /> },
  ],
}
```

Compilar branches y ordenarlas sin depender del orden accidental del array. Precedencia mínima:

```text
segmento estático > :param > *
```

El match debe conservar compatibilidad con `match.route`, `match.params` y `match.path`, y agregar la branch completa con padres, leaf, params combinados, metadata, loader data, breadcrumbs y boundary aplicable.

En desarrollo, advertir —sin fallar en producción— sobre ids duplicados, patrones indistinguibles y configuraciones ambiguas.

### 3. Outlets anidados

Conservar `NRouteOutlet` como outlet principal y agregar una primitiva explícita como `NOutlet` para renderizar el hijo de cada nivel.

```tsx
function BillingLayout() {
  return (
    <Stack>
      <BillingTabs />
      <NOutlet />
    </Stack>
  )
}
```

Debe funcionar con tres o más niveles sin que el consumidor reconstruya manualmente las rutas hijas.

### 4. Permisos y guards genéricos

Agregar autorización declarativa a rutas reutilizando `NPermissionCapability`, `NPermissionMode`, `NPermissionsProvider` y `usePermissions()`.

```ts
{
  path: "/tesoreria/pagos",
  requiredPermission: "tesoreria:pagos:ver",
  permissionMode: "all",
}
```

Una URL directa sin permiso no debe renderizar la página protegida. Definir una política consistente mediante `forbiddenFallback`, redirección o resultado de guard.

No acoplar el router a Nauth. `Nroutes` debe aceptar contexto genérico y rutas con `beforeEnter` síncrono o asíncrono:

```ts
beforeEnter: async ({ params, location, context, signal }) => {
  const allowed = await context.api.canOpenTenant(params.tenant, { signal })
  if (!allowed) return redirect("/403")
}
```

Evaluar guards `parent → child`, pasar `AbortSignal` y cancelar o descartar navegaciones obsoletas.

### 5. Loaders y ciclo de navegación

Agregar loaders cancelables como parte del ciclo de ruta, manteniendo `route.data` para metadata estática y usando un concepto separado `loaderData`.

```ts
loader: ({ params, searchParams, context, signal }) =>
  context.api.getInvoice(params.folio, { signal })
```

Cubrir preparación inicial, pending, éxito, error, cancelación y deduplicación/prefetch razonables. No construir un reemplazo de TanStack Query ni un caché complejo.

Modelar navegación al menos como `idle` y `loading`, con generación de navegación y `AbortController`. Si A comienza, B termina y luego responde A, A nunca debe sobrescribir B.

### 6. Error boundaries

Permitir `errorElement` por ruta y un fallback global. Errores de render o loader deben caer en el boundary más cercano de la branch sin desmontar sidebar, header, footer ni el shell completo. Los textos visibles nuevos pertenecen a `labels` y el error debe poder recibir foco.

### 7. NLink, hooks y prefetch

Crear `NLink` como `<a>` real y API recomendada, conservando `createLinkProps()`:

```tsx
<NLink to="/facturas/A-100" prefetch="intent">
  Abrir factura
</NLink>
```

Debe respetar estrategias, `basePath`, `replace`, `state`, search, modifier keys, click medio, `target`, `download`, enlaces externos y comportamiento nativo.

Agregar hooks especializados equivalentes a:

- `useNRouteParams()`
- `useNSearchParams()`
- `useNNavigate()`
- `useNLocation()`
- `useNNavigation()`
- `useNLoaderData()`
- `useNRouteMatches()`

Conservar `useNroutes()` completo por compatibilidad.

El prefetch por intención debe activarse con pointer enter o focus, preparar un `preload` explícito y/o loader, no navegar, deduplicar solicitudes y no asumir que cualquier `React.lazy()` puede precargarse mágicamente.

### 8. Integración con Nlayout

Derivar breadcrumbs desde la branch, con precedencia:

1. `pageHeader.breadcrumbs` explícitos.
2. Breadcrumbs derivados (`breadcrumb` o `title`).
3. Ninguno cuando `pageHeader={false}`.

Alinear permisos de ruta, `NSidebarItem` y `NHeaderNavItem`. Si corresponde, extender el header con `requiredPermission` y `permissionMode`, reutilizando utilidades existentes en lugar de copiar algoritmos.

Agregar progreso global opcional para loaders lentos, con delay anti-parpadeo, reduced motion, anuncio accesible y contrato `unstyled`/slots.

Agregar scroll restoration opt-in que distinga push, replace, popstate, hash y memory. El foco debe moverse cuando el contenido final esté listo, no durante pending.

Eliminar el conocimiento duplicado de `"4.25rem"` usado para reservar el trigger móvil. Centralizar una fuente semántica y configurable mediante token, custom property, prop compartida o constante interna apropiada.

Mejorar el tipado de `navigationId` sin llenar `Nlayout` de genéricos. Evaluar helpers como `defineNroutes()` y `defineNlayoutConfig()` para preservar literales, autocomplete y detección de typos con declaraciones mantenibles.

## Compatibilidad obligatoria

Las rutas planas y el contexto actual deben seguir funcionando:

```tsx
const routes: NRouteDefinition[] = [
  { id: "home", path: "/", title: "Inicio", element: <Home /> },
  {
    id: "invoice",
    path: "/comprobantes/:folio",
    title: "Comprobante",
    element: ({ params }) => <Invoice folio={params.folio} />,
  },
]

<Nroutes routes={routes} />
```

```ts
const { path, match, navigate, createLinkProps } = useNroutes()
```

Si una incompatibilidad resultara inevitable, debe justificarse, minimizarse, documentar migración y registrarse en `CHANGELOG.md`.

## Fuera de alcance

- File-based routing.
- Un framework SSR completo.
- Server actions o router para React Server Components.
- Caché de queries complejo.
- Validadores de schema obligatorios.
- Dependencia en TanStack Query, React Router o TanStack Router.

## Performance y accesibilidad

Compilar y rankear el árbol con memoización; evitar recorridos repetidos, objetos de contexto inestables y renders globales por cambios irrelevantes. Separar contextos sólo si existe beneficio medible.

Preservar teclado, foco posterior a navegación, `aria-live`, etiquetado de regiones, modifier clicks y reduced motion. `NLink` debe permanecer como enlace semántico. Pending, errores y progreso deben anunciarse sin ruido.

## Plan de implementación

### Fase 1 — Core router · completada

- Location completa y search params.
- Compilación del árbol y ranking.
- Matching anidado y branch.
- `NOutlet` multinivel.

### Fase 2 — Ciclo de navegación · completada

- Estado de navegación y cancelación.
- Permisos de ruta y `beforeEnter`.
- Loaders, redirects, loader data y errores.

### Fase 3 — Experiencia de desarrollo · completada

- `NLink`.
- Hooks especializados.
- Prefetch.
- Helpers TypeScript.

### Fase 4 — Nlayout · completada

- Breadcrumbs derivados.
- Coherencia de permisos en header/sidebar/rutas.
- Route progress.
- Scroll restoration.
- Fuente semántica para el inset del trigger móvil.

### Fase 5 — Hardening · completada

- Tests de regresión y nuevas capacidades.
- SSR, tree shaking y packaging.
- Catálogo, documentación y changelog.

Preferir módulos pequeños (`location`, `matcher`, `ranking`, `guards`, `loaders`, `navigation`, `hooks`) sobre convertir `Nroutes.tsx` en un monolito. La estructura exacta se decidirá después de auditar el código.

## Matriz mínima de pruebas

- Compatibilidad: memory, history, hash, `basePath`, params, not found y foco.
- Nesting: padre/hijo, tres niveles, params heredados, wildcard hijo y `NOutlet`.
- Ranking: `*`, `/facturas/*`, `/facturas/:folio` y `/facturas/nueva` desordenadas.
- Search: navegación, carga inicial, back, forward y generación de enlaces.
- Guards: permitido, denegado, redirect, async, parent/child y cancelación.
- Permisos: deep link bloqueado aunque la navegación ya esté oculta.
- Loaders: success, pending, data, error, `AbortSignal` y carrera stale.
- Boundaries: error de página o loader sin desmontar `Nlayout`.
- `NLink`: SPA click, modificadores, target, download, externos, replace y state.
- Breadcrumbs: derivados, params dinámicos y override manual.
- Prefetch: focus, pointer, sin navegación y deduplicación.
- Scroll: restauración al volver y política configurada.

## API objetivo orientativa

```tsx
import {
  Nroutes,
  NRouteOutlet,
  NOutlet,
  NLink,
  useNNavigate,
  useNLocation,
  useNRouteParams,
  useNSearchParams,
  useNNavigation,
  useNLoaderData,
  useNRouteMatches,
} from "nissi-ui/routes"

<Nroutes
  routes={routes}
  context={appContext}
  pendingFallback={<Pending />}
  forbiddenFallback={<Forbidden />}
/>
```

Los nombres son orientativos: la auditoría puede proponer alternativas más coherentes, manteniendo una ergonomía equivalente.

## Validación final obligatoria

```bash
npm run typecheck
npm test
npm run build
npm run check:package
npm run pack:check
```

No ignorar errores, desactivar tests, usar `any` como escape general ni agregar `@ts-ignore` sin una justificación extraordinaria.

## Definition of Done

El proyecto sólo estará terminado cuando:

- Las rutas planas actuales sigan funcionando.
- Existan nested routes, branch y nested outlet reales.
- Location y query params sobrevivan todo el ciclo de navegación.
- El matching sea independiente del orden accidental.
- Permisos y guards protejan deep links.
- Los loaders sean cancelables y las respuestas stale no ganen carreras.
- Los errores de ruta no derriben el shell.
- Existan `NLink`, hooks especializados y prefetch.
- `Nlayout` derive breadcrumbs y presente progress/scroll configurables.
- Sidebar, header y rutas compartan una política de permisos coherente.
- Desaparezca el magic number duplicado.
- Tests, typecheck, build, package checks y pack check estén verdes.
- Contextos, documentación, catálogo y changelog estén actualizados.

## Entrega esperada del equipo ejecutor

El informe final debe incluir:

1. Auditoría de cada hallazgo original: corrección, estado anterior y solución aplicada.
2. Arquitectura resultante desde URL hasta página.
3. Archivos modificados y responsabilidad.
4. API nueva con ejemplos reales.
5. Compatibilidad preservada y migraciones, si existen.
6. Escenarios de prueba agregados.
7. Resultado de todas las validaciones obligatorias.
8. Riesgos o decisiones pendientes reales.

El objetivo no es acumular código, sino producir un Nissi Router coherente, pequeño, potente y extensible que se sienta parte de Nissi UI.

## Validación de la entrega

- `npm run typecheck`: aprobado.
- `npm test`: 45 archivos y 293 pruebas aprobadas.
- `npm run build`: aprobado para ESM, CommonJS y declaraciones.
- `npm run check:package`: aprobado para consumo NodeNext/Bundler, SSR, directivas cliente y tree shaking.
- `npm run pack:check`: aprobado; la subruta `nissi-ui/routes` incluye las nuevas APIs.
- Catálogo Vite y muestra `nfacture.html`: respuestas HTTP 200; `LayoutRoutesView.test.tsx` monta las variantes de layout, router aislado y rutas anidadas.
