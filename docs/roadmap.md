# Historial y roadmap de componentes

Este documento registra qué se construyó y qué queda pendiente. Las fases expresan dependencias de producto, no fechas de entrega.

## Historial

| Fecha | Fase | Estado | Resultado |
| --- | --- | --- | --- |
| 2026-09-05 | Fundación | Completada | `NTable`, `NDataTable`, `NSidebar`, `NHeader`, `NForm` y permisos/capacidades. |
| 2026-09-05 | Plataforma modular | Completada | `NAppShell`, `NModuleRegistry` y `NWorkspaceSwitcher`, integrados en la galería. |
| 2026-09-05 | Fundación visual | Completada | `NThemeProvider`, selector `NTheme`, tema azul marino y Nissi Dark sincronizados mediante tokens semánticos. |
| 2026-09-05 | Flujos generalizables · Fase 1 | Completada | `NItemPicker<T>` con búsqueda, agrupación, selección y composición genérica. |
| 2026-09-06 | Flujos generalizables · Fase 2 | Completada | `NLineItemEditor<TItem, TLine>` con altas adaptables, campos editables, validación, orden, eliminación y estado controlado/no controlado. |
| 2026-09-06 | Flujos generalizables · Fase 3 | Completada | `NAmountInput` y `NAmountAllocator<TMethod>` con formatos internacionales, precisión, límites, distribución, resumen y validación adaptable. |
| 2026-09-06 | Flujos generalizables · Fase 4 | Completada | `NStepFlow<TState>` y `NApprovalFlow<TRequest>` con estado tipado, validación asíncrona, decisiones, historial y protección ante concurrencia. |
| 2026-09-06 | Flujos generalizables · Fase 5 | Completada | `NBalanceSession<TEntry>`, `NAdjustmentEditor<T>` y `NDocumentView<TDocument>` para cierres, correcciones auditables y documentos imprimibles. |
| 2026-09-06 | Flujos generalizables · Fase 6 | Completada | `NCodeCapture`, `NSyncStatus` y `NOfflineBoundary` para captura multicanal y experiencias resilientes con conectividad intermitente. |
| 2026-09-06 | Flujos generalizables · Fase 7 | Completada | `NCart<TItem, TLine>`, `NCheckout<TMethod>`, `NReceipt<TReceipt, TLine>` y ejemplo POS como composiciones delgadas. |
| 2026-09-07 | Impresión térmica | Completada | `NThermalPrint` como complemento configurable para rollos de 58/80 mm y adaptadores de impresora. |
| 2026-09-07 | Personalización, empaquetado y SSR | Completada | Contrato de slots en cuatro componentes prioritarios, sistema Chakra sustituible, módulos preservados, subrutas, directivas cliente y portal estático. |
| 2026-09-06 | Estados y navegación · Plus | Completada | `NPanel` lateral, modal, responsive, reactivo y dinámico, integrado con la posición de `NSidebar` mediante `NAppShell`. |
| 2026-09-06 | Fases 2–7 · Entrega final consolidada | Completada | Estados de página, datos server-side, actividad, dashboards, administración SaaS y patrones verticales; 22 componentes/patrones públicos y evolución de `NDataTable`. |
| 2026-09-09 | Nissi Router SPA profesional · Fases 1–5 | Completada | Location completa, routing jerárquico, ranking, outlets, permisos, guards, loaders cancelables, boundaries, NLink, hooks, prefetch, breadcrumbs, progreso, scroll y adaptadores externos. |
| 2026-09-09 | Nroutes v3 · Fase 0 | Completada | Auditoría del runtime vigente, deuda técnica, decisiones de arquitectura, línea base de validación y benchmark reproducible. |
| 2026-09-09 | Nroutes v3 · Fase 1 | Completada | Branch diff, params por nivel, revalidación selectiva y preservación de loader data en padres retenidos. |
| 2026-09-09 | Nroutes v3 · Fase 2 | Completada | Guards antes de datos, loaders paralelos por ondas, `dependsOn`, validación del grafo y errores deterministas. |
| 2026-09-09 | Nroutes v3 · Fase 3 | Completada | Caché de loaders con deduplicación, modos fresh/stale, SWR, GC, prefetch e invalidación pública. |
| 2026-09-09 | Nroutes v3 · Fase 4 | Completada | Route modules lazy con imports deduplicados, pending, retry, boundaries y prefetch explícito de código antes de datos. |
| 2026-09-09 | Nroutes v3 · Fase 5 | Completada | Routing por id opt-in con inferencia de params anidados, href/prefetch/navigate tipados y validación runtime. |
| 2026-09-09 | Nroutes v3 · Fase 6 | Completada | Search codecs opcionales, hooks ligados con inferencia, serialización tipada y revalidación limitada por `reloadOnSearch`. |
| 2026-09-09 | Nroutes v3 · Fase 7 | Completada | Blockers componibles para enlaces, navegación programática y traversal, con estado público, confirmación personalizada y protección `beforeunload`. |

## Fases pendientes

No quedan fases pendientes del alcance original ni de la primera evolución del [router SPA profesional](./future-professional-spa-router.md). La evolución [Nroutes v3](./nroutes-v3-plan.md) completó auditoría y fases 1–7; mantiene pendientes las fases 8–22, desde navigation intent enriquecido hasta la documentación web integral y actualización final de GitHub.

## Prioridad inmediata: Nroutes v3 P0

La secuencia de [Flujos operativos generalizables](./generalized-workflows-roadmap.md) y las siete fases posteriores quedó completada. Nroutes v3 queda pausado tras la Fase 7; la siguiente entrega pendiente es navigation intent enriquecido, sin introducir caché de queries, file-based routing ni responsabilidades de framework SSR.

## Regla de seguridad

`NPermissionGate`, `NModuleRegistry` y cualquier componente futuro de suscripciones controlan presentación. Las APIs deben revalidar identidad, tenant, capacidades y módulos contratados en cada operación.
