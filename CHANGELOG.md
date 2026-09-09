# Changelog

Todos los cambios relevantes de Nissi UI se documentarán en este archivo siguiendo versionado semántico.

## 0.2.0 — 2026-09-09

### Añadido

- Nroutes v3 Fase 7: navigation blockers componibles con `useNBlocker`, estado `from/to/action`, decisiones `proceed/reset`, cobertura de enlaces, push/replace, back/forward, traversal y protección complementaria `beforeunload`.
- Nroutes v3 Fase 6: search codecs opcionales y extensibles, defaults, hooks tipados, serialización por route id y dependencias selectivas mediante `reloadOnSearch`, conservando `URLSearchParams`.
- Auditoría y plan canónico de Nroutes v3 con arquitectura encontrada, deuda comprobada, decisiones progresivas de API, 21 fases, gates, riesgos y benchmark reproducible de 10/100/1,000 rutas.
- Fase 1 de Nroutes v3: branch diff puro, params por nivel, segmentos retenidos/entrantes/salientes, revalidación configurable y preservación del loader data de padres compartidos.
- Fase 2 de Nroutes v3: guards completos antes de datos, loaders independientes en paralelo, dependencias explícitas con `dependsOn`, validación de ciclos y errores deterministas por branch.
- Fase 3 de Nroutes v3: `NRouteCache` independiente, deduplicación, claves selectivas, cache-first/network-first/SWR, stale time, garbage collection, prefetch e invalidación pública por tags o rutas.
- Fase 4 de Nroutes v3: route modules lazy first-class, imports paralelos/deduplicados, pending por ruta, retry de chunks, prefetch explícito de código antes de datos y comportamiento SSR-safe.
- Fase 5 de Nroutes v3: targets por route id, inferencia TypeScript de ids y params anidados mediante `useNTypedNroutes`, `href` público, resolución runtime y compatibilidad completa con URLs libres.
- Evolución profesional de `Nroutes`: location completa, search params, árbol jerárquico, ranking, branches, `NOutlet`, permisos, guards, redirects, loaders cancelables, error boundaries y protección frente a respuestas obsoletas.
- `NLink`, prefetch por intención, hooks especializados (`useNLocation`, `useNNavigate`, `useNRouteParams`, `useNSearchParams`, `useNNavigation`, `useNLoaderData`, `useNRouteMatches`) y helpers `defineNroutes`/`defineNlayoutConfig`.
- Adaptador `NRouterAdapter` para delegar URL, navegación y prefetch a Next.js u otro router externo.
- Breadcrumbs derivados, progreso de navegación, restauración configurable de scroll y permisos coherentes entre `Nlayout`, `NHeader`, `NSidebar` y rutas.

- `Nlayout`, composición responsive de `NSidebar`, `NHeader`, `NPageHeader`, `NBreadcrumbs`, `NTheme` y `NThemeProvider` sobre `NAppShell`.
- `Nroutes`, administrador SPA con estrategias `history`, `hash` y `memory`, parámetros, History API, foco accesible y transición respetuosa de reduced motion.
- Muestra independiente `nfacture.html` con la navegación completa del proyecto NFacture y documentación interactiva dentro del catálogo.
- `NloginPage`, pantalla de acceso responsive con el isotipo oficial de Nissi, `NauthLogin`, tema oscuro inicial y selector `NTheme` integrado.
- Namespace público `Nauth*` para layouts, formularios y primitivas de autenticación, manteniendo los nombres anteriores como aliases compatibles.
- `embedded` y `minHeight` en `NauthLayout` para composiciones documentales sin regiones `main` anidadas.

### Corregido

- El ActionBar de `NDataTable` queda fijado al borde inferior del viewport con soporte de safe area; el explorador embebido de Sistema visual ya no lo desplaza hasta el final de una página alta.

## 0.1.2 — 2026-09-07

### Añadido

- Sección interactiva **Sistema visual** con navegación compacta por familias desde el header, paletas que transforman los componentes del explorador embebido y una guía completa de diseño y desarrollo web desde cero.
- Tres direcciones visuales de alto contraste que demuestran `unstyled`, `classNames` y `styles` sin retirar semántica, teclado ni foco de `NDocumentView` y `NPanel`.
- Contrato aditivo `unstyled`/`classNames`/`styles` en todos los componentes visuales públicos, con slots tipados y atributos `data-scope`/`data-part` estables.
- Sistema Chakra sustituible en `NThemeProvider`, subrutas ESM/CommonJS para componentes estabilizados y build estático del catálogo.
- Comprobaciones automáticas de SSR, directivas `"use client"`, imports por subruta y tree shaking con presupuestos.
- `NThermalPrint`, complemento configurable para aislar tickets de 58/80 mm, usar el diálogo del navegador o delegar impresión, copias, corte y cajón a un adaptador local.
- `NFacture`, provider standalone, adaptadores, navegación detectable por `NSidebar`/`NHeader`, alta de receptores en `NPanel`, roles y demo CFDI 4.0 en Proyectos.
- `NCodeCapture` profesional: adaptadores de sesión para cámara/handheld, lectura HID global configurable, captura continua, cola, metadatos de simbología/dispositivo, parser tipado, estados de permisos/desconexión y control opcional de linterna.
- `NCtrl`, `NCtrlProvider` y hooks de registro para ejecutar y descubrir atajos contextuales mediante un panel responsive activado con F11.

### Corregido

- `NReceipt` responde al ancho real de su contenedor y cambia sus partidas a formato compacto cuando una tarjeta o panel no puede alojar las columnas de escritorio.

## 0.1.1 — 2026-09-07

### Corregido

- Las declaraciones TypeScript usan especificadores ESM explícitos compatibles con `moduleResolution: "Bundler"` y `"NodeNext"`.
- La publicación ejecuta una prueba de consumo ESM, CommonJS y TypeScript sobre el paquete compilado.

## 0.1.0 — 2026-09-06

Primera versión pública.

### Incluye

- Plataforma responsive con header, sidebar, app shell, workspaces, módulos, permisos y temas.
- Tablas locales y server-side, formularios declarativos, filtros y superficies de detalle.
- Selección, edición de partidas, captura numérica internacionalizable y distribución precisa de valores.
- Flujos por pasos, aprobaciones, balances, ajustes y documentos.
- Captura de códigos, estados offline/sincronización, archivos, actividad y notificaciones.
- Carrito, checkout y recibos como presets delgados reutilizables.
- Panel lateral modal y dinámico.
- KPIs, dashboards y adaptadores de gráficas.
- Patrones SaaS, Kanban, agenda y adaptador de mapas.
- API TypeScript, etiquetas traducibles, ejemplos interactivos y documentación para desarrollo asistido por IA.
