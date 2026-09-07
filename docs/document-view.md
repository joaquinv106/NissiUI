# NDocumentView

`NDocumentView<TDocument>` presenta órdenes, recibos, informes, expedientes o comprobantes mediante adaptadores tipados. Estandariza encabezado, metadatos, secciones, estado, acciones e impresión sin fijar un modelo documental.

## Uso

```tsx
<NDocumentView
  document={order}
  getDocumentId={(document) => document.id}
  getDocumentTitle={(document) => document.title}
  getDocumentSubtitle={(document) => document.folio}
  fields={metadata}
  sections={sections}
  actions={actions}
  showPrint
/>
```

## Composición

- `fields` genera una lista semántica `dl/dt/dd` de metadatos con una a tres columnas.
- `sections` divide el documento en regiones tituladas y delega su contenido al consumidor.
- `renderHeader`, `renderBody` y `renderFooter` sustituyen áreas completas con un contexto que contiene documento, identidad y estado asíncrono.
- `variant="paper"` ofrece una superficie preparada para impresión; `plain` se integra dentro de otro contenedor.
- `showPrint` usa `onPrint` o `window.print()` sólo al activar el botón en cliente.

## Acciones

Cada `NDocumentAction<TDocument>` define etiqueta, icono, variante, paleta y `onAction`. Las acciones bloquean envíos duplicados y admiten resultados `{ success, message }`. `canPerformAction` es una restricción visual; el servidor debe revalidar permisos. Al cambiar `documentId`, cualquier respuesta pendiente del documento anterior se descarta.

## Accesibilidad y responsive

El documento usa `article` nombrado por su título, metadatos semánticos y secciones con encabezados. Acciones se apilan en móvil y se ocultan al imprimir. Carga, error y vacío tienen regiones anunciables; todos los textos internos pertenecen a `NDocumentViewLabels`.
