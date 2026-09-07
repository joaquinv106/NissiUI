import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { NThemeProvider } from "../components/theme"
import { BeginnerAccessibilityGuideView, DashboardStylesView } from "./AccessibilityViews"

afterEach(cleanup)

const renderView = (view: React.ReactNode) => render(<NThemeProvider defaultTheme="light">{view}</NThemeProvider>)

describe("vistas de accesibilidad y personalización", () => {
  it("cambia la dirección visual y conserva un estado anunciado", () => {
    renderView(<DashboardStylesView />)

    fireEvent.click(screen.getByRole("button", { name: /coral nocturno/i }))

    expect(screen.getByRole("button", { name: /coral nocturno/i })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText(/Coral y rosa para productos/i)).toHaveAttribute("role", "status")
  })

  it("abre el panel personalizado como diálogo accesible", async () => {
    renderView(<DashboardStylesView />)

    fireEvent.click(screen.getByRole("button", { name: /abrir detalle accesible/i }))

    const dialog = await screen.findByRole("dialog", { name: "Detalle de operación" })
    expect(within(dialog).getByText("38 órdenes requieren confirmación")).toBeInTheDocument()
  })

  it("ejecuta el adaptador simulado de impresión térmica", async () => {
    renderView(<DashboardStylesView />)

    fireEvent.click(screen.getByRole("button", { name: "Simular impresión" }))

    expect(await screen.findByText(/Trabajo simulado: 80 mm · 1 copia/i)).toHaveAttribute("role", "status")
  })

  it("presenta la guía para principiantes con una jerarquía navegable", () => {
    renderView(<BeginnerAccessibilityGuideView />)

    expect(screen.getByRole("heading", { name: "Diseño y desarrollo web con Nissi UI, desde cero", level: 1 })).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "Contenido de la guía" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Accesibilidad práctica", level: 2 })).toBeInTheDocument()
  })
})
