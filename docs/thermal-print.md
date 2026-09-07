# NThermalPrint

`NThermalPrint` aísla un fragmento de la interfaz y lo prepara para imprimir en rollos térmicos. No presupone recibos ni una marca de impresora: puede envolver `NReceipt`, `NDocumentView` o cualquier contenido React.

## Impresión desde el navegador

El modo predeterminado clona el contenido en un host temporal, oculta el resto de la aplicación durante `@media print`, configura el ancho y ejecuta `window.print()`. El host y el título temporal se eliminan al terminar.

```tsx
import { NReceipt, NThermalPrint } from "nissi-ui"

export function SaleReceipt() {
  return (
    <NThermalPrint showTrigger={false} paperWidthMm={80} marginMm={3} documentTitle="Ticket V-2048">
      {({ print, printing }) => (
        <NReceipt
          receipt={receipt}
          {...receiptAdapters}
          showPrint
          disabled={printing}
          onPrint={() => { void print() }}
        />
      )}
    </NThermalPrint>
  )
}
```

Cuando se reutiliza el botón de `NReceipt` o `NDocumentView`, usa `showTrigger={false}` en `NThermalPrint` para no presentar dos acciones:

```tsx
<NThermalPrint showTrigger={false} paperWidthMm={58}>
  {({ print, printing }) => (
    <NDocumentView
      {...documentProps}
      showPrint
      disabled={printing}
      onPrint={() => { void print() }}
    />
  )}
</NThermalPrint>
```

La configuración predeterminada es un rollo de `80 mm`, margen de `3 mm`, contenido de `74 mm` y tipografía monoespaciada de `9 pt`. Para un rollo de `58 mm`, el ancho disponible predeterminado es `52 mm`. Los valores inválidos se normalizan y `contentWidthMm` nunca rebasa el área disponible.

## Adaptadores de impresora

`adapter` sustituye a `window.print()` y recibe el elemento original, una copia imprimible, HTML serializado, el título y la configuración resuelta. Esto permite integrar QZ Tray, Electron, Tauri, un puente nativo o un servicio local sin agregar esas dependencias a Nissi UI.

```tsx
import type { NThermalPrintAdapter } from "nissi-ui"

const posAdapter: NThermalPrintAdapter = async ({ html, configuration }) => {
  await localPrinter.print({
    html,
    copies: configuration.job.copies,
    cut: configuration.job.cut,
    openCashDrawer: configuration.job.openCashDrawer,
  })
}

<NThermalPrint
  adapter={posAdapter}
  job={{ copies: 1, cut: "partial", openCashDrawer: true }}
>
  <NReceipt receipt={receipt} {...receiptAdapters} />
</NThermalPrint>
```

`copies`, `cut` y `openCashDrawer` son instrucciones para el adaptador; el diálogo del navegador no las ejecuta por sí mismo. La aplicación o puente local debe validar capacidades, permisos y disponibilidad de la impresora. Los navegadores no ofrecen impresión silenciosa portátil por motivos de seguridad.

## API principal

| Prop | Tipo | Predeterminado | Propósito |
| --- | --- | --- | --- |
| `children` | `ReactNode \| (context) => ReactNode` | requerida | Contenido objetivo; el contexto expone `print`, `printing`, `error` y `clearError`. |
| `paperWidthMm` | `58 \| 80 \| number` | `80` | Ancho físico del rollo. |
| `contentWidthMm` | `number` | ancho menos márgenes | Ancho máximo del contenido. |
| `marginMm` | `number` | `3` | Margen uniforme solicitado a `@page`. |
| `fontSizePt` | `number` | `9` | Tamaño base del host imprimible. |
| `fontFamily` | `string` | monoespaciada del sistema | Familia base del ticket. |
| `printBackground` | `boolean` | `false` | Solicita conservar fondos y colores. |
| `adapter` | `NThermalPrintAdapter` | `window.print` | Transporte de impresión sustituible. |
| `job` | `NThermalPrintJob` | una copia, sin corte/cajón | Capacidades solicitadas al adaptador. |
| `showTrigger` | `boolean` | `true` | Presenta el botón propio de impresión. |
| `labels` | `Partial<NThermalPrintLabels>` | español | Traduce acción, espera y error. |
| `unstyled` | `boolean` | `false` | Retira decoración del disparador y error sin cambiar la impresión. |
| `classNames` / `styles` | slots tipados | — | Personaliza `root`, `trigger`, `error` y `source`. |

Una referencia `NThermalPrintHandle` también expone `print()` para controles externos. `onBeforePrint`, `onAfterPrint` y `onPrintError` permiten telemetría o preparación adicional.

## Accesibilidad y límites

El disparador es un botón nativo, comunica el estado ocupado y el error usa `role="alert"`. Los controles propios llevan `data-nissi-print-hidden`; un consumidor puede usar el mismo atributo para excluir acciones adicionales.

La copia conserva valores actuales de `input`, `textarea` y `select`, y transforma `canvas` serializables en imágenes. Un canvas contaminado por recursos cross-origin no puede serializarse. El tamaño final, encabezados, pies y longitud del rollo todavía dependen del navegador, controlador y configuración física de la impresora.
