# Contexto técnico de Nissi UI

Este documento es la fuente de contexto para cualquier persona, agente o modelo de IA que trabaje en el proyecto. Debe leerse antes de explorar el repositorio o consultar fuentes externas.

## Objetivo

Nissi UI es una librería de componentes React reutilizables, publicable en npm como `nissi-ui`. Los componentes se construyen sobre Chakra UI v3 y deben poder instalarse en otros proyectos React sin copiar código. El desarrollo se realiza incrementalmente por componente y por fases; actualmente incluye tablas, navegación, formularios, permisos y la capa de plataforma `NAppShell`/`NModuleRegistry`/`NWorkspaceSwitcher` para operar microsistemas contratados desde un dashboard común.

## Principios de diseño

- API declarativa y tipada: la configuración principal usa JSON con `headers` y `data`.
- Chakra UI v3: usar sus primitivas y patrones compound; no introducir patrones de Chakra v2.
- Tema automático: preferir tokens semánticos (`bg`, `bg.panel`, `fg.muted`, `border`) para soportar claro y oscuro.
- Accesibilidad: conservar HTML semántico, nombres accesibles, navegación por teclado, foco visible y tooltips traducibles.
- Responsive desde móvil: la tabla ofrece desplazamiento horizontal o vista `stack` como lista de registros.
- Internacionalización: ningún texto nuevo debe quedar hardcodeado en la interfaz. Añadirlo al contrato `*Labels` y al objeto `default*Labels` del componente correspondiente; español es el idioma predeterminado.
- Paquete liviano: React, Chakra y Emotion son `peerDependencies`. Las exportaciones pesadas se cargan dinámicamente al usarse.
- API estable: evitar cambios incompatibles; los nuevos comportamientos deben ser configurables con valores predeterminados sensatos.

## Tecnología y comandos

- React 19 para desarrollo; compatibilidad declarada con React 18–19.
- TypeScript estricto, Vite 8, Chakra UI 3, TanStack Table 8 y Vitest.
- npm y `package-lock.json` son la fuente del gestor de paquetes.

Comandos: `npm run dev`, `npm run typecheck`, `npm test`, `npm run build` y `npm run pack:check`.

Antes de entregar cambios de comportamiento deben pasar al menos `typecheck`, pruebas y `build`.

## Estructura relevante

- `src/index.ts`: API pública del paquete.
- `src/index.test.tsx`: pruebas de integración y contrato.
- `src/dev/`: catálogo Vite de página completa; `main.tsx` usa `NAppShell` con `NSidebar` y `NHeader` reales y contiene vistas interactivas para cada componente. No forma parte de la API pública.
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
- `src/components/module-registry/`: catálogo de módulos, permisos, tipos, labels y pruebas.
- `src/components/workspace-switcher/`: selector de tenant/workspace, tipos, labels y pruebas.
- `docs/README.md`: índice de documentación.
- `docs/tables.md`: contrato y ejemplos de tablas.
- `docs/sidebar.md`: contrato y ejemplos de NSidebar.
- `docs/header.md`: contrato y ejemplos de NHeader.
- `docs/forms.md`: contrato y ejemplos de NForm.
- `docs/permissions.md`: contrato y ejemplos de NPermissionGate/useCanAccess.
- `docs/app-shell.md`, `docs/module-registry.md` y `docs/workspace-switcher.md`: contratos de la capa de plataforma.
- `docs/roadmap.md`: historial de componentes terminados y fases pendientes.
- `public/brand/`: isotipo, hero e iconos web de Nissi UI. `docs/brand.md` define el slogan y sus reglas de uso.
- El lenguaje cristalino (retícula, halos, hielo y animación ambiental) se limita a `OverviewView` en `src/dev/main.tsx`; no debe trasladarse a los componentes públicos ni a sus tokens.

No se deben exportar los componentes de `internal/` sin una decisión explícita de API.

## Contrato actual de tablas

- `NTable` es la base configurable. El `Card` está activo por defecto y puede quitarse con `card={false}`.
- `NDataTable` activa por defecto búsqueda, filtro, paginación, selección, ActionBar, visibilidad, exportación y reordenamiento de columnas y filas.
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
- Tema, superficies, texto, bordes y estados usan tokens semánticos. El cambio de tema es controlado mediante `theme` y `onThemeChange`.
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

## Flujo recomendado para agentes

1. Leer este archivo, `package.json` y el documento del componente afectado.
2. Inspeccionar sólo los archivos indicados en la estructura antes de hacer búsquedas amplias.
3. Consultar primero tipos y código instalados en `node_modules` para APIs de la versión fijada.
4. Usar documentación externa únicamente si el código local y la documentación oficial instalada no resuelven la duda.
5. Mantener cambios concentrados; actualizar tipos, etiquetas, pruebas y documentación juntos.
6. No editar `dist/` manualmente; se genera con `npm run build`.

## Criterios de terminado

Un cambio está terminado cuando funciona en claro y oscuro, es responsive, accesible por teclado cuando aplica, no introduce textos fuera de `labels`, conserva tipado público, incluye pruebas de interacción y deja actualizado `docs/`.
