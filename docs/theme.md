# NTheme

`NTheme` es el puente público entre el usuario y el sistema visual de Nissi UI. Centraliza la preferencia, la persistencia, la detección del sistema operativo y los tokens de Chakra UI para que header, sidebar, tablas, formularios y componentes futuros cambien de forma sincronizada.

Incluye cinco preferencias: `light`, `dark`, `navy`, `nissi` y `system`. `system` resuelve automáticamente a claro u oscuro; `navy` es un modo oscuro azul marino y `nissi` presenta **Nissi Dark**, la expresión elegante de los colores del isotipo.

## Paleta de Nissi Dark

La paleta se extrajo del isotipo maestro y se organizó por función, no como decoración indiscriminada:

| Color de marca | Valor | Función en la interfaz |
| --- | --- | --- |
| Cian prismático | `#5ACFFD` | Foco visible y destellos de alta atención. |
| Azul eléctrico | `#1461DE` | Referencia cromática principal del isotipo. |
| Índigo profundo | `#1D2EAF` | Profundidad, selección y transición hacia superficies. |
| Violeta cristal | `#6947DB` | Acento secundario y jerarquía visual. |
| Lavanda luminosa | `#CD97FC` | Realces puntuales; nunca texto extenso. |

Nissi Dark usa superficies índigo-tinta entre `#080C25` y `#1A2347`, evitando negro puro. El texto principal `#F6F7FF` alcanza una relación aproximada de `18.05:1` sobre el fondo; el texto secundario `#BAC2DD`, `10.87:1`. Las acciones predeterminadas usan `#3B52DF` con blanco (`6.07:1`) y el foco cian alcanza `10.81:1` sobre el fondo.

## Instalación raíz

`NThemeProvider` sustituye la combinación manual de `ChakraProvider` y `ThemeProvider`. Debe montarse una sola vez en la raíz:

```tsx
import { NThemeProvider } from "nissi-ui"

createRoot(document.getElementById("root")!).render(
  <NThemeProvider defaultTheme="system">
    <App />
  </NThemeProvider>,
)
```

La preferencia no controlada se persiste en `localStorage` con la clave `nissi-ui-theme`. Puede cambiarse mediante `storageKey`.

## Selector para el usuario

```tsx
import { NTheme } from "nissi-ui"

// Control compacto para un header.
<NTheme presentation="icon" />

// Control explícito para una pantalla de preferencias.
<NTheme presentation="button" />
```

Ambas variantes abren un menú navegable con teclado. El disparador tiene nombre accesible, el icono compacto incorpora tooltip y la opción activa se identifica visualmente. `themes` permite limitar las opciones mostradas en una ubicación concreta:

```tsx
<NTheme themes={["light", "dark", "navy", "nissi"]} />
```

## Estado controlado

```tsx
const [theme, setTheme] = useState<NThemePreference>("navy")

<NThemeProvider theme={theme} onThemeChange={setTheme}>
  <App />
</NThemeProvider>
```

En modo controlado, el consumidor conserva la fuente de verdad. Sin `theme`, el proveedor administra y persiste el estado. `disableTransitionOnChange` está activo por defecto para evitar destellos entre paletas.

## Integración con NHeader

Dentro de `NThemeProvider`, basta activar el control; `NHeader` consume el contexto sin duplicar estado:

```tsx
<NHeader variant="app" showThemeToggle themePresentation="button" />
```

Las props históricas `theme` y `onThemeChange` de `NHeader` siguen funcionando como toggle binario por compatibilidad, pero están deprecadas. Para acceder al estado desde lógica propia usa `useNTheme()`:

```tsx
const { mounted, theme, resolvedTheme, setTheme } = useNTheme()
```

Si una interfaz propia cambia su contenido según una preferencia persistida, espera a `mounted` para evitar diferencias de hidratación entre servidor y cliente. `NTheme` ya aplica esta protección internamente.

## API pública

### `NThemeProviderProps`

| Prop | Tipo | Predeterminado | Uso |
| --- | --- | --- | --- |
| `theme` | `"light" \| "dark" \| "navy" \| "nissi" \| "system"` | — | Preferencia controlada. |
| `defaultTheme` | `NThemePreference` | `"system"` | Preferencia inicial no controlada. |
| `onThemeChange` | `(theme) => void` | — | Notifica una selección del usuario. |
| `storageKey` | `string` | `"nissi-ui-theme"` | Clave de persistencia. |
| `enableSystem` | `boolean` | `true` | Habilita la opción del sistema operativo. |
| `disableTransitionOnChange` | `boolean` | `true` | Evita transiciones visuales durante el cambio. |

### `NThemeProps`

| Prop | Tipo | Predeterminado | Uso |
| --- | --- | --- | --- |
| `presentation` | `"icon" \| "button"` | `"icon"` | Apariencia del disparador. |
| `themes` | `NThemePreference[]` | Temas del proveedor | Opciones visibles en el menú. |
| `colorPalette` | `string` | `"blue"` | Paleta del control interactivo. |
| `labels` | `Partial<NThemeLabels>` | Español | Traducción de nombres y textos accesibles. |

También se exportan `NThemeName`, `NThemePreference`, `NThemeContextValue`, `defaultNThemeLabels`, `useNTheme` y `nissiSystem`.

## Extender temas

La definición canónica vive en `src/components/theme/`: registro y tipos en `types.ts`/`NThemeProvider.tsx`, nombres traducibles en `labels.ts` y tokens en `system.ts`. Un tema nuevo debe actualizar esos puntos, las pruebas, esta documentación y el catálogo. Los demás componentes no deben incorporar condicionales por tema: deben continuar usando `bg`, `bg.panel`, `bg.muted`, `fg`, `fg.muted`, `border` y `colorPalette.*`. En Nissi Dark, la paleta `blue.*` se reasigna semánticamente a los acentos de marca para que los componentes existentes respondan sin lógica adicional.

`nissiSystem` ya contiene el token crudo `colors.navy.*`; no es necesario ejecutar typegen para consumir `NTheme`. Si una aplicación importa y usa directamente tokens personalizados con tipado estricto de Chakra, puede ejecutar el typegen de Chakra sobre su configuración local.

## Accesibilidad y renderizado

- El menú usa los patrones de foco, flechas, Enter, Espacio y Escape de Chakra UI v3.
- El color no es el único indicador: cada opción tiene nombre e icono, y la activa muestra una marca.
- `next-themes` inyecta el tema inicial antes de hidratar para reducir parpadeos. En Next.js, conserva `suppressHydrationWarning` en `<html>`.
- `navy` y `nissi` anuncian `color-scheme: dark` al navegador para armonizar controles nativos y scrollbars.
