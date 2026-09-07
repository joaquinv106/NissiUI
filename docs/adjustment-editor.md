# NAdjustmentEditor

`NAdjustmentEditor<T>` construye una corrección tipada manteniendo visible el valor original y capturando un motivo auditable. Puede corregir movimientos, reservas, órdenes, incidencias, inventarios o cualquier registro sin modificarlo directamente.

## Uso

```tsx
const fields: NAdjustmentField<Movement>[] = [
  {
    id: "amount",
    label: "Importe",
    inputType: "number",
    getValue: (item) => item.amount,
    setValue: (item, amount) => ({ ...item, amount: Number(amount) }),
  },
]

<NAdjustmentEditor
  item={movement}
  getItemId={(item) => item.id}
  getItemTitle={(item) => item.reference}
  createAdjustment={(item) => ({ ...item })}
  fields={fields}
  onSubmit={(details) => api.createAdjustment(details)}
/>
```

## Contrato operativo

- `createAdjustment` debe devolver un borrador independiente. El componente nunca muta deliberadamente el original.
- Los campos declarativos admiten `text`, `number`, `textarea` y `select`, además de formato, análisis, comparación y validación sustituibles.
- `value`/`onValueChange` y `reason`/`onReasonChange` permiten controlar ambos estados externamente.
- `changedFieldIds` identifica cambios según `Object.is` o `field.isEqual`.
- `requireReason` es `true` por defecto. La validación por campo ocurre antes de `validate` y `onSubmit`.
- `renderOriginal`/`renderEditor` permiten una interfaz especializada con el mismo contexto tipado.
- Cambiar `itemId` reinicia borrador, motivo y errores; respuestas tardías del elemento anterior no afectan al nuevo.

Guardar un ajuste no equivale a sustituir el registro persistido. En dominios auditables, el backend debe crear una reversa, versión o evento de corrección y conservar el original.

## Accesibilidad y responsive

Cada editor usa `Field` de Chakra con etiqueta, ayuda y error. Original y ajustado aparecen lado a lado desde escritorio y apilados en móvil. Los cambios tienen una etiqueta textual además del color; errores generales se anuncian con `role="alert"`. Todos los textos pertenecen a `NAdjustmentEditorLabels`.
