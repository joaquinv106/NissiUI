# NBalanceSession

`NBalanceSession<TEntry>` compara el valor esperado de una sesión operativa con un valor observado. Sirve para cajas, turnos, arqueos, conciliaciones, inventarios o cualquier proceso con entradas firmadas; no presupone moneda ni contabilidad.

## Uso

```tsx
<NBalanceSession
  sessionId={session.id}
  entries={movements}
  openingAmount={session.opening}
  getEntryId={(entry) => entry.id}
  getEntryLabel={(entry) => entry.concept}
  getEntryAmount={(entry) => entry.signedAmount}
  countedAmount={counted}
  onCountedAmountChange={setCounted}
  onClose={(details) => api.closeSession(details)}
/>
```

`expectedAmount = openingAmount + sum(getEntryAmount(entry))`. Los egresos o decrementos se entregan con signo negativo. La diferencia es `countedAmount - expectedAmount`.

## Contrato operativo

- `countedAmount`/`onCountedAmountChange` ofrece estado controlado; `defaultCountedAmount` conserva un borrador local.
- `tolerance` considera balanceadas diferencias dentro de un umbral absoluto.
- Por defecto una diferencia bloquea el cierre. `allowCloseWithVariance` debe habilitarse solamente cuando el dominio permita justificarla.
- `onClose` admite espera asíncrona y resultados `boolean` o `{ success, message }`; durante la operación bloquea duplicados.
- Un cambio de `sessionId` reinicia el estado transitorio y descarta respuestas asíncronas de la sesión anterior.
- `status="closed"` y `readOnly` permiten presentar sesiones históricas.
- `renderSummary`, `renderEntry`, `header`, `footer` y `emptyState` sustituyen presentación sin cambiar el cálculo.

El componente no persiste, contabiliza ni autoriza el cierre. El servidor debe revalidar identidad, permisos, movimientos vigentes y reglas de negocio dentro de una transacción.

## Accesibilidad y responsive

La sesión es una región nombrada, el estado se anuncia de forma reactiva, los fallos usan `role="alert"` y los movimientos son una lista ordenada. El resumen cambia de una a cuatro columnas según el ancho; acciones y entradas se apilan en móvil. Todos los textos internos pertenecen a `NBalanceSessionLabels`.
