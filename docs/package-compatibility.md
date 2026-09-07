# Empaquetado, tree shaking y SSR

Nissi UI publica ESM y CommonJS, conserva módulos individuales y mantiene las directivas `"use client"` de los componentes interactivos. La importación raíz continúa siendo compatible:

```ts
import { NReceipt, NThermalPrint } from "nissi-ui"
```

Los componentes estabilizados para personalización también ofrecen subrutas opcionales:

```ts
import { NThemeProvider } from "nissi-ui/theme"
import type { NComponentStyleProps } from "nissi-ui/styling"
import { NPanel } from "nissi-ui/panel"
import { NDocumentView } from "nissi-ui/document-view"
import { NReceipt } from "nissi-ui/receipt"
import { NThermalPrint } from "nissi-ui/thermal-print"
```

## Tree shaking

`sideEffects: false`, ESM, peer dependencies externalizadas y módulos preservados permiten que el bundler consumidor elimine componentes no utilizados. `npm run check:package` construye fixtures desde la raíz y desde una subruta, y falla si una importación de `NThermalPrint` retiene contenido reconocible de tablas, facturación o atajos, o rebasa su presupuesto.

Las exportaciones PDF/Excel continúan usando imports dinámicos. CommonJS se mantiene por compatibilidad, aunque los consumidores que priorizan tree shaking deben usar ESM.

## SSR

Los componentes que usan hooks o APIs del navegador conservan `"use client"` en sus archivos ESM y CommonJS publicados. Las APIs `window`, `document` y `navigator` permanecen en efectos, handlers o funciones invocadas explícitamente.

La verificación de paquete importa la salida ESM en Node sin DOM, ejecuta `renderToString`, comprueba directivas cliente en ambas salidas, valida tipos NodeNext/Bundler e importa las subrutas publicadas.

En Next.js App Router, monta `NThemeProvider` dentro de un componente cliente y conserva `suppressHydrationWarning` en `<html>` por la integración con `next-themes`.

## Portal estático

El catálogo Vite tiene un build separado del paquete:

```bash
npm run docs:dev
npm run docs:build
npm run docs:preview
```

`docs:build` genera `site-dist/`, listo para desplegarse como sitio estático. `NISSI_DOCS_BASE` permite configurar una ruta base distinta de `/` en el proveedor de hosting.
