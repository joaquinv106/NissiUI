import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NWorkspaceSwitcher } from "./NWorkspaceSwitcher"

describe("NWorkspaceSwitcher", () => {
  it("cambia el workspace y notifica el objeto completo", async () => {
    const onValueChange = vi.fn()
    render(
      <ChakraProvider value={defaultSystem}>
        <NWorkspaceSwitcher
          workspaces={[
            { id: "north", name: "Sucursal Norte" },
            { id: "center", name: "Sucursal Centro", description: "Ciudad de México" },
          ]}
          onValueChange={onValueChange}
        />
      </ChakraProvider>,
    )

    fireEvent.click(screen.getByRole("button", { name: /Cambiar espacio de trabajo: Sucursal Norte/ }))
    fireEvent.click(await screen.findByRole("menuitem", { name: /Sucursal Centro/ }))
    expect(screen.getByRole("button", { name: /Sucursal Centro/ })).toBeInTheDocument()
    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ id: "center" }))
  })

  it("informa cuando no existen workspaces", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NWorkspaceSwitcher workspaces={[]} />
      </ChakraProvider>,
    )
    expect(screen.getByRole("status")).toHaveTextContent("No hay espacios de trabajo disponibles.")
  })
})
