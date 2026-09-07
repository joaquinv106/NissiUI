import { Button, ChakraProvider, Input, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NDateRangePicker, NDescriptionList, NDetailPanel, NFilterBar } from "./index"
import { NDataTable, type NTableServerQuery } from "../table"

const renderUI = (node: React.ReactNode) => render(<ChakraProvider value={defaultSystem}>{node}</ChakraProvider>)

describe("patrones de datos", () => {
  it("publica cambios de filtros activos", () => {
    const remove = vi.fn(); const clear = vi.fn()
    renderUI(<NFilterBar filters={[{ id: "status", label: "Estado", value: "Activo", onRemove: remove }]} onClear={clear}><Input aria-label="Buscar cliente" /></NFilterBar>)
    fireEvent.click(screen.getByRole("button", { name: "Quitar filtro Estado" })); fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }))
    expect(remove).toHaveBeenCalledOnce(); expect(clear).toHaveBeenCalledOnce()
  })

  it("controla y valida un rango de fechas", () => {
    const onChange = vi.fn()
    renderUI(<NDateRangePicker defaultValue={{ start: "2026-09-10", end: "2026-09-12" }} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText("Hasta"), { target: { value: "2026-09-01" } })
    expect(onChange).toHaveBeenLastCalledWith({ start: "2026-09-10", end: "2026-09-01" })
    expect(screen.getByText(/fecha final/)).toBeInTheDocument()
  })

  it("renderiza datos semánticos y detalle lateral", async () => {
    const items = [{ id: "folio", label: "Folio", value: "TR-100" }]
    renderUI(<><NDescriptionList items={items} /><NDetailPanel defaultOpen title="Detalle" items={items}><Button>Acción</Button></NDetailPanel></>)
    expect(screen.getAllByText("TR-100")).toHaveLength(2)
    expect(await screen.findByRole("dialog", { name: "Detalle" })).toBeInTheDocument()
  })

  it("delega paginación, búsqueda y orden al origen remoto", () => {
    const query: NTableServerQuery = { pageIndex: 1, pageSize: 10, sorting: [], search: "", filterColumn: "", filterValue: "" }
    const onQueryChange = vi.fn()
    renderUI(<NDataTable defaultActions={false} selectable={false} reorderableColumns={false} reorderableRows={false} columnVisibility={false} exportOptions={false} server={{ rowCount: 35, query, onQueryChange }} config={{ headers: [{ key: "name", header: "Nombre" }], data: [{ id: "1", name: "Página remota" }] }} />)
    expect(screen.getByText("Página 2 de 4")).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText("Buscar en la tabla"), { target: { value: "Ana" } })
    expect(onQueryChange).toHaveBeenCalledWith({ ...query, search: "Ana", pageIndex: 0 })
    fireEvent.click(screen.getByRole("button", { name: /Ordenar Nombre/ }))
    expect(onQueryChange).toHaveBeenCalledWith({ ...query, sorting: [{ id: "name", desc: false }], pageIndex: 0 })
  })
})
