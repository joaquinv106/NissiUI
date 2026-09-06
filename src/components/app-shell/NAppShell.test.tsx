import { ChakraProvider, defaultSystem, Text } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { NAppShell } from "./NAppShell"

describe("NAppShell", () => {
  it("compone regiones accesibles y un enlace para saltar al contenido", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NAppShell header={<header>Cabecera</header>} sidebar={<nav>Menú</nav>} footer={<Text>Pie</Text>}>
          <Text>Panel principal</Text>
        </NAppShell>
      </ChakraProvider>,
    )

    const main = screen.getByRole("main", { name: "Contenido principal" })
    expect(screen.getByRole("complementary", { name: "Navegación de la aplicación" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Saltar al contenido principal" })).toHaveAttribute("href", `#${main.id}`)
    expect(screen.getByText("Cabecera")).toBeInTheDocument()
    expect(screen.getByText("Pie")).toBeInTheDocument()
  })

  it("permite colocar el sidebar al final del flujo", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NAppShell sidebar={<nav>Menú derecho</nav>} sidebarPosition="end">
          Contenido
        </NAppShell>
      </ChakraProvider>,
    )

    const aside = screen.getByRole("complementary")
    expect(aside.previousElementSibling).toContainElement(screen.getByRole("main"))
  })
})
