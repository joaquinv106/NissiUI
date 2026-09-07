import { ChakraProvider, Text, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NCart } from "./NCart"
import type { NLineItemField } from "../line-item-editor"

interface Item { id: string; name: string; price: number }
interface Line extends Item { lineId: string; quantity: number }
const items: Item[] = [{ id: "coffee", name: "Café", price: 40 }, { id: "bread", name: "Pan", price: 25 }]
const fields: NLineItemField<Line>[] = [{ id: "quantity", header: "Cantidad", inputType: "number", min: 1, getValue: (line) => line.quantity, setValue: (line, value) => ({ ...line, quantity: Number(value) }) }]

function renderCart(props: Partial<React.ComponentProps<typeof NCart<Item, Line>>> = {}) {
  return render(<ChakraProvider value={defaultSystem}><NCart
    items={items}
    getItemId={(item) => item.id}
    getItemLabel={(item) => item.name}
    createLine={(item) => ({ ...item, lineId: `line-${item.id}`, quantity: 1 })}
    getLineId={(line) => line.lineId}
    getLineLabel={(line) => line.name}
    getLineAmount={(line) => line.price * line.quantity}
    fields={fields}
    formatAmount={(amount) => `$${amount.toFixed(2)}`}
    {...props}
  /></ChakraProvider>)
}

describe("NCart", () => {
  it("compone el selector, las partidas y un resumen reactivo", () => {
    renderCart({ defaultPickerOpen: true })
    fireEvent.click(screen.getByRole("button", { name: "Café" }))
    expect(screen.getByRole("region", { name: "Carrito" })).toHaveTextContent("1 partida")
    expect(screen.getAllByText("$40.00")).toHaveLength(2)
    fireEvent.change(screen.getByRole("spinbutton", { name: "Cantidad de Café" }), { target: { value: "3" } })
    expect(screen.getAllByText("$120.00")).toHaveLength(2)
  })

  it("delega impuestos y descuentos al cálculo del consumidor", () => {
    renderCart({
      defaultLines: [{ ...items[0], lineId: "line-coffee", quantity: 2 }],
      calculateSummary: (lines) => ({ subtotal: lines[0].price * lines[0].quantity, rows: [{ id: "tax", label: "Impuesto externo", amount: 12.8 }], total: 92.8 }),
    })
    expect(screen.getByText("$80.00")).toBeInTheDocument()
    expect(screen.getByText("Impuesto externo")).toBeInTheDocument()
    expect(screen.getByText("$92.80")).toBeInTheDocument()
  })

  it("vacía el estado no controlado y publica una causa explícita", () => {
    const onLinesChange = vi.fn()
    renderCart({ defaultLines: [{ ...items[0], lineId: "line-coffee", quantity: 1 }], onLinesChange })
    fireEvent.click(screen.getByRole("button", { name: "Vaciar carrito" }))
    expect(onLinesChange).toHaveBeenLastCalledWith([], { reason: "clear" })
    expect(screen.getByText("0 partidas")).toBeInTheDocument()
  })

  it("respeta líneas controladas, lectura y composición", () => {
    const line = { ...items[1], lineId: "line-bread", quantity: 1 }
    const onLinesChange = vi.fn()
    renderCart({ lines: [line], onLinesChange, readOnly: true, header: <Text>Venta mostrador</Text>, footer: <Text>Pie externo</Text>, labels: { title: "Pedido" } })
    expect(screen.getByText("Pedido")).toBeInTheDocument()
    expect(screen.getByText("Venta mostrador")).toBeInTheDocument()
    expect(screen.getByText("Pie externo")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Vaciar carrito" })).not.toBeInTheDocument()
  })

  it("reinicia el borrador no controlado cuando cambia cartKey", async () => {
    const view = renderCart({ cartKey: "cart-1", defaultLines: [{ ...items[0], lineId: "line-coffee", quantity: 1 }] })
    view.rerender(<ChakraProvider value={defaultSystem}><NCart items={items} cartKey="cart-2" defaultLines={[{ ...items[1], lineId: "line-bread", quantity: 2 }]} getItemId={(item) => item.id} getItemLabel={(item) => item.name} createLine={(item) => ({ ...item, lineId: `line-${item.id}`, quantity: 1 })} getLineId={(line) => line.lineId} getLineLabel={(line) => line.name} getLineAmount={(line) => line.price * line.quantity} fields={fields} /></ChakraProvider>)
    await waitFor(() => expect(screen.getByRole("spinbutton", { name: "Cantidad de Pan" })).toHaveValue(2))
    expect(screen.queryByRole("spinbutton", { name: "Cantidad de Café" })).not.toBeInTheDocument()
  })
})
