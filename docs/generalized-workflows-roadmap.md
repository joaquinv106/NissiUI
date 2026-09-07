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
| 2. Edición de partidas | Completada | `NLineItemEditor<TItem, TLine>` | Construir cotizaciones, pedidos, facturas, requisiciones, presupuestos y carritos. |
| 3. Valores y distribución | Completada | `NAmountInput`, `NAmountAllocator<TMethod>` | Capturar cantidades y distribuir totales entre pagos, presupuestos, centros de costo o comisiones. |
| 4. Flujos y decisiones | Completada | `NStepFlow<TState>`, `NApprovalFlow<TRequest>` | Orquestar onboarding, checkout, solicitudes, contratación y autorizaciones. |
| 5. Operación y documentos | Completada | `NBalanceSession<TEntry>`, `NAdjustmentEditor<T>`, `NDocumentView<T>` | Turnos, arqueos, conciliaciones, devoluciones, correcciones, órdenes, recibos y reportes. |
| 6. Captura y resiliencia | Completada | `NCodeCapture`, `NSyncStatus`, `NOfflineBoundary` | Integrar códigos/QR y comunicar conectividad, cola local y sincronización en aplicaciones móviles o de campo. |
| 7. Presets de dominio | Completada | `NCart`, `NCheckout`, `NReceipt` y ejemplo POS | Componer las piezas anteriores para retail sin contaminar el núcleo genérico. |

## Secuencia obligatoria

Las siete fases están completadas. Cualquier preset nuevo debe continuar como una composición delgada sobre las primitivas y patrones estabilizados; no duplicará sus reglas. La siguiente prioridad general vuelve a [roadmap.md](./roadmap.md).

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

## Resultado de la Fase 2

`NLineItemEditor<TItem, TLine>` combina el catálogo genérico con partidas controladas o no controladas. Los adaptadores `createLine`, `getLineId`, `getLineLabel` y `NLineItemField<TLine>` mantienen el modelo del consumidor, mientras `resolveAdd` define duplicados o fusiones sin reglas comerciales internas. Incluye edición, validación, reordenamiento, eliminación, slots, estados asíncronos y presentación responsive accesible.

El contrato completo está en [NLineItemEditor](./line-item-editor.md).

## Resultado de la Fase 3

`NAmountInput` captura números controlados o no controlados con límites, pasos, formatos internacionales, controles incrementales, estados de formulario y valores rápidos. `NAmountAllocator<TMethod>` compone esa primitiva para distribuir un total con precisión configurable, resumen, saldo restante, reparto equitativo sin pérdida por redondeo, restricciones por método y estados controlado/no controlado.

Los contratos completos están en [NAmountInput](./amount-input.md) y [NAmountAllocator](./amount-allocator.md).

## Resultado de la Fase 4

`NStepFlow<TState>` orquesta borradores tipados con navegación controlada o no controlada, validación síncrona/asíncrona, pasos opcionales o deshabilitados, acciones sustituibles y finalización protegida contra envíos duplicados. `NApprovalFlow<TRequest>` adapta cualquier solicitud, publica decisiones asíncronas, exige comentarios según la acción, muestra historial y evita que respuestas tardías modifiquen una solicitud distinta.

Los contratos completos están en [NStepFlow](./step-flow.md) y [NApprovalFlow](./approval-flow.md).

## Resultado de la Fase 5

`NBalanceSession<TEntry>` calcula expectativa, valor observado y diferencia para cualquier sesión medible, con tolerancia, detalle y cierre asíncrono. `NAdjustmentEditor<T>` conserva el original mientras construye una corrección tipada y motivada. `NDocumentView<TDocument>` presenta metadatos, secciones y acciones asíncronas en una superficie responsive e imprimible.

Los contratos completos están en [NBalanceSession](./balance-session.md), [NAdjustmentEditor](./adjustment-editor.md) y [NDocumentView](./document-view.md).

## Resultado de la Fase 6

`NCodeCapture` procesa identificadores desde teclado, pegado o proveedores externos con normalización, validación, control de duplicados y confirmación asíncrona. `NSyncStatus` representa exclusivamente el estado entregado por un motor real, con pendientes, fecha, detalles y recuperación. `NOfflineBoundary` conserva contenido o aplica fallback y permite comprobar conectividad sin confundir `navigator.onLine` con disponibilidad del servidor.

Los contratos completos están en [NCodeCapture](./code-capture.md), [NSyncStatus](./sync-status.md) y [NOfflineBoundary](./offline-boundary.md).

## Resultado de la Fase 7

`NCart<TItem, TLine>` compone `NLineItemEditor` con un resumen comercial inyectado. `NCheckout<TMethod>` compone `NAmountAllocator` con validación y confirmación asíncrona. `NReceipt<TReceipt, TLine>` adapta comprobantes mediante `NDocumentView`. El ejemplo POS integra además captura, conectividad y sincronización para demostrar interoperabilidad sin introducir una fuente de datos ficticia en la librería.

Los contratos están en [NCart](./cart.md), [NCheckout](./checkout.md), [NReceipt](./receipt.md) y [Ejemplo POS integrado](./pos-example.md).
