# NHeader

`NHeader` es la barra superior responsive de Nissi UI. Un mismo componente cubre sitios públicos con navegación y CTA (`variant="site"`) y aplicaciones con búsqueda, acciones, notificaciones, tema y usuario (`variant="app"`).

Cada `NHeaderNavItem` admite `requiredPermission` y `permissionMode`. Los elementos no autorizados y los grupos que queden vacíos se ocultan con el mismo motor de capacidades usado por `NSidebar` y `Nroutes`.

## Variante site

```tsx
import { ArrowRight } from "lucide-react"
import { NHeader, type NHeaderNavItem } from "nissi-ui"

const items: NHeaderNavItem[] = [
  { id: "home", label: "Inicio", href: "/" },
  {
    id: "products",
    label: "Productos",
    children: [
      { id: "analytics", label: "Analítica", href: "/analytics" },
      { id: "commerce", label: "Comercio", href: "/commerce" },
    ],
  },
]

export function SiteHeader() {
  return (
    <NHeader
      brand={<strong>Nissi</strong>}
      items={items}
      actions={[{
        id: "start",
        label: "Comenzar",
        icon: <ArrowRight />,
        href: "/signup",
        presentation: "button",
      }]}
    />
  )
}
```

## Variante app

Cuando la aplicación usa `NThemeProvider`, el selector consume automáticamente el tema global y ofrece claro, oscuro, azul marino, Nissi Dark y preferencia del sistema.

```tsx
<NHeader
  variant="app"
  brand={<strong>Nissi ERP</strong>}
  extra={<span>Ventas / Pedidos</span>}
  search={{
    value: query,
    onChange: setQuery,
    onSubmit: runGlobalSearch,
  }}
  actions={[
    { id: "help", label: "Ayuda", icon: <CircleHelp />, showOnMobile: true },
    { id: "settings", label: "Configuración", icon: <Settings /> },
  ]}
  notifications={notifications}
  user={{
    name: "Ana Torres",
    role: "Administradora",
    actions: [{ id: "logout", label: "Cerrar sesión", icon: <LogOut /> }],
  }}
  showThemeToggle
  themePresentation="button"
  sticky
/>
```

`themePresentation="button"` muestra el icono y el nombre del tema activo dentro del header. En el viewport base conserva el mismo botón y su nombre accesible, pero oculta visualmente el texto para proteger el espacio disponible.

Las props `theme` y `onThemeChange` se conservan deprecadas para integraciones binarias existentes. En código nuevo usa `NThemeProvider`; consulta la [guía de temas](./theme.md).

## Navegación y estado

`items` acepta `id`, `label`, `icon`, `href`, `badge`, `children`, `disabled`, `data` y `onClick`. `activeItemId`/`onItemSelect` ofrecen modo controlado; `defaultActiveItemId` cubre el modo no controlado. Cuando los datos no contienen `id`, usa `getItemId` para conservar identidad estable.

Los items con hijos abren un `Menu` en escritorio. En móvil se conserva la jerarquía completa dentro del Drawer o panel responsive. Enlaces y botones activos exponen `aria-current`.

## Acciones, notificaciones y usuario

`actions` acepta icono sustituible, badge, enlace o callback, `colorPalette`, estado deshabilitado y `presentation="icon" | "button"`. `showOnMobile` identifica acciones críticas que permanecen visibles en la barra compacta; las demás siguen disponibles en escritorio.

`notifications` genera un menú limitado al viewport y calcula el contador sin leer. `user` muestra avatar, nombre, rol y acciones de cuenta en un menú accesible. Todos los controles de icono conservan nombre accesible y tooltip.

## Responsive

- `overlay` (predeterminado): Drawer desde el lado derecho debajo de `md`.
- `push`: panel debajo del header que permanece dentro del flujo.
- `hidden`: oculta la navegación móvil y no muestra hamburguesa.

`mobileOpen`, `defaultMobileOpen` y `onMobileOpenChange` permiten estado controlado o no controlado. El Drawer atrapa el foco, cierra con Escape y devuelve el foco al disparador. Sus superficies flotantes usan `Portal`, ancho máximo relativo al viewport y tokens semánticos.

## Integración con NSidebar y tablas

La altura predeterminada es `4rem`, igual a la cabecera de referencia del layout. Para aplicaciones, coloca `NSidebar` y el área principal en un `Flex`; dentro del área principal renderiza `NHeader sticky` seguido del contenido. El sidebar conserva su propio Drawer móvil y `NHeader` controla exclusivamente la navegación superior, evitando duplicar estados.

`NHeader`, `NSidebar`, `NTable` y `NDataTable` comparten `bg.panel`, `bg.subtle`, `fg`, `fg.muted`, `border` y `colorPalette.*`. Esto mantiene contraste y ritmo visual en claro, oscuro, azul marino y Nissi Dark sin acoplar los componentes.

## Labels

Todos los textos internos se personalizan mediante `labels?: Partial<NHeaderLabels>`. `defaultNHeaderLabels` contiene los valores predeterminados en español.

## Arquitectura interna

`NHeader` coordina estado activo y Drawer; el tema se delega a `NTheme` cuando existe `NThemeProvider`. `HeaderBrand`, `HeaderNav`, `HeaderSearch`, `HeaderActions`, `HeaderNotifications`, `HeaderUserMenu` y `HeaderMobileMenu` son implementaciones internas y no forman parte de la API pública.
