# NSyncStatus

`NSyncStatus` representa el estado que entrega un motor de sincronización: `synced`, `syncing`, `pending`, `offline` o `error`. Es una superficie de estado controlada y no interpreta conectividad por sí sola.

## Uso

```tsx
<NSyncStatus
  status={sync.status}
  syncKey={workspaceId}
  pendingCount={sync.pendingCount}
  lastSyncedAt={sync.lastConfirmedAt}
  onRetry={sync.retry}
/>
```

## Contrato

- `status` es obligatorio y sigue siendo propiedad de la aplicación o del motor local.
- `pendingCount` sólo debe representar operaciones realmente guardadas en una cola; el componente no crea esa cola.
- `lastSyncedAt` acepta fecha, texto ISO o timestamp. Una fecha inválida se omite; `formatTimestamp` permite localización propia.
- `variant="panel"` muestra fecha, cola, detalles, errores y recuperación. `compact` sirve en headers o barras móviles.
- `onRetry` bloquea activaciones concurrentes y admite `{ success, message }`. No cambia `status`: el consumidor debe actualizarlo cuando el motor confirme el resultado.
- `syncKey` identifica tenant, workspace o sesión; al cambiar descarta feedback asíncrono anterior.

## Accesibilidad y seguridad semántica

El estado se anuncia en una región `status` con `aria-live="polite"`; errores del motor y del reintento usan `alert`. Iconos son decorativos y el texto comunica el significado. Todos los textos pertenecen a `NSyncStatusLabels`.

`synced` debe usarse únicamente después de una confirmación real de persistencia remota. La presencia de red no equivale a sincronización exitosa.
