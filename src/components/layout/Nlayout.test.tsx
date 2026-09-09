import { ChakraProvider, defaultSystem, Text } from "@chakra-ui/react"
import { fireEvent, render, screen } from "@testing-library/react"
import { FileText, LayoutDashboard } from "lucide-react"
import { describe, expect, it } from "vitest"

import { Nlayout } from "./Nlayout"
import type { NlayoutRoute } from "./types"

type DemoData = { section: "home" | "documents" }

const routes: NlayoutRoute<DemoData>[] = [
  {
    id: "home-route",
    path: "/",
    title: "Resumen",
    navigationId: "home",
    data: { section: "home" },
    pageHeader: { subtitle: "Estado general de la operación." },
    element: <Text>Indicadores del día</Text>,
  },
  {
    id: "documents-route",
    path: "/comprobantes",
    title: "Comprobantes",
    navigationId: "documents",
    data: { section: "documents" },
    pageHeader: {
      subtitle: "Consulta y administra documentos.",
      breadcrumbs: [
        { id: "home", label: "Inicio", href: "/" },
        { id: "documents", label: "Comprobantes", current: true },
      ],
    },
    element: <Text>Listado de comprobantes</Text>,
  },
]

describe("Nlayout", () => {
  it("compone sidebar, header, breadcrumbs, tema y contenido en una SPA", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <Nlayout<DemoData>
          provideTheme={false}
          routeStrategy="memory"
          routes={routes}
          navigation={[
            { id: "home", label: "Resumen", icon: <LayoutDashboard size={18} />, href: "/" },
            { id: "documents", label: "Comprobantes", icon: <FileText size={18} />, href: "/comprobantes" },
          ]}
          brand={<Text>Nissi Operaciones</Text>}
          sidebarProps={{ collapsible: false }}
        />
      </ChakraProvider>,
    )

    expect(screen.getByRole("heading", { name: "Resumen" })).toBeInTheDocument()
    expect(screen.getByText("Indicadores del día")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cambiar a tema oscuro" })).toBeInTheDocument()
    expect(fireEvent.click(screen.getByRole("link", { name: "Saltar al contenido principal" }))).toBe(true)

    const sidebarLink = document.querySelector<HTMLAnchorElement>('a[data-n-sidebar-item="documents"]')
    expect(sidebarLink).not.toBeNull()
    fireEvent.click(sidebarLink!)
    expect(screen.getByRole("heading", { name: "Comprobantes" })).toBeInTheDocument()
    expect(screen.getByText("Listado de comprobantes")).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "Ruta de navegación" })).toBeInTheDocument()
    expect(document.querySelector('a[data-n-sidebar-item="documents"]')).toHaveAttribute("aria-current", "page")
  })
})
