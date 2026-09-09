import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { NPanel } from "../components/panel"
import { NThemeProvider } from "../components/theme"
import { BeginnerAccessibilityGuideView, EmbeddedVisualPalette, VisualSystemView } from "./AccessibilityViews"

afterEach(cleanup)

const renderView = (view: React.ReactNode) => render(<NThemeProvider defaultTheme="light">{view}</NThemeProvider>)

describe("vistas de accesibilidad y personalización", () => {
  it("cambia la dirección visual y conserva un estado anunciado", () => {
    renderView(<VisualSystemView />)

    fireEvent.click(screen.getByRole("button", { name: /coral nocturno/i }))

    expect(screen.getByRole("button", { name: /coral nocturno/i })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText(/Coral y rosa para productos/i)).toHaveAttribute("role", "status")
    expect(screen.getByTitle("Ejemplo interactivo de NDataTable")).toHaveAttribute("src", "?view=datatable&theme=dark&embed=1&palette=coral")
  })

  it("abre el panel personalizado como diálogo accesible", async () => {
    renderView(<VisualSystemView />)

    fireEvent.click(screen.getByRole("button", { name: /abrir detalle accesible/i }))

    const dialog = await screen.findByRole("dialog", { name: "Detalle de operación" })
    expect(within(dialog).getByText("38 órdenes requieren confirmación")).toBeInTheDocument()
  })

  it("extiende la paleta embebida a los paneles renderizados mediante portal", async () => {
    renderView(
      <EmbeddedVisualPalette paletteId="coral">
        <NPanel trigger={<button>Abrir panel embebido</button>} title="Panel con paleta">
          Contenido
        </NPanel>
      </EmbeddedVisualPalette>,
    )

    expect(document.body).toHaveClass("visual-system-embed")
    expect(document.body).toHaveAttribute("data-palette", "coral")

    fireEvent.click(screen.getByRole("button", { name: "Abrir panel embebido" }))
    const dialog = await screen.findByRole("dialog", { name: "Panel con paleta" })

    expect(document.body).toContainElement(dialog)
    expect(dialog.closest(".visual-system-embed[data-palette='coral']")).toBe(document.body)
  })

  it("ejecuta el adaptador simulado de impresión térmica", async () => {
    renderView(<VisualSystemView />)

    fireEvent.click(screen.getByRole("button", { name: "Simular impresión" }))

    expect(await screen.findByText(/Trabajo simulado: 80 mm · 1 copia/i)).toHaveAttribute("role", "status")
  })

  it("presenta la guía para principiantes con una jerarquía navegable", () => {
    renderView(<BeginnerAccessibilityGuideView />)

    expect(screen.getByRole("heading", { name: "Diseño y desarrollo web con Nissi UI, desde cero", level: 1 })).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "Contenido de la guía" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Accesibilidad práctica", level: 2 })).toBeInTheDocument()
  })

  it("permite explorar tablas, formularios y el resto del catálogo real", async () => {
    renderView(<VisualSystemView />)

    fireEvent.click(screen.getByRole("button", { name: /datos e inputs/i }))
    fireEvent.click(await screen.findByRole("menuitem", { name: "NTable" }))

    expect(screen.getByTitle("Ejemplo interactivo de NTable")).toHaveAttribute("src", "?view=table&theme=dark&embed=1&palette=aurora")
    fireEvent.click(screen.getByRole("button", { name: /datos e inputs/i }))
    expect(await screen.findByRole("menuitem", { name: "NForm" })).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "NAmountInput" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /proyectos/i })).toBeInTheDocument()
  })
})
