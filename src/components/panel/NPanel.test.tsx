import { Button, ChakraProvider, Text, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { useRef, useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { NAppShell } from "../app-shell"
import { NPanel } from "./NPanel"

function renderPanel(node: React.ReactNode) {
  return render(<ChakraProvider value={defaultSystem}>{node}</ChakraProvider>)
}

describe("NPanel", () => {
  it("responde a una señal controlada y permite cerrar la superficie", async () => {
    const changes = vi.fn()

    function ControlledPanel() {
      const [open, setOpen] = useState(false)
      const triggerRef = useRef<HTMLButtonElement>(null)
      return (
        <>
          <Button ref={triggerRef} onClick={() => setOpen(true)}>Abrir pago</Button>
          <NPanel
            open={open}
            onOpenChange={(next) => { changes(next); setOpen(next) }}
            returnFocusRef={triggerRef}
            title="Finalizar pago"
            description="Revisa la distribución antes de confirmar."
          >
            <Text>Contenido del checkout</Text>
          </NPanel>
        </>
      )
    }

    renderPanel(<ControlledPanel />)
    const trigger = screen.getByRole("button", { name: "Abrir pago" })
    fireEvent.click(trigger)

    const dialog = await screen.findByRole("dialog", { name: "Finalizar pago" })
    expect(within(dialog).getByText("Contenido del checkout")).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole("button", { name: "Cerrar panel lateral" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(changes).toHaveBeenCalledWith(false)
    expect(trigger).toHaveFocus()
  })

  it("cambia dinámicamente de componente sin cerrar el panel", async () => {
    function DynamicPanel() {
      const [view, setView] = useState<"checkout" | "receipt">("checkout")
      return (
        <NPanel
          open
          title={view === "checkout" ? "Cobro" : "Recibo"}
          contentKey={view}
          headerActions={<Button size="xs" onClick={() => setView(view === "checkout" ? "receipt" : "checkout")}>Cambiar contenido</Button>}
        >
          {view === "checkout" ? <Text>Componente NCheckout</Text> : <Text>Componente NReceipt</Text>}
        </NPanel>
      )
    }

    renderPanel(<DynamicPanel />)
    const dialog = await screen.findByRole("dialog", { name: "Cobro" })
    fireEvent.click(within(dialog).getByRole("button", { name: "Cambiar contenido" }))

    expect(await screen.findByRole("dialog", { name: "Recibo" })).toBe(dialog)
    expect(within(dialog).getByText("Componente NReceipt")).toBeInTheDocument()
    expect(within(dialog).queryByText("Componente NCheckout")).not.toBeInTheDocument()
  })

  it("se coloca automáticamente al lado opuesto del sidebar de NAppShell", async () => {
    renderPanel(
      <NAppShell sidebarPosition="end">
        <NPanel open title="Detalle"><Text>Información</Text></NPanel>
      </NAppShell>,
    )

    const dialog = await screen.findByRole("dialog", { name: "Detalle" })
    expect(dialog).toHaveAttribute("data-placement", "start")
    expect(dialog).toHaveAttribute("data-n-panel")
  })

  it("admite disparador no controlado, título accesible y etiquetas traducibles", async () => {
    renderPanel(
      <NPanel
        trigger={<Button>Abrir detalle</Button>}
        labels={{ defaultTitle: "Quick detail", closePanel: "Close detail" }}
      >
        <Text>Detalle sin encabezado visible</Text>
      </NPanel>,
    )

    fireEvent.click(screen.getByRole("button", { name: "Abrir detalle" }))
    const dialog = await screen.findByRole("dialog", { name: "Quick detail" })
    expect(within(dialog).getByRole("button", { name: "Close detail" })).toBeInTheDocument()
  })

  it("permite bloquear cierre exterior y conserva cierre por Escape configurable", async () => {
    const onOpenChange = vi.fn()
    renderPanel(
      <NPanel open title="Proceso crítico" closeOnInteractOutside={false} closeOnEscape={false} onOpenChange={onOpenChange}>
        <Text>Operación protegida</Text>
      </NPanel>,
    )

    await screen.findByRole("dialog", { name: "Proceso crítico" })
    fireEvent.keyDown(document, { key: "Escape" })
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog", { name: "Proceso crítico" })).toBeInTheDocument()
  })
})
