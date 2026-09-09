# Catálogo técnico de Nissi UI

<img src="./assets/nissi-mark.png" alt="Logo de Nissi UI" width="96" />

**The React UI foundation for modular products.**

Este directorio es la fuente de documentación de los componentes antes de generar el sitio oficial. Cada componente nuevo debe registrar aquí su API pública, ejemplos, accesibilidad, decisiones internas, dependencias y cambios incompatibles.

Para integrar la librería mediante un asistente de IA consulta primero [AI_CONTEXT.md](../AI_CONTEXT.md) y el índice [llms.txt](../llms.txt).
El historial de versiones públicas se mantiene en [CHANGELOG.md](../CHANGELOG.md).

Consulta también [Accesibilidad y personalización desde cero](./accessibility.md), [Personalización compatible](./customization.md) y [Empaquetado, tree shaking y SSR](./package-compatibility.md).

## Componentes

| Componente | Estado | Documentación | Pruebas |
| --- | --- | --- | --- |
| `NTable` / `Ntable` | Fase 1–3 | [Tablas](./tables.md) | `src/index.test.tsx` |
| `NDataTable` / `Ndatatable` | Fase 1–3 | [Tablas](./tables.md) | `src/index.test.tsx` |
| `NSidebar` | Inicial | [Menú lateral](./sidebar.md) | `src/components/sidebar/NSidebar.test.tsx` |
| `NHeader` | Inicial | [Barra superior](./header.md) | `src/components/header/NHeader.test.tsx` |
| `NForm` | Inicial | [Formularios](./forms.md) | `src/components/form/NForm.test.tsx` |
| `NPermissionGate` | Inicial | [Permisos](./permissions.md) | `src/components/permissions/NPermissionGate.test.tsx` |
| `NAppShell` | Plataforma | [Shell de aplicación](./app-shell.md) | `src/components/app-shell/NAppShell.test.tsx` |
| `Nlayout` / `Nroutes` | Plataforma SPA · v3 Fases 1–5 | [Layout y rutas](./layout-routes.md), [arquitectura](./nroutes-architecture.md), [lifecycle](./nroutes-navigation-lifecycle.md), [caché](./nroutes-cache.md), [módulos lazy](./nroutes-route-modules.md), [routing tipado](./nroutes-typed-routing.md) | `src/components/layout/Nlayout.test.tsx`, `src/components/routes/Nroutes.test.tsx` |
| `NModuleRegistry` | Plataforma | [Registro de módulos](./module-registry.md) | `src/components/module-registry/NModuleRegistry.test.tsx` |
| `NWorkspaceSwitcher` | Plataforma | [Selector de workspace](./workspace-switcher.md) | `src/components/workspace-switcher/NWorkspaceSwitcher.test.tsx` |
| `NTheme` / `NThemeProvider` | Fundación visual | [Temas](./theme.md) | `src/components/theme/NTheme.test.tsx` |
| `NItemPicker<T>` | Flujos generalizables · Fase 1 | [Selector de elementos](./item-picker.md) | `src/components/item-picker/NItemPicker.test.tsx` |
| `NLineItemEditor<TItem, TLine>` | Flujos generalizables · Fase 2 | [Editor de partidas](./line-item-editor.md) | `src/components/line-item-editor/NLineItemEditor.test.tsx` |
| `NAmountInput` | Flujos generalizables · Fase 3 | [Entrada de valores](./amount-input.md) | `src/components/amount-input/NAmountInput.test.tsx` |
| `NAmountAllocator<TMethod>` | Flujos generalizables · Fase 3 | [Distribución de valores](./amount-allocator.md) | `src/components/amount-allocator/NAmountAllocator.test.tsx` |
| `NStepFlow<TState>` | Flujos generalizables · Fase 4 | [Flujos por pasos](./step-flow.md) | `src/components/step-flow/NStepFlow.test.tsx` |
| `NApprovalFlow<TRequest>` | Flujos generalizables · Fase 4 | [Flujos de aprobación](./approval-flow.md) | `src/components/approval-flow/NApprovalFlow.test.tsx` |
| `NBalanceSession<TEntry>` | Flujos generalizables · Fase 5 | [Sesiones de balance](./balance-session.md) | `src/components/balance-session/NBalanceSession.test.tsx` |
| `NAdjustmentEditor<T>` | Flujos generalizables · Fase 5 | [Editor de ajustes](./adjustment-editor.md) | `src/components/adjustment-editor/NAdjustmentEditor.test.tsx` |
| `NDocumentView<T>` | Flujos generalizables · Fase 5 | [Vista de documentos](./document-view.md) | `src/components/document-view/NDocumentView.test.tsx` |
| `NCodeCapture` | Flujos generalizables · Fase 6 | [Captura de códigos](./code-capture.md) | `src/components/code-capture/NCodeCapture.test.tsx` |
| `NSyncStatus` | Flujos generalizables · Fase 6 | [Estado de sincronización](./sync-status.md) | `src/components/sync-status/NSyncStatus.test.tsx` |
| `NOfflineBoundary` | Flujos generalizables · Fase 6 | [Conectividad intermitente](./offline-boundary.md) | `src/components/offline-boundary/NOfflineBoundary.test.tsx` |
| `NCart<TItem, TLine>` | Flujos generalizables · Fase 7 | [Carrito](./cart.md) | `src/components/cart/NCart.test.tsx` |
| `NCheckout<TMethod>` | Flujos generalizables · Fase 7 | [Finalización](./checkout.md) | `src/components/checkout/NCheckout.test.tsx` |
| `NReceipt<TReceipt, TLine>` | Flujos generalizables · Fase 7 | [Recibo](./receipt.md) | `src/components/receipt/NReceipt.test.tsx` |
| `NThermalPrint` | Impresión · Complemento | [Impresión térmica](./thermal-print.md) | `src/components/thermal-print/NThermalPrint.test.tsx` |
| Ejemplo POS integrado | Flujos generalizables · Fase 7 | [Integración POS](./pos-example.md) | `src/dev/Phase7Views.test.tsx` |
| `NPanel` | Estados y navegación · Plus | [Panel lateral](./panel.md) | `src/components/panel/NPanel.test.tsx` |
| `NCtrl` | Productividad · Atajos | [Atajos contextuales](./ctrl.md) | `src/components/ctrl/NCtrl.test.tsx` |
| Estados y navegación (`NPageHeader`, `NBreadcrumbs`, `NAsyncState`, `NEmptyState`, `NConfirmDialog`) | Fase final | [Fase final](./final-components.md) | `src/components/page/page.test.tsx` |
| Datos (`NFilterBar`, `NDateRangePicker`, `NDescriptionList`, `NDetailPanel`) | Fase final | [Fase final](./final-components.md) | `src/components/data-patterns/data-patterns.test.tsx` |
| Actividad (`NFileUpload`, `NActivityTimeline`, `NNotificationCenter`) | Fase final | [Fase final](./final-components.md) | `src/components/activity/activity.test.tsx` |
| Dashboard (`NStatCard`, `NDashboardGrid`, `NChartFrame`) | Fase final | [Fase final](./final-components.md) | `src/components/dashboard/dashboard.test.tsx` |
| SaaS (`NSubscriptionGate`, `NPlanComparison`, `NAuditLog`, `NImpersonationBanner`) | Fase final | [Fase final](./final-components.md) | `src/components/saas/saas.test.tsx` |
| Verticales (`NKanban`, `NScheduler`, `NMapView`) | Fase final | [Fase final](./final-components.md) | `src/components/verticals/verticals.test.tsx` |
| `NFacture` | Proyecto vertical · CFDI México | [Facturación electrónica](./facture.md) | `src/components/facture/NFacture.test.tsx` |

| `NloginPage` / Nauth (`NauthLayout`, formularios y primitivas) | Autenticación visual | [Nauth](./auth.md) | `src/components/auth/auth.test.tsx` |

Consulta también el [historial y roadmap por fases](./roadmap.md).

La auditoría y entrega de las cinco fases de [Nissi Router SPA profesional](./future-professional-spa-router.md) documentan la generación vigente. La evolución incremental, cacheable, tipada y observable se gobierna desde el [plan canónico de Nroutes v3](./nroutes-v3-plan.md); la [arquitectura](./nroutes-architecture.md) y el [lifecycle de navegación](./nroutes-navigation-lifecycle.md) describen las fases ya disponibles, mientras las posteriores continúan pendientes hasta contar con implementación y pruebas.

El objetivo prioritario actual y su secuencia están definidos en [Flujos operativos generalizables](./generalized-workflows-roadmap.md).

La marca, el slogan y los recursos gráficos se documentan en [Identidad visual](./brand.md).

## Convenciones para componentes futuros

1. La API pública y sus tipos se exportan desde `src/index.ts`.
2. Los textos visibles deben admitir configuración y tener español como valor predeterminado.
3. Los colores deben usar tokens semánticos compatibles con los temas claro, oscuro, azul marino y Nissi Dark.
4. Cada interacción debe documentar teclado, foco y semántica ARIA.
5. Las dependencias pesadas deben cargarse de forma diferida cuando la funcionalidad sea opcional.
6. Toda corrección de regresión debe incluir una prueba automatizada.
