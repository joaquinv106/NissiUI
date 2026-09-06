import { Box, Text } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NHeader } from "../header"
import { NTheme } from "./NTheme"
import { NThemeProvider } from "./NThemeProvider"
import { nissiSystem } from "./system"
import { useNTheme } from "./context"

function ThemeProbe() {
  const { theme, resolvedTheme } = useNTheme()
  return <Text>{theme}:{resolvedTheme}</Text>
}

describe("NTheme", () => {
  it("sincroniza el tema azul marino y el esquema de color del navegador", async () => {
    render(
      <NThemeProvider theme="navy">
        <ThemeProbe />
        <Box bg="bg.panel">Panel</Box>
      </NThemeProvider>,
    )

    expect(screen.getByText("navy:navy")).toBeInTheDocument()
    await waitFor(() => expect(document.documentElement).toHaveClass("navy"))
    expect(document.documentElement.style.colorScheme).toBe("dark")
  })

  it("sincroniza Nissi Dark como un esquema oscuro de marca", async () => {
    render(
      <NThemeProvider theme="nissi">
        <ThemeProbe />
        <NTheme presentation="button" />
      </NThemeProvider>,
    )

    expect(screen.getByText("nissi:nissi")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Tema actual: Nissi Dark/ })).toHaveTextContent("Nissi Dark")
    await waitFor(() => expect(document.documentElement).toHaveClass("nissi"))
    expect(document.documentElement.style.colorScheme).toBe("dark")
  })

  it("expone los tokens navy después de los tokens oscuros de Chakra", () => {
    const tokenCss = JSON.stringify(nissiSystem.getTokenCss())
    const darkSelector = tokenCss.indexOf(".dark &")
    const navySelector = tokenCss.indexOf(".navy &, .navy .chakra-theme:not(.light):not(.dark) &")

    expect(darkSelector).toBeGreaterThan(-1)
    expect(navySelector).toBeGreaterThan(darkSelector)
    expect(tokenCss).toContain('"--chakra-colors-bg-panel":"#0d2036"')
    expect(tokenCss).toContain('"--chakra-colors-fg-muted":"#a9bdd3"')
  })

  it("aplica a Nissi Dark las superficies y acentos extraídos del isotipo", () => {
    const tokenCss = JSON.stringify(nissiSystem.getTokenCss())
    const darkSelector = tokenCss.indexOf(".dark &")
    const nissiSelector = tokenCss.indexOf(".nissi &, .nissi .chakra-theme:not(.light):not(.dark):not(.navy) &")

    expect(nissiSelector).toBeGreaterThan(darkSelector)
    expect(tokenCss).toContain('"--chakra-colors-bg-panel":"#0d122b"')
    expect(tokenCss).toContain('"--chakra-colors-fg-muted":"#bac2dd"')
    expect(tokenCss).toContain('"--chakra-colors-blue-solid":"var(--chakra-colors-nissi-600)"')
    expect(tokenCss).toContain('"--chakra-colors-blue-focus-ring":"var(--chakra-colors-nissi-cyan)"')
  })

  it("permite elegir cualquier tema desde la variante botón", async () => {
    const onThemeChange = vi.fn()
    render(
      <NThemeProvider theme="light" onThemeChange={onThemeChange}>
        <NTheme presentation="button" />
      </NThemeProvider>,
    )

    fireEvent.click(screen.getByRole("button", { name: /Elegir tema.*Tema actual: Claro/ }))
    fireEvent.click(await screen.findByRole("menuitemradio", { name: /Azul marino/ }))
    await waitFor(() => expect(onThemeChange).toHaveBeenCalledWith("navy"))
  })

  it("administra y persiste la preferencia cuando no está controlado", async () => {
    const storageKey = "nissi-theme-test"
    localStorage.removeItem(storageKey)
    render(
      <NThemeProvider defaultTheme="light" storageKey={storageKey}>
        <NTheme presentation="button" />
        <ThemeProbe />
      </NThemeProvider>,
    )

    fireEvent.click(screen.getByRole("button", { name: /Elegir tema.*Tema actual: Claro/ }))
    fireEvent.click(await screen.findByRole("menuitemradio", { name: /Azul marino/ }))

    await waitFor(() => expect(screen.getByText("navy:navy")).toBeInTheDocument())
    expect(localStorage.getItem(storageKey)).toBe("navy")
    localStorage.removeItem(storageKey)
  })

  it("integra el selector completo en NHeader sin props de tema duplicadas", async () => {
    render(
      <NThemeProvider theme="dark">
        <NHeader showThemeToggle />
      </NThemeProvider>,
    )

    fireEvent.click(screen.getByRole("button", { name: /Elegir tema.*Tema actual: Oscuro/ }))
    expect(await screen.findByRole("menuitemradio", { name: /Claro/ })).toBeInTheDocument()
    expect(screen.getByRole("menuitemradio", { name: /Azul marino/ })).toBeInTheDocument()
    expect(screen.getByRole("menuitemradio", { name: /Nissi Dark/ })).toBeInTheDocument()
    expect(screen.getByRole("menuitemradio", { name: /Usar tema del sistema/ })).toBeInTheDocument()
  })

  it("admite etiquetas traducidas y limita las opciones visibles", async () => {
    render(
      <NThemeProvider theme="light">
        <NTheme
          themes={["light", "navy"]}
          labels={{ selectorLabel: "Choose theme", navyTheme: "Navy blue" }}
        />
      </NThemeProvider>,
    )

    fireEvent.click(screen.getByRole("button", { name: /Choose theme/ }))
    expect(await screen.findByRole("menuitemradio", { name: /Navy blue/ })).toBeInTheDocument()
    expect(screen.queryByRole("menuitemradio", { name: /Oscuro/ })).not.toBeInTheDocument()
  })
})
