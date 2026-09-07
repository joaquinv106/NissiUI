import { ChakraProvider, Text, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NDocumentView } from "./NDocumentView"
import type { NDocumentAction } from "./types"

interface Document { id: string; title: string; folio: string; total: number; status: string }
const document: Document = { id: "doc-1", title: "Orden de servicio", folio: "OS-18", total: 250, status: "Emitida" }
const baseProps = {
  document,
  getDocumentId: (value: Document) => value.id,
  getDocumentTitle: (value: Document) => value.title,
  getDocumentSubtitle: (value: Document) => value.folio,
  getDocumentStatus: (value: Document) => value.status,
  fields: [{ id: "total", label: "Total", getValue: (value: Document) => `$${value.total}` }],
  sections: [{ id: "detail", title: "Detalle", render: (value: Document) => <Text>Contenido de {value.folio}</Text> }],
}

function renderDocument(props: Partial<React.ComponentProps<typeof NDocumentView<Document>>> = {}) {
  return render(<ChakraProvider value={defaultSystem}><NDocumentView {...baseProps} {...props} /></ChakraProvider>)
}

describe("NDocumentView", () => {
  it("presenta un documento semántico con metadatos y secciones", () => {
    renderDocument()
    const article = screen.getByRole("article", { name: "Orden de servicio" })
    expect(within(article).getByText("OS-18")).toBeInTheDocument()
    expect(within(article).getByText("Emitida")).toBeInTheDocument()
    expect(screen.getByRole("term")).toHaveTextContent("Total")
    expect(screen.getByRole("definition")).toHaveTextContent("$250")
    expect(screen.getByRole("heading", { name: "Detalle" })).toBeInTheDocument()
  })

  it("ejecuta acciones asíncronas una sola vez y comunica fallos", async () => {
    let resolveAction: ((value: { success: boolean; message: string }) => void) | undefined
    const onAction = vi.fn(() => new Promise<{ success: boolean; message: string }>((resolve) => { resolveAction = resolve }))
    const actions: NDocumentAction<Document>[] = [{ id: "send", label: "Enviar", onAction }]
    renderDocument({ actions })
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }))
    expect(screen.getByRole("button", { name: "Procesando acción" })).toBeDisabled()
    fireEvent.click(screen.getByRole("button", { name: "Procesando acción" }))
    expect(onAction).toHaveBeenCalledTimes(1)
    resolveAction?.({ success: false, message: "Destino no disponible" })
    expect(await screen.findByRole("alert")).toHaveTextContent("Destino no disponible")
  })

  it("aplica restricciones externas y admite impresión sustituible", () => {
    const onPrint = vi.fn()
    const allowed = vi.fn()
    const blocked = vi.fn()
    const actions: NDocumentAction<Document>[] = [{ id: "allowed", label: "Descargar", onAction: allowed }, { id: "blocked", label: "Cancelar", onAction: blocked }]
    renderDocument({ actions, canPerformAction: (_value, action) => action.id !== "blocked", showPrint: true, onPrint })
    fireEvent.click(screen.getByRole("button", { name: "Imprimir" }))
    fireEvent.click(screen.getByRole("button", { name: "Descargar" }))
    expect(onPrint).toHaveBeenCalledWith(document)
    expect(allowed).toHaveBeenCalledWith(document)
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled()
  })

  it("descarta respuestas asíncronas de un documento anterior", async () => {
    let resolveAction: ((value: { success: boolean; message: string }) => void) | undefined
    const action: NDocumentAction<Document> = { id: "send", label: "Enviar", onAction: () => new Promise((resolve) => { resolveAction = resolve }) }
    const view = renderDocument({ actions: [action] })
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }))
    const nextDocument = { ...document, id: "doc-2", folio: "OS-19" }
    view.rerender(<ChakraProvider value={defaultSystem}><NDocumentView {...baseProps} document={nextDocument} actions={[action]} /></ChakraProvider>)
    await waitFor(() => expect(screen.getByRole("button", { name: "Enviar" })).toBeEnabled())
    resolveAction?.({ success: false, message: "Respuesta antigua" })
    await waitFor(() => expect(screen.queryByText("Respuesta antigua")).not.toBeInTheDocument())
    expect(screen.getByText("OS-19")).toBeInTheDocument()
  })

  it("ofrece composición y estados de carga, error y vacío traducibles", () => {
    const view = renderDocument({ renderBody: () => <Text>Cuerpo personalizado</Text>, variant: "plain" })
    expect(screen.getByText("Cuerpo personalizado")).toBeInTheDocument()
    view.rerender(<ChakraProvider value={defaultSystem}><NDocumentView {...baseProps} loading labels={{ loading: "Loading document" }} /></ChakraProvider>)
    expect(screen.getByRole("status")).toHaveTextContent("Loading document")
    view.rerender(<ChakraProvider value={defaultSystem}><NDocumentView {...baseProps} error={<Text>Error remoto</Text>} /></ChakraProvider>)
    expect(screen.getByRole("alert")).toHaveTextContent("Error remoto")
    view.rerender(<ChakraProvider value={defaultSystem}><NDocumentView {...baseProps} document={null} /></ChakraProvider>)
    expect(screen.getByRole("status")).toHaveTextContent("No hay un documento")
  })

  it("expone slots estables y conserva semántica en modo unstyled", () => {
    renderDocument({
      unstyled: true,
      classNames: { root: "custom-document", document: "custom-paper", metadata: "custom-metadata" },
      styles: { document: { px: "10" } },
    })

    const root = screen.getByRole("region", { name: "Vista de documento" })
    const article = screen.getByRole("article", { name: "Orden de servicio" })
    expect(root).toHaveClass("custom-document")
    expect(root).toHaveAttribute("data-scope", "n-document-view")
    expect(article).toHaveClass("custom-paper")
    expect(article).toHaveAttribute("data-part", "document")
    expect(screen.getByRole("definition").closest("dl")).toHaveClass("custom-metadata")
  })
})
