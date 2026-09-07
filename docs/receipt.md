# NReceipt

`NReceipt<TReceipt, TLine>` es un preset imprimible construido sobre `NDocumentView`. Adapta un comprobante propio a encabezado, fecha, estado, partidas y totales sin modificar su modelo.

## Uso

```tsx
<NReceipt
  receipt={receipt}
  getReceiptId={(value) => value.id}
  getReceiptNumber={(value) => value.folio}
  getReceiptDate={(value) => value.createdAt}
  getLines={(value) => value.lines}
  getLineId={(line) => line.id}
  getLineLabel={(line) => line.description}
  getLineQuantity={(line) => line.quantity}
  getLineUnitAmount={(line) => line.unitPrice}
  getLineTotal={(line) => line.total}
  getSummaryRows={(value) => value.summary}
  getTotal={(value) => value.total}
  showPrint
/>
```

## Adaptación

- Los extractores reciben los modelos originales del consumidor; no se exige transformar datos a una interfaz interna.
- Los importes llegan calculados. `NReceipt` únicamente los presenta mediante `formatAmount` o `Intl.NumberFormat`.
- `metadata`, `sections`, `beforeLines`, `afterLines`, `renderReceiptHeader` y `renderReceiptFooter` amplían la composición.
- Acciones, impresión, estados de carga/error/vacío y variantes `paper`/`plain` se heredan de `NDocumentView`.
- Para rollos de 58/80 mm, aislamiento del ticket o adaptadores ESC/POS/locales, conecta `onPrint` con [`NThermalPrint`](./thermal-print.md).
- `documentLabels` traduce el visor base y `labels` los textos del preset.

Las partidas usan lista semántica y cambian de columnas a una distribución compacta en móvil. El documento no genera folios, firma contenido, emite comprobantes fiscales ni garantiza integridad; esas responsabilidades corresponden al backend.

`NReceipt` hereda `unstyled`, `classNames` y `styles` de la capa documental y agrega los slots `lines`, `line`, `lineLabel`, `summary` y `total`. Consulta [Personalización compatible](./customization.md).
