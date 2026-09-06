# NPermissionGate / useCanAccess

Módulo de control de acceso, no visual por defecto: define cómo `NSidebar`, `NTable`/`NDataTable` y `NForm` deciden qué mostrar según las capacidades (rol + microservicios contratados) del cliente actual. Se apoya en un modelo de capacidades con comodines, pensado para una base de datos genérica de permisos por sector.

## Modelo de capacidades

Una capacidad es una cadena con espacio de nombres, por ejemplo `"facturacion:editar"`. Reglas de coincidencia:

- `"*"` otorga acceso a cualquier capacidad (superadministrador).
- `"facturacion:*"` otorga acceso a cualquier capacidad que empiece con `"facturacion:"` (todo el microservicio).
- Una coincidencia exacta también es válida.

```tsx
import { canAccess } from "nissi-ui"

canAccess(["facturacion:*"], "facturacion:editar") // true
canAccess(["facturacion:ver"], "facturacion:editar") // false
```

## Instalación

Envuelve la app (o la sección que corresponda) con `NPermissionsProvider`, entregando las capacidades otorgadas al usuario/cliente actual (típicamente resueltas desde tu backend combinando rol + microservicios comprados):

```tsx
import { NPermissionsProvider } from "nissi-ui"

<NPermissionsProvider permissions={["core:*", "facturacion:ver", "reportes:*"]}>
  <App />
</NPermissionsProvider>
```

Sin `NPermissionsProvider` en el árbol, `usePermissions`/`useCanAccess` permiten todo por defecto, para no romper usos existentes de `NSidebar`/`NTable`/`NForm` que no necesiten control de acceso.

## `useCanAccess`

```tsx
const canEditInvoices = useCanAccess("facturacion:editar")
const canManageAny = useCanAccess(["facturacion:*", "reportes:*"], "any") // por defecto "any"
```

## `NPermissionGate`

Componente para envolver cualquier UI propia (botones, secciones, tarjetas de un microservicio):

```tsx
<NPermissionGate requires="facturacion:eliminar" behavior="disable">
  <Button onClick={deleteInvoice}>Eliminar factura</Button>
</NPermissionGate>
```

- `behavior="hide"` (por defecto): omite el contenido por completo cuando no hay permiso.
- `behavior="disable"`: muestra el contenido pero lo deshabilita (`disabled`, `aria-disabled`) y agrega un tooltip explicando la razón (`labels.deniedTooltip`).
- `fallback`: contenido alterno cuando se deniega (por ejemplo, un aviso de upgrade de plan).
- `mode`: `"any"` (al menos una capacidad) o `"all"` (todas), cuando `requires` es un arreglo.

## Integración con los demás componentes

- **`NSidebar`**: cada `NSidebarItem` admite `requiredPermission`/`permissionMode`. Los ítems sin la capacidad se ocultan; un grupo se oculta si todos sus hijos quedan ocultos.
- **`NTable`/`NDataTable`**: cada `NTableAction` admite `requiredPermission`/`permissionMode`. Las acciones sin la capacidad no aparecen en la barra de acciones (`ActionBar`).
- **`NForm`**: cada `NFormField` admite `requiredPermission`/`permissionMode`. Los campos sin la capacidad se ocultan y se excluyen de la validación.
- **`NModuleRegistry`**: oculta módulos no autorizados y, opcionalmente, presenta los no contratados como deshabilitados.

Ningún componente requiere `NPermissionsProvider` para funcionar; la integración es completamente opcional y aditiva.

Este control sólo afecta la presentación. El backend debe revalidar permisos, tenant y suscripciones en cada operación.

## Accesibilidad e i18n

- El tooltip de `behavior="disable"` usa `NTooltip` y sus textos pertenecen a `NPermissionLabels` (español por defecto), igual que el resto de la librería.
