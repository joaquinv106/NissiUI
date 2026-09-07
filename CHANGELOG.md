# Changelog

Todos los cambios relevantes de Nissi UI se documentarán en este archivo siguiendo versionado semántico.

## Sin publicar

## 0.1.2 — 2026-09-07

### Añadido

- Sección interactiva de accesibilidad con submenús para un laboratorio de estilos de dashboard y una guía completa de diseño y desarrollo web desde cero.
- Tres direcciones visuales de alto contraste que demuestran `unstyled`, `classNames` y `styles` sin retirar semántica, teclado ni foco de `NDocumentView` y `NPanel`.
- Contrato aditivo `unstyled`/`classNames`/`styles` para `NPanel`, `NDocumentView`, `NReceipt` y `NThermalPrint`, con slots y atributos `data-*` estables.
- Sistema Chakra sustituible en `NThemeProvider`, subrutas ESM/CommonJS para componentes estabilizados y build estático del catálogo.
- Comprobaciones automáticas de SSR, directivas `"use client"`, imports por subruta y tree shaking con presupuestos.
- `NThermalPrint`, complemento configurable para aislar tickets de 58/80 mm, usar el diálogo del navegador o delegar impresión, copias, corte y cajón a un adaptador local.
- `NFacture`, provider standalone, adaptadores, navegación detectable por `NSidebar`/`NHeader`, alta de receptores en `NPanel`, roles y demo CFDI 4.0 en Proyectos.
- `NCodeCapture` profesional: adaptadores de sesión para cámara/handheld, lectura HID global configurable, captura continua, cola, metadatos de simbología/dispositivo, parser tipado, estados de permisos/desconexión y control opcional de linterna.
- `NCtrl`, `NCtrlProvider` y hooks de registro para ejecutar y descubrir atajos contextuales mediante un panel responsive activado con F11.

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
