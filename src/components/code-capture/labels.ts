import type { NCodeCaptureLabels } from "./types"

export const defaultNCodeCaptureLabels: NCodeCaptureLabels = {
  captureLabel: "Captura de código",
  inputLabel: "Código",
  placeholder: "Escribe, pega o escanea un código",
  helperText: "Presiona Enter para procesar el código.",
  submit: "Procesar código",
  requestScan: "Abrir lector",
  requestingScan: "Abriendo lector",
  startScanner: "Iniciar lector",
  stopScanner: "Detener lector",
  scannerIdle: "Lector detenido",
  scannerStarting: "Iniciando lector",
  scannerActive: "Lector activo",
  scannerStopping: "Deteniendo lector",
  scannerUnsupported: "Lector no compatible",
  scannerPermissionDenied: "Permiso del lector denegado",
  scannerDisconnected: "Lector desconectado",
  scannerError: "Error del lector",
  enableTorch: "Encender linterna",
  disableTorch: "Apagar linterna",
  processing: "Procesando código",
  clear: "Limpiar código",
  required: "Captura un código antes de continuar.",
  invalid: "El código no es válido.",
  duplicate: "Este código acaba de procesarse.",
  captured: "Código procesado correctamente.",
  captureFailed: "No fue posible procesar el código.",
  scannerFailed: "No fue posible obtener un código del lector.",
  queueFull: "El lector envió demasiados códigos. Intenta nuevamente.",
}

export function resolveNCodeCaptureLabels(labels?: Partial<NCodeCaptureLabels>): NCodeCaptureLabels {
  return { ...defaultNCodeCaptureLabels, ...labels }
}
