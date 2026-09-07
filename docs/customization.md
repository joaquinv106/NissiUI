# Personalización compatible

Nissi UI conserva su apariencia predeterminada y permite personalizar componentes gradualmente mediante un contrato compartido. `NComponentStyleProps<TSlot>` expone tres propiedades opcionales:

```ts
interface NComponentStyleProps<TSlot extends string> {
  unstyled?: boolean
  classNames?: Partial<Record<TSlot, string>>
  styles?: Partial<Record<TSlot, SystemStyleObject>>
}
```

- `unstyled` retira decoración predeterminada, pero conserva semántica, layout funcional, estados, callbacks, foco y teclado.
- `classNames` permite integrar CSS propio usando nombres de slot tipados.
- `styles` aplica objetos `SystemStyleObject` de Chakra UI v3 a esos mismos slots.
- Cada slot genera `data-scope` y `data-part`; las clases internas de Chakra no forman parte del contrato público.

El valor predeterminado de `unstyled` es `false`, por lo que las aplicaciones existentes no cambian.

## Ejemplo

```tsx
import { NPanel } from "nissi-ui/panel"

<NPanel
  open
  title="Detalle"
  classNames={{ content: "company-panel", body: "company-panel__body" }}
  styles={{ body: { px: "8", bg: "bg.subtle" } }}
>
  <Detail />
</NPanel>
```

Para controlar completamente la superficie:

```tsx
<NPanel
  unstyled
  classNames={{ content: "raw-dialog", closeTrigger: "raw-dialog__close" }}
  styles={{ content: { width: "min(42rem, 100vw)", bg: "bg.panel" } }}
>
  <Detail />
</NPanel>
```

## Componentes cubiertos inicialmente

| Componente | Slots adicionales principales |
| --- | --- |
| `NPanel` | `content`, `header`, `title`, `description`, `body`, `footer`, `closeTrigger`, `backdrop` |
| `NDocumentView` | `root`, `actions`, `document`, `documentHeader`, `title`, `metadata`, `section`, `documentFooter` |
| `NReceipt` | Slots de documento más `lines`, `line`, `lineLabel`, `summary`, `total` |
| `NThermalPrint` | `root`, `trigger`, `error`, `source` |

Los tipos `NPanelSlot`, `NDocumentViewSlot`, `NReceiptSlot` y `NThermalPrintSlot` son públicos. El contrato se extenderá por familias sin retirar props históricas ni exponer módulos `internal/`.

## Sistema Chakra propio

`NThemeProvider` usa `nissiSystem` de forma predeterminada, pero acepta `system` para organizaciones que mantienen una configuración Chakra propia:

```tsx
<NThemeProvider system={companySystem} defaultTheme="system">
  <App />
</NThemeProvider>
```

El sistema alternativo debe definir los tokens consumidos por la aplicación. Para conservar la apariencia adaptativa de Nissi UI se recomiendan `bg`, `bg.panel`, `bg.muted`, `fg`, `fg.muted`, `border` y las paletas semánticas de estado.

## Compatibilidad

- No dependas de clases hash generadas por Chakra o Emotion.
- Considera nombres de slots y atributos `data-*` como API versionada.
- Prefiere `styles` para ajustes locales y un sistema Chakra propio para decisiones globales.
- Un modo `unstyled` no desactiva reglas de permisos, validación, estado controlado ni adaptadores.
