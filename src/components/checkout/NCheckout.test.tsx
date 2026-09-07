import { ChakraProvider, Text, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NCheckout } from "./NCheckout"

interface Method { id: string; name: string }
const methods: Method[] = [{ id: "cash", name: "Efectivo" }, { id: "card", name: "Tarjeta" }]

function renderCheckout(props: Partial<React.ComponentProps<typeof NCheckout<Method>>> = {}) {
  const onComplete = props.onComplete ?? vi.fn()
  return { onComplete, ...render(<ChakraProvider value={defaultSystem}><NCheckout total={100} methods={methods} getMethodId={(method) => method.id} getMethodLabel={(method) => method.name} onComplete={onComplete} {...props} /></ChakraProvider>) }
}

describe("NCheckout", () => {
  it("impide completar una distribución pendiente", () => {
    const { onComplete } = renderCheckout()
    fireEvent.click(screen.getByRole("button", { name: "Completar operación" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Distribuye el total completo")
    expect(onComplete).not.toHaveBeenCalled()
  })

  it("compone el asignador y entrega un detalle balanceado", async () => {
    const onComplete = vi.fn(() => ({ success: true, message: "Venta autorizada" }))
    renderCheckout({ onComplete, review: <Text>2 productos</Text> })
    fireEvent.click(screen.getByRole("button", { name: "Asignar el restante a Efectivo" }))
    fireEvent.click(screen.getByRole("button", { name: "Completar operación" }))
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ total: 100, summary: expect.objectContaining({ status: "balanced" }), allocations: expect.arrayContaining([{ method: methods[0], amount: 100 }]) })))
    expect(screen.getByRole("status")).toHaveTextContent("Venta autorizada")
    expect(screen.getByText("2 productos")).toBeInTheDocument()
  })

  it("permite capturar manualmente el pago sin editar antes de los decimales", () => {
    renderCheckout({ locale: "es-MX", formatOptions: { style: "currency", currency: "MXN" } })
    const input = screen.getByRole("spinbutton", { name: "Valor asignado a Efectivo" })
    fireEvent.focus(input)
    expect(input).toHaveValue("0")
    fireEvent.input(input, { target: { value: "100" } })
    expect(input).toHaveValue("100")
    expect(screen.getByText("Distribución completa")).toBeInTheDocument()
    fireEvent.blur(input)
    expect(input).toHaveValue("$100.00")
  })

  it("bloquea envíos concurrentes y comunica el fallo confirmado", async () => {
    let resolveComplete: ((value: { success: boolean; message: string }) => void) | undefined
    const onComplete = vi.fn(() => new Promise<{ success: boolean; message: string }>((resolve) => { resolveComplete = resolve }))
    renderCheckout({ defaultAllocations: [{ method: methods[0], amount: 100 }], onComplete })
    fireEvent.click(screen.getByRole("button", { name: "Completar operación" }))
    const loading = screen.getByRole("button", { name: "Procesando operación" })
    fireEvent.click(loading)
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1))
    resolveComplete?.({ success: false, message: "Pago rechazado" })
    expect(await screen.findByRole("alert")).toHaveTextContent("Pago rechazado")
  })

  it("descarta respuestas de una operación anterior", async () => {
    let resolveComplete: ((value: { success: boolean; message: string }) => void) | undefined
    const onComplete = () => new Promise<{ success: boolean; message: string }>((resolve) => { resolveComplete = resolve })
    const view = renderCheckout({ checkoutKey: "sale-1", defaultAllocations: [{ method: methods[0], amount: 100 }], onComplete })
    fireEvent.click(screen.getByRole("button", { name: "Completar operación" }))
    view.rerender(<ChakraProvider value={defaultSystem}><NCheckout checkoutKey="sale-2" total={100} methods={methods} getMethodId={(method) => method.id} getMethodLabel={(method) => method.name} allocations={[{ method: methods[0], amount: 100 }]} onComplete={onComplete} /></ChakraProvider>)
    resolveComplete?.({ success: false, message: "Respuesta anterior" })
    await waitFor(() => expect(screen.queryByText("Respuesta anterior")).not.toBeInTheDocument())
  })

  it("admite validación asíncrona, lectura y etiquetas propias", async () => {
    const onComplete = vi.fn()
    const view = renderCheckout({ defaultAllocations: [{ method: methods[0], amount: 100 }], validate: async () => "Turno cerrado", onComplete })
    fireEvent.click(screen.getByRole("button", { name: "Completar operación" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Turno cerrado")
    expect(onComplete).not.toHaveBeenCalled()
    view.rerender(<ChakraProvider value={defaultSystem}><NCheckout total={100} methods={methods} getMethodId={(method) => method.id} getMethodLabel={(method) => method.name} onComplete={onComplete} readOnly labels={{ title: "Review payment" }} /></ChakraProvider>)
    expect(screen.getByText("Review payment")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Completar operación" })).not.toBeInTheDocument()
  })

  it("reinicia asignaciones no controladas al cambiar checkoutKey", async () => {
    const onComplete = vi.fn()
    const view = renderCheckout({ checkoutKey: "sale-1", defaultAllocations: [{ method: methods[0], amount: 100 }], onComplete })
    view.rerender(<ChakraProvider value={defaultSystem}><NCheckout checkoutKey="sale-2" total={100} methods={methods} getMethodId={(method) => method.id} getMethodLabel={(method) => method.name} defaultAllocations={[{ method: methods[1], amount: 20 }]} onComplete={onComplete} /></ChakraProvider>)
    await waitFor(() => expect(screen.getByRole("spinbutton", { name: "Valor asignado a Tarjeta" })).toHaveValue("20"))
    expect(screen.getByRole("spinbutton", { name: "Valor asignado a Efectivo" })).toHaveValue("0")
  })
})
