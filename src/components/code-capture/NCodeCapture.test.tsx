import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NCodeCapture } from "./NCodeCapture"
import type { NCodeCaptureScannerAdapter } from "./types"

function renderCapture(props: Partial<React.ComponentProps<typeof NCodeCapture>> = {}) {
  const onCapture = props.onCapture ?? vi.fn()
  return { onCapture, ...render(<ChakraProvider value={defaultSystem}><NCodeCapture onCapture={onCapture} {...props} /></ChakraProvider>) }
}

describe("NCodeCapture", () => {
  it("normaliza y procesa por Enter con el origen correcto", async () => {
    const onCapture = vi.fn()
    renderCapture({ onCapture })
    const input = screen.getByRole("textbox", { name: "Código" })
    fireEvent.change(input, { target: { value: "  ABC-12  " } })
    fireEvent.keyDown(input, { key: "Enter" })
    await waitFor(() => expect(onCapture).toHaveBeenCalledWith("ABC-12", { code: "ABC-12", rawCode: "  ABC-12  ", source: "keyboard" }))
    expect(screen.getByRole("status")).toHaveTextContent("Código procesado correctamente")
    expect(input).toHaveValue("")
  })

  it("procesa el resultado de un lector externo y conserva su feedback", async () => {
    const onCapture = vi.fn(() => ({ success: true, message: "Producto agregado" }))
    renderCapture({ onCapture, onRequestScan: async () => "QR-900" })
    fireEvent.click(screen.getByRole("button", { name: "Abrir lector" }))
    await waitFor(() => expect(onCapture).toHaveBeenCalledWith("QR-900", expect.objectContaining({ source: "external" })))
    expect(screen.getByRole("status")).toHaveTextContent("Producto agregado")
  })

  it("valida antes de capturar y bloquea duplicados accidentales", async () => {
    const onCapture = vi.fn()
    const validate = vi.fn((code: string) => code.startsWith("OK-") ? undefined : "Formato inválido")
    renderCapture({ onCapture, validate })
    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "BAD" } })
    fireEvent.click(screen.getByRole("button", { name: "Procesar código" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Formato inválido")
    expect(onCapture).not.toHaveBeenCalled()
    fireEvent.change(input, { target: { value: "OK-1" } })
    fireEvent.click(screen.getByRole("button", { name: "Procesar código" }))
    await waitFor(() => expect(onCapture).toHaveBeenCalledTimes(1))
    fireEvent.change(input, { target: { value: "OK-1" } })
    fireEvent.click(screen.getByRole("button", { name: "Procesar código" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("acaba de procesarse")
    expect(onCapture).toHaveBeenCalledTimes(1)
  })

  it("respeta valor controlado, solo lectura y etiquetas traducibles", () => {
    const onValueChange = vi.fn()
    const { rerender } = renderCapture({ value: "FIXED", onValueChange, readOnly: true, labels: { inputLabel: "Scan code" } })
    expect(screen.getByRole("textbox", { name: "Scan code" })).toHaveValue("FIXED")
    expect(screen.getByRole("button", { name: "Procesar código" })).toBeDisabled()
    rerender(<ChakraProvider value={defaultSystem}><NCodeCapture value="NEXT" onValueChange={onValueChange} onCapture={vi.fn()} /></ChakraProvider>)
    expect(screen.getByRole("textbox")).toHaveValue("NEXT")
  })

  it("entrega formato, dispositivo, metadata y datos interpretados de un lector", async () => {
    const onCapture = vi.fn()
    renderCapture({
      onCapture,
      onRequestScan: () => ({
        code: "(01)7501000000014(10)LOT-7",
        source: "camera",
        format: "data_matrix",
        device: { id: "rear", type: "camera" },
        metadata: { cornerPoints: 4 },
        detectedAt: new Date("2026-09-07T12:00:00.000Z"),
      }),
      parse: (code) => ({ gtin: code.slice(4, 17), lot: "LOT-7" }),
    })
    fireEvent.click(screen.getByRole("button", { name: "Abrir lector" }))
    await waitFor(() => expect(onCapture).toHaveBeenCalledWith(
      "(01)7501000000014(10)LOT-7",
      expect.objectContaining({
        source: "camera",
        format: "data_matrix",
        device: { id: "rear", type: "camera" },
        metadata: { cornerPoints: 4 },
        parsed: { gtin: "7501000000014", lot: "LOT-7" },
      }),
    ))
  })

  it("opera un adaptador continuo y permite detenerlo", async () => {
    let emit: Parameters<NCodeCaptureScannerAdapter["start"]>[0]["onScan"] | undefined
    const stop = vi.fn()
    const adapter: NCodeCaptureScannerAdapter = {
      id: "handheld",
      label: "Zebra DataWedge",
      source: "handheld",
      start: ({ onScan }) => { emit = onScan },
      stop,
    }
    const onCapture = vi.fn()
    renderCapture({ scannerAdapter: adapter, continuousScan: true, onCapture })
    fireEvent.click(screen.getByRole("button", { name: "Iniciar lector" }))
    expect(await screen.findByText(/Zebra DataWedge · Lector activo/)).toBeInTheDocument()
    await emit?.({ code: "EAN-1", format: "ean_13" })
    await waitFor(() => expect(onCapture).toHaveBeenCalledWith("EAN-1", expect.objectContaining({ source: "handheld", format: "ean_13" })))
    fireEvent.click(screen.getByRole("button", { name: "Detener lector" }))
    await waitFor(() => expect(stop).toHaveBeenCalled())
    expect(await screen.findByText(/Lector detenido/)).toBeInTheDocument()
  })

  it("captura una ráfaga HID global sin requerir foco en el input", async () => {
    const onCapture = vi.fn()
    renderCapture({ keyboardWedge: true, onCapture })
    for (const key of "ABC123") fireEvent.keyDown(window, { key })
    fireEvent.keyDown(window, { key: "Enter" })
    await waitFor(() => expect(onCapture).toHaveBeenCalledWith("ABC123", expect.objectContaining({
      source: "hid",
      device: { type: "keyboard-wedge" },
    })))
  })

  it("comunica cuando el adaptador no es compatible", async () => {
    const adapter: NCodeCaptureScannerAdapter = { id: "camera", isSupported: () => false, start: vi.fn() }
    renderCapture({ scannerAdapter: adapter })
    fireEvent.click(screen.getByRole("button", { name: "Iniciar lector" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Lector no compatible")
    expect(adapter.start).not.toHaveBeenCalled()
  })

  it("distingue permisos denegados y notifica el error al host", async () => {
    const onScannerError = vi.fn()
    const stop = vi.fn()
    const adapter: NCodeCaptureScannerAdapter = {
      id: "camera",
      start: ({ onError }) => onError({ code: "permission-denied", message: "Autoriza la cámara" }),
      stop,
    }
    renderCapture({ scannerAdapter: adapter, onScannerError })
    fireEvent.click(screen.getByRole("button", { name: "Iniciar lector" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Autoriza la cámara")
    expect(await screen.findByText(/Permiso del lector denegado/)).toBeInTheDocument()
    expect(onScannerError).toHaveBeenCalledWith(expect.objectContaining({ code: "permission-denied" }))
    expect(stop).toHaveBeenCalled()
  })

  it("expone un control de linterna sólo durante una sesión compatible", async () => {
    const setTorch = vi.fn()
    const adapter: NCodeCaptureScannerAdapter = {
      id: "mobile-camera",
      capabilities: { camera: true, torch: true },
      start: vi.fn(),
      setTorch,
    }
    renderCapture({ scannerAdapter: adapter })
    expect(screen.queryByRole("button", { name: "Encender linterna" })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Iniciar lector" }))
    const torch = await screen.findByRole("button", { name: "Encender linterna" })
    fireEvent.click(torch)
    await waitFor(() => expect(setTorch).toHaveBeenCalledWith(true))
    expect(await screen.findByRole("button", { name: "Apagar linterna" })).toBeInTheDocument()
  })
})
