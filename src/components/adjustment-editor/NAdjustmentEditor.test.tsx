import { ChakraProvider, Text, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NAdjustmentEditor } from "./NAdjustmentEditor"
import type { NAdjustmentField } from "./types"

interface RecordItem { id: string; title: string; amount: number; category: string }
const item: RecordItem = { id: "record-1", title: "Movimiento 18", amount: 100, category: "general" }
const fields: NAdjustmentField<RecordItem>[] = [
  { id: "amount", label: "Importe", inputType: "number", getValue: (value) => value.amount, setValue: (value, amount) => ({ ...value, amount: Number(amount) }), validate: (amount) => Number(amount) > 0 ? undefined : "Debe ser mayor que cero." },
  { id: "category", label: "Categoría", inputType: "select", options: [{ label: "General", value: "general" }, { label: "Proyecto", value: "project" }], getValue: (value) => value.category, setValue: (value, category) => ({ ...value, category: String(category) }) },
]
const baseProps = { item, getItemId: (value: RecordItem) => value.id, getItemTitle: (value: RecordItem) => value.title, createAdjustment: (value: RecordItem) => ({ ...value }), fields }

function renderEditor(props: Partial<React.ComponentProps<typeof NAdjustmentEditor<RecordItem>>> = {}) {
  return render(<ChakraProvider value={defaultSystem}><NAdjustmentEditor {...baseProps} {...props} /></ChakraProvider>)
}

describe("NAdjustmentEditor", () => {
  it("mantiene visible el original y publica un borrador inmutable", () => {
    const onValueChange = vi.fn()
    renderEditor({ onValueChange })
    fireEvent.change(screen.getByRole("spinbutton", { name: "Ajustado" }), { target: { value: "125" } })
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ amount: 125 }), expect.objectContaining({ fieldId: "amount", changedFieldIds: ["amount"] }))
    expect(item.amount).toBe(100)
    expect(screen.getByText("Modificado")).toBeInTheDocument()
  })

  it("exige cambios, motivo y validación de campo antes de guardar", async () => {
    const onSubmit = vi.fn()
    renderEditor({ onSubmit })
    fireEvent.click(screen.getByRole("button", { name: "Guardar ajuste" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("al menos un cambio")
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "0" } })
    fireEvent.click(screen.getByRole("button", { name: "Guardar ajuste" }))
    expect(await screen.findByText("Debe ser mayor que cero.")).toBeInTheDocument()
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "120" } })
    fireEvent.click(screen.getByRole("button", { name: "Guardar ajuste" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("motivo")
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("envía el ajuste y bloquea acciones duplicadas", async () => {
    let resolveSubmit: ((value: boolean) => void) | undefined
    const onSubmit = vi.fn(() => new Promise<boolean>((resolve) => { resolveSubmit = resolve }))
    renderEditor({ onSubmit })
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "120" } })
    fireEvent.change(screen.getByRole("textbox", { name: /Motivo del ajuste/ }), { target: { value: "Corrección documentada" } })
    fireEvent.click(screen.getByRole("button", { name: "Guardar ajuste" }))
    expect(screen.getByRole("button", { name: "Guardando ajuste" })).toBeDisabled()
    fireEvent.click(screen.getByRole("button", { name: "Guardando ajuste" }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ itemId: "record-1", reason: "Corrección documentada", changedFieldIds: ["amount"] }))
    resolveSubmit?.(true)
  })

  it("restablece el borrador y descarta respuestas del elemento anterior", async () => {
    let resolveSubmit: ((value: { success: boolean; message: string }) => void) | undefined
    const onSubmit = vi.fn(() => new Promise<{ success: boolean; message: string }>((resolve) => { resolveSubmit = resolve }))
    const view = renderEditor({ onSubmit })
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "140" } })
    fireEvent.click(screen.getByRole("button", { name: "Restablecer" }))
    expect(screen.getByRole("spinbutton")).toHaveValue(100)
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "130" } })
    fireEvent.change(screen.getByRole("textbox", { name: /Motivo/ }), { target: { value: "Razón" } })
    fireEvent.click(screen.getByRole("button", { name: "Guardar ajuste" }))
    const nextItem = { ...item, id: "record-2", title: "Movimiento 19" }
    view.rerender(<ChakraProvider value={defaultSystem}><NAdjustmentEditor {...baseProps} item={nextItem} onSubmit={onSubmit} /></ChakraProvider>)
    await waitFor(() => expect(screen.getByRole("spinbutton")).toHaveValue(100))
    resolveSubmit?.({ success: false, message: "Respuesta antigua" })
    await waitFor(() => expect(screen.queryByText("Respuesta antigua")).not.toBeInTheDocument())
  })

  it("admite render personalizado y estados de carga, error y vacío", () => {
    const view = renderEditor({ renderOriginal: (value) => <Text>Original {value.amount}</Text>, renderEditor: ({ adjustment }) => <Text>Ajuste {adjustment.amount}</Text>, readOnly: true })
    expect(screen.getByText("Original 100")).toBeInTheDocument()
    expect(screen.getByText("Ajuste 100")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Guardar ajuste" })).not.toBeInTheDocument()
    view.rerender(<ChakraProvider value={defaultSystem}><NAdjustmentEditor {...baseProps} loading /></ChakraProvider>)
    expect(screen.getByRole("status")).toHaveTextContent("Cargando información")
    view.rerender(<ChakraProvider value={defaultSystem}><NAdjustmentEditor {...baseProps} error={<Text>Error remoto</Text>} /></ChakraProvider>)
    expect(screen.getByRole("alert")).toHaveTextContent("Error remoto")
    view.rerender(<ChakraProvider value={defaultSystem}><NAdjustmentEditor {...baseProps} item={null} /></ChakraProvider>)
    expect(screen.getByRole("status")).toHaveTextContent("No hay un elemento")
  })
})
