# NCtrl

`NCtrl` administra combinaciones de teclado de la vista activa y las presenta en un `NPanel` responsive. Está orientado a flujos de alta frecuencia —punto de venta, almacén, captura o facturación— donde usar teclas de función reduce cambios entre teclado y mouse.

## Integración global

Monta un único panel cerca de la raíz. `F11` lo abre por defecto y el botón flotante permanece como alternativa táctil y como mecanismo descubrible.

```tsx
<NCtrlProvider>
  <AppRoutes />
  <NCtrl viewId={route.id} viewLabel={route.title} />
</NCtrlProvider>
```

> Algunos navegadores o entornos administrados reservan F11 para pantalla completa. NCtrl intenta cancelar ese comportamiento, pero el botón flotante garantiza acceso; `toggleShortcut` permite elegir otra combinación.

## Atajos declarativos por vista

```tsx
const shortcuts: NCtrlShortcut[] = [
  {
    id: "checkout",
    keys: ["F4", "Ctrl+Enter"],
    label: "Ir al cobro",
    group: "Venta",
    handler: openCheckout,
    allowInEditable: true,
  },
  {
    id: "cash",
    keys: "F6",
    label: "Cobrar en efectivo",
    description: "Finaliza la venta usando efectivo.",
    group: "Cobro directo",
    handler: chargeCash,
    disabled: !canCharge,
  },
]

<NCtrl viewId="pos-sale" viewLabel="Punto de venta" shortcuts={shortcuts} />
```

Al cambiar `viewId`, el panel limpia su búsqueda y muestra la colección nueva. Los handlers pueden ser síncronos o asíncronos; mientras uno corre, se bloquean ejecuciones adicionales.

## Registro desde componentes

Los componentes descendientes pueden publicar acciones sin conocer dónde está el panel:

```tsx
function SaleActions() {
  useNCtrlShortcut({
    id: "new-sale",
    keys: "F2",
    label: "Nueva venta",
    group: "Venta",
    handler: createSale,
  })

  useNCtrlShortcuts(paymentShortcuts)
  return <SaleToolbar />
}
```

Los atajos registrados se retiran al desmontar el componente. Si un atajo declarado directamente en `NCtrl` comparte `id` con uno registrado, el declarado tiene precedencia.

## Contrato de teclado

- Una cadena representa una combinación: `F2`, `Ctrl+S`, `Alt+N` o `Mod+K`.
- Un arreglo representa alternativas para la misma función.
- `Mod` se convierte en `⌘` en Apple y `Ctrl` en otras plataformas.
- Por defecto no se ejecutan acciones dentro de inputs, selects, textareas o contenido editable. `allowInEditable` habilita casos POS como F6 dentro del campo de código.
- `preventDefault={false}` conserva el comportamiento nativo cuando sea necesario.
- `repeat` permite responder a la repetición por mantener la tecla presionada; está desactivado por defecto.
- `priority` decide qué acción ejecutar si dos combinaciones coinciden; `onShortcutConflict` permite auditar el conflicto.
- `executeShortcuts={false}` convierte el componente en una guía sin ejecutar acciones.
- `disableShortcutsWhileOpen` evita activar operaciones accidentalmente mientras se consulta el panel.

## Estado, permisos y seguridad

`disabled` comunica que una acción existe pero no está disponible; `hidden` la retira completamente. La aplicación debe derivar ambos desde su estado y permisos actuales. NCtrl controla presentación y eventos del navegador: el backend debe volver a validar permisos, precios, inventario, formas de pago e idempotencia antes de completar una operación.

`onShortcutInvoke`, `onShortcutError` y `onShortcutConflict` permiten telemetría. Los errores se anuncian dentro del panel, pero no se exponen mensajes técnicos automáticamente.

## Responsive y accesibilidad

En móvil, `NPanel` ocupa el viewport y las acciones se muestran en una columna; desde `md` usan dos columnas. El panel atrapa/restaura foco, cierra con Escape, incluye búsqueda etiquetada y representa combinaciones con `Kbd` y `aria-keyshortcuts`. Todos los textos internos pertenecen a `NCtrlLabels`.
