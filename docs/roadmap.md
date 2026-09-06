# Historial y roadmap de componentes

Este documento registra qué se construyó y qué queda pendiente. Las fases expresan dependencias de producto, no fechas de entrega.

## Historial

| Fecha | Fase | Estado | Resultado |
| --- | --- | --- | --- |
| 2026-09-05 | Fundación | Completada | `NTable`, `NDataTable`, `NSidebar`, `NHeader`, `NForm` y permisos/capacidades. |
| 2026-09-05 | Plataforma modular | Completada | `NAppShell`, `NModuleRegistry` y `NWorkspaceSwitcher`, integrados en la galería. |

## Fases pendientes

| Fase | Componentes/cambio | Para qué sirve |
| --- | --- | --- |
| 2. Estados y navegación de página | `NPageHeader`, `NBreadcrumbs`, `NAsyncState`, `NEmptyState`, `NConfirmDialog` | Estandarizar títulos, contexto, carga, errores, vacíos y confirmaciones en todos los microsistemas. |
| 3. Datos server-side | Evolucionar `NDataTable`; `NFilterBar`, `NDateRangePicker`, `NDetailPanel`, `NDescriptionList` | Paginación, filtros y ordenamiento remotos; exploración de grandes volúmenes sin descargar todo al navegador. |
| 4. Flujos operativos | `NStepper`/`NWizard`, `NFileUpload`, `NActivityTimeline`, `NNotificationCenter` | Altas complejas, adjuntos, auditoría y tareas asincrónicas consistentes. |
| 5. Dashboards | `NStatCard`, `NDashboardGrid`, adaptadores de gráficas | KPIs y paneles configurables con estados responsive y accesibles. |
| 6. Administración SaaS | `NSubscriptionGate`, `NPlanComparison`, `NAuditLog`, `NImpersonationBanner` | Compra/upgrade de módulos, trazabilidad y soporte seguro multi-tenant. |
| 7. Patrones verticales | `NKanban`, `NScheduler`, `NMapView` | Cubrir CRM, servicio en campo, agenda y logística sin contaminar el núcleo general. |

## Prioridad inmediata: NDataTable server-side

La siguiente evolución debe admitir estado controlado de paginación, filtros y ordenamiento, `rowCount`/`pageCount`, indicadores de carga y callbacks remotos. El contrato debe evitar mezclar simultáneamente modelos client-side y server-side de forma implícita.

## Regla de seguridad

`NPermissionGate`, `NModuleRegistry` y cualquier componente futuro de suscripciones controlan presentación. Las APIs deben revalidar identidad, tenant, capacidades y módulos contratados en cada operación.
