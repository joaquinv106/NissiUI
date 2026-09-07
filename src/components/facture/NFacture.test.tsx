import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NHeader } from "../header"
import { NSidebar } from "../sidebar"
import { NFacture } from "./NFacture"
import { createNFactureHeaderNavigation, createNFactureNavigation } from "./navigation"
import type { NFactureData } from "./types"
import { calculateNFactureTotals, isValidMexicanRfc } from "./utils"

const data: NFactureData = {
  customers: [{ id: "customer-1", rfc: "EKU9003173C9", name: "ESCUELA KEMPER URGATE", postalCode: "26015", taxRegime: "601" }],
  items: [{ id: "item-1", sku: "SERV-01", description: "Servicio de consultoría", productServiceKey: "80101500", unitKey: "E48", unitPrice: 100, vatRate: 0.16 }],
  invoices: [{ id: "invoice-1", uuid: "demo-uuid", series: "A", folio: "1042", issuedAt: "2026-09-07T10:00:00-06:00", customerName: "ESCUELA KEMPER URGATE", customerRfc: "EKU9003173C9", total: 116, status: "stamped" }],
  tickets: [{ id: "ticket-1", folio: "TKT-1048", issuedAt: "2026-09-07T10:00:00-06:00", total: 116, lines: [{ id: "line-1", itemId: "item-1", sku: "SERV-01", description: "Servicio de consultoría", productServiceKey: "80101500", unitKey: "E48", quantity: 1, unitPrice: 100, discount: 0, vatRate: 0.16, iepsRate: 0 }] }],
  catalogs: {
    cfdiUses: [{ value: "G03", label: "Gastos en general", compatibleRegimes: ["601"] }],
    paymentForms: [{ value: "03", label: "Transferencia electrónica de fondos" }],
    paymentMethods: [{ value: "PUE", label: "Pago en una sola exhibición" }],
  },
}

function renderFacture(props: Partial<React.ComponentProps<typeof NFacture>> = {}) {
  return render(<ChakraProvider value={defaultSystem}><NFacture data={data} {...props} /></ChakraProvider>)
}

describe("NFacture", () => {
  it("calcula importes fiscales con precisión monetaria", () => {
    expect(calculateNFactureTotals([{ id: "1", itemId: "1", sku: "1", description: "Demo", productServiceKey: "01010101", unitKey: "H87", quantity: 2, unitPrice: 100, discount: 10, vatRate: 0.16, iepsRate: 0.08 }])).toEqual({ subtotal: 200, discount: 10, vat: 30.4, ieps: 15.2, total: 235.6 })
  })

  it("valida la estructura de RFC físico y moral", () => {
    expect(isValidMexicanRfc("EKU9003173C9")).toBe(true)
    expect(isValidMexicanRfc("GODE561231GR8")).toBe(true)
    expect(isValidMexicanRfc("RFC-INVALIDO")).toBe(false)
  })

  it("genera navegación consumible por NSidebar y restringida por rol", () => {
    const operator = createNFactureNavigation({ role: "operator" })[0]!
    const admin = createNFactureNavigation({ role: "admin" })[0]!
    expect(operator.children?.map((item) => item.data?.view)).toEqual(["dashboard", "issue", "history", "ticket", "docs"])
    expect(admin.children?.map((item) => item.data?.view)).toContain("certificates")
    expect(admin.children?.find((item) => item.data?.view === "integrations")?.requiredPermission).toBe("facture:admin")
    expect(createNFactureHeaderNavigation({ role: "pos" })[0]?.children?.map((item) => item.data?.view)).toEqual(["dashboard", "issue", "ticket", "docs"])
  })

  it("delega la navegación al host por defecto y permite activarla para standalone", () => {
    const view = renderFacture({ defaultView: "dashboard" })
    expect(screen.queryByRole("navigation", { name: "Navegación de facturación" })).not.toBeInTheDocument()
    view.rerender(<ChakraProvider value={defaultSystem}><NFacture data={data} role="operator" showNavigation /></ChakraProvider>)
    expect(screen.getByRole("navigation", { name: "Navegación de facturación" })).toBeInTheDocument()
  })

  it("se integra como submenú de Proyectos en NSidebar", () => {
    render(<ChakraProvider value={defaultSystem}><NSidebar responsive="push" items={[{ id: "projects", label: "Proyectos", children: createNFactureNavigation({ role: "admin" }) }]} /></ChakraProvider>)
    fireEvent.click(screen.getByRole("button", { name: "Proyectos" }))
    fireEvent.click(screen.getByRole("button", { name: "NFacture" }))
    expect(screen.getByRole("button", { name: "Documentación" })).toBeInTheDocument()
  })

  it("se integra como dropdown de NHeader", async () => {
    const onHeaderSelect = vi.fn()
    render(<ChakraProvider value={defaultSystem}><NHeader items={createNFactureHeaderNavigation({ role: "admin" })} onItemSelect={onHeaderSelect} /></ChakraProvider>)
    const headerTrigger = screen.getByRole("button", { name: "NFacture", hidden: true })
    headerTrigger.focus()
    fireEvent.keyDown(headerTrigger, { key: "ArrowDown" })
    fireEvent.click(await screen.findByRole("menuitem", { name: "Documentación" }))
    expect(onHeaderSelect).toHaveBeenCalledWith(expect.objectContaining({ data: { view: "docs" } }))
  })

  it("oculta administración para POS y permite convertir un ticket", async () => {
    renderFacture({ role: "pos", defaultView: "ticket" })
    expect(screen.queryByText("Certificados CSD y fiscal")).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText("Folio o identificador del ticket"), { target: { value: "TKT-1048" } })
    fireEvent.click(screen.getByRole("button", { name: "Buscar ticket" }))
    expect(await screen.findByText("Ticket encontrado. Revisa los conceptos antes de timbrar.")).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole("button", { name: "Emitir factura" }).at(-1)!)
    expect(await screen.findByRole("region", { name: "Partidas de la factura" })).toBeInTheDocument()
  })

  it("delega el timbrado al adaptador y anuncia el resultado", async () => {
    const stampInvoice = vi.fn().mockResolvedValue({ success: true, message: "UUID DEMO TIMBRADO" })
    renderFacture({ role: "operator", defaultView: "issue", adapter: { stampInvoice } })
    fireEvent.change(screen.getByLabelText("Receptor"), { target: { value: "customer-1" } })
    fireEvent.click(screen.getByRole("button", { name: "Conceptos" }))
    fireEvent.click(await screen.findByText("Servicio de consultoría"))
    fireEvent.click(screen.getByRole("button", { name: "Validar y timbrar CFDI" }))
    await waitFor(() => expect(stampInvoice).toHaveBeenCalledWith(expect.objectContaining({ customerId: "customer-1", totals: expect.objectContaining({ total: 116 }) })))
    expect(await screen.findByRole("status")).toHaveTextContent("UUID DEMO TIMBRADO")
  })

  it("abre la vista imprimible de un comprobante dentro de NPanel", async () => {
    renderFacture({ role: "operator", defaultView: "history" })
    fireEvent.click(screen.getByRole("button", { name: "Ver comprobante" }))
    const dialog = await screen.findByRole("dialog", { name: "Vista previa del comprobante" })
    expect(within(dialog).getByRole("region", { name: "Vista previa del comprobante" })).toHaveTextContent("A1042")
    expect(within(dialog).getByRole("button", { name: "Imprimir" })).toBeInTheDocument()
  })

  it("registra un receptor desde la emisión sin abandonar la vista", async () => {
    renderFacture({ role: "operator", defaultView: "issue" })
    fireEvent.click(screen.getByRole("button", { name: "Registrar receptor" }))
    const dialog = await screen.findByRole("dialog", { name: "Nuevo receptor fiscal" })
    fireEvent.change(within(dialog).getByRole("textbox", { name: "RFC" }), { target: { value: "AAA010101AAA" } })
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Nombre o razón social" }), { target: { value: "CLIENTE DEMO" } })
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Código postal fiscal" }), { target: { value: "06000" } })
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Régimen fiscal" }), { target: { value: "601" } })
    fireEvent.click(within(dialog).getByRole("button", { name: "Guardar receptor" }))
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Nuevo receptor fiscal" })).not.toBeInTheDocument())
    expect(screen.getByRole("combobox", { name: "Receptor" })).toHaveDisplayValue("AAA010101AAA · CLIENTE DEMO")
  })
})
