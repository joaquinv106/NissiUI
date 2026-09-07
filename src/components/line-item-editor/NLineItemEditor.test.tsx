import { ChakraProvider, Text, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NLineItemEditor } from "./NLineItemEditor"
import type { NLineItemField } from "./types"

interface DemoItem {
  id: string
  name: string
  category: string
  disabled?: boolean
}

interface DemoLine {
  id: string
  itemId: string
  name: string
  quantity: number
  unit: string
}

const items: DemoItem[] = [
  { id: "camera", name: "C\u00e1mara", category: "Activos" },
  { id: "design", name: "Dise\u00f1o UX", category: "Servicios" },
  { id: "desk", name: "Escritorio", category: "Activos", disabled: true },
]

const initialLines: DemoLine[] = [
  { id: "line-camera", itemId: "camera", name: "C\u00e1mara", quantity: 1, unit: "pieza" },
  { id: "line-design", itemId: "design", name: "Dise\u00f1o UX", quantity: 2, unit: "hora" },
]

const fields: NLineItemField<DemoLine>[] = [
  {
    id: "quantity",
    header: "Cantidad",
    inputType: "number",
    min: 1,
    getValue: (line) => line.quantity,
    setValue: (line, value) => ({ ...line, quantity: Number(value) }),
    validate: (value) => Number(value) > 0 ? undefined : "Debe ser mayor que cero",
  },
  {
    id: "unit",
    header: "Unidad",
    inputType: "select",
    options: [
      { label: "Pieza", value: "pieza" },
      { label: "Hora", value: "hora" },
    ],
    getValue: (line) => line.unit,
    setValue: (line, value) => ({ ...line, unit: String(value) }),
  },
]

function renderEditor(props: Partial<React.ComponentProps<typeof NLineItemEditor<DemoItem, DemoLine>>> = {}) {
  return render(
    <ChakraProvider value={defaultSystem}>
      <NLineItemEditor
        items={items}
        getItemId={(item) => item.id}
        getItemLabel={(item) => item.name}
        createLine={(item) => ({ id: `line-${item.id}`, itemId: item.id, name: item.name, quantity: 1, unit: "pieza" })}
        getLineId={(line) => line.id}
        getLineLabel={(line) => line.name}
        getLineDescription={(line) => line.itemId}
        fields={fields}
        {...props}
      />
    </ChakraProvider>,
  )
}

describe("NLineItemEditor", () => {
  it("agrega elementos desde el selector y publica el motivo del cambio", () => {
    const onLinesChange = vi.fn()
    renderEditor({ defaultPickerOpen: true, onLinesChange })

    fireEvent.click(screen.getByRole("button", { name: "C\u00e1mara" }))

    expect(screen.getByText("1 partida")).toBeInTheDocument()
    expect(screen.getByRole("spinbutton", { name: "Cantidad de C\u00e1mara" })).toHaveValue(1)
    expect(onLinesChange).toHaveBeenLastCalledWith(
      [expect.objectContaining({ itemId: "camera", quantity: 1 })],
      expect.objectContaining({ reason: "add", item: items[0] }),
    )
  })

  it("respeta lines como fuente de verdad controlada", () => {
    const onLinesChange = vi.fn()
    renderEditor({ lines: initialLines.slice(0, 1), defaultPickerOpen: true, onLinesChange })

    fireEvent.click(screen.getByRole("button", { name: "Dise\u00f1o UX" }))

    expect(onLinesChange).toHaveBeenCalledWith(
      expect.arrayContaining([initialLines[0], expect.objectContaining({ itemId: "design" })]),
      expect.objectContaining({ reason: "add" }),
    )
    expect(screen.getByText("1 partida")).toBeInTheDocument()
  })

  it("edita campos tipados y entrega el identificador del campo", () => {
    const onLinesChange = vi.fn()
    renderEditor({ defaultLines: initialLines, onLinesChange })

    fireEvent.change(screen.getByRole("spinbutton", { name: "Cantidad de C\u00e1mara" }), { target: { value: "3" } })
    fireEvent.change(screen.getByRole("combobox", { name: "Unidad de C\u00e1mara" }), { target: { value: "hora" } })

    expect(onLinesChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ quantity: 3 })]),
      expect.objectContaining({ reason: "update", fieldId: "quantity" }),
    )
    expect(screen.getByRole("combobox", { name: "Unidad de C\u00e1mara" })).toHaveValue("hora")
  })

  it("muestra la validaci\u00f3n configurada por el consumidor", () => {
    renderEditor({ defaultLines: initialLines.slice(0, 1) })
    const quantity = screen.getByRole("spinbutton", { name: "Cantidad de C\u00e1mara" })

    fireEvent.change(quantity, { target: { value: "0" } })

    expect(quantity).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("alert")).toHaveTextContent("Debe ser mayor que cero")
  })

  it("reordena y elimina partidas con acciones accesibles", () => {
    const onLinesChange = vi.fn()
    renderEditor({ defaultLines: initialLines, onLinesChange })

    fireEvent.click(screen.getByRole("button", { name: "Mover Dise\u00f1o UX hacia arriba" }))
    expect(onLinesChange).toHaveBeenLastCalledWith(
      [initialLines[1], initialLines[0]],
      expect.objectContaining({ reason: "reorder", fromIndex: 1, toIndex: 0 }),
    )

    fireEvent.click(screen.getByRole("button", { name: "Eliminar Dise\u00f1o UX" }))
    expect(screen.queryByText("Dise\u00f1o UX")).not.toBeInTheDocument()
    expect(onLinesChange).toHaveBeenLastCalledWith(
      [initialLines[0]],
      expect.objectContaining({ reason: "remove", line: initialLines[1] }),
    )
  })

  it("permite definir la pol\u00edtica de duplicados mediante resolveAdd", () => {
    renderEditor({
      defaultLines: initialLines.slice(0, 1),
      defaultPickerOpen: true,
      resolveAdd: ({ line, lines }) => lines.map((current) => current.itemId === line.itemId
        ? { ...current, quantity: current.quantity + 1 }
        : current),
    })

    fireEvent.click(screen.getByRole("button", { name: "C\u00e1mara" }))

    expect(screen.getByText("1 partida")).toBeInTheDocument()
    expect(screen.getByRole("spinbutton", { name: "Cantidad de C\u00e1mara" })).toHaveValue(2)
  })

  it("aplica estados deshabilitado y de s\u00f3lo lectura", () => {
    const { rerender } = renderEditor({
      defaultPickerOpen: true,
      isItemDisabled: (item) => Boolean(item.disabled),
    })
    expect(screen.getByRole("button", { name: "Escritorio" })).toBeDisabled()

    rerender(
      <ChakraProvider value={defaultSystem}>
        <NLineItemEditor
          items={items}
          getItemId={(item) => item.id}
          getItemLabel={(item) => item.name}
          createLine={(item) => ({ id: item.id, itemId: item.id, name: item.name, quantity: 1, unit: "pieza" })}
          getLineId={(line) => line.id}
          getLineLabel={(line) => line.name}
          fields={fields}
          lines={initialLines.slice(0, 1)}
          readOnly
        />
      </ChakraProvider>,
    )
    expect(screen.queryByRole("button", { name: "Agregar elementos" })).not.toBeInTheDocument()
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
  })

  it("presenta contenido personalizado y estados traducibles", () => {
    const view = renderEditor({
      error: <Text>Servicio no disponible</Text>,
      labels: { errorTitle: "Lines unavailable" },
    })
    expect(screen.getByRole("alert")).toHaveTextContent("Lines unavailable")
    expect(screen.getByRole("alert")).toHaveTextContent("Servicio no disponible")

    view.rerender(
      <ChakraProvider value={defaultSystem}>
        <NLineItemEditor
          items={items}
          getItemId={(item) => item.id}
          getItemLabel={(item) => item.name}
          createLine={(item) => ({ id: item.id, itemId: item.id, name: item.name, quantity: 1, unit: "pieza" })}
          getLineId={(line) => line.id}
          getLineLabel={(line) => line.name}
          emptyState={<Text role="status">Sin conceptos</Text>}
        />
      </ChakraProvider>,
    )
    expect(within(screen.getByRole("status")).getByText("Sin conceptos")).toBeInTheDocument()
  })
})
