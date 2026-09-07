import { ChakraProvider, Text, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NSyncStatus } from "./NSyncStatus"

function renderStatus(props: Partial<React.ComponentProps<typeof NSyncStatus>> = {}) {
  return render(<ChakraProvider value={defaultSystem}><NSyncStatus status="synced" {...props} /></ChakraProvider>)
}

describe("NSyncStatus", () => {
  it("presenta el estado, pendientes y fecha semántica", () => {
    renderStatus({ status: "pending", pendingCount: 3, lastSyncedAt: "2026-09-06T10:00:00.000Z", formatTimestamp: () => "6 sep, 04:00", message: "Se enviarán al recuperar conexión" })
    expect(screen.getByRole("status")).toHaveTextContent("Cambios pendientes")
    expect(screen.getByText("3 cambios pendientes")).toBeInTheDocument()
    expect(screen.getByText("6 sep, 04:00").closest("time")).toHaveAttribute("datetime", "2026-09-06T10:00:00.000Z")
  })

  it("expone detalles progresivamente y una variante compacta", () => {
    const view = renderStatus({ status: "error", details: <Text>POST /sync: 503</Text>, showDetails: true })
    expect(screen.getByText("POST /sync: 503")).toBeVisible()
    view.rerender(<ChakraProvider value={defaultSystem}><NSyncStatus status="offline" variant="compact" pendingCount={1} /></ChakraProvider>)
    expect(screen.getByRole("status")).toHaveTextContent("Sin conexión1 cambio pendiente")
  })

  it("bloquea reintentos concurrentes y comunica fallos confirmados", async () => {
    let resolveRetry: ((value: { success: boolean; message: string }) => void) | undefined
    const onRetry = vi.fn(() => new Promise<{ success: boolean; message: string }>((resolve) => { resolveRetry = resolve }))
    renderStatus({ status: "error", onRetry })
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }))
    const loadingButton = screen.getByRole("button", { name: "Reintentando" })
    fireEvent.click(loadingButton)
    expect(onRetry).toHaveBeenCalledTimes(1)
    resolveRetry?.({ success: false, message: "Servidor no disponible" })
    expect(await screen.findByRole("alert")).toHaveTextContent("Servidor no disponible")
  })

  it("descarta la respuesta de una sincronización anterior", async () => {
    let resolveRetry: ((value: { success: boolean; message: string }) => void) | undefined
    const onRetry = () => new Promise<{ success: boolean; message: string }>((resolve) => { resolveRetry = resolve })
    const view = renderStatus({ status: "error", syncKey: "tenant-a", onRetry })
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }))
    view.rerender(<ChakraProvider value={defaultSystem}><NSyncStatus status="synced" syncKey="tenant-b" onRetry={onRetry} /></ChakraProvider>)
    await waitFor(() => expect(screen.getByText("Sincronizado")).toBeInTheDocument())
    resolveRetry?.({ success: false, message: "Respuesta antigua" })
    await waitFor(() => expect(screen.queryByText("Respuesta antigua")).not.toBeInTheDocument())
  })

  it("presenta errores del motor y etiquetas sustituibles", () => {
    renderStatus({ status: "error", error: <Text>Conflicto de versión</Text>, labels: { error: "Sync failed" } })
    expect(screen.getByText("Sync failed")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("Conflicto de versión")
  })
})
