# Proyecto prioritario: flujos operativos generalizables

Este proyecto amplía Nissi UI con primitivas y patrones capaces de construir un punto de venta sin convertir la librería en una solución exclusiva de retail. Cada componente debe funcionar también en compras, inventarios, servicios, recursos humanos, finanzas y operaciones de campo.

La regla arquitectónica es mantener tres capas:

1. **Primitivas genéricas:** selección, captura y entrada de valores sin reglas de negocio.
2. **Patrones operativos:** edición de partidas, distribución de montos, pasos y aprobaciones.
3. **Presets de dominio:** configuraciones delgadas como carrito, checkout o recibo; nunca duplican la lógica de las capas anteriores.

## Fases

| Fase | Estado | Entregables | Resultado reutilizable |
| --- | --- | --- | --- |
| 1. Selección de entidades | Completada | `NItemPicker<T>` | Buscar, agrupar, presentar y seleccionar productos, servicios, personas, archivos o activos. |
| 2. Edición de partidas | Siguiente | `NLineItemEditor<TItem, TLine>` | Construir cotizaciones, pedidos, facturas, requisiciones, presupuestos y carritos. |
| 3. Valores y distribución | Pendiente | `NAmountInput`, `NAmountAllocator<TMethod>` | Capturar cantidades y distribuir totales entre pagos, presupuestos, centros de costo o comisiones. |
| 4. Flujos y decisiones | Pendiente | `NStepFlow<TState>`, `NApprovalFlow<TRequest>` | Orquestar onboarding, checkout, solicitudes, contratación y autorizaciones. |
| 5. Operación y documentos | Pendiente | `NBalanceSession<TEntry>`, `NAdjustmentEditor<T>`, `NDocumentView<T>` | Turnos, arqueos, conciliaciones, devoluciones, correcciones, órdenes, recibos y reportes. |
| 6. Captura y resiliencia | Pendiente | `NCodeCapture`, `NSyncStatus`, `NOfflineBoundary` | Integrar códigos/QR y comunicar conectividad, cola local y sincronización en aplicaciones móviles o de campo. |
| 7. Presets de dominio | Pendiente | `NCart`, `NCheckout`, `NReceipt` y ejemplo POS | Componer las piezas anteriores para retail sin contaminar el núcleo genérico. |

## Secuencia obligatoria

La siguiente sesión debe comenzar con la **Fase 2: `NLineItemEditor`**. No se desarrollarán presets POS antes de estabilizar las primitivas y patrones de los que dependen.

Cada fase debe entregar conjuntamente:

- API genérica con TypeScript estricto y callbacks de adaptación (`getItemId`, extractores y cálculos inyectados).
- Estado controlado y no controlado cuando exista interacción persistente.
- Slots de composición para contenido y acciones, sin asumir productos, impuestos o monedas.
- `labels` completos, teclado, foco visible, estados vacío/carga/error y soporte responsive.
- Integración con tokens semánticos, permisos cuando corresponda, pruebas, catálogo y documentación.
- Validación mediante `npm run typecheck`, `npm test` y `npm run build`.

## Resultado de la Fase 1

`NItemPicker<T>` recibe cualquier colección y exige únicamente `getItemId` y `getItemLabel`. Admite búsqueda local o remota, texto indexable adicional, agrupación, layouts grid/list, selección simple/múltiple/acción, elementos deshabilitados, slots, estado controlado y navegación por flechas.

El contrato completo está en [NItemPicker](./item-picker.md).
