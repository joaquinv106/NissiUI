import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { NFactureLayoutPage } from "./NFactureLayoutPage"

describe("NFactureLayoutPage", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/nfacture.html#/facturacion/dashboard")
    localStorage.removeItem("nissi-ui-nfacture-theme")
  })

  it("carga la aplicación completa y navega entre rutas sin recargar", async () => {
    render(<NFactureLayoutPage />)

    expect(screen.getByRole("region", { name: "Contenido de Resumen" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Tema actual: Nissi Dark/ })).toBeInTheDocument()
    expect(screen.getByText("Comprobantes recientes")).toBeInTheDocument()

    const issueLink = document.querySelector<HTMLAnchorElement>('a[data-n-sidebar-item="facture-issue"]')
    expect(issueLink).not.toBeNull()
    fireEvent.click(issueLink!)

    await waitFor(() => expect(window.location.hash).toBe("#/facturacion/issue"))
    expect(screen.getByRole("region", { name: "Contenido de Emitir factura" })).toBeInTheDocument()
    expect(screen.getByText("Captura receptor, conceptos e impuestos antes de solicitar el timbrado.")).toBeInTheDocument()
    expect(document.querySelector('a[data-n-sidebar-item="facture-issue"]')).toHaveAttribute("aria-current", "page")
  })
})
