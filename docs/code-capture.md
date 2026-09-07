# NCodeCapture

`NCodeCapture` unifica códigos de barras, QR, Data Matrix, folios y activos provenientes de escritura, pegado, lectores USB/Bluetooth tipo teclado, cámaras y bridges de handhelds. El componente administra interacción, sesiones, cola, validación y feedback; el SDK elegido por la aplicación conserva el acceso al hardware y la decodificación óptica.

## Captura básica y lectura puntual

La API original continúa disponible. `onRequestScan` puede devolver un `string` o una lectura estructurada:

```tsx
<NCodeCapture
  onRequestScan={() => camera.read()}
  normalize={(raw) => raw.trim().toUpperCase()}
  validate={(code) => inventory.validateCode(code)}
  onCapture={(code, details) => inventory.add(code, details)}
/>
```

```tsx
<NCodeCapture
  onRequestScan={() => ({
    code: "7501000000014",
    format: "ean_13",
    source: "camera",
    device: { id: "rear", label: "Cámara posterior", type: "camera" },
  })}
  onCapture={(code, details) => console.log(details.format)}
/>
```

## Cámara, handheld o bridge nativo

`scannerAdapter` representa una sesión push. Funciona con Zebra DataWedge, Honeywell Mobility SDK, ML Kit, ZXing, Capacitor, React Native WebView o un proveedor web sin agregar esas dependencias a Nissi UI.

```tsx
const adapter: NCodeCaptureScannerAdapter = {
  id: "datawedge",
  label: "Zebra DataWedge",
  source: "handheld",
  capabilities: { continuous: true },
  isSupported: () => dataWedge.isAvailable(),
  start: ({ signal, onScan, onError }) => {
    const unsubscribe = dataWedge.subscribe(
      (event) => void onScan({
        code: event.data,
        format: event.symbology,
        source: "handheld",
        device: { id: event.deviceId, type: "handheld" },
        metadata: event.metadata,
        detectedAt: new Date(),
      }),
      (cause) => onError({ code: "device-disconnected", cause }),
    )
    signal.addEventListener("abort", unsubscribe, { once: true })
    return unsubscribe
  },
}

<NCodeCapture
  scannerAdapter={adapter}
  continuousScan
  autoStartScanner
  onCapture={processCode}
/>
```

El adaptador puede declarar `capabilities.torch` e implementar `setTorch(enabled)`; NCodeCapture mostrará un control accesible de linterna mientras la sesión esté activa. `scannerPreview` permite montar el video o visor provisto por el SDK dentro de la superficie del componente.

## Lector USB/Bluetooth tipo teclado

Con el foco en el campo, el sufijo `Enter` funciona sin configuración. Para capturar ráfagas aun cuando otro elemento de la página tiene foco:

```tsx
<NCodeCapture
  keyboardWedge={{
    captureGlobally: true,
    minLength: 6,
    maxInterKeyDelayMs: 60,
    terminatorKeys: ["Enter", "Tab"],
  }}
  onCapture={processCode}
/>
```

La detección global ignora campos editables por defecto para no secuestrar escritura humana. Ajusta velocidad, longitud y sufijos al perfil configurado en el lector. Las lecturas se reportan con `source: "hid"` y `device.type: "keyboard-wedge"`.

## Interpretación tipada

El decodificador debe reportar la simbología real; no es confiable deducir QR, Code 128 o EAN únicamente desde el texto. `parse` transforma el contenido ya decodificado a un modelo propio —por ejemplo GS1, un QR de pago o un folio SAT— y lo entrega como `details.parsed`:

```tsx
interface Gs1Data { gtin: string; lot?: string; expiresAt?: string }

<NCodeCapture<Gs1Data>
  scannerAdapter={cameraAdapter}
  parse={(code, input) => gs1.parse(code, input.format)}
  validate={(code) => gs1.isValid(code) ? undefined : "GS1 inválido"}
  onCapture={(_code, { parsed, format, device }) => save(parsed, format, device)}
/>
```

`NCodeCaptureInput` y `NCodeCaptureDetails<TParsed>` admiten `format`, `device`, `metadata` y `detectedAt`. Los formatos conocidos incluyen QR, Data Matrix, Aztec, PDF417, Code 128/39/93, Codabar, EAN, UPC e ITF, y aceptan identificadores adicionales de un SDK.

## Resiliencia de la sesión

- `continuousScan` conserva la sesión; en modo puntual se detiene después de una captura exitosa.
- `maxQueuedScans` limita ráfagas mientras `validate`, `parse` u `onCapture` están procesando.
- `AbortSignal`, la función de limpieza y `stop()` liberan cámara/listeners al detener o desmontar.
- `isSupported()` evita iniciar integraciones no disponibles.
- `onScannerStateChange` reporta `idle`, `starting`, `active`, `stopping`, `unsupported`, `permission-denied`, `disconnected` o `error`.
- `onScannerError` recibe errores tipados: permisos, desconexión, cancelación o desconocido.
- `allowDuplicate={false}` bloquea el mismo código durante `duplicateWindowMs`; habilítalo en conteos donde una repetición sea válida.

## Accesibilidad y límites

El input usa `Field`, los controles son botones nativos, los estados se anuncian y las cadenas pertenecen a `NCodeCaptureLabels`. La interfaz se apila en móvil, usa tokens semánticos y permite integrar un preview sin imponer su implementación.

Nissi UI no incluye secretos, permisos de cámara, drivers, decodificadores ni reglas GS1/SAT. Esas responsabilidades pertenecen al adaptador y al backend; el componente ofrece el contrato para conectarlos, cancelarlos y observarlos de forma consistente.
