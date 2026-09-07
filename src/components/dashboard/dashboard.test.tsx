import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NChartFrame, NDashboardGrid, NDashboardGridItem, NStatCard } from "./index"

const renderUI = (node: React.ReactNode) => render(<ChakraProvider value={defaultSystem}>{node}</ChakraProvider>)
describe("dashboards", () => {
  it("muestra KPI y tendencia", () => { renderUI(<NStatCard label="Ingresos" value="$18,500" trend={12} trendLabel="vs. mes anterior" />); expect(screen.getByText("$18,500")).toBeInTheDocument(); expect(screen.getByText("12%")).toBeInTheDocument() })
  it("compone celdas responsive", () => { renderUI(<NDashboardGrid><NDashboardGridItem colSpan={2}><p>Indicador ancho</p></NDashboardGridItem></NDashboardGrid>); expect(screen.getByText("Indicador ancho")).toBeInTheDocument() })
  it("ofrece gráfica base, tabla accesible y adaptador", () => {
    const renderer = vi.fn(() => <div>Gráfica externa</div>)
    renderUI(<NChartFrame title="Ventas" data={[{ label: "Lun", value: 10 }]} renderer={renderer} />)
    expect(screen.getByText("Gráfica externa")).toBeInTheDocument(); expect(screen.getByRole("table", { name: "Datos de la gráfica" })).toHaveTextContent("10"); expect(renderer).toHaveBeenCalled()
  })
})
