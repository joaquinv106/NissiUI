# Contexto técnico de Nissi UI

Este documento es la fuente de contexto para cualquier persona, agente o modelo de IA que trabaje en el proyecto. Debe leerse antes de explorar el repositorio o consultar fuentes externas.

## Objetivo

Nissi UI es una librería de componentes React reutilizables, publicable en npm como `nissi-ui`. Los componentes se construyen sobre Chakra UI v3 y deben poder instalarse en otros proyectos React sin copiar código. El desarrollo se realiza incrementalmente por componente y por fases; actualmente incluye tablas, navegación, formularios, permisos y la capa de plataforma `NAppShell`/`NModuleRegistry`/`NWorkspaceSwitcher` para operar microsistemas contratados desde un dashboard común.

## Objetivo prioritario: flujos operativos generalizables

La prioridad del proyecto es desarrollar componentes genéricos capaces de componer un punto de venta, compras, inventarios, servicios, recursos humanos y otros flujos sin introducir reglas de un dominio específico en el núcleo. La fuente canónica del plan es [docs/generalized-workflows-roadmap.md](./docs/generalized-workflows-roadmap.md).

- Fase 1, `NItemPicker<T>`: completada. Selección visible con búsqueda, agrupación, layouts y estado controlado/no controlado.
- Fase 2, `NLineItemEditor<TItem, TLine>`: completada. Altas adaptables, campos editables, validación, orden y eliminación con estado controlado/no controlado.
- Fase 3, `NAmountInput` y `NAmountAllocator<TMethod>`: completada. Captura internacionalizable y distribución precisa de valores entre destinos tipados.
- Fase 4, `NStepFlow<TState>` y `NApprovalFlow<TRequest>`: completada. Flujos por pasos y decisiones adaptables con validación y concurrencia asíncrona.
- Fase 5, `NBalanceSession<TEntry>`, `NAdjustmentEditor<T>` y `NDocumentView<TDocument>`: completada. Operación, correcciones auditables y documentos adaptables.
- Fase 6, `NCodeCapture`, `NSyncStatus` y `NOfflineBoundary`: completada. Captura multicanal y comunicación resiliente para conectividad intermitente.
- Fase 7, `NCart<TItem, TLine>`, `NCheckout<TMethod>`, `NReceipt<TReceipt, TLine>` y ejemplo POS: completada como composiciones delgadas.
- Las siete fases prioritarias y las seis fases posteriores están completas. La prioridad actual es estabilización para publicación.
- `NPanel` está completado como plus adelantado de esa siguiente fase: superficie lateral modal, dinámica y opuesta al sidebar.
- No construir componentes POS monolíticos: cualquier preset futuro debe permanecer sobre primitivas y patrones estabilizados.

## Próximo proyecto: Nissi Router SPA profesional

La siguiente evolución propuesta para la plataforma es convertir `Nroutes` y `Nlayout` en un router SPA jerárquico con location completa, rutas anidadas, ranking, permisos de ruta, guards y loaders cancelables, boundaries, `NLink`, prefetch, breadcrumbs derivados, progreso y restauración de scroll. Es un objetivo **futuro y aún no implementado**; el contrato actual continúa descrito en este archivo y en `docs/layout-routes.md`.

La especificación de traspaso, fases, compatibilidad, pruebas y Definition of Done vive en [docs/future-professional-spa-router.md](./docs/future-professional-spa-router.md). Todo equipo que inicie ese trabajo debe auditar primero la implementación vigente y reutilizar el sistema existente de permisos, en especial el filtrado que `NSidebar` ya realiza mediante `usePermissions()`.

## Principios de diseño

- API declarativa y tipada: la configuración principal usa JSON con `headers` y `data`.
- Chakra UI v3: usar sus primitivas y patrones compound; no introducir patrones de Chakra v2.
- Tema automático: preferir tokens semánticos (`bg`, `bg.panel`, `fg.muted`, `border`) para soportar claro, oscuro, azul marino y Nissi Dark mediante `NThemeProvider`.
- Accesibilidad: conservar HTML semántico, nombres accesibles, navegación por teclado, foco visible y tooltips traducibles.
- Responsive desde móvil: la tabla ofrece desplazamiento horizontal o vista `stack` como lista de registros.
- Internacionalización: ningún texto nuevo debe quedar hardcodeado en la interfaz. Añadirlo al contrato `*Labels` y al objeto `default*Labels` del componente correspondiente; español es el idioma predeterminado.
- Paquete liviano: React, Chakra y Emotion son `peerDependencies`. Las exportaciones pesadas se cargan dinámicamente al usarse.
- API estable: evitar cambios incompatibles; los nuevos comportamientos deben ser configurables con valores predeterminados sensatos.

## Tecnología y comandos

- React 19 para desarrollo; compatibilidad declarada con React 18–19.
- TypeScript estricto, Vite 8, Chakra UI 3, TanStack Table 8 y Vitest.
- npm y `package-lock.json` son la fuente del gestor de paquetes.

Comandos: `npm run dev`, `npm run typecheck`, `npm test`, `npm run build`, `npm run check:package` y `npm run pack:check`.

Antes de entregar cambios de comportamiento deben pasar al menos `typecheck`, pruebas, `build` y `check:package`.

## Estructura relevante

- `src/index.ts`: API pública del paquete.
- `src/index.test.tsx`: pruebas de integración y contrato.
- `src/dev/`: catálogo Vite de página completa; `main.tsx` usa `NAppShell` con `NSidebar` y `NHeader` reales y contiene vistas interactivas para cada componente. No forma parte de la API pública.
- `src/dev/AuthView.tsx`: laboratorio funcional de `NloginPage`, login, registro, recuperación, reset, OTP y verificación de correo; sólo simula callbacks locales.
- `src/dev/LayoutRoutesView.tsx`: documentación interactiva de `Nlayout` y `Nroutes`; enlaza la muestra de aplicación completa.
- `src/dev/NFactureLayoutPage.tsx` y `nfacture.html`: entrada independiente de catálogo que muestra NFacture dentro de `Nlayout`, con rutas hash sin recarga.
- `src/dev/ComponentDocs.tsx`: panel de documentación reutilizado en cada vista del catálogo (propósito, pasos, variantes, pestañas/pills con vista previa + código por variante, y ejemplos adicionales de props). Todo nuevo componente debe agregar su propio `<ComponentDocs>` con `variantExamples` reales (no solo texto) al añadirse al catálogo.
- `src/components/internal/NTooltip.tsx`: tooltip interno accesible.
- `src/components/table/NTable.tsx`: estado y orquestación de TanStack Table.
- `src/components/table/NDataTable.tsx`: defaults avanzados, edición y borrado.
- `src/components/table/EditRowDialog.tsx`: formulario de edición por tipo de dato.
- `src/components/table/types.ts`: contrato público y tipos.
- `src/components/table/labels.ts`: textos predeterminados e i18n.
- `src/components/table/exporters.ts`: copiar, imprimir y exportaciones dinámicas.
- `src/components/table/utils.ts`: identidad, formato y serialización.
- `src/components/table/internal/`: toolbar, vistas, paginación y ActionBar.
- `src/components/sidebar/NSidebar.tsx`: estado y orquestación del menú lateral.
- `src/components/sidebar/types.ts`: contrato público de navegación.
- `src/components/sidebar/labels.ts`: textos predeterminados de NSidebar.
- `src/components/sidebar/utils.ts`: identidad, búsqueda y recorrido del árbol.
- `src/components/sidebar/internal/`: header, footer, buscador, ítems y grupos internos.
- `src/components/header/NHeader.tsx`: estado y orquestación de la barra superior.
- `src/components/header/types.ts`: contrato público de NHeader.
- `src/components/header/labels.ts`: textos predeterminados de NHeader.
- `src/components/header/utils.ts`: identidad y helpers de la barra superior.
- `src/components/header/internal/`: marca, navegación, búsqueda, acciones, notificaciones, usuario y menú móvil internos.
- `src/components/form/NForm.tsx`: estado, validación y envío de formularios reactivos.
- `src/components/form/types.ts`: contrato público de NForm.
- `src/components/form/labels.ts`: textos predeterminados de NForm.
- `src/components/form/utils.ts`: valores iniciales, agrupación por sección y validación de campos.
- `src/components/form/internal/`: campo, sección y acciones del formulario internos.
- `src/components/permissions/NPermissionsProvider.tsx`: contexto de capacidades otorgadas (`usePermissions`).
- `src/components/permissions/useCanAccess.ts`: hook de verificación de capacidades.
- `src/components/permissions/NPermissionGate.tsx`: componente que oculta o deshabilita UI propia según capacidad.
- `src/components/permissions/types.ts`: contrato público del módulo de permisos.
- `src/components/permissions/labels.ts`: textos predeterminados (tooltip de acceso denegado).
- `src/components/permissions/utils.ts`: coincidencia de capacidades con comodines (`canAccess`, `matchesCapability`).
- `src/components/app-shell/`: implementación, tipos, labels y pruebas de `NAppShell`.
- `src/components/layout/`: composición pública `Nlayout` sobre shell, sidebar, header, encabezados de página, breadcrumbs, tema y rutas.
- `src/components/routes/`: administrador SPA `Nroutes`, outlet animado, contexto, matching de parámetros, History API/hash/memoria, labels y pruebas.
- `src/components/module-registry/`: catálogo de módulos, permisos, tipos, labels y pruebas.
- `src/components/workspace-switcher/`: selector de tenant/workspace, tipos, labels y pruebas.
- `src/components/theme/`: `NThemeProvider`, selector `NTheme`, contexto, tipos, labels y `nissiSystem` con los tokens de claro, oscuro, azul marino y Nissi Dark.
- `src/components/styling/`: contrato público aditivo de `unstyled`, `classNames` y `styles` por slots tipados, implementado por todos los componentes visuales públicos; los providers sin DOM conservan su configuración específica.
- `src/components/item-picker/`: `NItemPicker<T>`, tipos, labels, búsqueda normalizada, selección y pruebas de la Fase 1 prioritaria.
- `src/components/line-item-editor/`: `NLineItemEditor<TItem, TLine>`, tipos, labels, utilidades y pruebas de la Fase 2 prioritaria.
- `src/components/amount-input/`: `NAmountInput`, tipos, labels, análisis regional y pruebas de captura numérica de la Fase 3.
- `src/components/amount-allocator/`: `NAmountAllocator<TMethod>`, tipos, labels, aritmética de precisión y pruebas de distribución de la Fase 3.
- `src/components/step-flow/`: `NStepFlow<TState>`, tipos, labels, navegación, validación y pruebas de la Fase 4.
- `src/components/approval-flow/`: `NApprovalFlow<TRequest>`, tipos, labels, decisiones, historial y pruebas de la Fase 4.
- `src/components/balance-session/`: `NBalanceSession<TEntry>`, tipos, labels, cálculo, cierre asíncrono y pruebas de la Fase 5.
- `src/components/adjustment-editor/`: `NAdjustmentEditor<T>`, tipos, labels, comparación, validación y pruebas de la Fase 5.
- `src/components/document-view/`: `NDocumentView<TDocument>`, tipos, labels, acciones, impresión y pruebas de la Fase 5.
- `src/components/code-capture/`: `NCodeCapture`, tipos, labels, validación, captura externa y pruebas de la Fase 6.
- `src/components/sync-status/`: `NSyncStatus`, tipos, labels, reintentos y pruebas de la Fase 6.
- `src/components/offline-boundary/`: `NOfflineBoundary`, tipos, labels, eventos de conectividad y pruebas de la Fase 6.
- `src/components/cart/`: `NCart<TItem, TLine>`, resumen inyectado, composición de partidas y pruebas de la Fase 7.
- `src/components/checkout/`: `NCheckout<TMethod>`, composición de distribución, confirmación y pruebas de la Fase 7.
- `src/components/receipt/`: `NReceipt<TReceipt, TLine>`, adaptación documental y pruebas de la Fase 7.
- `src/components/thermal-print/`: `NThermalPrint`, aislamiento de contenido para rollos de 58/80 mm y adaptadores de impresión sustituibles.
- `src/components/panel/`: `NPanel`, señales controladas/no controladas, contenido dinámico, accesibilidad modal y pruebas.
- `src/components/ctrl/`: `NCtrl`, provider, hooks, normalización de combinaciones, ejecución contextual y pruebas.
- `src/components/facture/`: proyecto vertical `NFacture`, contratos CFDI, navegación, permisos y adaptadores de integración; las reglas fiscales definitivas permanecen en backend/PAC.
- `src/components/auth/`: sistema visual Nauth y `NloginPage`; tema oscuro inicial, selector `NTheme`, layouts, formularios, OTP, contraseña, social UI, labels, contratos y pruebas sin lógica de autenticación o persistencia.
- `src/components/page/`, `data-patterns/`, `activity/`, `dashboard/`, `saas/` y `verticals/`: entrega final consolidada; contratos, implementación y pruebas de los patrones restantes.
- `src/dev/FinalPhaseViews.tsx`: seis vistas de catálogo con documentación y ejemplos reactivos de la entrega final.
- `src/dev/Phase7Views.tsx`: vistas del catálogo y ejemplo POS integrado; no pertenece a la API pública.
- `src/dev/PanelView.tsx`: catálogo interactivo de `NPanel` alternando `NCheckout` y `NReceipt`.
- `src/dev/AccessibilityViews.tsx`: laboratorio visual de personalización accesible y guía interactiva para personas nuevas en diseño y desarrollo web.
- `AI_CONTEXT.md`: contrato de integración portable para asistentes de IA y aplicaciones consumidoras.
- `llms.txt`: índice breve y descubrible del contexto para IA.
- `CHANGELOG.md`: historial de versiones públicas.
- `scripts/check-package.mjs`: prueba de consumo de la salida compilada desde ESM, CommonJS y TypeScript NodeNext.
- `docs/README.md`: índice de documentación.
- `docs/tables.md`: contrato y ejemplos de tablas.
- `docs/sidebar.md`: contrato y ejemplos de NSidebar.
- `docs/header.md`: contrato y ejemplos de NHeader.
- `docs/forms.md`: contrato y ejemplos de NForm.
- `docs/permissions.md`: contrato y ejemplos de NPermissionGate/useCanAccess.
- `docs/app-shell.md`, `docs/module-registry.md` y `docs/workspace-switcher.md`: contratos de la capa de plataforma.
- `docs/item-picker.md`: contrato y ejemplos de `NItemPicker<T>`.
- `docs/line-item-editor.md`: contrato y ejemplos de `NLineItemEditor<TItem, TLine>`.
- `docs/amount-input.md` y `docs/amount-allocator.md`: contratos y ejemplos de captura y distribución de valores.
- `docs/step-flow.md` y `docs/approval-flow.md`: contratos y ejemplos de flujos por pasos y decisiones.
- `docs/balance-session.md`, `docs/adjustment-editor.md` y `docs/document-view.md`: contratos de sesiones, ajustes y documentos.
- `docs/code-capture.md`, `docs/sync-status.md` y `docs/offline-boundary.md`: contratos de captura y resiliencia.
- `docs/cart.md`, `docs/checkout.md`, `docs/receipt.md` y `docs/pos-example.md`: presets y referencia integrada de la Fase 7.
- `docs/thermal-print.md`: contrato de impresión térmica, aislamiento del DOM y adaptadores locales.
- `docs/customization.md` y `docs/package-compatibility.md`: slots visuales, sistema Chakra sustituible, subrutas, tree shaking, SSR y build del portal.
- `docs/accessibility.md`: fundamentos, personalización por capas y lista práctica de accesibilidad para principiantes.
- `docs/panel.md`: contrato, responsive, foco, posición y composición dinámica de `NPanel`.
- `docs/ctrl.md`: contrato de atajos por vista, registro, ejecución, conflictos y accesibilidad de `NCtrl`.
- `docs/facture.md`: alcance, contratos, seguridad, navegación y referencias oficiales de `NFacture`.
- `docs/auth.md`: arquitectura, importación, componentes, tema, estados, accesibilidad, seguridad, personalización y empaquetado de Nauth y `NloginPage`.
- `docs/layout-routes.md`: contrato, estrategias, accesibilidad, personalización e integración de `Nlayout` y `Nroutes`.
- `docs/future-professional-spa-router.md`: especificación futura para evolucionar `Nroutes`/`Nlayout`; no representa funcionalidad disponible actualmente.
- `docs/final-components.md`: contrato consolidado de estados, datos remotos, actividad, dashboards, SaaS y verticales.
- `docs/generalized-workflows-roadmap.md`: fases canónicas del objetivo prioritario y orden obligatorio de desarrollo.
- `docs/roadmap.md`: historial de componentes terminados y fases pendientes.
- `public/brand/`: isotipo, hero e iconos web de Nissi UI. `docs/brand.md` define el slogan y sus reglas de uso.
- El lenguaje cristalino (retícula, halos, hielo y animación ambiental) se limita a `OverviewView` en `src/dev/main.tsx`; no debe trasladarse a los componentes públicos ni a sus tokens.

No se deben exportar los componentes de `internal/` sin una decisión explícita de API.

## Contrato actual de tablas

- `NTable` es la base configurable. El `Card` está activo por defecto y puede quitarse con `card={false}`.
- `NDataTable` activa por defecto búsqueda, filtro, paginación, selección, ActionBar, visibilidad, exportación y reordenamiento de columnas y filas.
- `server` permite controlar `query`, `rowCount` y `loading`; en ese modo la aplicación resuelve búsqueda, filtro, orden y paginación remotos y entrega la página actual.
- `getRowId` debe usarse para identidad estable. Si no existe, se intenta `row.id`, después `row.key` y finalmente el índice con advertencia en desarrollo.
- La edición sólo aplica a una fila. El borrado puede aplicar a varias y admite `onBeforeDelete`.
- `NTableAction.selectionRequirement` controla si una acción aparece con selección `single`, `multiple` o `any`.
- `reorderableColumns` controla el orden interactivo. En `NDataTable` es `true` por defecto; el usuario puede arrastrar el asa o usar Alt + flecha izquierda/derecha.
- `reorderableRows` controla el orden de filas. En `NDataTable` es `true` por defecto; permite arrastrar o usar Alt + flecha arriba/abajo y notifica mediante `onDataChange`/`onRowOrderChange`.
- El orden de columnas debe propagarse a cabeceras, filas, vista stack, columnas pegajosas y exportaciones.
- Los textos y tooltips pertenecen a `labels`; cualquier nueva etiqueta debe tener default en español.
- El `ActionBar` flotante (`TableSelectionBar`) usa `bg.muted` con borde (`border`) en vez del `bg.panel` por defecto de Chakra, porque en tema claro `bg.panel` y `bg` son el mismo blanco y el panel se pierde visualmente.

La referencia completa y ejemplos están en `docs/tables.md`.

## Contrato actual de NSidebar

- `NSidebar` recibe un árbol de `NSidebarItem` con enlaces, acciones, iconos, badges y grupos mediante `children`.
- El activo y el colapso admiten modo controlado y no controlado. `collapsible` es `true` y los textos pertenecen a `NSidebarLabels` con español predeterminado.
- `responsive="overlay"` es el default: usa `Drawer` de Chakra UI en móvil y sidebar en escritorio. También existen `push` y `hidden`.
- El árbol usa navegación/listas semánticas, `aria-current`, grupos con `aria-expanded` y teclado con flechas, Home, End, Enter y Espacio.
- `searchable` filtra sin perder la jerarquía. `getItemId` sigue la filosofía de identidad estable de `getRowId`.
- `header` y `footer` son slots. Los módulos de `sidebar/internal/` no se exportan.
- El control de colapso en escritorio es un botón circular flotante anclado al borde del sidebar (no dentro del header); usa iconos de chevron según `position` y estado. `SidebarHeader` sólo conserva el botón de cierre en móvil.
- El ancho del contenedor de escritorio se anima al colapsar o expandir para que también se desplace suavemente el contenido adyacente; usa la duración semántica `moderate` (`200ms`) y elimina la transición con `prefers-reduced-motion`.
- Los controles de búsqueda (`NSidebar` y `NDataTable`) aplican el estilo de foco al contenedor (`_focusWithin`) en vez del `Input` interno, para que el anillo de foco cubra todo el campo y no se recorte.
- El `Toaster` de copiado en `NDataTable` define ancho máximo (`calc(100vw - 2rem)`) y `insetInline` responsive para evitar que el mensaje se salga de la pantalla en viewports angostos.
- La superficie del sidebar (`nav`, Drawer y botones flotantes) usa `bg.muted` en vez de `bg.panel`, porque en tema claro `bg.panel` y `bg` son el mismo blanco y el sidebar se pierde visualmente contra el contenido.
- La fila del header interno (`SidebarHeader`) mide `minH="16"` (4rem) para alinear su borde inferior con el de `NHeader` cuando ambos se combinan en un mismo layout.

La referencia completa y ejemplos están en `docs/sidebar.md`.

## Contrato actual de NHeader

- `NHeader` usa `variant="site" | "app"`: site prioriza marca, navegación con dropdowns y CTA; app prioriza contexto, búsqueda, acciones, notificaciones, tema y usuario.
- `brand`, `items`, `search`, `actions`, `notifications`, `user` y `extra` son configurables. Los items y acciones admiten iconos sustituibles y badges.
- La navegación activa y el Drawer móvil admiten estado controlado/no controlado. `getItemId` permite identidad estable.
- `responsive="overlay"` es el default; también existen `push` y `hidden`. Overlay usa Drawer de Chakra, limita su ancho al viewport y restaura el foco.
- La altura predeterminada es `4rem`. En un layout con `NSidebar`, NHeader vive dentro del área principal y puede usar `sticky` sin modificar el ancho ni estado del sidebar. La fila de `SidebarHeader` comparte esta misma altura (`minH="16"`) para que ambos bordes queden alineados.
- El fondo usa `bg.muted` (igual que la superficie del sidebar) en vez de `bg.panel`, para mantener armonía visual y contraste contra el contenido en tema claro.
- La búsqueda aplica foco al contenedor completo. Menús, Drawer, badges y tooltips usan patrones accesibles y portales cuando corresponde.
- Tema, superficies, texto, bordes y estados usan tokens semánticos. Dentro de `NThemeProvider`, `showThemeToggle` consume el selector global y `themePresentation="icon" | "button"` define su apariencia; `theme` y `onThemeChange` quedan como compatibilidad binaria deprecada.
- Todos los textos internos pertenecen a `NHeaderLabels`; español es el default.

La referencia completa y ejemplos están en `docs/header.md`.

## Contrato actual de NForm

- `NForm` recibe `config.fields` (`NFormField<T>[]`) y opcionalmente `config.sections` para agrupar campos con título/descripción y número de columnas (1 a 3). Los campos sin `section` se muestran al final.
- Tipos de campo soportados: `text`, `email`, `password`, `tel`, `url`, `number`, `currency`, `textarea`, `select`, `multiselect`, `checkbox`, `switch`, `radio`, `date`, `datetime`, `hidden` y `custom` (vía `render`).
- `mode` se infiere de `data`: con `data` es `"edit"`, sin `data` es `"create"`, salvo que se pase explícitamente.
- La validación vive en `field.validation` (`required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `validate` síncrono/asíncrono) y corre por campo al perder el foco y completa al enviar; bloquea el envío si hay errores.
- `onSubmit(values, mode)` debe retornar `NFormSubmitResult` (`{ success, message?, errors? }`); `errors` indexa por `key` de campo y se combina con la validación de cliente. El resultado se anuncia en un `Toaster` de éxito/error, con `colorPalette` `green`/`red` según el tipo de aviso (`bg=colorPalette.subtle`, `color=colorPalette.fg`, borde `colorPalette.emphasized`) para que se distingan y sean legibles en tema claro y oscuro.
- `resetOnSuccess` (`true` por defecto) limpia el formulario tras un envío exitoso sólo en modo `create`.
- `colSpan` (`1 | 2 | 3 | "full"`) controla el ancho de cada campo dentro de la rejilla responsive de su sección (1 columna en móvil).
- Comparte tokens (`bg.panel`, `bg.muted`, `border`, `colorPalette`) y el patrón de `Toaster` con ancho máximo ya usado en `NDataTable`, para verse en armonía y evitar que el mensaje se salga de la pantalla.
- Todos los textos pertenecen a `NFormLabels`; español es el default. Los módulos de `form/internal/` no se exportan.

La referencia completa y ejemplos están en `docs/forms.md`.

## Contrato actual de NPermissionGate / useCanAccess

- El modelo de capacidades es una cadena con namespace (`"facturacion:editar"`). `"*"` otorga todo; `"facturacion:*"` otorga cualquier capacidad de ese microservicio; también se admite coincidencia exacta. Combina en una sola lista roles y microservicios contratados.
- `NPermissionsProvider` recibe `permissions: string[]` (las capacidades otorgadas al cliente/usuario actual) y las expone vía contexto. **Sin `NPermissionsProvider` montado, `usePermissions`/`useCanAccess` permiten todo**, para no romper usos existentes de `NSidebar`/`NTable`/`NForm` sin control de acceso.
- `useCanAccess(required, mode)` es el hook base; `NPermissionGate` es el componente para envolver UI propia del consumidor, con `behavior="hide"` (por defecto, omite el contenido) o `behavior="disable"` (lo muestra deshabilitado con tooltip) y `fallback` opcional.
- Integración aditiva y opcional en los demás componentes mediante campos `requiredPermission`/`permissionMode`:
  - `NSidebarItem`: los ítems sin la capacidad se ocultan; un grupo se oculta si todos sus hijos quedan ocultos (`filterSidebarItemsByPermission`).
  - `NTableAction`: las acciones sin la capacidad no aparecen en el `ActionBar` (filtradas en `NTable` antes de pasarlas a `TableSelectionBar`).
  - `NFormField`: los campos sin la capacidad se ocultan y se excluyen de la validación (`isFieldHidden`/`validateAllFields` reciben `can`).
- Los textos (tooltip de acceso denegado) pertenecen a `NPermissionLabels`; español es el default.

La referencia completa y ejemplos están en `docs/permissions.md`.

## Contrato actual de la capa de plataforma

- `NAppShell` compone slots de header/sidebar/footer y contenido, admite sidebar en `start`/`end`, densidad y ancho del contenido, y genera regiones semánticas con skip link. No duplica el estado responsive de `NHeader` o `NSidebar`.
- `NModuleRegistry` recibe `NModuleDefinition[]`, maneja selección controlada/no controlada y ofrece layouts `grid`, `list` y `compact`. Oculta módulos no autorizados; `showUnavailable` permite mostrar como bloqueados los no contratados.
- `NWorkspaceSwitcher` recibe workspaces tipados, admite selección controlada/no controlada y una variante compacta para header/móvil. El consumidor debe invalidar o segmentar consultas al cambiar de contexto.
- `NPermissionGate` y `NModuleRegistry` sólo controlan presentación. El backend siempre revalida identidad, tenant, permisos y suscripciones.

Las referencias completas están en `docs/app-shell.md`, `docs/module-registry.md` y `docs/workspace-switcher.md`; el orden de trabajo pendiente vive en `docs/roadmap.md`.

## Contrato actual de Nlayout y Nroutes

- `Nlayout` compone `NAppShell`, `NSidebar`, `NHeader`, `NPageHeader`, `NBreadcrumbs`, `NTheme` y `NThemeProvider`; `provideTheme={false}` permite usar un provider existente.
- Cada `NlayoutRoute` declara `path`, `title`, `element` y opcionalmente `navigationId` y `pageHeader`. `navigationId` sincroniza la ruta con el elemento activo del sidebar y del header.
- `Nroutes` admite `history`, `hash` y `memory`, estado controlado/no controlado, `basePath`, enlaces internos interceptados, navegación atrás/adelante, parámetros `:param` y comodín final `*`.
- `NRouteOutlet` resuelve nodos o funciones de render, admite Suspense, fallback de ruta inexistente, foco tras navegación, anuncio `aria-live` y una transición de 180 ms que se elimina con `prefers-reduced-motion`.
- `Nroutes` no obtiene datos, no autentica ni aplica permisos. El servidor debe configurar fallback para rutas `history`; `hash` funciona en hosting estático y `memory` en previews/tests.
- En móvil `Nlayout` reserva el borde del header ocupado por el trigger overlay de `NSidebar`; respeta `sidebarPosition`, `responsive` y `showMobileTrigger`.
- La muestra independiente `nfacture.html` usa rutas hash, Nissi Dark inicial, navegación de `createNFactureNavigation` y `NFacture` sin sidebar duplicado. La referencia completa está en `docs/layout-routes.md`.

## Contrato actual de NTheme

- `NThemeProvider` es el proveedor raíz: instala `nissiSystem` por defecto o un `system` Chakra sustituible, sincroniza `next-themes`, persiste la preferencia y admite estado controlado mediante `theme`/`onThemeChange`.
- Las preferencias públicas son `light`, `dark`, `navy`, `nissi` y `system`; el tema efectivo siempre es `light`, `dark`, `navy` o `nissi`.
- `NTheme` es el selector accesible con `presentation="icon" | "button"`. Sus textos pertenecen a `NThemeLabels` y tienen español predeterminado.
- `navy` hereda recetas y paletas de estados del modo oscuro de Chakra, pero redefine `bg.*`, `fg.*` y `border.*` con una escala azul marino armónica.
- `nissi` implementa Nissi Dark: superficies índigo-tinta, texto frío de alto contraste y una reasignación semántica de `blue.*` basada en el azul, índigo, violeta y cian medidos del isotipo.
- `NHeader showThemeToggle` usa automáticamente `NTheme` cuando está dentro del proveedor; `themePresentation="button"` muestra el nombre del tema en el header. Los demás componentes sólo consumen tokens semánticos y no conocen nombres de temas.
- Para agregar un tema se actualizan exclusivamente el registro/tipos, etiquetas y sistema en `src/components/theme/`, además de pruebas, catálogo y documentación.

La referencia completa está en `docs/theme.md`.

## Contrato actual de NItemPicker

- `NItemPicker<TItem>` requiere `items`, `getItemId` y `getItemLabel`; no presupone productos ni una forma concreta de datos.
- `selectionMode="single" | "multiple" | "none"` cubre selección persistente y activación directa. `selectedIds`/`defaultSelectedIds` siguen el patrón controlado/no controlado.
- La búsqueda local normaliza mayúsculas y acentos e indexa etiqueta, descripción, grupo y `getSearchText`; `shouldFilter={false}` permite búsqueda remota controlada.
- `groupBy`, `layout="grid" | "list"`, `columns`, `renderItem`, `renderLeading`, `renderTrailing`, `header`, `footer` y `emptyState` permiten composición sin acoplamiento de dominio.
- Cada opción es un botón nativo con `aria-pressed`, foco visible, flechas/Home/End, estados disabled/loading/empty y anuncios `aria-live`.
- Todos los textos pertenecen a `NItemPickerLabels`; la referencia completa está en `docs/item-picker.md`.

## Contrato actual de NLineItemEditor

- `NLineItemEditor<TItem, TLine>` no presupone productos, cantidades, precios ni monedas: `createLine` traduce la entidad y `NLineItemField<TLine>` define cada valor visible o editable.
- `lines`/`defaultLines` ofrecen estado controlado/no controlado; `onLinesChange` entrega el siguiente estado y la causa `add`, `update`, `remove` o `reorder`.
- `resolveAdd` permite agregar, fusionar, sustituir o rechazar duplicados sin incorporar reglas de negocio al núcleo.
- Reutiliza `NItemPicker` mediante `pickerProps`; ofrece slots de línea, estados loading/error/empty, restricciones por línea y modo `readOnly`.
- La lista se apila en móvil y usa columnas alineadas desde `md`, sin duplicar controles. Inputs y acciones tienen nombres accesibles, foco visible y textos en `NLineItemEditorLabels`.
- La referencia completa está en `docs/line-item-editor.md`.

## Contrato actual de NAmountInput

- `NAmountInput` conserva `number | null` como contrato y ofrece `value`/`defaultValue` para estado controlado/no controlado.
- `locale` y `formatOptions` delegan la presentación a `Intl.NumberFormat`; no presupone moneda, porcentaje ni unidad.
- Durante el foco conserva un borrador numérico sin adornos y sólo aplica moneda, agrupación y decimales de relleno al salir; esto evita que los renders controlados destruyan la captura en `NAmountAllocator`, `NCheckout` y POS.
- `min`, `max`, `step`, controles incrementales y `quickValues` cubren captura táctil, teclado y atajos configurables.
- Etiqueta, ayuda, error, requerido, disabled y readOnly usan `Field` y `NumberInput` de Chakra UI v3; todos los nombres internos pertenecen a `NAmountInputLabels`.
- La referencia completa está en `docs/amount-input.md`.

## Contrato actual de NAmountAllocator

- `NAmountAllocator<TMethod>` requiere `total`, `methods`, `getMethodId` y `getMethodLabel`; cada `NAmountAllocation<TMethod>` conserva método y valor.
- `allocations`/`defaultAllocations` ofrecen estado controlado/no controlado. El callback entrega asignaciones, resumen (`under`, `balanced`, `over`) y causa del cambio.
- La aritmética usa `precision`; el reparto equitativo distribuye unidades mínimas restantes para conservar el total exacto.
- Por defecto impide sobreasignación y negativos; ambos comportamientos sólo se habilitan explícitamente. Límites, bloqueo y validación pueden variar por método.
- Resumen, progressbar, lista responsive, acciones y estados usan semántica accesible, tokens y `NAmountAllocatorLabels`.
- La referencia completa está en `docs/amount-allocator.md`.

## Contrato actual de NStepFlow

- `NStepFlow<TState>` conserva un borrador tipado y un paso activo, ambos en modo controlado o no controlado.
- Cada paso aporta contenido, metadatos y validación síncrona o asíncrona; los pasos opcionales, omitibles y deshabilitados no introducen reglas de dominio.
- La navegación lineal evita saltos hacia adelante, permite volver a pasos habilitados y considera final al último paso habilitado.
- Las acciones predeterminadas y sustituibles comparten un contexto tipado; la espera asíncrona bloquea acciones duplicadas y anuncia errores.
- La referencia completa está en `docs/step-flow.md`.

## Contrato actual de NApprovalFlow

- `NApprovalFlow<TRequest>` adapta identidad, título, descripción y presentación de cualquier solicitud sin conocer su dominio.
- El estado puede ser controlado o no controlado; las acciones, restricciones, comentarios e historial son configurables y traducibles.
- Las decisiones asíncronas bloquean duplicados. Al cambiar `requestId`, se descarta el estado transitorio y cualquier respuesta tardía de la solicitud anterior.
- `canPerformAction` controla presentación, no autorización: el backend debe revalidar identidad, tenant, permisos y vigencia de la solicitud.
- La referencia completa está en `docs/approval-flow.md`.

## Contrato actual de NBalanceSession

- `NBalanceSession<TEntry>` calcula saldo esperado mediante saldo inicial y movimientos firmados aportados por `getEntryAmount`.
- El conteo admite estado controlado/no controlado; `tolerance` y `allowCloseWithVariance` gobiernan exclusivamente la experiencia de cierre.
- `onClose` es asíncrono, bloquea duplicados y descarta respuestas cuando cambia `sessionId`.
- La persistencia, autorización y validación definitiva corresponden al backend. La referencia está en `docs/balance-session.md`.

## Contrato actual de NAdjustmentEditor

- `NAdjustmentEditor<T>` exige `createAdjustment` para mantener un borrador independiente del original.
- Campos declarativos o `renderEditor` construyen la corrección; `changedFieldIds`, motivo y errores acompañan el envío.
- Cambiar `itemId` reinicia el estado transitorio y descarta respuestas anteriores. El backend conserva la trazabilidad definitiva.
- La referencia completa está en `docs/adjustment-editor.md`.

## Contrato actual de NDocumentView

- `NDocumentView<TDocument>` adapta identidad, encabezado, estado, metadatos y secciones sin fijar un modelo documental.
- Las acciones son asíncronas y restringibles visualmente; la autorización real continúa en el servidor.
- `paper` y `plain`, slots completos e impresión permiten integrarlo en pantallas y salidas físicas.
- La referencia completa está en `docs/document-view.md`.

## Contrato actual de la Fase 6

- `NCodeCapture` recibe identificadores manuales, pegados, lectores HID globales o adaptadores de cámara/handheld; soporta sesiones cancelables y continuas, cola acotada, simbología/dispositivo, parser tipado, permisos, desconexión y linterna opcional, y sólo confirma cuando `onCapture` tiene éxito.
- `NSyncStatus` es controlado y representa `synced`, `syncing`, `pending`, `offline` o `error`. No crea colas ni infiere éxito remoto; `syncKey` descarta reintentos obsoletos.
- `NOfflineBoundary` ofrece continuidad con `banner` o sustitución con `fallback`. Los eventos de `navigator.onLine` son orientativos; `online` controlado y `onCheckConnectivity` permiten usar una comprobación real del servicio.
- La persistencia local, resolución de conflictos, autenticación y sincronización pertenecen a la aplicación consumidora.
- Las referencias completas están en `docs/code-capture.md`, `docs/sync-status.md` y `docs/offline-boundary.md`.

## Contrato actual de la Fase 7

- `NCart<TItem, TLine>` reutiliza `NLineItemEditor`; `getLineAmount` y `calculateSummary` mantienen precios, impuestos, descuentos y promociones fuera de la librería.
- `NCheckout<TMethod>` reutiliza `NAmountAllocator`; sólo intenta completar una distribución válida, bloquea duplicados y descarta respuestas cuando cambia `checkoutKey`.
- `NReceipt<TReceipt, TLine>` reutiliza `NDocumentView`; extractores tipados presentan folio, fecha, partidas y totales ya calculados.
- La demo POS en `src/dev/Phase7Views.tsx` valida la interoperabilidad con `NCodeCapture`, `NOfflineBoundary` y `NSyncStatus`. Su cola es sólo demostrativa y no se publica como motor de datos.
- La persistencia local, claves de idempotencia, pagos, reglas fiscales, autorización e integridad definitiva corresponden a la aplicación y su backend.
- Las referencias completas están en `docs/cart.md`, `docs/checkout.md`, `docs/receipt.md` y `docs/pos-example.md`.

## Contrato actual de NThermalPrint

- `NThermalPrint` envuelve cualquier contenido React y lo clona temporalmente bajo `body` para imprimir sólo ese fragmento, sin header, sidebar ni otras superficies de la aplicación.
- `paperWidthMm`, `contentWidthMm`, `marginMm`, `fontSizePt`, `fontFamily` y `printBackground` configuran rollos de 58/80 mm u otros anchos.
- Sin `adapter` usa `window.print()`; con `adapter` entrega DOM, HTML y configuración resuelta a un puente local, escritorio o ESC/POS aportado por el consumidor.
- `job` comunica copias, corte y apertura de cajón al adaptador. El navegador no garantiza esas capacidades ni impresión silenciosa.
- Expone `print()` por render prop y `ref`, de modo que `NReceipt` y `NDocumentView` pueden reutilizar sus botones mediante `onPrint`.
- Los controles propios se excluyen del ticket, los errores se anuncian y todos los textos pertenecen a `NThermalPrintLabels`. La referencia está en `docs/thermal-print.md`.

## Contrato actual de NPanel

- `NPanel` es una superficie lateral modal agnóstica al contenido; `open`/`defaultOpen` y `onOpenChange` permiten controlarla desde señales de la aplicación.
- `children`, `title`, `description`, `headerActions` y `footer` pueden cambiar mientras permanece abierta. `contentKey` reinicia opcionalmente el subárbol sustituido.
- `placement="auto"` consume internamente `sidebarPosition` de `NAppShell` y aparece en el lado contrario; fuera del shell admite `sidebarPosition` explícito.
- Ocupa `100vw` en móvil, conserva un ancho legible configurable en escritorio y siempre mide `100dvh`; sólo su cuerpo desplaza contenido.
- Portal, overlay, animación, bloqueo de scroll, foco atrapado/restaurado, Escape y botón de cierre se apoyan en el Drawer de Chakra UI v3.
- La aplicación conserva permisos, navegación de vistas, cambios sin guardar, persistencia y reglas de negocio. La referencia completa está en `docs/panel.md`.

## Contrato actual de NCtrl

- `NCtrl` escucha combinaciones de la vista activa, abre un `NPanel` con F11 y conserva un botón flotante como alternativa táctil o cuando el navegador reserva esa tecla.
- `NCtrlProvider`, `useNCtrlShortcut` y `useNCtrlShortcuts` permiten que componentes montados registren y retiren acciones sin conocer la ubicación del panel global.
- `Mod`, modificadores, teclas de función, alternativas, prioridad, conflictos, repetición e inputs editables son configurables; los handlers asíncronos bloquean duplicados.
- El host deriva atajos visibles/deshabilitados desde permisos y estado. El backend revalida toda operación sensible. La referencia está en `docs/ctrl.md`.

## Contrato actual de NFacture

- `NFacture` es un proyecto vertical componible para CFDI 4.0; reutiliza primitivas públicas y no introduce sellado, XML, secretos ni comunicación PAC en el cliente.
- `NissiInvoicingProvider` inyecta datos y `NFactureDataAdapter` delega carga, tickets, CSD, Constancia Fiscal, PAC, webhooks y timbrado al consumidor.
- `createNFactureNavigation` produce el árbol para `NSidebar`; `createNFactureHeaderNavigation` genera su equivalente filtrado para `NHeader`. Ambos incluyen `docs`.
- La navegación embebida está desactivada por defecto para evitar un segundo sidebar. El alta de receptores, visor y administración usan `NPanel` para conservar una pantalla operativa compacta.
- `showHeader={false}` permite delegar la cabecera principal a `Nlayout`; el encabezado propio permanece activo por defecto para usos standalone.
- `role="admin" | "operator" | "pos"` ofrece presets; `permissions` permite RBAC explícito. El backend siempre revalida identidad, tenant y autorización.
- Los catálogos SAT se inyectan desde el host para evitar congelar reglas temporales. La referencia completa está en `docs/facture.md`.

## Regla de actualización continua del contexto

Todo artefacto, API pública, ruta, subruta de paquete, componente, hook, utilidad, token, variante, demo, prueba, documento o decisión arquitectónica que se cree o cambie debe registrarse en este archivo durante el mismo cambio. `PROJECT_CONTEXT.md` debe describir únicamente comportamiento comprobable en el repositorio; no se documentan como terminadas capacidades pendientes o conceptuales.

## Contrato actual de Nauth y NloginPage

- La entrada pública `nissi-ui/auth` y el barrel principal usan como nombres preferidos `NauthLayout`, `NauthLogin`, `NauthRegister`, `NauthForgotPassword`, `NauthResetPassword`, `NauthVerifyEmail`, `NauthOtpVerification`, `NauthSocialButtons`, `NauthPasswordField`, `NauthPasswordStrength`, `NauthDivider`, `NauthHeader`, `NauthFooter` y `NauthAlert`, junto con sus tipos y labels. Los nombres originales `NAuth*`, `NLogin`, `NRegister` y equivalentes permanecen como aliases compatibles.
- `NloginPage` es la composición de entrada completa: monta `NThemeProvider` por defecto, usa `dark` como preferencia inicial, muestra `NTheme` dentro de la página, integra `NauthLogin` y presenta el isotipo ligero oficial incluido desde `docs/assets/nissi-mark.png`. `provideTheme={false}` evita providers anidados cuando la aplicación ya dispone de uno.
- En móvil el isotipo se reduce y los beneficios secundarios se ocultan para priorizar el formulario; desde `md` recupera la composición dividida completa. `logo` permite sustituir la marca sin fijar recursos externos en el consumidor.
- `NauthLayout` ofrece `centered`, `split`, `glass`, `minimal` y `branded`; las variantes divididas colapsan verticalmente en móvil. `embedded` cambia la región raíz a `section` y `minHeight` permite previews o composiciones contenidas.
- `NauthLogin` soporta correo, usuario, ambos o teléfono; `NauthRegister` admite campos declarativos y personalizados. Recuperación, reset, verificación de correo y OTP exponen callbacks asíncronos y estados externos sin acoplar backend.
- `NauthOtpVerification` admite 4, 6 u 8 dígitos, pegado completo, navegación con flechas, Backspace, autofoco, finalización y reenvío temporizado. Contraseña incorpora visibilidad, autocomplete y medidor informativo.
- Todos los textos compartidos pertenecen a `NauthLabels`; la página agrega `NloginPageLabels`. El español es el default y los componentes principales admiten slots `unstyled`/`classNames`/`styles`.
- `NauthSocialButtons` apila proveedores en móvil y, desde `sm`, reparte el ancho disponible con `flex: 1 1 0` y `min-width: 0`; ningún botón puede conservar `width: 100%` dentro de la fila porque provocaría desbordamiento horizontal.
- Nauth no ejecuta OAuth, no realiza requests, no guarda credenciales, tokens o sesiones y no escribe almacenamiento local. `NThemeProvider` sólo persiste la preferencia visual. La aplicación y su backend conservan identidad, políticas, rate limits, sesión y validación definitiva.
- La referencia completa está en `docs/auth.md`; las pruebas viven en `src/components/auth/auth.test.tsx`.

## Flujo recomendado para agentes

1. Leer este archivo, `package.json` y el documento del componente afectado.
2. Inspeccionar sólo los archivos indicados en la estructura antes de hacer búsquedas amplias.
3. Consultar primero tipos y código instalados en `node_modules` para APIs de la versión fijada.
4. Usar documentación externa únicamente si el código local y la documentación oficial instalada no resuelven la duda.
5. Mantener cambios concentrados; actualizar tipos, etiquetas, pruebas y documentación juntos.
6. No editar `dist/` manualmente; se genera con `npm run build`.

## Criterios de terminado

Un cambio está terminado cuando funciona en claro, oscuro, azul marino y Nissi Dark, es responsive, accesible por teclado cuando aplica, no introduce textos fuera de `labels`, conserva tipado público, incluye pruebas de interacción y deja actualizado `docs/`.

Para toda entrega que modifique una vista del catálogo o añada una nueva, no basta con `typecheck` o `build`: se debe iniciar el catálogo, comprobar que la URL responde y ejecutar una prueba de renderizado que monte la vista y recorra sus estados o variantes principales. No se debe declarar terminada una entrega visual si la vista no carga correctamente en ejecución.
