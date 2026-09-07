import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NKanban, NMapView, NScheduler } from "./index"

const renderUI = (node: React.ReactNode) => render(<ChakraProvider value={defaultSystem}>{node}</ChakraProvider>)
describe("patrones verticales", () => {
  it("mueve tarjetas por teclado/botón", () => { const move = vi.fn(); renderUI(<NKanban onMove={move} columns={[{ id: "todo", title: "Por hacer", cards: [{ id: "a", title: "Llamar" }] }, { id: "done", title: "Listo", cards: [] }]} />); fireEvent.click(screen.getByRole("button", { name: "Mover Llamar a la columna siguiente" })); expect(move).toHaveBeenCalledWith({ cardId: "a", fromColumnId: "todo", toColumnId: "done", toIndex: 0 }) })
  it("selecciona eventos de agenda", () => { const select = vi.fn(); renderUI(<NScheduler startDate="2026-09-06T00:00:00" days={1} events={[{ id: "e1", title: "Visita", start: "2026-09-06T10:00:00" }]} onEventSelect={select} />); fireEvent.click(screen.getByRole("button", { name: /Visita/ })); expect(select).toHaveBeenCalled() })
  it("integra un proveedor de mapas mediante adaptador", () => { const renderer = vi.fn(() => <div>Mapa externo</div>); renderUI(<NMapView markers={[{ id: "m1", latitude: 19.43, longitude: -99.13, label: "Centro" }]} renderer={renderer} />); expect(screen.getByText("Mapa externo")).toBeInTheDocument(); expect(screen.getByRole("region", { name: "Mapa" })).toHaveTextContent("Centro"); expect(renderer).toHaveBeenCalled() })
})
