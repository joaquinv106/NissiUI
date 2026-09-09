# Accesibilidad y personalización desde cero

Esta guía explica cómo construir una interfaz clara, responsive y personalizable con Nissi UI. Está escrita para personas que comienzan en diseño o desarrollo web y complementa los ejemplos interactivos del catálogo.

## 1. Empieza por la tarea

Antes de elegir colores, responde:

1. ¿Qué necesita lograr la persona?
2. ¿Qué información necesita para decidir?
3. ¿Cuál es la acción principal?
4. ¿Qué puede salir mal y cómo se recuperará?

Una interfaz accesible mantiene esas respuestas visibles mediante títulos, agrupaciones, texto de ayuda, estados y acciones reconocibles.

## 2. Instala la librería

```bash
npm install nissi-ui @chakra-ui/react @emotion/react next-themes
```

Envuelve la aplicación con el proveedor:

```tsx
import { NThemeProvider } from "nissi-ui/theme"

export function App() {
  return <NThemeProvider><YourProduct /></NThemeProvider>
}
```

## 3. Usa estructura semántica

- Mantén un `h1` que describa la vista y continúa con `h2` y `h3` sin saltos arbitrarios.
- Usa botones para ejecutar acciones y enlaces para cambiar de ubicación.
- Etiqueta todos los campos y botones que sólo muestran un icono.
- Expresa listas, tablas, navegación y regiones con el elemento HTML correspondiente.
- Acompaña el color con texto, icono o forma; “rojo” por sí solo no explica un error.

Los componentes Nissi conservan roles, teclado, foco y estados incluso cuando se usa `unstyled`.

## 4. Personaliza por capas

Aplica únicamente el nivel necesario:

1. Props como `variant`, `colorPalette` o `size`.
2. `styles` para asignar estilos Chakra a slots tipados.
3. `classNames` para conectar CSS propio mediante nombres estables.
4. `unstyled` para control visual completo sin retirar comportamiento.
5. `NThemeProvider system={companySystem}` para tokens y decisiones globales de marca.

```tsx
import { NDocumentView } from "nissi-ui/document-view"

<NDocumentView
  unstyled
  classNames={{ document: "company-document", title: "company-document__title" }}
  styles={{
    document: {
      bg: "bg.panel",
      borderWidth: "1px",
      borderColor: "border",
      rounded: "2xl",
      p: { base: "5", md: "8" },
    },
  }}
  {...props}
/>
```

No uses clases internas generadas por Chakra o Emotion. Sólo los slots públicos, `data-scope` y `data-part` forman parte del contrato estable.

El explorador visual extiende la paleta elegida al documento embebido completo. Así, superficies como `NPanel`, menús y diálogos que Chakra monta mediante portales bajo `document.body` conservan los mismos tokens que sus disparadores.

## 5. Color y contraste

- Usa tokens semánticos como `bg`, `bg.panel`, `fg`, `fg.muted` y `border` para adaptarte a todos los temas.
- Reserva colores fijos para una identidad deliberada y comprueba su contraste en cada superficie.
- Haz visible el foco con contraste suficiente y espacio respecto al elemento.
- No uses texto tenue para información esencial.
- Comprueba estados normal, hover, focus, disabled, error y success.

El catálogo incluye las paletas Aurora, Coral nocturno y Cobalto como ejemplos de dashboards expresivos. Son demostraciones locales; una aplicación real debe convertir sus decisiones repetidas en tokens del sistema.

El submenú **Accesibilidad → Sistema visual** reúne todos los componentes visuales de la librería y demuestra el contrato compartido `unstyled` + `classNames` + `styles`. Las familias viven como menús desplegables compactos en el header y Aurora, Coral y Cobalto se eligen con controles pequeños; la paleta actualiza los tokens semánticos del componente activo, no sólo el fondo de la página.

El explorador **Todo Nissi UI** agrupa el catálogo completo por fundación, datos/formularios, flujos, comercio, patrones y proyectos. Cada opción abre una vista interactiva embebida con los ejemplos, variantes y código existentes; sólo carga un ejemplo a la vez para conservar rendimiento, una jerarquía comprensible y navegación de teclado predecible. La composición extensa permanece disponible bajo un detalle expandible para evitar saturación visual.

## 6. Responsive

Empieza por móvil y agrega columnas cuando exista espacio:

```tsx
<SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="4">
  {cards}
</SimpleGrid>
```

Comprueba al menos:

- 320 px de ancho sin desplazamiento horizontal global.
- Zoom del navegador al 200%.
- Textos traducidos o nombres largos.
- Controles táctiles cómodos.
- Tablas en modo scroll o stack según el contexto.

## 7. Teclado y lectores de pantalla

Recorre cada flujo sólo con teclado. El orden de foco debe coincidir con el orden visual. Los diálogos deben atrapar el foco, cerrar con Escape cuando sea apropiado y devolverlo al elemento que los abrió.

Los resultados asincrónicos requieren anuncios mediante `role="status"` o `role="alert"`. Los gráficos necesitan una descripción o resumen textual porque una figura visual no comunica sus valores a todas las personas.

## 8. SSR, tree shaking e impresión

Usa subrutas cuando quieras imports pequeños y explícitos:

```tsx
import { NPanel } from "nissi-ui/panel"
import { NThermalPrint } from "nissi-ui/thermal-print"
```

Los módulos interactivos conservan `"use client"` y pueden importarse durante SSR sin acceder inmediatamente a `window` o `document`. `NThermalPrint` separa la presentación del ticket del mecanismo de impresión; un adaptador local sigue siendo necesario para impresión silenciosa, corte o apertura de cajón.

## 9. Lista de comprobación

- La tarea y la acción principal se entienden sin explicación externa.
- Títulos y regiones tienen una jerarquía coherente.
- Todo funciona con teclado y el foco siempre es visible.
- El color no es la única señal.
- Móvil, zoom, tema oscuro y textos largos funcionan.
- Loading, vacío, error y éxito están contemplados.
- Los textos del componente viven en `labels`.
- La autorización real continúa en el backend.
- Pasan `npm run typecheck`, `npm test`, `npm run build` y `npm run check:package`.

Consulta también [Personalización compatible](./customization.md), [Temas](./theme.md) y [Empaquetado, tree shaking y SSR](./package-compatibility.md).
