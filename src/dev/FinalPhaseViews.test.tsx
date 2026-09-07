import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { ActivityPatternsView, DashboardPatternsView, DataPatternsView, PagePatternsView, SaasPatternsView, VerticalPatternsView } from "./FinalPhaseViews"

afterEach(cleanup)
const renderView = (view: React.ReactNode) => render(<ChakraProvider value={defaultSystem}>{view}</ChakraProvider>)

describe("catálogo de la fase final", () => {
  it.each([
    ["Contexto, estados y decisiones coherentes", <PagePatternsView />],
    ["Exploración escalable de información", <DataPatternsView />],
    ["Evidencia y comunicación operativa", <ActivityPatternsView />],
    ["Indicadores y visualizaciones componibles", <DashboardPatternsView />],
    ["Suscripciones, soporte y trazabilidad", <SaasPatternsView />],
    ["Bloques especializados sin contaminar el núcleo", <VerticalPatternsView />],
  ])("renderiza %s", (title, view) => {
    renderView(view)
    expect(screen.getByRole("heading", { name: title, level: 1 })).toBeInTheDocument()
    expect(screen.getAllByText("Ejemplo funcional").length).toBeGreaterThan(0)
  })
})
