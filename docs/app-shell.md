# NAppShell

`NAppShell` es la estructura raíz para aplicaciones y dashboards. Compone `NHeader`, `NSidebar`, contenido y footer sin duplicar el estado responsive de esos componentes.

Cuando una aplicación necesita además tema, encabezados de ruta, breadcrumbs y navegación SPA coordinada, usa la composición [`Nlayout`](./layout-routes.md). `NAppShell` permanece como la primitiva de geometría desacoplada.

```tsx
<NAppShell
  header={<NHeader variant="app" sticky />}
  sidebar={<NSidebar items={items} />}
  sidebarPosition="start"
>
  <Routes />
</NAppShell>
```

## Contrato

- `sidebarPosition`: `"start"` (predeterminado) o `"end"`.
- `contentPadding`: `"none"`, `"compact"` o `"comfortable"` (predeterminado).
- `contentMaxWidth`: ancho máximo del contenido; `"full"` elimina el límite.
- `minHeight`: `"100dvh"` por defecto; permite previews o shells embebidos.
- `header`, `sidebar` y `footer`: slots desacoplados.
- `labels`: traduce el enlace para saltar al contenido y los nombres de regiones.

`sidebarPosition` también se comparte internamente con `NPanel`: cuando el panel usa `placement="auto"`, se abre en el borde opuesto sin que la aplicación duplique esa configuración.

Genera regiones `aside`, `main` y `footer`, además de un skip link visible al recibir foco. `NHeader` y `NSidebar` siguen siendo responsables de sus propios Drawers y estados controlados.
