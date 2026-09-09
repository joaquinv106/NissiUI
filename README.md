# Nissi UI

<img src="./docs/assets/nissi-mark.png" alt="Logo de Nissi UI" width="112" />

**The React UI foundation for modular products.**

Librería de componentes React reutilizables construidos sobre Chakra UI v3.

Creada y desarrollada por **Lic. Informática Joaquin Villegas Chavez**.

## Requisitos

- Node.js 20.19 o posterior
- React 18 o 19
- Chakra UI 3
- next-themes 0.4 o posterior

## Desarrollo local

```bash
npm install
npm run dev
```

El catálogo también puede generarse como portal estático:

```bash
npm run docs:build
npm run docs:preview
```

En Windows PowerShell, si la política de ejecución bloquea `npm.ps1`, usa `npm.cmd install` y `npm.cmd run dev`.

## Inicio inmediato con React + Vite

```bash
npm create vite@latest mi-aplicacion -- --template react-ts
cd mi-aplicacion
npm install
npm install nissi-ui @chakra-ui/react @emotion/react next-themes
```

En `src/main.tsx`, instala el proveedor una sola vez:

```tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { NThemeProvider } from "nissi-ui"
import App from "./App"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NThemeProvider defaultTheme="system">
      <App />
    </NThemeProvider>
  </StrictMode>,
)
```

Después cualquier componente se importa desde la raíz del paquete:

```tsx
import { NDataTable, NPageHeader } from "nissi-ui"
```

## Scripts

- `npm run dev`: abre el entorno visual de desarrollo.
- `npm run typecheck`: valida TypeScript.
- `npm test`: ejecuta las pruebas una vez.
- `npm run build`: genera ESM, CommonJS y declaraciones TypeScript en `dist`.
- `npm run check:package`: valida la API compilada desde consumidores ESM, CommonJS y TypeScript NodeNext.
- `npm run pack:check`: muestra exactamente qué se incluirá en el paquete npm.

## Uso en otro proyecto

```bash
npm install nissi-ui @chakra-ui/react @emotion/react next-themes
```

La aplicación consumidora debe envolver su árbol una sola vez con `NThemeProvider`. Este instala Chakra UI y sincroniza los temas claro, oscuro, azul marino, Nissi Dark y del sistema:

```tsx
import { NTheme, NThemeProvider } from "nissi-ui"

export function AppProvider({ children }: { children: React.ReactNode }) {
  return <NThemeProvider defaultTheme="system">{children}</NThemeProvider>
}

// En el header o en una pantalla de preferencias:
<NTheme presentation="icon" />
```

Los componentes usan tokens semánticos y responden automáticamente al proveedor. Consulta la [guía de NTheme](./docs/theme.md) para estado controlado, traducciones e integración con `NHeader`.

Cada componente público deberá exportarse desde `src/index.ts` y acompañarse de sus pruebas.

## Componentes públicos

- `NTable` (`Ntable` como alias): tabla general y de presentación.
- `NDataTable` (`Ndatatable` como alias): búsqueda, filtros, ordenamiento, selección, acciones, edición y exportación.
- `NSidebar`: navegación lateral responsive con grupos, búsqueda, badges y estado colapsado.
- `NAppShell`: composición responsive de header, sidebar, contenido y footer.
- `Nlayout`: layout de aplicación con `NSidebar`, `NHeader`, encabezado de página, breadcrumbs y selector de tema integrados.
- `Nroutes`: router SPA progresivo con location completa, rutas anidadas, ranking, permisos, guards, loaders cancelables, boundaries, `NLink`, prefetch y adaptadores externos.
- `NModuleRegistry`: catálogo de microsistemas contratados y autorizados.
- `NWorkspaceSwitcher`: selector de organización, tenant, sucursal o proyecto.
- `NItemPicker<T>`: selección buscable y agrupable de productos, servicios, personas, archivos o activos.
- `NLineItemEditor<TItem, TLine>`: edición adaptable de partidas para documentos y flujos operativos de cualquier sector.
- `NAmountInput`: captura neutral de cantidades, importes, porcentajes o unidades con formato internacional.
- `NAmountAllocator<TMethod>`: distribución precisa de un total entre métodos o destinos tipados.
- `NStepFlow<TState>`: flujos de varios pasos con borrador tipado, validación y finalización asíncrona.
- `NApprovalFlow<TRequest>`: decisiones y trazabilidad adaptables para solicitudes de cualquier sector.
- `NBalanceSession<TEntry>`: balance de sesiones, movimientos, conteos y diferencias con cierre asíncrono.
- `NAdjustmentEditor<T>`: correcciones tipadas con comparación del original y motivo auditable.
- `NDocumentView<TDocument>`: documentos adaptables con metadatos, secciones, acciones e impresión.
- `NCodeCapture`: captura profesional desde teclado/HID, cámara o handheld mediante adaptadores cancelables, sesiones continuas, metadatos e interpretación tipada.
- `NSyncStatus`: estado controlado de sincronización, cola, errores y reintentos.
- `NOfflineBoundary`: continuidad o fallback ante conectividad intermitente.
- `NCart<TItem, TLine>`: preset de carrito sobre el editor genérico de partidas.
- `NCheckout<TMethod>`: distribución y confirmación asíncrona de una operación.
- `NReceipt<TReceipt, TLine>`: comprobante adaptable e imprimible sobre `NDocumentView`.
- `NPanel`: superficie lateral modal, reactiva y capaz de alternar cualquier componente.
- `NCtrl`: panel flotante responsive y registro contextual de atajos para navegación y operación rápida con teclado.
- `NFacture`: módulo componible de facturación electrónica mexicana con CFDI 4.0, roles, navegación y adaptadores externos.
- `NloginPage`: pantalla de acceso responsive con tema oscuro inicial, selector de tema integrado y formulario `NauthLogin`.
- Nauth: `NauthLayout`, `NauthLogin`, registro, recuperación, OTP y primitivas visuales desacopladas del backend.
- Patrones de página: `NPageHeader`, `NBreadcrumbs`, `NAsyncState`, `NEmptyState` y `NConfirmDialog`.
- Datos escalables: `NDataTable` server-side, `NFilterBar`, `NDateRangePicker`, `NDescriptionList` y `NDetailPanel`.
- Actividad y dashboards: `NFileUpload`, `NActivityTimeline`, `NNotificationCenter`, `NStatCard`, `NDashboardGrid` y `NChartFrame`.
- Administración y verticales: `NSubscriptionGate`, `NPlanComparison`, `NAuditLog`, `NImpersonationBanner`, `NKanban`, `NScheduler` y `NMapView`.

Consulta [el catálogo técnico](./docs/README.md), [la guía de accesibilidad desde cero](./docs/accessibility.md), [personalización compatible](./docs/customization.md), [empaquetado y SSR](./docs/package-compatibility.md), [la identidad visual](./docs/brand.md), [la guía completa de tablas](./docs/tables.md), el [roadmap por fases](./docs/roadmap.md), el [proyecto prioritario de flujos generalizables](./docs/generalized-workflows-roadmap.md) y la [auditoría del Router SPA profesional](./docs/future-professional-spa-router.md) para ver contratos, ejemplos y decisiones.

Los asistentes y agentes de IA deben comenzar por [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md), que concentra el objetivo, la arquitectura, las convenciones y las rutas relevantes del proyecto.

Para integrar el paquete desde otra aplicación o generar código con cualquier asistente de IA, entrega también [`AI_CONTEXT.md`](./AI_CONTEXT.md). El archivo [`llms.txt`](./llms.txt) funciona como índice breve y descubrible de ese contexto.

## Autor

**Lic. Informática Joaquin Villegas Chavez** — creador y desarrollador de Nissi UI.

## Publicación

El paquete usa versionado semántico. Para preparar una nueva versión, actualiza el changelog y la versión, valida el contenido del paquete y publícalo con una cuenta autorizada:

```bash
npm login
npm run pack:check
npm publish --access public
```
