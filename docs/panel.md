# NPanel

`NPanel` presenta cualquier flujo o detalle en una superficie lateral modal. Puede contener `NCheckout`, `NReceipt`, `NForm`, una tabla, un historial o cualquier nodo React; no conoce ni administra el tipo de contenido.

## Uso controlado y contenido dinámico

```tsx
const [panel, setPanel] = useState<"checkout" | "receipt" | null>(null)

<NPanel
  open={panel !== null}
  onOpenChange={(open) => {
    if (!open) setPanel(null)
  }}
  contentKey={panel ?? "closed"}
  title={panel === "checkout" ? "Finalizar pago" : "Recibo"}
>
  {panel === "checkout"
    ? <NCheckout {...checkoutProps} />
    : <NReceipt {...receiptProps} />}
</NPanel>
```

`open` es la señal controlada del sistema. Cambiar `children`, `title` o `footer` actualiza el panel sin cerrarlo. `contentKey` es opcional: al cambiar reinicia el estado interno del subárbol, útil al sustituir una operación por otra; si debe conservarse, se omite.

También existe el modo local:

```tsx
<NPanel trigger={<Button>Ver detalle</Button>} title="Detalle">
  <Detail />
</NPanel>
```

## Posición y dimensiones

- `placement="auto"` es el valor predeterminado. Dentro de `NAppShell`, aparece automáticamente al lado opuesto de `sidebarPosition`.
- Fuera de `NAppShell`, `auto` presupone un sidebar al inicio y abre el panel al final. `sidebarPosition` permite comunicar otra disposición.
- `placement="start" | "end"` fija explícitamente la dirección.
- En móvil usa `100vw`; desde `md`, `desktopWidth` vale `clamp(32rem, 46vw, 48rem)` y puede adaptarse al flujo.
- La superficie y su positioner miden `100dvh`: encabezado y pie permanecen visibles y sólo el cuerpo desplaza su contenido.

## Interacción modal

El componente usa el `Drawer` accesible de Chakra UI v3 mediante un portal. Incluye overlay, bloqueo de scroll, foco atrapado, cierre con Escape o interacción exterior, restauración de foco, botón de cierre y animaciones laterales. Las animaciones se eliminan cuando el sistema solicita movimiento reducido.

Para operaciones que no pueden descartarse accidentalmente:

```tsx
<NPanel closeOnEscape={false} closeOnInteractOutside={false}>
  <CriticalProcess />
</NPanel>
```

En aperturas controladas desde un botón externo, `returnFocusRef` identifica de forma determinista dónde devolver el foco. `initialFocusRef` puede dirigirlo al primer control significativo.

## API principal

| Prop | Tipo | Predeterminado | Uso |
| --- | --- | --- | --- |
| `open` / `defaultOpen` | `boolean` | `false` | Estado controlado o inicial. |
| `onOpenChange` | `(open: boolean) => void` | — | Publica apertura y cierre desde cualquier causa. |
| `placement` | `"auto" \| "start" \| "end"` | `"auto"` | Resuelve o fija el lado del panel. |
| `sidebarPosition` | `"start" \| "end"` | contexto | Posición del sidebar cuando no existe `NAppShell`. |
| `desktopWidth` | `string` | `clamp(32rem, 46vw, 48rem)` | Ancho legible en pantallas medianas y grandes. |
| `title` / `description` | `ReactNode` | título accesible | Encabezado del diálogo. |
| `children` | `ReactNode` | — | Componente o vista activa. |
| `contentKey` | `React.Key` | — | Reinicia el subárbol al sustituir contenido. |
| `headerActions` / `footer` | `ReactNode` | — | Acciones y cierre del flujo. |
| `trigger` | `ReactElement` | — | Disparador opcional para modo no controlado. |
| `closeOnEscape` / `closeOnInteractOutside` | `boolean` | `true` | Políticas de descarte. |
| `modal` / `trapFocus` / `preventScroll` | `boolean` | `true` | Comportamiento modal accesible. |
| `initialFocusRef` / `returnFocusRef` | `RefObject` | — | Destinos explícitos de foco. |
| `labels` | `Partial<NPanelLabels>` | español | Título alternativo y nombre del cierre. |
| `unstyled` | `boolean` | `false` | Retira decoración conservando Drawer, foco y controles. |
| `classNames` / `styles` | slots tipados | — | Personaliza partes públicas sin depender del DOM interno. |

Los slots disponibles incluyen `content`, `header`, `title`, `description`, `headerActions`, `body`, `footer`, `closeTrigger`, `backdrop`, `positioner` y `trigger`. Consulta [Personalización compatible](./customization.md).

## Responsabilidades

`NPanel` controla exclusivamente presentación e interacción. La aplicación sigue siendo responsable del estado del flujo, permisos, confirmación de cambios sin guardar, persistencia, errores de red y reglas de negocio.
