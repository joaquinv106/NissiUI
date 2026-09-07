import { ChakraProvider, Text, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NOfflineBoundary } from "./NOfflineBoundary"

function renderBoundary(props: Partial<React.ComponentProps<typeof NOfflineBoundary>> = {}) {
  return render(<ChakraProvider value={defaultSystem}><NOfflineBoundary online={false} {...props}><Text>Contenido principal</Text></NOfflineBoundary></ChakraProvider>)
}

describe("NOfflineBoundary", () => {
  it("mantiene el contenido y comunica la cola en modo banner", () => {
    renderBoundary({ queuedCount: 2 })
    expect(screen.getByText("Contenido principal")).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Trabajando sin conexión")
    expect(screen.getByText("2 cambios en cola")).toBeInTheDocument()
  })

  it("sustituye el contenido solo cuando se solicita fallback", () => {
    const view = renderBoundary({ behavior: "fallback", fallback: <Text>Vista disponible sin red</Text> })
    expect(screen.queryByText("Contenido principal")).not.toBeInTheDocument()
    expect(screen.getByText("Vista disponible sin red")).toBeInTheDocument()
    view.rerender(<ChakraProvider value={defaultSystem}><NOfflineBoundary online behavior="fallback" fallback={<Text>Vista disponible sin red</Text>}><Text>Contenido principal</Text></NOfflineBoundary></ChakraProvider>)
    expect(screen.getByText("Contenido principal")).toBeInTheDocument()
  })

  it("usa el resultado real de la comprobación y no cambia un estado controlado", async () => {
    const onOnlineChange = vi.fn()
    const onCheckConnectivity = vi.fn(async () => ({ online: false, message: "API inaccesible" }))
    renderBoundary({ onCheckConnectivity, onOnlineChange })
    fireEvent.click(screen.getByRole("button", { name: "Comprobar conexión" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("API inaccesible")
    expect(onOnlineChange).toHaveBeenCalledWith(false)
    expect(screen.getByText("Trabajando sin conexión")).toBeInTheDocument()
  })

  it("actualiza el modo no controlado mediante eventos del navegador", async () => {
    const onOnlineChange = vi.fn()
    render(<ChakraProvider value={defaultSystem}><NOfflineBoundary defaultOnline detectBrowserEvents onOnlineChange={onOnlineChange}><Text>Aplicación</Text></NOfflineBoundary></ChakraProvider>)
    fireEvent(window, new Event("offline"))
    expect(await screen.findByText("Trabajando sin conexión")).toBeInTheDocument()
    expect(onOnlineChange).toHaveBeenLastCalledWith(false)
    fireEvent(window, new Event("online"))
    await waitFor(() => expect(screen.queryByText("Trabajando sin conexión")).not.toBeInTheDocument())
  })

  it("puede anunciar recuperación y traducir sus textos", () => {
    renderBoundary({ online: true, showOnlineStatus: true, labels: { onlineRestored: "Back online" } })
    expect(screen.getByRole("status")).toHaveTextContent("Back online")
  })
})
