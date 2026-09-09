import { ChakraProvider, defaultSystem, Text } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { HelpCircle, LogOut } from "lucide-react"
import { describe, expect, it, vi } from "vitest"

import { NHeader } from "./NHeader"
import { NThemeProvider } from "../theme"
import { NPermissionsProvider } from "../permissions"

function renderHeader(header: React.ReactNode) {
  return render(<ChakraProvider value={defaultSystem}>{header}</ChakraProvider>)
}

describe("NHeader", () => {
  it("renderiza la variante site y selecciona navegación", () => {
    const onItemSelect = vi.fn()
    renderHeader(
      <NHeader
        brand={<Text>Nissi UI</Text>}
        items={[{ id: "home", label: "Inicio", href: "#inicio" }]}
        defaultActiveItemId="home"
        onItemSelect={onItemSelect}
      />,
    )

    expect(screen.getByRole("banner")).toBeInTheDocument()
    const home = screen.getByRole("link", { name: "Inicio", hidden: true })
    expect(home).toHaveAttribute("aria-current", "page")
    fireEvent.click(home)
    expect(onItemSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "home" }))
  })

  it("abre dropdowns con teclado y permite seleccionar un hijo", async () => {
    const onItemSelect = vi.fn()
    renderHeader(
      <NHeader
        items={[{ id: "products", label: "Productos", children: [{ id: "table", label: "Tablas" }] }]}
        onItemSelect={onItemSelect}
      />,
    )

    const trigger = screen.getByRole("button", { name: /Productos/, hidden: true })
    trigger.focus()
    fireEvent.keyDown(trigger, { key: "ArrowDown" })
    const option = await screen.findByRole("menuitem", { name: "Tablas" })
    fireEvent.click(option)
    expect(onItemSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "table" }))
  })

  it("renderiza la variante app, búsqueda, tema y acciones", () => {
    const onSearch = vi.fn()
    const onThemeChange = vi.fn()
    const onAction = vi.fn()
    renderHeader(
      <NHeader
        variant="app"
        brand={<Text>Nissi</Text>}
        extra={<Text>Panel general</Text>}
        search={{ onChange: onSearch }}
        showThemeToggle
        theme="light"
        onThemeChange={onThemeChange}
        actions={[{ id: "help", label: "Ayuda", icon: <HelpCircle />, showOnMobile: true, badge: 2, onClick: onAction }]}
      />,
    )

    fireEvent.change(screen.getByRole("searchbox", { name: "Buscar en la aplicación", hidden: true }), { target: { value: "ventas" } })
    expect(onSearch).toHaveBeenCalledWith("ventas")
    fireEvent.click(screen.getByRole("button", { name: "Cambiar a tema oscuro" }))
    expect(onThemeChange).toHaveBeenCalledWith("dark")
    expect(screen.getAllByText("2").length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole("button", { name: "Ayuda" }))
    expect(onAction).toHaveBeenCalled()
  })

  it("renderiza NTheme como botón y permite elegir el tema desde el header", async () => {
    render(
      <NThemeProvider theme="nissi">
        <NHeader showThemeToggle themePresentation="button" />
      </NThemeProvider>,
    )

    const trigger = screen.getByRole("button", { name: "Elegir tema. Tema actual: Nissi Dark" })
    expect(trigger).toHaveTextContent("Nissi Dark")
    fireEvent.click(trigger)
    expect(await screen.findByRole("menuitemradio", { name: "Claro" })).toBeInTheDocument()
    expect(screen.getByRole("menuitemradio", { name: "Nissi Dark" })).toHaveAttribute("aria-checked", "true")
  })

  it("abre notificaciones y menú de usuario en portales", async () => {
    const onLogout = vi.fn()
    renderHeader(
      <NHeader
        variant="app"
        notifications={[{ id: "release", title: "Nueva versión", description: "Lista para instalar", unread: true }]}
        user={{ name: "Ana Torres", role: "Administradora", actions: [{ id: "logout", label: "Cerrar sesión", icon: <LogOut />, onClick: onLogout }] }}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "1 notificaciones sin leer" }))
    expect(await screen.findByRole("menuitem", { name: /Nueva versión/ })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: "Escape" })
    await waitFor(() => expect(screen.queryByRole("menuitem", { name: /Nueva versión/ })).not.toBeInTheDocument())
    fireEvent.click(screen.getByRole("button", { name: "Abrir menú de Ana Torres" }))
    const logout = await screen.findByRole("menuitem", { name: "Cerrar sesión" })
    expect(logout.closest("[data-scope='menu']")).not.toBeNull()
    fireEvent.click(logout)
    expect(onLogout).toHaveBeenCalled()
  })

  it("colapsa la navegación a un Drawer móvil y restaura el foco", async () => {
    renderHeader(<NHeader items={[{ id: "home", label: "Inicio" }]} />)
    const trigger = screen.getByRole("button", { name: "Abrir menú de navegación" })
    fireEvent.click(trigger)
    const dialog = await screen.findByRole("dialog")
    expect(document.body.contains(dialog)).toBe(true)
    fireEvent.click(within(dialog).getByRole("button", { name: "Inicio" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it("aplica permisos a la navegación de escritorio y móvil", () => {
    renderHeader(
      <NPermissionsProvider permissions={["core:ver"]}>
        <NHeader items={[
          { id: "home", label: "Inicio", requiredPermission: "core:ver" },
          { id: "billing", label: "Facturación", requiredPermission: "facturacion:ver" },
        ]} />
      </NPermissionsProvider>,
    )
    expect(screen.getByRole("button", { name: "Inicio", hidden: true })).toBeInTheDocument()
    expect(screen.queryByText("Facturación")).not.toBeInTheDocument()
  })
})
