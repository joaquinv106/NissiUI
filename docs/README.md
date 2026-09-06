# Catálogo técnico de Nissi UI

<img src="./assets/nissi-mark.png" alt="Logo de Nissi UI" width="96" />

**The React UI foundation for modular products.**

Este directorio es la fuente de documentación de los componentes antes de generar el sitio oficial. Cada componente nuevo debe registrar aquí su API pública, ejemplos, accesibilidad, decisiones internas, dependencias y cambios incompatibles.

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
| `NModuleRegistry` | Plataforma | [Registro de módulos](./module-registry.md) | `src/components/module-registry/NModuleRegistry.test.tsx` |
| `NWorkspaceSwitcher` | Plataforma | [Selector de workspace](./workspace-switcher.md) | `src/components/workspace-switcher/NWorkspaceSwitcher.test.tsx` |
| `NTheme` / `NThemeProvider` | Fundación visual | [Temas](./theme.md) | `src/components/theme/NTheme.test.tsx` |
| `NItemPicker<T>` | Flujos generalizables · Fase 1 | [Selector de elementos](./item-picker.md) | `src/components/item-picker/NItemPicker.test.tsx` |

Consulta también el [historial y roadmap por fases](./roadmap.md).

El objetivo prioritario actual y su secuencia están definidos en [Flujos operativos generalizables](./generalized-workflows-roadmap.md).

La marca, el slogan y los recursos gráficos se documentan en [Identidad visual](./brand.md).

## Convenciones para componentes futuros

1. La API pública y sus tipos se exportan desde `src/index.ts`.
2. Los textos visibles deben admitir configuración y tener español como valor predeterminado.
3. Los colores deben usar tokens semánticos compatibles con los temas claro, oscuro, azul marino y Nissi Dark.
4. Cada interacción debe documentar teclado, foco y semántica ARIA.
5. Las dependencias pesadas deben cargarse de forma diferida cuando la funcionalidad sea opcional.
6. Toda corrección de regresión debe incluir una prueba automatizada.
