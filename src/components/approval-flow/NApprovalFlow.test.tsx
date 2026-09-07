import { ChakraProvider, Text, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { NApprovalFlow } from "./NApprovalFlow"
import type { NApprovalAction, NApprovalStatus } from "./types"

interface Request {
  id: string
  title: string
  description: string
}

const request: Request = { id: "req-1", title: "Acceso temporal", description: "Requiere revisión del responsable." }

function renderApproval(props: Partial<React.ComponentProps<typeof NApprovalFlow<Request>>> = {}) {
  return render(
    <ChakraProvider value={defaultSystem}>
      <NApprovalFlow
        request={request}
        getRequestId={(item) => item.id}
        getRequestTitle={(item) => item.title}
        getRequestDescription={(item) => item.description}
        {...props}
      />
    </ChakraProvider>,
  )
}

describe("NApprovalFlow", () => {
  it("presenta una solicitud adaptada y su estado", () => {
    renderApproval()

    expect(screen.getByRole("heading", { name: "Acceso temporal" })).toBeInTheDocument()
    expect(screen.getByText("Requiere revisión del responsable.")).toBeInTheDocument()
    expect(screen.getByText("Pendiente")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Aprobar" })).toBeEnabled()
  })

  it("publica una aprobación y actualiza el estado no controlado", async () => {
    const onDecision = vi.fn()
    const onStatusChange = vi.fn()
    renderApproval({ onDecision, onStatusChange })

    fireEvent.change(screen.getByRole("textbox", { name: "Comentario" }), { target: { value: "  Cumple requisitos  " } })
    fireEvent.click(screen.getByRole("button", { name: "Aprobar" }))

    await waitFor(() => expect(onDecision).toHaveBeenCalledWith(request, {
      requestId: "req-1",
      actionId: "approve",
      status: "approved",
      comment: "Cumple requisitos",
    }))
    expect(onStatusChange).toHaveBeenCalledWith("approved", expect.objectContaining({ requestId: "req-1" }))
    expect(screen.getByText("Aprobado")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Aprobar" })).toBeDisabled()
  })

  it("exige comentario para rechazar o solicitar cambios", async () => {
    const onDecision = vi.fn()
    renderApproval({ onDecision })

    fireEvent.click(screen.getByRole("button", { name: "Rechazar" }))
    expect(await screen.findByText("Escribe un comentario antes de continuar.")).toBeInTheDocument()
    expect(onDecision).not.toHaveBeenCalled()

    fireEvent.change(screen.getByRole("textbox", { name: "Comentario" }), { target: { value: "Falta evidencia" } })
    fireEvent.click(screen.getByRole("button", { name: "Solicitar cambios" }))
    await waitFor(() => expect(onDecision).toHaveBeenCalledWith(request, expect.objectContaining({
      actionId: "changes",
      status: "changes-requested",
      comment: "Falta evidencia",
    })))
  })

  it("mantiene el estado controlado como fuente de verdad visible", async () => {
    function ControlledApproval() {
      const [status, setStatus] = useState<NApprovalStatus>("pending")
      return (
        <NApprovalFlow
          request={request}
          getRequestId={(item) => item.id}
          getRequestTitle={(item) => item.title}
          status={status}
          onStatusChange={setStatus}
        />
      )
    }
    render(<ChakraProvider value={defaultSystem}><ControlledApproval /></ChakraProvider>)

    fireEvent.click(screen.getByRole("button", { name: "Aprobar" }))

    expect(await screen.findByText("Aprobado")).toBeInTheDocument()
  })

  it("reinicia el estado transitorio al cambiar la identidad de la solicitud", async () => {
    const secondRequest: Request = { id: "req-2", title: "Compra extraordinaria", description: "Nueva solicitud." }
    const view = renderApproval()

    fireEvent.change(screen.getByRole("textbox", { name: "Comentario" }), { target: { value: "No debe migrar" } })
    view.rerender(
      <ChakraProvider value={defaultSystem}>
        <NApprovalFlow request={secondRequest} getRequestId={(item) => item.id} getRequestTitle={(item) => item.title} />
      </ChakraProvider>,
    )

    await waitFor(() => expect(screen.getByRole("textbox", { name: "Comentario" })).toHaveValue(""))
    fireEvent.click(screen.getByRole("button", { name: "Aprobar" }))
    expect(await screen.findByText("Aprobado")).toBeInTheDocument()

    view.rerender(
      <ChakraProvider value={defaultSystem}>
        <NApprovalFlow request={request} getRequestId={(item) => item.id} getRequestTitle={(item) => item.title} />
      </ChakraProvider>,
    )
    await waitFor(() => expect(screen.getByText("Pendiente")).toBeInTheDocument())
  })

  it("ignora una respuesta asíncrona perteneciente a una solicitud anterior", async () => {
    let resolveDecision: (() => void) | undefined
    const onStatusChange = vi.fn()
    const onDecision = vi.fn(() => new Promise<void>((resolve) => { resolveDecision = resolve }))
    const nextRequest: Request = { id: "req-2", title: "Solicitud vigente", description: "Debe permanecer pendiente." }
    const view = renderApproval({ onDecision, onStatusChange })

    fireEvent.click(screen.getByRole("button", { name: "Aprobar" }))
    await waitFor(() => expect(onDecision).toHaveBeenCalledTimes(1))
    view.rerender(
      <ChakraProvider value={defaultSystem}>
        <NApprovalFlow
          request={nextRequest}
          getRequestId={(item) => item.id}
          getRequestTitle={(item) => item.title}
          onDecision={onDecision}
          onStatusChange={onStatusChange}
        />
      </ChakraProvider>,
    )

    await waitFor(() => expect(screen.getByRole("button", { name: "Aprobar" })).toBeEnabled())
    resolveDecision?.()
    await waitFor(() => expect(screen.getByText("Pendiente")).toBeInTheDocument())
    expect(onStatusChange).not.toHaveBeenCalled()
  })

  it("bloquea envíos duplicados y comunica fallos asíncronos", async () => {
    let resolveDecision: ((result: { success: boolean; message: string }) => void) | undefined
    const onDecision = vi.fn(() => new Promise<{ success: boolean; message: string }>((resolve) => { resolveDecision = resolve }))
    renderApproval({ onDecision })

    fireEvent.click(screen.getByRole("button", { name: "Aprobar" }))
    expect(screen.getByRole("button", { name: "Procesando decisión" })).toBeDisabled()
    fireEvent.click(screen.getByRole("button", { name: "Procesando decisión" }))
    expect(onDecision).toHaveBeenCalledTimes(1)

    resolveDecision?.({ success: false, message: "La solicitud cambió en el servidor." })
    expect(await screen.findByRole("alert")).toHaveTextContent("La solicitud cambió en el servidor.")
    expect(screen.getByText("Pendiente")).toBeInTheDocument()
  })

  it("admite decisiones personalizadas y restricciones externas", () => {
    const actions: NApprovalAction[] = [
      { id: "accept", label: "Aceptar solicitud", status: "approved", colorPalette: "green" },
      { id: "deny", label: "Denegar solicitud", status: "rejected", colorPalette: "red" },
    ]
    renderApproval({ actions, canPerformAction: (_item, action) => action.id !== "deny" })

    expect(screen.getByRole("button", { name: "Aceptar solicitud" })).toBeEnabled()
    expect(screen.getByRole("button", { name: "Denegar solicitud" })).toBeDisabled()
    expect(screen.queryByRole("button", { name: "Aprobar" })).not.toBeInTheDocument()
  })

  it("presenta un historial semántico con formato sustituible", () => {
    renderApproval({
      history: [
        { id: "event-1", status: "changes-requested", actor: "María", comment: "Adjunta el documento", timestamp: "2026-09-06T12:00:00Z" },
      ],
      formatTimestamp: () => "Hace una hora",
    })

    const history = screen.getByRole("list", { name: "Historial" })
    expect(within(history).getByText("María")).toBeInTheDocument()
    expect(within(history).getByText("Cambios solicitados")).toBeInTheDocument()
    expect(within(history).getByText("Adjunta el documento")).toBeInTheDocument()
    expect(within(history).getByText("Hace una hora")).toBeInTheDocument()
  })

  it("ofrece estados de sólo lectura, carga, error y vacío", () => {
    const view = renderApproval({ readOnly: true })
    expect(screen.queryByRole("button", { name: "Aprobar" })).not.toBeInTheDocument()
    expect(screen.getByText("Todavía no hay decisiones registradas.")).toBeInTheDocument()

    view.rerender(
      <ChakraProvider value={defaultSystem}>
        <NApprovalFlow<Request> request={request} getRequestId={(item) => item.id} getRequestTitle={(item) => item.title} loading labels={{ loading: "Loading request" }} />
      </ChakraProvider>,
    )
    expect(screen.getByRole("status")).toHaveTextContent("Loading request")

    view.rerender(
      <ChakraProvider value={defaultSystem}>
        <NApprovalFlow<Request> request={request} getRequestId={(item) => item.id} getRequestTitle={(item) => item.title} error={<Text>Servicio no disponible</Text>} />
      </ChakraProvider>,
    )
    expect(screen.getByRole("alert")).toHaveTextContent("Servicio no disponible")

    view.rerender(
      <ChakraProvider value={defaultSystem}>
        <NApprovalFlow<Request> request={null} getRequestId={(item) => item.id} getRequestTitle={(item) => item.title} />
      </ChakraProvider>,
    )
    expect(screen.getByRole("status")).toHaveTextContent("No hay una solicitud seleccionada")
  })
})
