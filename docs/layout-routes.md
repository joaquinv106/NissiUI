# Nlayout y Nroutes

`Nlayout` es la composición de aplicación de Nissi UI. Integra `NAppShell`, `NSidebar`, `NHeader`, `NPageHeader`, `NBreadcrumbs`, `NTheme` y `NThemeProvider`, y delega el cambio de contenido a `Nroutes` para conservar una experiencia single-page.

## Inicio rápido

```tsx
import { Nlayout, type NlayoutRoute } from "nissi-ui/layout"

const routes: NlayoutRoute[] = [
  {
    id: "dashboard",
    path: "/",
    title: "Resumen",
    navigationId: "dashboard",
    pageHeader: {
      subtitle: "Estado general de la operación.",
      breadcrumbs: [{ id: "home", label: "Inicio", current: true }],
    },
    element: <Dashboard />,
  },
  {
    id: "invoices",
    path: "/facturas",
    title: "Facturas",
    navigationId: "invoices",
    element: <Invoices />,
  },
]

const navigation = [
  { id: "dashboard", label: "Resumen", href: "/" },
  { id: "invoices", label: "Facturas", href: "/facturas" },
]

<Nlayout routes={routes} navigation={navigation} />
```

Cada `navigationId` conecta la ruta con el elemento activo de `NSidebar` y `NHeader`. Los enlaces cuyo destino coincide con una ruta se interceptan en captura: cambian History API o el hash sin recargar el documento. Los enlaces externos, descargas, nuevas pestañas y clics con modificadores conservan el comportamiento nativo.

## Nroutes independiente

```tsx
import { NRouteOutlet, Nroutes, useNroutes } from "nissi-ui/routes"

function Navigation() {
  const { createLinkProps } = useNroutes()
  return <a {...createLinkProps("/reportes")}>Reportes</a>
}

<Nroutes routes={routes} strategy="history">
  <Navigation />
  <NRouteOutlet />
</Nroutes>
```

Las rutas admiten parámetros (`/facturas/:folio`) y un comodín final (`/ayuda/*`). El `element` puede ser un nodo o una función que recibe `params`, ruta y datos tipados.

## Estrategias

- `history` es el valor predeterminado. Requiere que el servidor entregue la aplicación para las rutas profundas; `basePath` permite alojarla bajo un prefijo.
- `hash` funciona en hosting estático sin configurar rewrites.
- `memory` no modifica la URL y sirve para previews, tests y componentes embebidos.

`path` controla el estado desde un router externo. Sin esa prop, `defaultPath` inicializa el estado y `onPathChange` notifica cada navegación. Atrás/adelante se sincronizan mediante `popstate` y `hashchange`.

## Tema y composición

`Nlayout` monta `NThemeProvider` por defecto y activa `NTheme` dentro de `NHeader`. Si la aplicación ya tiene el provider en su raíz, usa `provideTheme={false}`. `themeProviderProps`, `headerProps`, `sidebarProps` y `shellProps` mantienen configurables las piezas integradas sin duplicar su API.

En móvil, el header reserva automáticamente el espacio del disparador overlay de `NSidebar` en el borde configurado. Así la marca y las acciones no quedan debajo del menú flotante; al desactivar el disparador o usar otro modo responsive, el espacio adicional desaparece.

El encabezado de cada ruta usa `NPageHeader`; `pageHeader={false}` permite omitirlo. Las migas se declaran en `pageHeader.breadcrumbs` y sus enlaces participan en la misma navegación SPA.

## Transición y accesibilidad

`NRouteOutlet` aplica una entrada de 180 ms con opacidad y desplazamiento de 4 px. La animación desaparece con `prefers-reduced-motion`. Después de navegar, el outlet recibe foco programático sin mover el scroll y anuncia el título mediante `aria-live`.

Carga, ruta inexistente y nombre de región pertenecen a `NroutesLabels`. `pendingFallback` y `notFoundFallback` sustituyen los estados completos.

## Muestra NFacture

El archivo `nfacture.html` carga una demostración independiente a pantalla completa. Usa `strategy="hash"`, Nissi Dark como tema inicial, la navegación generada por `createNFactureNavigation`, encabezados por ruta y el proyecto `NFacture` sin un segundo sidebar.

En desarrollo:

```text
http://localhost:5173/nfacture.html#/facturacion/dashboard
```

Los datos, credenciales e integraciones de la muestra son ficticios; `Nroutes` no obtiene datos ni implementa autenticación, permisos o reglas de negocio.
