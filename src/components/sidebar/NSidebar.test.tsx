import { Button, ChakraProvider, defaultSystem, Text } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { NPermissionsProvider, NSidebar, type NSidebarItem } from "../../index"

const items: NSidebarItem[] = [
  { id: "home", label: "Inicio", href: "#inicio" },
  {
    id: "settings",
    label: "Configuración",
    children: [
      { id: "profile", label: "Perfil" },
      { id: "security", label: "Seguridad", badge: 2 },
    ],
  },
  { id: "disabled", label: "Deshabilitado", disabled: true },
]

function renderSidebar(sidebar: React.ReactNode) {
  return render(<ChakraProvider value={defaultSystem}>{sidebar}</ChakraProvider>)
}

describe("NSidebar", () => {
  it("renderiza navegación semántica y selecciona elementos", () => {
    const onItemSelect = vi.fn()
    renderSidebar(
      <NSidebar
        items={items}
        responsive="push"
        defaultActiveItemId="home"
        onItemSelect={onItemSelect}
      />,
    )

    expect(screen.getByRole("navigation", { name: "Navegación principal" })).toBeInTheDocument()
    const home = screen.getByRole("link", { name: "Inicio" })
    expect(home).toHaveAttribute("aria-current", "page")
    fireEvent.keyDown(home, { key: " " })
    expect(onItemSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "home" }))
    fireEvent.click(screen.getByRole("button", { name: "Configuración" }))
    fireEvent.click(screen.getByRole("button", { name: "Perfil" }))
    expect(screen.getByRole("button", { name: "Perfil" })).toHaveAttribute("aria-current", "true")
    expect(onItemSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "profile" }))
  })

  it("soporta colapso controlado y tooltips/nombres accesibles", async () => {
    const onCollapsedChange = vi.fn()
    renderSidebar(
      <NSidebar
        items={items}
        responsive="push"
        collapsed
        header={<Text>Nissi</Text>}
        onCollapsedChange={onCollapsedChange}
      />,
    )

    const collapsedHome = screen.getByRole("link", { name: "Inicio" })
    expect(collapsedHome).toBeInTheDocument()
    fireEvent.pointerMove(collapsedHome, { pointerType: "mouse" })
    expect(await screen.findByRole("tooltip", { name: "Inicio" })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Expandir menú lateral" }))
    expect(onCollapsedChange).toHaveBeenCalledWith(false)
  })

  it("navega grupos con flechas, Home y End", async () => {
    renderSidebar(<NSidebar items={items} responsive="push" />)
    const group = screen.getByRole("button", { name: "Configuración" })
    group.focus()
    fireEvent.keyDown(group, { key: "ArrowRight" })
    expect(group).toHaveAttribute("aria-expanded", "true")

    fireEvent.keyDown(group, { key: "ArrowRight" })
    expect(screen.getByRole("button", { name: "Perfil" })).toHaveFocus()
    fireEvent.keyDown(screen.getByRole("button", { name: "Perfil" }), { key: "End" })
    expect(screen.getByRole("button", { name: "Deshabilitado" })).not.toHaveFocus()
    expect(screen.getByRole("button", { name: /Seguridad/ })).toHaveFocus()
    fireEvent.keyDown(screen.getByRole("button", { name: /Seguridad/ }), { key: "Home" })
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveFocus()

    fireEvent.keyDown(screen.getByRole("button", { name: "Perfil" }), { key: "ArrowLeft" })
    await waitFor(() => expect(group).toHaveFocus())
  })

  it("filtra el árbol conservando el grupo del resultado", () => {
    renderSidebar(<NSidebar items={items} responsive="push" searchable />)
    fireEvent.change(screen.getByRole("textbox", { name: "Buscar opciones de navegación" }), {
      target: { value: "perfil" },
    })

    expect(screen.getByRole("button", { name: "Configuración" })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("button", { name: "Perfil" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Inicio" })).not.toBeInTheDocument()
  })

  it("usa getItemId para identidad y estado activo estable", () => {
    const dynamicItems: NSidebarItem[] = [{ label: "Panel" }, { label: "Reportes" }]
    renderSidebar(
      <NSidebar
        items={dynamicItems}
        responsive="push"
        defaultActiveItemId="panel"
        getItemId={(item) => item.label.toLocaleLowerCase()}
      />,
    )

    expect(screen.getByRole("button", { name: "Panel" })).toHaveAttribute("aria-current", "true")
  })

  it("abre el Drawer responsive y lo cierra al seleccionar", async () => {
    renderSidebar(<NSidebar items={items} />)
    const trigger = screen.getByRole("button", { name: "Abrir menú de navegación" })
    fireEvent.click(trigger)
    const dialog = await screen.findByRole("dialog")
    const navigation = within(dialog).getByRole("navigation", { name: "Navegación principal" })
    fireEvent.click(within(navigation).getByRole("link", { name: "Inicio" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it("permite controlar el Drawer sin renderizar el disparador integrado", async () => {
    function ControlledSidebar() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <Button onClick={() => setOpen(true)}>Abrir navegación externa</Button>
          <NSidebar
            items={items}
            position="end"
            showMobileTrigger={false}
            mobileOpen={open}
            onMobileOpenChange={setOpen}
          />
        </>
      )
    }

    renderSidebar(<ControlledSidebar />)
    expect(screen.queryByRole("button", { name: "Abrir menú de navegación" })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Abrir navegación externa" }))
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Cerrar menú de navegación" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("oculta ítems y grupos sin la capacidad requerida", () => {
    const permissionedItems: NSidebarItem[] = [
      { id: "home", label: "Inicio", href: "#inicio" },
      {
        id: "billing",
        label: "Facturación",
        requiredPermission: "facturacion:*",
        children: [{ id: "invoices", label: "Facturas" }],
      },
    ]

    renderSidebar(
      <NPermissionsProvider permissions={["core:*"]}>
        <NSidebar items={permissionedItems} responsive="push" />
      </NPermissionsProvider>,
    )

    expect(screen.getByRole("link", { name: "Inicio" })).toBeInTheDocument()
    expect(screen.queryByText("Facturación")).not.toBeInTheDocument()
  })
})
