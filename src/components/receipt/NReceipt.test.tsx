import { ChakraProvider, Text, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NReceipt } from "./NReceipt"

interface Line { id: string; name: string; quantity: number; price: number }
interface Receipt { id: string; folio: string; date: string; status: string; lines: Line[]; tax: number; total: number }
const receipt: Receipt = { id: "r-1", folio: "V-100", date: "2026-09-06T12:00:00.000Z", status: "Pagado", lines: [{ id: "coffee", name: "Café", quantity: 2, price: 40 }], tax: 12.8, total: 92.8 }

function renderReceipt(props: Partial<React.ComponentProps<typeof NReceipt<Receipt, Line>>> = {}) {
  return render(<ChakraProvider value={defaultSystem}><NReceipt
    receipt={receipt}
    getReceiptId={(value) => value.id}
    getReceiptNumber={(value) => value.folio}
    getReceiptDate={(value) => value.date}
    getReceiptStatus={(value) => value.status}
    getLines={(value) => value.lines}
    getLineId={(line) => line.id}
    getLineLabel={(line) => line.name}
    getLineQuantity={(line) => line.quantity}
    getLineUnitAmount={(line) => line.price}
    getLineTotal={(line) => line.quantity * line.price}
    getSummaryRows={(value) => [{ id: "tax", label: "Impuesto", amount: value.tax }]}
    getTotal={(value) => value.total}
    formatAmount={(amount) => `$${amount.toFixed(2)}`}
    formatDate={() => "6 septiembre 2026"}
    {...props}
  /></ChakraProvider>)
}

describe("NReceipt", () => {
  it("compone un documento semántico con partidas y totales", () => {
    renderReceipt()
    const article = screen.getByRole("article", { name: "Recibo" })
    expect(within(article).getByText(/V-100/)).toBeInTheDocument()
    expect(within(article).getByText("6 septiembre 2026")).toBeInTheDocument()
    const lineList = screen.getByRole("list", { name: "Partidas del recibo" })
    expect(lineList).toHaveTextContent("Café")
    expect(Array.from(lineList.children).every((child) => child.tagName === "LI")).toBe(true)
    expect(screen.getByText("$40.00")).toBeInTheDocument()
    expect(screen.getByText("$92.80")).toBeInTheDocument()
  })

  it("delega impresión y acciones al visor documental", () => {
    const onPrint = vi.fn()
    renderReceipt({ showPrint: true, onPrint })
    fireEvent.click(screen.getByRole("button", { name: "Imprimir" }))
    expect(onPrint).toHaveBeenCalledWith(receipt)
  })

  it("admite composición adicional y recibos sin partidas", () => {
    renderReceipt({ receipt: { ...receipt, lines: [] }, beforeLines: <Text>Gracias por su compra</Text>, afterLines: <Text>Conserve este comprobante</Text> })
    expect(screen.getByText("Gracias por su compra")).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("no contiene partidas")
    expect(screen.getByText("Conserve este comprobante")).toBeInTheDocument()
  })

  it("hereda estados y permite traducir el preset", () => {
    const view = renderReceipt({ receipt: null, labels: { receiptLabel: "Sales receipt" }, documentLabels: { emptyTitle: "No receipt" } })
    expect(screen.getByRole("status", { name: "Sales receipt" })).toHaveTextContent("No receipt")
    view.rerender(<ChakraProvider value={defaultSystem}><NReceipt<Receipt, Line> receipt={receipt} getReceiptId={(value) => value.id} getReceiptNumber={(value) => value.folio} getLines={(value) => value.lines} getLineId={(line) => line.id} getLineLabel={(line) => line.name} getLineTotal={(line) => line.price * line.quantity} getTotal={(value) => value.total} loading /></ChakraProvider>)
    expect(screen.getByRole("status")).toHaveTextContent("Cargando documento")
  })

  it("personaliza slots del recibo sin cambiar partidas ni totales", () => {
    renderReceipt({ unstyled: true, classNames: { lines: "custom-lines", line: "custom-line", total: "custom-total" } })
    expect(screen.getByRole("list", { name: "Partidas del recibo" }).closest("[data-part='lines']")).toHaveClass("custom-lines")
    expect(screen.getByRole("listitem")).toHaveClass("custom-line")
    expect(screen.getByText("Total").closest("div")).toHaveClass("custom-total")
    expect(screen.getByText("$92.80")).toBeInTheDocument()
  })
})
