import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NCodeCapture } from "./NCodeCapture"

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
})
