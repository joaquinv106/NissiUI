import { Button, ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NAsyncState, NBreadcrumbs, NConfirmDialog, NEmptyState, NPageHeader } from "./index"

const renderUI = (node: React.ReactNode) => render(<ChakraProvider value={defaultSystem}>{node}</ChakraProvider>)

describe("patrones de página", () => {
  it("compone encabezado, ruta y acciones responsive", () => {
    renderUI(<NPageHeader title="Usuarios" subtitle="Administra el equipo" breadcrumbs={<NBreadcrumbs items={[{ id: "home", label: "Inicio", href: "/" }, { id: "users", label: "Usuarios", current: true }]} />} actions={<Button>Crear usuario</Button>} />)
    expect(screen.getByRole("heading", { name: "Usuarios", level: 1 })).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "Ruta de navegación" })).toHaveTextContent("Inicio")
    expect(screen.getByRole("button", { name: "Crear usuario" })).toBeInTheDocument()
  })

  it("colapsa niveles intermedios de breadcrumbs", async () => {
    renderUI(<NBreadcrumbs maxItems={3} items={[{ id: "a", label: "A", href: "/a" }, { id: "b", label: "B", href: "/b" }, { id: "c", label: "C", href: "/c" }, { id: "d", label: "D", current: true }]} />)
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Más niveles" })) })
    expect(await screen.findByRole("menu")).toHaveTextContent("B")
  })

  it("presenta vacío accionable", () => {
    renderUI(<NEmptyState title="Sin proyectos" primaryAction={<Button>Crear proyecto</Button>} />)
    expect(screen.getByRole("status")).toHaveTextContent("Sin proyectos")
    expect(screen.getByRole("button", { name: "Crear proyecto" })).toBeInTheDocument()
  })

  it("cambia entre carga, error, reintento y éxito", async () => {
    const retry = vi.fn()
    const view = renderUI(<NAsyncState status="loading" />)
    expect(screen.getByRole("status", { name: "Cargando información" })).toBeInTheDocument()
    view.rerender(<ChakraProvider value={defaultSystem}><NAsyncState status="error" error="Servicio no disponible" onRetry={retry} /></ChakraProvider>)
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }))
    await waitFor(() => expect(retry).toHaveBeenCalledOnce())
    view.rerender(<ChakraProvider value={defaultSystem}><NAsyncState status="success"><p>Contenido listo</p></NAsyncState></ChakraProvider>)
    expect(screen.getByText("Contenido listo")).toBeInTheDocument()
  })

  it("confirma de forma asíncrona, bloquea duplicados y se cierra", async () => {
    let resolveAction: ((result: boolean) => void) | undefined
    const confirm = vi.fn(() => new Promise<boolean>((resolve) => { resolveAction = resolve }))
    renderUI(<NConfirmDialog trigger={<Button>Eliminar</Button>} destructive onConfirm={confirm}>La eliminación no se puede deshacer.</NConfirmDialog>)
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }))
    const dialog = await screen.findByRole("alertdialog")
    const confirmButton = within(dialog).getByRole("button", { name: "Confirmar" })
    fireEvent.click(confirmButton)
    fireEvent.click(within(dialog).getByRole("button", { name: "Confirmando" }))
    expect(confirm).toHaveBeenCalledOnce()
    resolveAction?.(true)
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
  })

  it("mantiene el diálogo abierto y comunica un fallo confirmado", async () => {
    renderUI(<NConfirmDialog trigger={<Button>Publicar</Button>} onConfirm={() => ({ success: false, message: "Falta autorización" })} />)
    fireEvent.click(screen.getByRole("button", { name: "Publicar" }))
    const dialog = await screen.findByRole("dialog")
    fireEvent.click(within(dialog).getByRole("button", { name: "Confirmar" }))
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Falta autorización")
  })
})
