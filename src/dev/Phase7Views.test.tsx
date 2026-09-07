import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { PosExampleView } from "./Phase7Views"

function renderPos() {
  return render(<ChakraProvider value={defaultSystem}><PosExampleView /></ChakraProvider>)
}

describe("Ejemplo POS de la Fase 7", () => {
  it("conecta captura, carrito, pago y recibo", async () => {
    renderPos()
    const code = screen.getByRole("textbox", { name: "Código" })
    fireEvent.change(code, { target: { value: "7501002" } })
    fireEvent.keyDown(code, { key: "Enter" })
    expect(await screen.findByRole("spinbutton", { name: "Cantidad de Pan artesanal" })).toHaveValue(1)
    fireEvent.click(screen.getByRole("button", { name: "Asignar el restante a Efectivo" }))
    fireEvent.click(screen.getByRole("button", { name: "Completar operación" }))
    expect(await screen.findByRole("article", { name: "Recibo" })).toHaveTextContent("Café de especialidad")
    expect(screen.getByRole("article", { name: "Recibo" })).toHaveTextContent("Pan artesanal")
  })

  it("permite escribir manualmente un pago en el POS", async () => {
    renderPos()
    const payment = screen.getByRole("spinbutton", { name: "Valor asignado a Efectivo" })
    fireEvent.focus(payment)
    expect(payment).toHaveValue("0")
    fireEvent.input(payment, { target: { value: "98.6" } })
    expect(payment).toHaveValue("98.6")
    expect(await screen.findByText("Distribución completa")).toBeInTheDocument()
    fireEvent.blur(payment)
    await waitFor(() => expect(payment).toHaveValue("$98.60"))
  })

  it("expone conectividad y cola sin ocultar la operación", async () => {
    renderPos()
    fireEvent.click(screen.getByRole("button", { name: "Simular sin conexión" }))
    expect(await screen.findByText("Trabajando sin conexión")).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Carrito" })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Restablecer conexión" }))
    await waitFor(() => expect(screen.queryByText("Trabajando sin conexión")).not.toBeInTheDocument())
  })
})
