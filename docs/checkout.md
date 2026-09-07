# NCheckout

`NCheckout<TMethod>` compone `NAmountAllocator` con validación y confirmación asíncrona. Sirve como preset de pago dividido, sin implementar pasarelas, terminales, persistencia ni autorización.

## Uso

```tsx
<NCheckout
  checkoutKey={sale.id}
  total={cart.total}
  methods={paymentMethods}
  getMethodId={(method) => method.id}
  getMethodLabel={(method) => method.name}
  allocations={payments}
  onAllocationsChange={setPayments}
  validate={(details) => api.validateSale(details)}
  onComplete={(details) => api.capturePayment(details)}
/>
```

## Contrato

- `allocations`/`defaultAllocations` y `onAllocationsChange` conservan el patrón del asignador base.
- Por defecto sólo permite completar cuando existen métodos y el resumen está balanceado. `canComplete` puede expresar casos autorizados como operaciones gratuitas.
- `validate` corre antes de `onComplete` y puede ser asíncrono. Ambos reciben total, asignaciones y resumen.
- `onComplete` acepta `void`, booleano o `{ success, message }`; durante la espera se bloquean interacciones duplicadas.
- `checkoutKey` identifica la operación, reinicia asignaciones no controladas y descarta validaciones o respuestas tardías de otra venta.
- Usa `methodLayout="stacked"` por defecto para conservar legibilidad dentro de paneles laterales; puede cambiarse a `"responsive"` cuando dispone de una región amplia.
- `review`, `header`, `footer`, `allocatorHeader` y `allocatorFooter` permiten componer información adicional.

La API no trata una respuesta local como autorización bancaria. El consumidor actualiza y persiste la operación sólo después de la confirmación de su adaptador. Los errores usan `alert`, el éxito usa `status` y todas las cadenas pertenecen a `NCheckoutLabels` o `allocatorLabels`.
