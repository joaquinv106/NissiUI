# Nissi UI — contexto para asistentes de IA

Este archivo permite que cualquier asistente de IA integre Nissi UI en aplicaciones React sin asumir reglas de un sector concreto.

## Identidad del paquete

- Paquete npm: `nissi-ui`
- Versión estable actual: `0.2.0`
- Creador y desarrollador: Lic. Informática Joaquin Villegas Chavez
- Repositorio: <https://github.com/joaquinv106/NissiUI>
- Stack consumidor: React 18 o 19, TypeScript recomendado, Chakra UI v3 y Emotion.

## Instalación en React + Vite

```bash
npm install nissi-ui @chakra-ui/react @emotion/react next-themes
```

Envuelve la aplicación una sola vez:

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

La API raíz continúa siendo la opción general:

```tsx
import { NAppShell, NDataTable, NForm, NPanel } from "nissi-ui"
```

No importes rutas `dist/`, `src/` o `internal/`.

Para imports especialmente acotados también existen `nissi-ui/theme`, `nissi-ui/styling`, `nissi-ui/panel`, `nissi-ui/document-view`, `nissi-ui/receipt`, `nissi-ui/thermal-print`, `nissi-ui/auth`, `nissi-ui/layout` y `nissi-ui/routes`. Estas subrutas son públicas; cualquier otra ruta interna sigue fuera del contrato.

`NPanel`, `NDocumentView`, `NReceipt` y `NThermalPrint` aceptan opcionalmente `unstyled`, `classNames` y `styles`. Sin esas props conservan exactamente la apariencia predeterminada. `NThemeProvider.system` permite entregar un sistema Chakra v3 propio y usa `nissiSystem` por defecto.

## Modelo de integración

Nissi UI no realiza solicitudes HTTP ni contiene reglas de negocio. La aplicación obtiene datos mediante REST, GraphQL, RPC, Firebase, Supabase u otro origen y los entrega como props. Los componentes comunican las acciones mediante callbacks.

```text
API → hook/store/página → props Nissi UI → callbacks → estado/API
```

Prefiere estado controlado cuando varios componentes comparten la información:

```tsx
import { useState } from "react"
import { NCheckout, type NAmountAllocation } from "nissi-ui"

type PaymentMethod = { id: string; name: string }

export function PaymentPanel({ total, methods }: { total: number; methods: PaymentMethod[] }) {
  const [allocations, setAllocations] = useState<NAmountAllocation<PaymentMethod>[]>([])

  return (
    <NCheckout
      total={total}
      methods={methods}
      allocations={allocations}
      onAllocationsChange={(next) => setAllocations([...next])}
      getMethodId={(method) => method.id}
      getMethodLabel={(method) => method.name}
      onComplete={(details) => api.createPayment(details)}
    />
  )
}
```

## Familias disponibles

- Plataforma: `NAppShell`, `Nlayout`, `Nroutes`, `NHeader`, `NSidebar`, `NModuleRegistry`, `NWorkspaceSwitcher`, `NThemeProvider`. `Nlayout` integra el shell completo y `Nroutes` ofrece rutas planas o anidadas, guards, loaders paralelos con dependencias explícitas, permisos, History API, hash, memoria y adaptadores para routers externos.
- Acceso: `NPermissionsProvider`, `NPermissionGate`, `useCanAccess`, `NSubscriptionGate`.
- Autenticación visual: `NloginPage` como pantalla autónoma con tema oscuro inicial y selector, además de `NauthLogin`, `NauthRegister`, recuperación, OTP y primitivas. La aplicación conserva sesión, OAuth y validación definitiva.
- Formularios y selección: `NForm`, `NItemPicker`, `NAmountInput`, `NCodeCapture`, `NDateRangePicker`, `NFileUpload`.
- `NCodeCapture` integra lectores HID, cámaras y handhelds mediante `scannerAdapter`; la decodificación y los permisos permanecen en el SDK consumidor, mientras el componente aporta sesiones, cola, estados y `parse` tipado.
- Datos: `NTable`, `NDataTable`, `NFilterBar`, `NDescriptionList`, `NDetailPanel`.
- Operación: `NLineItemEditor`, `NAmountAllocator`, `NStepFlow`, `NApprovalFlow`, `NBalanceSession`, `NAdjustmentEditor`.
- Comercio: `NCart`, `NCheckout`, `NReceipt`, `NDocumentView`, `NThermalPrint`.
- `NThermalPrint` aísla contenido para rollos de 58/80 mm; usa `window.print()` por defecto y permite inyectar un `adapter` para puentes locales, ESC/POS o aplicaciones de escritorio. Corte, copias y cajón son responsabilidad de ese adaptador.
- Estados y productividad: `NAsyncState`, `NEmptyState`, `NConfirmDialog`, `NPanel`, `NCtrl`, `NSyncStatus`, `NOfflineBoundary`.
- Actividad: `NActivityTimeline`, `NNotificationCenter`, `NAuditLog`, `NImpersonationBanner`.
- Dashboards: `NStatCard`, `NDashboardGrid`, `NDashboardGridItem`, `NChartFrame`.
- Verticales: `NKanban`, `NScheduler`, `NMapView`.
- Proyecto fiscal: `NFacture`, `NissiInvoicingProvider`, `createNFactureNavigation` para sidebar y `createNFactureHeaderNavigation` para header; toda validación y operación fiscal definitiva vive en backend/PAC.

La documentación detallada vive en `docs/README.md` dentro del paquete y del repositorio.

## Router SPA profesional

`Nroutes` y `Nlayout` ofrecen navegación SPA jerárquica con location completa, rutas anidadas, ranking, branch diff, guards, loaders cancelables paralelos, permisos, error boundaries, `NLink`, hooks y prefetch. Las rutas planas, `useNroutes()` y `createLinkProps()` permanecen compatibles. `NRouterAdapter` permite que Next.js u otro framework conserve el control de la URL; no deben operar dos routers sobre History API al mismo tiempo. La referencia completa está en `docs/layout-routes.md` y el orden de ejecución en `docs/nroutes-navigation-lifecycle.md`.

`docs/nroutes-v3-plan.md` gobierna la evolución futura por fases. Branch diff, scheduling paralelo, route cache, módulos lazy, routing tipado, search codecs y navigation blockers ya están implementados. `defineNroutes()` y `useNTypedNroutes(routes)` validan ids, params y search para navigate, href y prefetch sin retirar strings o `URLSearchParams`; `createNRouteSearchHook(schema)` ofrece lectura inferida. `useNBlocker(condition)` intercepta enlaces, push/replace y traversal con decisiones `proceed/reset`; puede componerse con `NConfirmDialog` y complementarse con `beforeunload`. El manifest eager conserva rutas y permisos; el módulo lazy aporta UI y lifecycle. `useNroutes()` permite invalidar datos, revalidar y reintentar chunks. No asumas que actions, outlets nombrados o DevTools ya forman parte de la API publicada: el plan registra esas capacidades como pendientes hasta que existan implementación y pruebas.

## Reglas para generar código con IA

1. Usa exclusivamente exportaciones públicas desde `nissi-ui`.
2. Mantén los datos y reglas en la aplicación; no modifiques el paquete dentro de `node_modules`.
3. Usa adaptadores estables como `getItemId`, `getRowId`, `getMethodId` y `getLineId`.
4. Usa estado controlado para datos compartidos y modo no controlado sólo para borradores locales aislados.
5. Traduce textos internos mediante la prop `labels`; el español es el valor predeterminado.
6. Conserva números como `number | null`; no persistas cadenas monetarias formateadas.
7. Entrega fechas de API en un formato inequívoco y define la zona horaria en la capa de aplicación.
8. Representa carga, error y vacío mediante `NAsyncState` o las props equivalentes del componente.
9. `NDataTable.server` recibe la página actual y publica cambios de consulta; el backend conserva el filtrado y total reales.
10. Revalida autenticación, tenant, permisos, suscripciones, importes e idempotencia en el backend.
11. `NOfflineBoundary` y `NSyncStatus` comunican estado; IndexedDB/SQLite y el motor de sincronización pertenecen a la aplicación.
12. Los `renderer` de `NChartFrame` y `NMapView` permiten conectar motores externos sin volverlos dependencias obligatorias.
13. Personaliza slots mediante `classNames`/`styles`; no dependas de clases hash de Chakra ni importes `internal/`.

## Arquitectura recomendada

```text
Nissi UI
  └─ Pantallas y flujos de la aplicación
      └─ hooks / store / caché de consultas
          └─ API con autenticación y autorización
              └─ base de datos e integraciones externas
```

Para aplicaciones offline, usa IndexedDB en PWA o SQLite en escritorio/móvil y sincroniza con una base central, normalmente PostgreSQL. Usa identificadores generados en cliente, control de versiones e idempotencia para evitar duplicados.

## Desarrollo de la propia librería

Si la tarea consiste en contribuir al repositorio, lee primero `AGENTS.md` y `PROJECT_CONTEXT.md`. Mantén Chakra UI v3, TypeScript estricto, tokens semánticos, accesibilidad, responsive e internacionalización. Actualiza implementación, tipos, pruebas, catálogo y documentación en conjunto. Valida con:

```bash
npm run typecheck
npm test
npm run build
```

## Prompt inicial sugerido

```text
Construye esta pantalla con React, TypeScript y Nissi UI. Lee AI_CONTEXT.md y la documentación del componente. Usa estado controlado para los datos recibidos de la API, identificadores estables, labels para traducción y NAsyncState para carga/error/vacío. Mantén las reglas de negocio, seguridad y persistencia fuera de los componentes UI.
```
