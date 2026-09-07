# NOfflineBoundary

`NOfflineBoundary` comunica conectividad intermitente y decide si conserva el contenido o presenta un fallback. No implementa almacenamiento local, resolución de conflictos ni sincronización.

## Uso controlado

```tsx
<NOfflineBoundary
  online={connectivity.online}
  queuedCount={queue.pendingCount}
  onOnlineChange={connectivity.setOnline}
  onCheckConnectivity={connectivity.checkServer}
>
  <FieldApplication />
</NOfflineBoundary>
```

## Modos

- `behavior="banner"` mantiene el contenido disponible y muestra una advertencia. Es apropiado cuando la aplicación puede guardar localmente.
- `behavior="fallback"` sustituye el contenido cuando la función depende obligatoriamente de red.
- `online` activa el modo controlado. Sin esta prop, el componente puede escuchar eventos `online`/`offline` del navegador mediante `detectBrowserEvents`.
- `onCheckConnectivity` debe comprobar el servicio real y devolver booleano o `{ online, message }`. En modo no controlado actualiza el estado interno; en modo controlado sólo notifica mediante `onOnlineChange`.
- `queuedCount` es informativo y sólo debe usarse cuando existe una cola persistente real.

## Limitaciones deliberadas

`navigator.onLine` indica si el navegador considera disponible una interfaz de red; no garantiza que la API, autenticación o base de datos remota respondan. Para decisiones de negocio, entregue `online` desde un monitor propio o implemente `onCheckConnectivity`.

El banner y la recuperación usan regiones `status`; fallos de comprobación usan `alert`. Botones y mensajes son traducibles mediante `NOfflineBoundaryLabels`, y las acciones se apilan en pantallas angostas.
