import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { NCtrl } from "./NCtrl"
import { NCtrlProvider, useNCtrlShortcut } from "./NCtrlContext"
import { formatNCtrlChord, normalizeNCtrlChord } from "./utils"

function renderCtrl(node: React.ReactNode) {
  return render(<ChakraProvider value={defaultSystem}>{node}</ChakraProvider>)
}

describe("NCtrl", () => {
  it("abre y cierra el panel contextual con F11", async () => {
    renderCtrl(<NCtrl viewId="sale" viewLabel="Cobro" shortcuts={[{ id: "pay", keys: "F4", label: "Cobrar" }]} />)
    fireEvent.keyDown(window, { key: "F11" })
    expect(await screen.findByRole("dialog", { name: /Atajos de teclado · Cobro/ })).toBeInTheDocument()
    expect(screen.getByText("Cobrar")).toBeInTheDocument()
    fireEvent.keyDown(window, { key: "F11" })
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("ejecuta atajos con modificadores y evita campos editables por defecto", async () => {
    const save = vi.fn()
    renderCtrl(<><input aria-label="Nombre" /><NCtrl shortcuts={[{ id: "save", keys: "Ctrl+S", label: "Guardar", handler: save }]} /></>)
    fireEvent.keyDown(window, { key: "s", ctrlKey: true })
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1))
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Nombre" }), { key: "s", ctrlKey: true })
    expect(save).toHaveBeenCalledTimes(1)
  })

  it("permite teclas de función dentro de inputs cuando se configura", async () => {
    const charge = vi.fn()
    renderCtrl(<><input aria-label="Importe" /><NCtrl shortcuts={[{ id: "cash", keys: "F6", label: "Cobrar en efectivo", allowInEditable: true, handler: charge }]} /></>)
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Importe" }), { key: "F6" })
    await waitFor(() => expect(charge).toHaveBeenCalled())
  })

  it("registra atajos desde componentes descendientes y actualiza su estado", async () => {
    const action = vi.fn()
    function RegisteredAction() {
      const [disabled, setDisabled] = useState(false)
      useNCtrlShortcut({ id: "registered", keys: "Alt+N", label: "Nueva venta", disabled, handler: action })
      return <button onClick={() => setDisabled(true)}>Deshabilitar</button>
    }
    renderCtrl(<NCtrlProvider><RegisteredAction /><NCtrl /></NCtrlProvider>)
    fireEvent.keyDown(window, { key: "F11" })
    expect(await screen.findByText("Nueva venta")).toBeInTheDocument()
    fireEvent.keyDown(window, { key: "F11" })
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    fireEvent.click(screen.getByRole("button", { name: "Deshabilitar" }))
    fireEvent.keyDown(window, { key: "F11" })
    await waitFor(() => expect(screen.getByRole("button", { name: /Nueva venta/ })).toBeDisabled())
  })

  it("resuelve conflictos por prioridad y los comunica", async () => {
    const primary = vi.fn()
    const secondary = vi.fn()
    const onShortcutConflict = vi.fn()
    renderCtrl(<NCtrl onShortcutConflict={onShortcutConflict} shortcuts={[
      { id: "secondary", keys: "F2", label: "Secundario", priority: 1, handler: secondary },
      { id: "primary", keys: "F2", label: "Principal", priority: 10, handler: primary },
    ]} />)
    fireEvent.keyDown(window, { key: "F2" })
    await waitFor(() => expect(primary).toHaveBeenCalled())
    expect(secondary).not.toHaveBeenCalled()
    expect(onShortcutConflict).toHaveBeenCalledWith("F2", expect.arrayContaining([expect.objectContaining({ id: "primary" }), expect.objectContaining({ id: "secondary" })]))
  })

  it("normaliza Mod según plataforma y presenta combinaciones legibles", () => {
    expect(normalizeNCtrlChord("Mod+Shift+K", "MacIntel")).toBe("shift+meta+k")
    expect(normalizeNCtrlChord("Mod+Shift+K", "Win32")).toBe("ctrl+shift+k")
    expect(formatNCtrlChord("Alt+ArrowDown")).toBe("Alt + ↓")
  })
})
