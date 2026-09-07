# NAmountAllocator

`NAmountAllocator<TMethod>` distribuye un total entre cualquier colección tipada. Un método puede representar un pago, presupuesto, centro de costo, comisión, persona, cuenta o recurso; el componente sólo conoce su identidad, etiqueta y valor asignado.

## Uso

```tsx
import { NAmountAllocator, type NAmountAllocation } from "nissi-ui"

const [allocations, setAllocations] = useState<NAmountAllocation<CostCenter>[]>([])

<NAmountAllocator
  total={budget}
  methods={costCenters}
  getMethodId={(center) => center.id}
  getMethodLabel={(center) => center.name}
  getMethodDescription={(center) => center.department}
  allocations={allocations}
  onAllocationsChange={(next, summary) => {
    setAllocations([...next])
    setComplete(summary.status === "balanced")
  }}
/>
```

`allocations`/`defaultAllocations` siguen el patrón controlado/no controlado. Cada asignación conserva el objeto `method` completo y su `amount`; no obliga al consumidor a reconstruir entidades desde identificadores.

## Resumen y precisión

El resumen entrega `total`, `allocated`, `remaining` y `status` (`"under"`, `"balanced"` o `"over"`). Toda operación se redondea con `precision` —dos decimales por defecto— y la distribución equitativa reparte las unidades mínimas sobrantes, evitando perder el total por errores como `100 / 3`.

Por defecto no se permite superar el total. `allowOverAllocation` habilita el exceso explícitamente y lo comunica mediante estado visual y callback. `allowNegative` habilita valores negativos cuando el flujo representa ajustes o compensaciones.

## Operaciones

- Cada método puede editarse con `NAmountInput`.
- Al enfocar un importe se presenta un borrador numérico limpio; al salir se restaura moneda, agrupación y precisión. El mismo comportamiento se conserva dentro de `NCheckout` y los presets POS.
- “Restante” suma el saldo disponible al método elegido.
- “Distribuir equitativamente” reparte el total entre métodos habilitados.
- “Reiniciar” lleva métodos editables a cero y conserva los bloqueados.
- `getMethodMin` y `getMethodMax` aplican límites por destino.
- `isMethodDisabled` preserva asignaciones bloqueadas durante acciones globales.
- `validateAllocation` devuelve errores por método usando también el resumen resultante.

`showAssignRemaining`, `showDistributeEvenly` y `showReset` permiten ocultar acciones que no correspondan a una experiencia. `methodLayout="stacked"` mantiene la etiqueta y los controles en filas separadas dentro de paneles laterales o contenedores estrechos. `readOnly` elimina toda mutación conservando resumen y valores.

## Composición

`renderMethodLeading` y `renderMethodTrailing` reciben el método y su estado. `header`, `footer` y `emptyState` permiten integrar el patrón en documentos o formularios. `amountInputProps` personaliza pasos, controles y valores rápidos sin poder reemplazar las invariantes administradas por el asignador.

## API principal

| Prop | Tipo | Predeterminado | Uso |
| --- | --- | --- | --- |
| `total` | `number` | — | Valor objetivo. |
| `methods` | `readonly TMethod[]` | — | Destinos disponibles. |
| `getMethodId` / `getMethodLabel` | adaptadores | — | Identidad estable y nombre accesible. |
| `allocations` / `defaultAllocations` | `NAmountAllocation<TMethod>[]` | `[]` | Estado controlado/no controlado. |
| `onAllocationsChange` | `(allocations, summary, change) => void` | — | Estado siguiente, resumen y causa. |
| `precision` | `number` | `2` | Unidades decimales de cálculo. |
| `formatOptions` | `Intl.NumberFormatOptions` | decimal | Presentación regional de valores. |
| `allowOverAllocation` / `allowNegative` | `boolean` | `false` | Flexibiliza invariantes explícitamente. |
| `methodLayout` | `"responsive" \| "stacked"` | `"responsive"` | Evita comprimir métodos dentro de contenedores estrechos. |
| `getMethodMin` / `getMethodMax` | callbacks | — | Límites por método. |
| `validateAllocation` | callback | — | Error de dominio por asignación. |
| `amountInputProps` | props parciales de `NAmountInput` | — | Apariencia y captura del valor. |
| `labels` | `Partial<NAmountAllocatorLabels>` | español | Estados, acciones y nombres accesibles. |

## Accesibilidad y seguridad

- El resumen responsive expone total, asignado, restante y un progressbar nombrado.
- Los cambios de estado se anuncian mediante `aria-live`.
- Cada spinbutton se nombra con el método correspondiente.
- La colección es una lista semántica y todas las acciones son botones nativos.
- Loading, error y vacío usan regiones `status`/`alert`.
- Las restricciones visuales no sustituyen la validación del backend ni garantizan disponibilidad real de fondos o recursos.
