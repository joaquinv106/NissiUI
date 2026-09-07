# NLineItemEditor

`NLineItemEditor<TItem, TLine>` convierte entidades de cualquier catálogo en partidas editables sin imponer un modelo comercial. El consumidor define cómo identificar elementos y líneas, cómo crear una línea y qué campos pueden verse o editarse; por eso sirve para cotizaciones, pedidos, requisiciones, presupuestos, listas de materiales, asignaciones o carritos.

## Uso básico

```tsx
import { NLineItemEditor, type NLineItemField } from "nissi-ui"

type CatalogItem = { id: string; name: string; unitPrice: number }
type DocumentLine = {
  id: string
  itemId: string
  name: string
  quantity: number
  unitPrice: number
}

const fields: NLineItemField<DocumentLine>[] = [
  {
    id: "quantity",
    header: "Cantidad",
    inputType: "number",
    min: 1,
    getValue: (line) => line.quantity,
    setValue: (line, value) => ({ ...line, quantity: Number(value) }),
    validate: (value) => Number(value) > 0 ? undefined : "Ingresa una cantidad mayor que cero.",
  },
  {
    id: "unitPrice",
    header: "Valor unitario",
    getValue: (line) => line.unitPrice,
    formatValue: (value) => formatCurrency(Number(value)),
  },
]

<NLineItemEditor
  items={catalog}
  getItemId={(item) => item.id}
  getItemLabel={(item) => item.name}
  createLine={(item) => ({
    id: crypto.randomUUID(),
    itemId: item.id,
    name: item.name,
    quantity: 1,
    unitPrice: item.unitPrice,
  })}
  getLineId={(line) => line.id}
  getLineLabel={(line) => line.name}
  fields={fields}
  lines={lines}
  onLinesChange={(nextLines) => setLines([...nextLines])}
/>
```

El componente no calcula subtotales, impuestos, existencias ni monedas. Esas reglas permanecen en adaptadores como `createLine`, `setValue`, `formatValue` o en el estado del consumidor.

## Estado y cambios

`lines` convierte al consumidor en la fuente de verdad. `defaultLines` habilita estado local. `onLinesChange` funciona en ambos modos y recibe el estado siguiente junto con `reason` (`"add"`, `"update"`, `"remove"` o `"reorder"`), la línea, el elemento, el campo y los índices aplicables.

## Campos configurables

Cada `NLineItemField<TLine>` declara un `id`, encabezado y extractor `getValue`. Si incluye `setValue`, se vuelve editable; sin ese adaptador se presenta como sólo lectura.

- `inputType="text" | "number" | "select"` cubre edición común.
- `options` configura un select nativo accesible.
- `parseValue` adapta el valor crudo antes de llamar a `setValue`.
- `formatValue` controla la presentación de campos de sólo lectura.
- `validate` devuelve el texto de error del dominio.
- `render` sustituye el campo completo y recibe `updateValue` y `updateLine`.
- `width` y `align` ajustan la columna en escritorio; en móvil cada campo conserva su etiqueta.

Los textos de `header`, `placeholder`, opciones y errores pertenecen a la configuración del consumidor porque describen su dominio. Los textos propios del componente viven en `NLineItemEditorLabels`.

## Altas y duplicados

El selector integrado reutiliza `NItemPicker` en modo de acción directa. `pickerProps` expone búsqueda, agrupación, layouts, contenido personalizado y búsqueda remota sin duplicar ese contrato.

Por defecto cada activación agrega la línea creada al final. `resolveAdd` permite fusionar, reemplazar o rechazar duplicados:

```tsx
<NLineItemEditor
  resolveAdd={({ line, lines }) => {
    const existing = lines.find((current) => current.itemId === line.itemId)
    if (!existing) return [...lines, line]
    return lines.map((current) => current.id === existing.id
      ? { ...current, quantity: current.quantity + 1 }
      : current)
  }}
  {...props}
/>
```

`isItemDisabled(item, lines)` permite desactivar opciones según el documento actual.

## Composición y restricciones

- `renderLineLeading` agrega avatar, icono o miniatura.
- `renderLineActions` incorpora acciones propias junto a mover y eliminar.
- `header`, `footer` y `emptyState` son slots completos.
- `canRemoveLine`, `canReorderLine`, `isLineDisabled`, `removable` y `reorderable` controlan operaciones por línea.
- `readOnly` conserva la presentación y elimina altas, edición y acciones destructivas.
- `pickerOpen`/`defaultPickerOpen` y `onPickerOpenChange` siguen el patrón controlado/no controlado.
- `loading` y `error` comunican estados asíncronos; `error` admite contenido del consumidor.

Las restricciones visuales no sustituyen la autorización del backend. El consumidor debe validar permisos y reglas de negocio al persistir.

## API principal

| Prop | Tipo | Predeterminado | Uso |
| --- | --- | --- | --- |
| `items` | `readonly TItem[]` | — | Entidades disponibles en el selector. |
| `getItemId` / `getItemLabel` | adaptadores | — | Identidad y nombre accesible del catálogo. |
| `createLine` | `(item, { lines }) => TLine` | — | Traduce una entidad a la línea del consumidor. |
| `getLineId` / `getLineLabel` | adaptadores | — | Identidad estable y nombre de cada partida. |
| `fields` | `readonly NLineItemField<TLine>[]` | `[]` | Columnas visibles/editables. |
| `lines` / `defaultLines` | `readonly TLine[]` | `[]` | Estado controlado/no controlado. |
| `onLinesChange` | `(lines, change) => void` | — | Publica el siguiente estado y la causa. |
| `resolveAdd` | reducer de alta | agregar al final | Fusiona, reemplaza o rechaza duplicados. |
| `pickerProps` | props parciales de `NItemPicker` | — | Configura búsqueda y presentación del catálogo. |
| `reorderable` / `removable` | `boolean` | `true` | Habilita acciones de orden y eliminación. |
| `readOnly` / `disabled` | `boolean` | `false` | Restringe interacción conservando contenido. |
| `loading` / `error` | estado | `false` / — | Estados asíncronos accesibles. |
| `labels` | `Partial<NLineItemEditorLabels>` | español | i18n y nombres accesibles. |

## Accesibilidad y responsive

- La colección es una lista semántica; cada partida puede recibir foco después de altas, movimientos o eliminaciones.
- Los campos usan controles nativos con nombres compuestos por encabezado y línea.
- Mover y eliminar son botones con nombres accesibles provistos por `labels`.
- El selector comunica `aria-expanded`/`aria-controls` y conserva la navegación de teclado de `NItemPicker`.
- Carga, vacío, errores y validación se anuncian con regiones `status` o `alert`.
- En móvil cada partida se apila con etiquetas visibles; desde `md` comparte columnas alineadas sin duplicar controles interactivos.
- Superficies, bordes, foco y paleta usan tokens semánticos compatibles con los cuatro temas de Nissi UI.
