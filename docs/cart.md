# NCart

`NCart<TItem, TLine>` es un preset de carrito construido sobre `NLineItemEditor`. Coordina selección, edición y un resumen comercial, pero no incorpora reglas fiscales, precios, descuentos ni inventario.

## Uso

```tsx
<NCart
  items={products}
  lines={lines}
  onLinesChange={setLines}
  getItemId={(product) => product.id}
  getItemLabel={(product) => product.name}
  createLine={createCartLine}
  getLineId={(line) => line.id}
  getLineLabel={(line) => line.name}
  getLineAmount={(line) => line.quantity * line.unitPrice}
  calculateSummary={(lines) => pricing.calculate(lines)}
  fields={cartFields}
/>
```

## Composición y estado

- `lines`/`defaultLines` conserva el patrón controlado o no controlado. `onLinesChange` publica `add`, `update`, `remove`, `reorder` o `clear`.
- `cartKey` reinicia el borrador no controlado al comenzar otra operación; en modo controlado el store continúa siendo la fuente de verdad.
- Las props de adaptación, campos, selector, restricciones y estados se delegan a `NLineItemEditor`.
- `getLineAmount` produce el resumen mínimo. `calculateSummary` sustituye el cálculo completo y entrega `subtotal`, filas etiquetadas y `total`.
- `renderSummary` permite sustituir la presentación sin perder el estado del carrito.
- `formatAmount`, `locale` y `formatOptions` controlan la salida; el preset no presupone moneda.

## Límites

El consumidor debe validar precios, existencias, impuestos, promociones, permisos y concurrencia en su dominio y nuevamente en el servidor. Vaciar afecta únicamente el borrador de interfaz; cualquier confirmación adicional debe vivir en la pantalla que compone el preset.

El contenedor y el resumen usan estructura semántica, botones nativos, tokens adaptables y distribución responsive. Los textos propios pertenecen a `NCartLabels`; los del editor se sustituyen mediante `editorLabels`.
