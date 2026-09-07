# NCodeCapture

`NCodeCapture` captura códigos de barras, QR, folios, activos o identificadores mediante escritura, pegado, lectores que emulan teclado y proveedores externos. No depende de una cámara ni de un SDK concreto.

## Uso

```tsx
<NCodeCapture
  onRequestScan={() => scanner.read()}
  normalize={(raw) => raw.trim().toUpperCase()}
  validate={(code) => validateFormat(code)}
  onCapture={(code, details) => processCode(code, details)}
/>
```

## Contrato

- `value`/`defaultValue` y `onValueChange` ofrecen estado controlado o no controlado.
- `onCapture(code, details)` recibe el valor normalizado, el original y el origen `manual`, `keyboard`, `paste` o `external`. Acepta `void`, booleano o `{ success, message }`, también asíncronos.
- `onRequestScan` integra cámara web, lector nativo o cualquier SDK. La librería no solicita permisos ni presume disponibilidad de hardware.
- `normalize` y `validate` ejecutan antes de `onCapture`. Un resultado fallido nunca se anuncia como captura exitosa.
- `allowDuplicate={false}` bloquea repeticiones del mismo código durante `duplicateWindowMs`; puede desactivarse para conteos legítimos.
- `clearOnSuccess` limpia el campo después de una confirmación, conservando el feedback visible.

## Accesibilidad y operación

El input tiene etiqueta y ayuda configurables; Enter procesa lectores de teclado y los botones son nativos. Errores usan `alert`, confirmaciones usan `status` y todas las cadenas pertenecen a `NCodeCaptureLabels`. Durante validación, captura o lectura externa se bloquean envíos duplicados. En móvil, input y acciones se apilan sin superposición.

La cámara, el catálogo consultado, la autorización y la persistencia pertenecen a la aplicación consumidora.
