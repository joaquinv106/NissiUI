# NSidebar

`NSidebar` es el componente de navegación lateral responsive de Nissi UI. Recibe un árbol de elementos, soporta grupos, selección controlada o no controlada, búsqueda, badges, colapso y un Drawer accesible en dispositivos móviles.

```tsx
import { Home, Settings, Users } from "lucide-react"
import { NSidebar, type NSidebarItem } from "nissi-ui"

const items: NSidebarItem[] = [
  { id: "home", label: "Inicio", icon: <Home />, href: "/" },
  {
    id: "team",
    label: "Equipo",
    icon: <Users />,
    badge: 8,
    children: [
      { id: "members", label: "Miembros", href: "/team/members" },
      { id: "roles", label: "Roles", href: "/team/roles" },
    ],
  },
  { id: "settings", label: "Configuración", icon: <Settings /> },
]

export function AppSidebar() {
  return (
    <NSidebar
      items={items}
      defaultActiveItemId="home"
      searchable
      header={<strong>Nissi Workspace</strong>}
      footer={<small>usuario@nissi.mx</small>}
      onItemSelect={(item) => console.log(item)}
    />
  )
}
```

## Elementos y grupos

Cada `NSidebarItem` admite `id`, `label`, `icon`, `href`, `onClick`, `badge`, `children`, `disabled` y `data`. Un elemento con `children` se interpreta como grupo colapsable. Los componentes dentro de `internal/` no forman parte de la API pública.

`multipleGroupsOpen` es `true` por defecto. Con `false`, abrir un grupo cierra los grupos no relacionados y conserva abiertos sus ancestros.

## Estado activo

Para estado no controlado usa `defaultActiveItemId`. Para integrar un router o estado externo usa `activeItemId` y `onItemSelect`:

```tsx
<NSidebar
  items={items}
  activeItemId={routeId}
  onItemSelect={(item) => navigate(item.href)}
/>
```

Los enlaces activos exponen `aria-current="page"`; los botones activos exponen `aria-current="true"`. Al activar un elemento se ejecuta primero su `onClick` y después `onItemSelect`.

## Identidad estable

Se recomienda proporcionar `id` en cada elemento. Si los datos externos usan otra clave, configura `getItemId`:

```tsx
<NSidebar items={items} getItemId={(item) => String(item.data.key)} />
```

Sin `item.id` ni `getItemId`, se usa el índice aplanado como respaldo y se muestra una advertencia en desarrollo, ya que insertar o reordenar opciones cambiaría su identidad.

## Colapso

`collapsible` es `true`. El estado puede ser no controlado mediante `defaultCollapsed` o controlado mediante `collapsed` y `onCollapsedChange`. Los anchos predeterminados son `17rem` expandido y `4.5rem` colapsado; se modifican con `expandedWidth` y `collapsedWidth`.

En escritorio, el control de colapso es un botón circular flotante anclado al borde del sidebar (mitad dentro, mitad fuera), con icono de chevron que cambia de dirección según el estado y la `position`. En móvil no se muestra, ya que el Drawer se cierra con su propio botón.

En modo colapsado permanecen visibles los iconos o la inicial del elemento. Cada control muestra un tooltip y conserva un nombre accesible. La búsqueda y el footer se ocultan hasta expandir el menú.

## Responsive

El disparador móvil se monta en un portal con posición fija para que no sea recortado por el contenedor de la aplicación. `showMobileTrigger` es `true` por defecto. Si una aplicación necesita colocar su propio botón, puede desactivarlo y controlar el Drawer mediante `mobileOpen` y `onMobileOpenChange`; `defaultMobileOpen` cubre el modo no controlado.

`responsive="overlay"` es el valor predeterminado. En móvil muestra un botón que abre un `Drawer` expandido de Chakra UI con foco atrapado, cierre mediante Escape y restauración de foco al disparador.

- `overlay`: Drawer en móvil y sidebar normal desde `md`.
- `push`: sidebar dentro del flujo en todos los tamaños; el contenedor consumidor decide cómo empuja el contenido.
- `hidden`: oculta el sidebar debajo de `md`, sin disparador móvil.

`position="start" | "end"` controla el lado del Drawer y el orden lógico del sidebar. El valor predeterminado es `start`.

El catálogo de desarrollo (`src/dev/main.tsx`) muestra el patrón recomendado para una aplicación de página completa: contenedor `Flex` con `minH="100dvh"`, sidebar dentro de una región sticky de altura `100dvh` y área principal flexible. El `activeItemId` controlado gestiona qué vista se presenta.

## Búsqueda

`searchable` activa el buscador. La coincidencia ignora mayúsculas y acentos. Si coincide un hijo, se conserva su jerarquía y se abre temporalmente el grupo; si coincide el grupo, se muestran todos sus hijos.

## Teclado y accesibilidad

La raíz usa `<nav>` con etiqueta configurable y el árbol se representa mediante listas `<ul>/<li>` reales. Los grupos usan `aria-expanded`, `aria-controls` y `role="group"`.

- `Flecha arriba/abajo`: mueve el foco entre opciones visibles.
- `Home` / `End`: enfoca la primera o última opción habilitada.
- `Flecha derecha`: abre un grupo o entra en su primer hijo.
- `Flecha izquierda`: cierra un grupo o devuelve el foco al grupo padre.
- `Enter` / `Espacio`: activa botones; `Enter` activa enlaces mediante el comportamiento nativo.
- `Escape`: cierra el Drawer responsive.

## Variantes y tema

`variant` acepta `elevated`, `outline` y `plain`. `colorPalette` controla los estados activos y badges. Fondos, texto y bordes usan tokens semánticos de Chakra UI, por lo que funcionan automáticamente en temas claro y oscuro.

El header y footer usan `bg.subtle`, mientras que el cuerpo conserva `bg.panel`; la búsqueda usa `bg` y los elementos inactivos/activos emplean `fg.muted` y `colorPalette.fg`. Esta separación mantiene contraste y jerarquía visual tanto sobre fondos claros como oscuros.

## Textos e internacionalización

`labels?: Partial<NSidebarLabels>` permite reemplazar todos los textos visibles y nombres accesibles. Los defaults están en español y se exportan como `defaultNSidebarLabels`.

```tsx
<NSidebar
  items={items}
  labels={{
    navigationLabel: "Main navigation",
    searchPlaceholder: "Search menu…",
    collapseSidebar: "Collapse sidebar",
  }}
/>
```

## Arquitectura interna

`NSidebar` coordina estado activo, colapso, grupos, búsqueda, teclado y Drawer. La presentación se divide en componentes internos no exportados:

- `SidebarHeader`: slot superior y control de colapso.
- `SidebarSearch`: buscador del árbol.
- `SidebarItem`: enlace o acción individual.
- `SidebarGroup`: trigger y lista anidada.
- `SidebarFooter`: slot inferior.

`utils.ts` concentra identidad, resolución, aplanado, búsqueda y rutas dentro del árbol; `labels.ts` contiene los textos predeterminados.
