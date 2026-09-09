# Navigation blockers de Nroutes

Los blockers impiden abandonar una vista con trabajo pendiente antes de que Nroutes modifique la ubicación. La API es opt-in, pertenece a cada instancia de `<Nroutes>` y no impone una interfaz de confirmación.

## Uso con NConfirmDialog

```tsx
import { NConfirmDialog } from "nissi-ui"
import { useNBlocker } from "nissi-ui/routes"

function InvoiceEditor() {
  const blocker = useNBlocker(isDirty)

  return (
    <>
      <InvoiceForm />
      <NConfirmDialog
        open={blocker.state === "blocked"}
        onOpenChange={(open) => { if (!open) blocker.reset() }}
        title="Cambios sin guardar"
        description="Si continúas, los cambios locales se perderán."
        confirmLabel="Salir"
        cancelLabel="Permanecer"
        onConfirm={blocker.proceed}
      />
    </>
  )
}
```

`useNBlocker()` acepta un booleano o un predicado. El predicado permite decidir con el origen, destino y tipo de navegación:

```tsx
const blocker = useNBlocker(({ from, to, action }) =>
  isDirty && action !== "replace" && from.pathname !== to.pathname,
)
```

## Estado y decisiones

El resultado expone:

- `state`: `"idle"` o `"blocked"`;
- `from` y `to`: locations completas de la navegación pendiente;
- `action`: `"push"`, `"replace"`, `"traverse"` o `"unload"`;
- `proceed()`: ejecuta una sola vez la navegación retenida;
- `reset()`: cancela la navegación y conserva la ubicación activa.

Puede haber varios blockers en el mismo router. Cada hook informa `blocked` sólo cuando su propia condición participó en la decisión, mientras el runtime conserva una única navegación pendiente. Desmontar el último blocker involucrado cancela esa navegación.

## Cobertura

El mismo registro intercepta `NLink`, `navigate()`, `replace()`, `back()`, `forward()` y traversal de History API (`popstate`/cambio de hash). En `memory`, Nroutes conoce exactamente las entradas anterior y siguiente. En `history` y `hash`, si el navegador ya notificó un traversal bloqueado, Nroutes restaura la URL activa y sólo repite el movimiento después de `proceed()`.

Los enlaces externos, descargas, `target` y clics con modificadores conservan la semántica nativa del navegador. Al salir o recargar el documento, `beforeunload` complementa el blocker. Por seguridad, los navegadores controlan el mensaje de esa alerta y pueden decidir no mostrarla; una UI React personalizada no puede sustituir ese diálogo durante el cierre real de la pestaña.

## Routers externos

`NRouterAdapter` sigue permitiendo que Next.js, React Server Components con una frontera cliente u otro host sea dueño de la URL. Las llamadas realizadas mediante `NLink`, `navigate()` y `replace()` pasan por el blocker antes de invocar el adapter. `back` y `forward` son callbacks opcionales del adapter; como algunos hosts no exponen por adelantado el destino de un traversal, el blocker puede reportar la ubicación activa como `to`. Cuando el destino sea conocido, conviene canalizarlo mediante `navigate()` o `replace()`.

Un cambio de `router.location` que el host ya confirmó no puede deshacerse de forma fiable desde Nroutes. El adapter debe solicitar la navegación a través de la API de Nroutes para obtener bloqueo previo. No deben operar dos propietarios de History API sobre la misma URL.

## Accesibilidad

La confirmación personalizada debe gestionar foco, Escape, nombres accesibles y acciones explícitas para continuar o permanecer. `NConfirmDialog` ya proporciona esas bases. Los textos se entregan mediante sus props/`labels`, por lo que pueden localizarse sin modificar el blocker.
