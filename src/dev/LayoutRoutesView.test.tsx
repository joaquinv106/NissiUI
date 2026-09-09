import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LayoutRoutesView } from "./LayoutRoutesView"

describe("LayoutRoutesView", () => {
  it("documenta variantes reales y enlaza la muestra independiente", () => {
    render(<ChakraProvider value={defaultSystem}><LayoutRoutesView /></ChakraProvider>)

    expect(screen.getByRole("heading", { name: "Nlayout + Nroutes" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Abrir demostración completa/ })).toHaveAttribute("href", "/nfacture.html")
    expect(screen.getByRole("tab", { name: "Layout completo" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Router aislado" })).toBeInTheDocument()
  })
})
