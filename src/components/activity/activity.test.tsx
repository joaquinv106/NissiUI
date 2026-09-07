import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NActivityTimeline, NFileUpload, NNotificationCenter } from "./index"

const renderUI = (node: React.ReactNode) => render(<ChakraProvider value={defaultSystem}>{node}</ChakraProvider>)
describe("actividad y archivos", () => {
  it("agrega y elimina archivos válidos", () => {
    const change = vi.fn(); const file = new File(["demo"], "comprobante.txt", { type: "text/plain" })
    renderUI(<NFileUpload onFilesChange={change} />)
    fireEvent.change(screen.getByLabelText("Seleccionar archivos"), { target: { files: [file] } })
    expect(screen.getByText("comprobante.txt")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Quitar comprobante.txt" }))
    expect(change).toHaveBeenLastCalledWith([])
  })
  it("rechaza archivos por tamaño", () => {
    const rejected = vi.fn(); const file = new File(["grande"], "grande.txt")
    renderUI(<NFileUpload maxSize={2} onRejected={rejected} />)
    fireEvent.change(screen.getByLabelText("Seleccionar archivos"), { target: { files: [file] } })
    expect(screen.getByRole("alert")).toBeInTheDocument(); expect(rejected).toHaveBeenCalledWith([file])
  })
  it("presenta una línea de actividad", () => {
    renderUI(<NActivityTimeline items={[{ id: "1", title: "Pago aprobado", timestamp: "10:30" }, { id: "2", title: "Recibo emitido" }]} />)
    expect(screen.getByRole("list", { name: "Actividad" })).toHaveTextContent("Pago aprobado")
  })
  it("abre notificaciones y comunica acciones", async () => {
    const mark = vi.fn(); const select = vi.fn()
    renderUI(<NNotificationCenter notifications={[{ id: "n1", title: "Nuevo depósito", read: false }]} onMarkRead={mark} onSelect={select} />)
    fireEvent.click(screen.getByRole("button", { name: /Notificaciones/ }))
    fireEvent.click(await screen.findByRole("button", { name: "Nuevo depósito" }))
    expect(mark).toHaveBeenCalledWith("n1"); expect(select).toHaveBeenCalled()
  })
})
