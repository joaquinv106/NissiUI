# Lifecycle de navegación de Nroutes

Esta guía documenta el lifecycle implementado hasta la fase 5 de Nroutes v3. Search codecs, blockers, actions y observabilidad se incorporarán en fases posteriores y no deben asumirse todavía.

## Pipeline vigente

```text
target por URL o route id tipado
  → location
  → matching y branch diff
  → permisos de toda la branch
  → route modules lazy requeridos
  → guards requeridos, padre → hijo
  → loaders requeridos por ondas
  → resolución de caché/deduplicación
  → validación AbortSignal/generación
  → commit
  → scroll, foco y anuncio
```

## 1. Matching y trabajo afectado

`createNRouteTransition()` compara la branch activa con la siguiente. Una ruta participa cuando entra en la branch o cuando una ruta retenida cumple su política `revalidate`/`reloadOnSearch`.

Esto evita volver a procesar padres por una navegación sibling:

```text
/tenant/acme/treasury/payments
→ /tenant/acme/treasury/accounts

tenant    retained · no work
treasury  retained · no work
payments  leaving
accounts  entering · work
```

## 2. Permisos y guards

La capacidad `requiredPermission` de toda la branch se evalúa antes de ejecutar cualquier guard o loader. Si falta una capacidad, el estado es forbidden y no se inicia trabajo de datos.

Los guards afectados se ejecutan secuencialmente de padre a hijo. Todos deben terminar antes de iniciar loaders. Esto garantiza que un guard hijo que deniega o redirige impida también loaders sensibles de sus padres y siblings.

```ts
beforeEnter: async ({ params, context, signal, loaderData }) => {
  if (!context.session) return redirect("/login")
  return context.api.canOpenTenant(params.tenant, { signal })
}
```

`loaderData` contiene resultados retenidos de la navegación anterior. Los guards no reciben resultados de loaders nuevos porque éstos aún no se han ejecutado.

## 3. Scheduler paralelo

Después de autorizar la transición, el scheduler crea una tarea por loader afectado. Una tarea sin dependencias pendientes pertenece a la siguiente onda; todas las tareas de una onda se ejecutan concurrentemente.

```text
onda 1: tenant ───────┐
        permissions ──┼─ Promise.allSettled
onda 2: invoice ──────┘  dependsOn: ["tenant"]
```

Las dependencias son explícitas:

```ts
{
  id: "invoice",
  path: "invoices/:folio",
  dependsOn: ["tenant"],
  loader: ({ params, loaderData, signal }) =>
    api.getInvoice(loaderData.tenant, params.folio, { signal }),
}
```

`loaderData.tenant` está garantizado cuando comienza `invoice` porque fue declarado en `dependsOn`. No se debe leer implícitamente el resultado de otro loader de la misma onda: el objeto entregado es un snapshot de los resultados disponibles al iniciar esa onda.

## Validación del grafo

Antes de ejecutar se valida que cada dependencia:

- exista en la misma branch;
- tenga loader;
- no apunte a sí misma;
- no forme un ciclo con otras tareas pendientes.

Una configuración inválida produce `NRouteLoaderSchedulerError` y cae en el error boundary correspondiente a la ruta que declaró el problema. No se intenta adivinar un orden alternativo.

## Errores deterministas

El scheduler usa `Promise.allSettled` por onda. Si fallan varias tareas independientes, selecciona el error con menor índice de branch para mantener un resultado determinista equivalente al orden padre→hijo. Los loaders exitosos de esa onda permanecen disponibles para el boundary; no se ejecutan ondas dependientes después de un fallo.

El boundary se busca desde la ruta fallida hacia sus padres. `Nlayout`, sidebar y header permanecen montados.

## Abort y carreras

Todos los guards y loaders reciben el `AbortSignal` de la transición. Al iniciar una navegación más nueva, Nroutes aborta la anterior. Además, una generación monotónica protege el commit:

```text
A inicia
B inicia → abort A
B termina → commit B
A termina tarde → descartada
```

La misma regla se aplica al resultado combinado del scheduler. Los adaptadores y APIs del consumidor deben propagar el signal a `fetch` u operaciones cancelables para evitar trabajo innecesario.

## Caché dentro del pipeline

Cada tarea autorizada consulta `NRouteCache` antes de iniciar red. Un hit fresh puede resolver inmediatamente; un miss o dato stale sigue la política de la ruta. Las solicitudes concurrentes comparten trabajo sin acoplar el aborto de un consumidor con los demás. Consulta [Caché de rutas](./nroutes-cache.md) para modos, claves, GC, prefetch e invalidación.

## Compatibilidad

No es necesario declarar `dependsOn`. Todas las rutas existentes continúan funcionando y sus loaders ahora se paralelizan cuando participan en la misma transición. Si el orden importa, debe declararse; no se crean dependencias implícitas por jerarquía visual.

Las estrategias history/hash/memory, los adapters externos y la API `useNroutes()` no cambian.
