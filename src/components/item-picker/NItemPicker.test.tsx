import { Badge, ChakraProvider, Text, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NItemPicker } from "./NItemPicker"

interface DemoItem {
  id: string
  name: string
  description: string
  category: string
  code: string
  disabled?: boolean
}

const items: DemoItem[] = [
  { id: "camera", name: "Cámara", description: "Equipo audiovisual", category: "Activos", code: "CAM-01" },
  { id: "design", name: "Diseño UX", description: "Servicio profesional", category: "Servicios", code: "SRV-10" },
  { id: "desk", name: "Escritorio", description: "Mobiliario", category: "Activos", code: "MOB-22", disabled: true },
]

function renderPicker(props: Partial<React.ComponentProps<typeof NItemPicker<DemoItem>>> = {}) {
  return render(
    <ChakraProvider value={defaultSystem}>
      <NItemPicker
        items={items}
        getItemId={(item) => item.id}
        getItemLabel={(item) => item.name}
        getItemDescription={(item) => item.description}
        getSearchText={(item) => item.code}
        {...props}
      />
    </ChakraProvider>,
  )
}

describe("NItemPicker", () => {
  it("filtra etiquetas sin depender de acentos y permite limpiar la búsqueda", () => {
    renderPicker()

    const search = screen.getByRole("searchbox", { name: "Buscar entre los elementos disponibles" })
    fireEvent.change(search, { target: { value: "camara" } })
    expect(screen.getByRole("button", { name: "Cámara" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Diseño UX" })).not.toBeInTheDocument()
    expect(screen.getByText("1 resultado")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Limpiar búsqueda" }))
    expect(search).toHaveValue("")
    expect(screen.getByText("3 resultados")).toBeInTheDocument()
  })

  it("busca también por el texto adicional proporcionado por el consumidor", () => {
    renderPicker()
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "SRV-10" } })
    expect(screen.getByRole("button", { name: "Diseño UX" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Cámara" })).not.toBeInTheDocument()
  })

  it("administra selección simple y entrega elementos e identificadores", () => {
    const onSelectionChange = vi.fn()
    const onItemSelect = vi.fn()
    renderPicker({ onSelectionChange, onItemSelect })

    const camera = screen.getByRole("button", { name: "Cámara" })
    fireEvent.click(camera)

    expect(camera).toHaveAttribute("aria-pressed", "true")
    expect(screen.getAllByText("1 seleccionado")).toHaveLength(2)
    expect(onItemSelect).toHaveBeenCalledWith(items[0])
    expect(onSelectionChange).toHaveBeenLastCalledWith([items[0]], ["camera"])
  })

  it("agrega y retira elementos en selección múltiple", () => {
    const onSelectionChange = vi.fn()
    renderPicker({ selectionMode: "multiple", onSelectionChange })

    fireEvent.click(screen.getByRole("button", { name: "Cámara" }))
    fireEvent.click(screen.getByRole("button", { name: "Diseño UX" }))
    expect(screen.getAllByText("2 seleccionados")).toHaveLength(2)
    expect(onSelectionChange).toHaveBeenLastCalledWith([items[0], items[1]], ["camera", "design"])

    fireEvent.click(screen.getByRole("button", { name: "Cámara" }))
    expect(onSelectionChange).toHaveBeenLastCalledWith([items[1]], ["design"])
  })

  it("respeta la selección controlada sin duplicar la fuente de verdad", () => {
    const onSelectionChange = vi.fn()
    renderPicker({ selectedIds: ["design"], onSelectionChange })

    const camera = screen.getByRole("button", { name: "Cámara" })
    const design = screen.getByRole("button", { name: "Diseño UX" })
    expect(design).toHaveAttribute("aria-pressed", "true")
    fireEvent.click(camera)

    expect(onSelectionChange).toHaveBeenLastCalledWith([items[0]], ["camera"])
    expect(camera).toHaveAttribute("aria-pressed", "false")
    expect(design).toHaveAttribute("aria-pressed", "true")
  })

  it("delega la búsqueda remota cuando shouldFilter es false", () => {
    const onSearchValueChange = vi.fn()
    renderPicker({ searchValue: "consulta remota", shouldFilter: false, onSearchValueChange })

    expect(screen.getByText("3 resultados")).toBeInTheDocument()
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "nuevo valor" } })
    expect(onSearchValueChange).toHaveBeenCalledWith("nuevo valor")
    expect(screen.getByRole("searchbox")).toHaveValue("consulta remota")
  })

  it("actúa sin selección persistente cuando selectionMode es none", () => {
    const onItemSelect = vi.fn()
    const onSelectionChange = vi.fn()
    renderPicker({ selectionMode: "none", onItemSelect, onSelectionChange })

    const item = screen.getByRole("button", { name: "Cámara" })
    fireEvent.click(item)
    expect(item).not.toHaveAttribute("aria-pressed")
    expect(onItemSelect).toHaveBeenCalledWith(items[0])
    expect(onSelectionChange).not.toHaveBeenCalled()
  })

  it("respeta elementos deshabilitados y navegación por flechas", () => {
    const onItemSelect = vi.fn()
    renderPicker({ isItemDisabled: (item) => Boolean(item.disabled), onItemSelect })

    const camera = screen.getByRole("button", { name: "Cámara" })
    const design = screen.getByRole("button", { name: "Diseño UX" })
    const desk = screen.getByRole("button", { name: "Escritorio" })
    expect(desk).toBeDisabled()
    fireEvent.click(desk)
    expect(onItemSelect).not.toHaveBeenCalled()

    camera.focus()
    fireEvent.keyDown(camera, { key: "ArrowRight" })
    expect(design).toHaveFocus()
    fireEvent.keyDown(design, { key: "ArrowRight" })
    expect(camera).toHaveFocus()
  })

  it("agrupa y permite personalizar la representación de cada elemento", () => {
    renderPicker({
      groupBy: (item) => item.category,
      layout: "list",
      renderItem: (item, state) => (
        <Text>{item.code}{state.selected ? " seleccionado" : ""}</Text>
      ),
      renderTrailing: (item) => <Badge>{item.category}</Badge>,
    })

    expect(screen.getByRole("heading", { name: "Activos" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Servicios" })).toBeInTheDocument()
    expect(screen.getByText("CAM-01")).toBeInTheDocument()
  })

  it("muestra estados de carga y vacío traducibles", () => {
    const view = renderPicker({ loading: true, labels: { loading: "Loading choices" } })
    expect(screen.getByRole("status")).toHaveTextContent("Loading choices")
    expect(screen.queryByRole("button", { name: "Cámara" })).not.toBeInTheDocument()

    view.rerender(
      <ChakraProvider value={defaultSystem}>
        <NItemPicker
          items={[]}
          getItemId={(item: DemoItem) => item.id}
          getItemLabel={(item) => item.name}
          labels={{ emptyTitle: "Nothing found", emptyDescription: "Change the filters" }}
        />
      </ChakraProvider>,
    )
    expect(screen.getByRole("status")).toHaveTextContent("Nothing found")
    expect(screen.getByRole("status")).toHaveTextContent("Change the filters")
  })
})
