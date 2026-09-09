import { ChakraProvider, defaultSystem, Link, Stack, Text } from "@chakra-ui/react"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NRouteOutlet, Nroutes, useNroutes } from "./index"
import type { NRouteDefinition } from "./types"

const routes: NRouteDefinition[] = [
  { id: "home", path: "/", title: "Inicio", element: <Text>Resumen principal</Text> },
  { id: "invoice", path: "/comprobantes/:folio", title: "Comprobante", element: ({ params }) => <Text>Folio {params.folio}</Text> },
]

function RouterFixture() {
  const { createLinkProps } = useNroutes()
  return (
    <Stack>
      <Link {...createLinkProps("/comprobantes/A-1042")}>Abrir comprobante</Link>
      <NRouteOutlet />
    </Stack>
  )
}

describe("Nroutes", () => {
  it("navega sin recargar, resuelve parámetros y enfoca el contenido", () => {
    const onPathChange = vi.fn()
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes routes={routes} strategy="memory" defaultPath="/" onPathChange={onPathChange}>
          <RouterFixture />
        </Nroutes>
      </ChakraProvider>,
    )

    expect(screen.getByText("Resumen principal")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("link", { name: "Abrir comprobante" }))
    expect(screen.getByText("Folio A-1042")).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Contenido de Comprobante" })).toHaveFocus()
    expect(onPathChange).toHaveBeenCalledWith("/comprobantes/A-1042", expect.objectContaining({ params: { folio: "A-1042" } }))
  })

  it("muestra un estado traducible cuando ninguna ruta coincide", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes
          routes={routes}
          strategy="memory"
          defaultPath="/inexistente"
          labels={{ notFoundTitle: "Ruta desconocida", notFoundDescription: "Revisa la dirección." }}
        />
      </ChakraProvider>,
    )

    expect(screen.getByText("Ruta desconocida")).toBeInTheDocument()
    expect(screen.getByText("Revisa la dirección.")).toBeInTheDocument()
  })

  it("sincroniza History API, basePath y navegación del navegador", () => {
    window.history.replaceState({}, "", "/suite/")
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes routes={routes} strategy="history" basePath="/suite">
          <RouterFixture />
        </Nroutes>
      </ChakraProvider>,
    )

    fireEvent.click(screen.getByRole("link", { name: "Abrir comprobante" }))
    expect(window.location.pathname).toBe("/suite/comprobantes/A-1042")

    act(() => {
      window.history.replaceState({}, "", "/suite/")
      window.dispatchEvent(new PopStateEvent("popstate"))
    })
    expect(screen.getByText("Resumen principal")).toBeInTheDocument()
  })
})
