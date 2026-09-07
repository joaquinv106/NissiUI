import { ChakraProvider, Text, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NBalanceSession } from "./NBalanceSession"

interface Entry { id: string; label: string; amount: number }
const entries: Entry[] = [{ id: "in", label: "Entrada", amount: 50 }, { id: "out", label: "Salida", amount: -20 }]

function renderSession(props: Partial<React.ComponentProps<typeof NBalanceSession<Entry>>> = {}) {
  return render(<ChakraProvider value={defaultSystem}><NBalanceSession sessionId="session-1" entries={entries} openingAmount={100} getEntryId={(entry) => entry.id} getEntryLabel={(entry) => entry.label} getEntryAmount={(entry) => entry.amount} {...props} /></ChakraProvider>)
}

describe("NBalanceSession", () => {
  it("calcula el saldo esperado y presenta movimientos con signo", () => {
    renderSession()
    expect(screen.getByText("130")).toBeInTheDocument()
    expect(screen.getByText("Entrada")).toBeInTheDocument()
    expect(screen.getByText("-20")).toBeInTheDocument()
    expect(screen.getByText("Abierta")).toBeInTheDocument()
  })

  it("actualiza el conteo y publica el resumen reactivo", async () => {
    const onCountedAmountChange = vi.fn()
    renderSession({ onCountedAmountChange })
    fireEvent.input(screen.getByRole("spinbutton", { name: "Saldo contado" }), { target: { value: "130" } })
    await waitFor(() => expect(onCountedAmountChange).toHaveBeenLastCalledWith(130, expect.objectContaining({ expectedAmount: 130, difference: 0, status: "balanced" })))
    expect(screen.getByText("Balanceada")).toBeInTheDocument()
  })

  it("bloquea el cierre vacío o con diferencia salvo configuración explícita", async () => {
    const onClose = vi.fn()
    const view = renderSession({ onClose })
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Captura el saldo contado")
    fireEvent.input(screen.getByRole("spinbutton"), { target: { value: "125" } })
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("diferencia debe resolverse")
    expect(onClose).not.toHaveBeenCalled()
    view.rerender(<ChakraProvider value={defaultSystem}><NBalanceSession sessionId="session-1" entries={entries} openingAmount={100} getEntryId={(entry) => entry.id} getEntryLabel={(entry) => entry.label} getEntryAmount={(entry) => entry.amount} defaultCountedAmount={125} allowCloseWithVariance onClose={onClose} /></ChakraProvider>)
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }))
    await waitFor(() => expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ sessionId: "session-1", countedAmount: 125 })))
  })

  it("descarta cierres asíncronos de una sesión anterior", async () => {
    let resolveClose: ((value: { success: boolean; message: string }) => void) | undefined
    const onClose = vi.fn(() => new Promise<{ success: boolean; message: string }>((resolve) => { resolveClose = resolve }))
    const view = renderSession({ defaultCountedAmount: 130, onClose })
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }))
    view.rerender(<ChakraProvider value={defaultSystem}><NBalanceSession sessionId="session-2" entries={[]} openingAmount={0} defaultCountedAmount={0} getEntryId={(entry: Entry) => entry.id} getEntryLabel={(entry: Entry) => entry.label} getEntryAmount={(entry: Entry) => entry.amount} onClose={onClose} /></ChakraProvider>)
    await waitFor(() => expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeEnabled())
    resolveClose?.({ success: false, message: "Respuesta antigua" })
    await waitFor(() => expect(screen.queryByText("Respuesta antigua")).not.toBeInTheDocument())
  })

  it("ofrece estados controlado, cerrado, carga, error y vacío", () => {
    const onCountedAmountChange = vi.fn()
    const view = renderSession({ countedAmount: null, onCountedAmountChange })
    fireEvent.input(screen.getByRole("spinbutton"), { target: { value: "130" } })
    expect(onCountedAmountChange).toHaveBeenCalled()
    expect(screen.getByText("Abierta")).toBeInTheDocument()
    view.rerender(<ChakraProvider value={defaultSystem}><NBalanceSession sessionId="x" entries={[]} status="closed" getEntryId={(entry: Entry) => entry.id} getEntryLabel={(entry: Entry) => entry.label} getEntryAmount={(entry: Entry) => entry.amount} /></ChakraProvider>)
    expect(screen.getByText("Cerrada")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Cerrar sesión" })).not.toBeInTheDocument()
    view.rerender(<ChakraProvider value={defaultSystem}><NBalanceSession sessionId="x" entries={[]} loading getEntryId={(entry: Entry) => entry.id} getEntryLabel={(entry: Entry) => entry.label} getEntryAmount={(entry: Entry) => entry.amount} /></ChakraProvider>)
    expect(screen.getByRole("status")).toHaveTextContent("Cargando sesión")
    view.rerender(<ChakraProvider value={defaultSystem}><NBalanceSession sessionId="x" entries={[]} error={<Text>Error remoto</Text>} getEntryId={(entry: Entry) => entry.id} getEntryLabel={(entry: Entry) => entry.label} getEntryAmount={(entry: Entry) => entry.amount} /></ChakraProvider>)
    expect(screen.getByRole("alert")).toHaveTextContent("Error remoto")
    view.rerender(<ChakraProvider value={defaultSystem}><NBalanceSession sessionId="" entries={[]} getEntryId={(entry: Entry) => entry.id} getEntryLabel={(entry: Entry) => entry.label} getEntryAmount={(entry: Entry) => entry.amount} /></ChakraProvider>)
    expect(screen.getByRole("status")).toHaveTextContent("No hay una sesión")
  })
})
