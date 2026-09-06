# Nissi UI

<img src="./docs/assets/nissi-mark.png" alt="Logo de Nissi UI" width="112" />

**The React UI foundation for modular products.**

Librería de componentes React reutilizables construidos sobre Chakra UI v3.

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

En Windows PowerShell, si la política de ejecución bloquea `npm.ps1`, usa `npm.cmd install` y `npm.cmd run dev`.

## Scripts

- `npm run dev`: abre el entorno visual de desarrollo.
- `npm run typecheck`: valida TypeScript.
- `npm test`: ejecuta las pruebas una vez.
- `npm run build`: genera ESM, CommonJS y declaraciones TypeScript en `dist`.
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
- `NModuleRegistry`: catálogo de microsistemas contratados y autorizados.
- `NWorkspaceSwitcher`: selector de organización, tenant, sucursal o proyecto.
- `NItemPicker<T>`: selección buscable y agrupable de productos, servicios, personas, archivos o activos.

Consulta [el catálogo técnico](./docs/README.md), [la identidad visual](./docs/brand.md), [la guía completa de tablas](./docs/tables.md), el [roadmap por fases](./docs/roadmap.md) y el [proyecto prioritario de flujos generalizables](./docs/generalized-workflows-roadmap.md) para ver contratos, ejemplos y trabajo pendiente.

Los asistentes y agentes de IA deben comenzar por [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md), que concentra el objetivo, la arquitectura, las convenciones y las rutas relevantes del proyecto.

## Publicación

Antes de la primera publicación, completa en `package.json` la metadata del repositorio y confirma que el nombre `nissi-ui` siga disponible. Después:

```bash
npm login
npm run pack:check
npm publish
```
