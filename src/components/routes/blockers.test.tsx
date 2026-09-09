import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useState } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { NLink, NRouteOutlet, Nroutes, useNBlocker, useNroutes } from "./index"

const routes = [
  { id: "one", path: "/one", title: "Uno", element: <span>Vista uno</span> },
  { id: "two", path: "/two", title: "Dos", element: <span>Vista dos</span> },
  { id: "three", path: "/three", title: "Tres", element: <span>Vista tres</span> },
] as const

function BlockerHarness() {
  const [dirty, setDirty] = useState(false)
  const blocker = useNBlocker(dirty)
  const router = useNroutes()
  return <>
    <button onClick={() => setDirty((value) => !value)}>{dirty ? "Limpiar" : "Ensuciar"}</button>
    <NLink to="/two">Enlace dos</NLink>
    <button onClick={() => router.navigate("/two")}>Navegar dos</button>
    <button onClick={() => router.replace("/three")}>Reemplazar tres</button>
    <button onClick={router.back}>Atrás</button>
    <button onClick={router.forward}>Adelante</button>
    <output aria-label="location">{router.location.pathname}</output>
    <output aria-label="blocker">{blocker.state}</output>
    {blocker.state === "blocked" ? <>
      <output aria-label="from">{blocker.from?.pathname}</output>
      <output aria-label="to">{blocker.to?.pathname}</output>
      <output aria-label="action">{blocker.action}</output>
      <button onClick={blocker.proceed}>Continuar</button>
      <button onClick={blocker.reset}>Permanecer</button>
    </> : null}
    <NRouteOutlet />
  </>
}

function renderMemory() {
  return render(
    <ChakraProvider value={defaultSystem}>
      <Nroutes routes={routes} strategy="memory" defaultPath="/one">
        <BlockerHarness />
      </Nroutes>
    </ChakraProvider>,
  )
}

afterEach(() => {
  window.history.replaceState(null, "", "/")
})

describe("navigation blockers", () => {
  it("intercepta NLink, navigate y replace con proceed/reset y locations exactas", () => {
    renderMemory()
    fireEvent.click(screen.getByRole("button", { name: "Ensuciar" }))

    fireEvent.click(screen.getByRole("link", { name: "Enlace dos" }))
    expect(screen.getByLabelText("location")).toHaveTextContent("/one")
    expect(screen.getByLabelText("blocker")).toHaveTextContent("blocked")
    expect(screen.getByLabelText("from")).toHaveTextContent("/one")
    expect(screen.getByLabelText("to")).toHaveTextContent("/two")
    expect(screen.getByLabelText("action")).toHaveTextContent("push")

    fireEvent.click(screen.getByRole("button", { name: "Permanecer" }))
    expect(screen.getByLabelText("blocker")).toHaveTextContent("idle")
    expect(screen.getByLabelText("location")).toHaveTextContent("/one")

    fireEvent.click(screen.getByRole("button", { name: "Navegar dos" }))
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }))
    expect(screen.getByLabelText("location")).toHaveTextContent("/two")

    fireEvent.click(screen.getByRole("button", { name: "Reemplazar tres" }))
    expect(screen.getByLabelText("action")).toHaveTextContent("replace")
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }))
    expect(screen.getByLabelText("location")).toHaveTextContent("/three")
  })

  it("bloquea back y forward en memoria sin perder el historial pendiente", () => {
    renderMemory()
    fireEvent.click(screen.getByRole("button", { name: "Navegar dos" }))
    fireEvent.click(screen.getByRole("button", { name: "Ensuciar" }))

    fireEvent.click(screen.getByRole("button", { name: "Atrás" }))
    expect(screen.getByLabelText("to")).toHaveTextContent("/one")
    expect(screen.getByLabelText("action")).toHaveTextContent("traverse")
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }))
    expect(screen.getByLabelText("location")).toHaveTextContent("/one")

    fireEvent.click(screen.getByRole("button", { name: "Adelante" }))
    expect(screen.getByLabelText("to")).toHaveTextContent("/two")
    fireEvent.click(screen.getByRole("button", { name: "Permanecer" }))
    expect(screen.getByLabelText("location")).toHaveTextContent("/one")
  })

  it("permite navegar inmediatamente cuando la condición deja de cumplirse", () => {
    renderMemory()
    fireEvent.click(screen.getByRole("button", { name: "Ensuciar" }))
    fireEvent.click(screen.getByRole("button", { name: "Limpiar" }))
    fireEvent.click(screen.getByRole("button", { name: "Navegar dos" }))
    expect(screen.getByLabelText("location")).toHaveTextContent("/two")
    expect(screen.getByLabelText("blocker")).toHaveTextContent("idle")
  })

  it("activa beforeunload sólo mientras existe trabajo sin guardar", () => {
    renderMemory()
    const cleanEvent = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(cleanEvent)
    expect(cleanEvent.defaultPrevented).toBe(false)

    fireEvent.click(screen.getByRole("button", { name: "Ensuciar" }))
    const dirtyEvent = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(dirtyEvent)
    expect(dirtyEvent.defaultPrevented).toBe(true)
  })

  it("bloquea las operaciones delegadas a un router externo", () => {
    const navigate = vi.fn()
    const back = vi.fn()
    const forward = vi.fn()
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes routes={routes} router={{ location: "/one", navigate, back, forward }}>
          <BlockerHarness />
        </Nroutes>
      </ChakraProvider>,
    )
    fireEvent.click(screen.getByRole("button", { name: "Ensuciar" }))

    fireEvent.click(screen.getByRole("link", { name: "Enlace dos" }))
    expect(navigate).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }))
    expect(navigate).toHaveBeenLastCalledWith("/two", {})

    fireEvent.click(screen.getByRole("button", { name: "Reemplazar tres" }))
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }))
    expect(navigate).toHaveBeenLastCalledWith("/three", { replace: true })

    fireEvent.click(screen.getByRole("button", { name: "Atrás" }))
    expect(back).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }))
    expect(back).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole("button", { name: "Adelante" }))
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }))
    expect(forward).toHaveBeenCalledOnce()
  })

  it("intercepta popstate y restaura la URL visible hasta decidir", async () => {
    window.history.replaceState(null, "", "/one")
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes routes={routes} strategy="history"><BlockerHarness /></Nroutes>
      </ChakraProvider>,
    )
    fireEvent.click(screen.getByRole("button", { name: "Navegar dos" }))
    expect(window.location.pathname).toBe("/two")
    fireEvent.click(screen.getByRole("button", { name: "Ensuciar" }))

    act(() => {
      window.history.replaceState(null, "", "/one")
      window.dispatchEvent(new PopStateEvent("popstate"))
    })
    await waitFor(() => expect(screen.getByLabelText("blocker")).toHaveTextContent("blocked"))
    expect(screen.getByLabelText("to")).toHaveTextContent("/one")
    expect(screen.getByLabelText("location")).toHaveTextContent("/two")
    expect(window.location.pathname).toBe("/two")
  })
})
