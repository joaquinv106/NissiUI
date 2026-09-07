import { ChakraProvider, Text, defaultSystem } from "@chakra-ui/react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { createRef } from "react"
import { describe, expect, it, vi } from "vitest"

import { NThermalPrint } from "./NThermalPrint"
import type { NThermalPrintHandle } from "./types"

function renderWithProvider(node: React.ReactNode) {
  return render(<ChakraProvider value={defaultSystem}>{node}</ChakraProvider>)
}

describe("NThermalPrint", () => {
  it("aísla el contenido y abre la impresión del navegador con formato de 80 mm", async () => {
    const print = vi.fn(() => {
      expect(document.body).toHaveAttribute("data-nissi-thermal-printing")
      expect(document.body.querySelector("[data-nissi-thermal-print-host]")).toHaveTextContent("Ticket V-100")
      expect(document.body.querySelector("[data-nissi-thermal-print-style]")).toHaveTextContent("size: 80mm auto")
    })
    Object.defineProperty(window, "print", { configurable: true, value: print })

    renderWithProvider(<NThermalPrint><Text>Ticket V-100</Text></NThermalPrint>)
    fireEvent.click(screen.getByRole("button", { name: "Imprimir ticket" }))

    await waitFor(() => expect(print).toHaveBeenCalledOnce())
    expect(document.body).not.toHaveAttribute("data-nissi-thermal-printing")
    expect(document.body.querySelector("[data-nissi-thermal-print-host]")).not.toBeInTheDocument()
  })

  it("entrega configuración, HTML y opciones de hardware a un adaptador", async () => {
    const adapter = vi.fn()
    renderWithProvider(<NThermalPrint
      paperWidthMm={58}
      marginMm={2}
      fontSizePt={8}
      documentTitle="Venta V-100"
      job={{ copies: 2, cut: "partial", openCashDrawer: true }}
      adapter={adapter}
    ><Text>Contenido adaptable</Text></NThermalPrint>)

    fireEvent.click(screen.getByRole("button", { name: "Imprimir ticket" }))
    await waitFor(() => expect(adapter).toHaveBeenCalledOnce())

    const context = adapter.mock.calls[0][0]
    expect(context.configuration).toMatchObject({
      paperWidthMm: 58,
      contentWidthMm: 54,
      marginMm: 2,
      fontSizePt: 8,
      job: { copies: 2, cut: "partial", openCashDrawer: true },
    })
    expect(context.html).toContain("Contenido adaptable")
    expect(context.documentTitle).toBe("Venta V-100")
  })

  it("se integra por render prop con botones de impresión existentes", async () => {
    const adapter = vi.fn()
    renderWithProvider(<NThermalPrint showTrigger={false} adapter={adapter}>
      {({ print }) => <button type="button" onClick={() => { void print() }}>Imprimir recibo existente</button>}
    </NThermalPrint>)

    expect(screen.queryByRole("button", { name: "Imprimir ticket" })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Imprimir recibo existente" }))
    await waitFor(() => expect(adapter).toHaveBeenCalledOnce())
  })

  it("expone una referencia imperativa y comunica errores traducibles", async () => {
    const ref = createRef<NThermalPrintHandle>()
    const failure = new Error("Impresora desconectada")
    const onPrintError = vi.fn()
    renderWithProvider(<NThermalPrint
      ref={ref}
      showTrigger={false}
      adapter={() => { throw failure }}
      onPrintError={onPrintError}
      labels={{ printError: "Printer unavailable" }}
    ><Text>Ticket</Text></NThermalPrint>)

    let result
    await act(async () => { result = await ref.current?.print() })
    expect(result).toMatchObject({ success: false, reason: "failed", error: failure })
    expect(onPrintError).toHaveBeenCalledWith(failure)
    expect(screen.getByRole("alert")).toHaveTextContent("Printer unavailable")
  })

  it("acepta modo unstyled, clases y estilos sin retirar la acción", () => {
    renderWithProvider(<NThermalPrint
      unstyled
      classNames={{ root: "custom-printer", trigger: "custom-trigger", source: "custom-source" }}
      styles={{ source: { px: "7" } }}
    ><Text>Ticket configurable</Text></NThermalPrint>)

    const trigger = screen.getByRole("button", { name: "Imprimir ticket" })
    expect(trigger).toHaveClass("custom-trigger")
    expect(trigger).toHaveAttribute("data-part", "trigger")
    expect(screen.getByText("Ticket configurable").parentElement).toHaveClass("custom-source")
  })
})
