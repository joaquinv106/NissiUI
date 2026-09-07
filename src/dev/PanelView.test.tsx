import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { PanelView } from "./PanelView"

describe("Vista interactiva de NPanel", () => {
  it("abre el checkout, cambia al recibo y cierra el mismo panel", async () => {
    render(<ChakraProvider value={defaultSystem}><PanelView /></ChakraProvider>)

    fireEvent.click(screen.getAllByRole("button", { name: "Abrir pago" })[0])
    const dialog = await screen.findByRole("dialog", { name: "Finalizar operación" })
    expect(within(dialog).getByRole("region", { name: "Finalización de compra" })).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole("button", { name: "Recibo" }))
    expect(await screen.findByRole("dialog", { name: "Comprobante de venta" })).toBe(dialog)
    expect(within(dialog).getByRole("article", { name: "Recibo" })).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole("button", { name: "Cerrar panel lateral" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })
})
