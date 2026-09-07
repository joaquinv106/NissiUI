import { ChakraProvider, Input, Text, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { NStepFlow } from "./NStepFlow"
import type { NStepFlowStep } from "./types"

interface WizardState {
  name: string
  confirmed: boolean
}

const steps: NStepFlowStep<WizardState>[] = [
  {
    id: "details",
    title: "Datos",
    description: "Información principal",
    validate: (state) => state.name ? undefined : "Escribe un nombre.",
    render: ({ state, setState }) => (
      <Input aria-label="Nombre" value={state.name} onChange={(event) => setState((current) => ({ ...current, name: event.target.value }))} />
    ),
  },
  {
    id: "review",
    title: "Revisión",
    render: ({ state }) => <Text>Revisar {state.name}</Text>,
  },
]

function renderFlow(props: Partial<React.ComponentProps<typeof NStepFlow<WizardState>>> = {}) {
  return render(
    <ChakraProvider value={defaultSystem}>
      <NStepFlow steps={steps} defaultState={{ name: "", confirmed: false }} {...props} />
    </ChakraProvider>,
  )
}

describe("NStepFlow", () => {
  it("actualiza el borrador y avanza mostrando el nuevo contenido", async () => {
    const onStateChange = vi.fn()
    const onStepChange = vi.fn()
    renderFlow({ onStateChange, onStepChange })

    fireEvent.change(screen.getByRole("textbox", { name: "Nombre" }), { target: { value: "Proyecto Norte" } })
    expect(onStateChange).toHaveBeenLastCalledWith(
      { name: "Proyecto Norte", confirmed: false },
      { reason: "step", stepId: "details" },
    )

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }))

    expect(await screen.findByText("Revisar Proyecto Norte")).toBeInTheDocument()
    expect(onStepChange).toHaveBeenLastCalledWith("review", expect.objectContaining({ reason: "next", previousStepId: "details" }))
  })

  it("bloquea el avance y anuncia el resultado de validación", async () => {
    renderFlow()

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Escribe un nombre.")
    expect(screen.getByRole("textbox", { name: "Nombre" })).toBeInTheDocument()
  })

  it("mantiene reactivos el estado y el paso controlados", async () => {
    function ControlledExample() {
      const [draft, setDraft] = useState<WizardState>({ name: "Inicial", confirmed: false })
      const [activeStep, setActiveStep] = useState("details")
      return (
        <>
          <NStepFlow
            steps={steps}
            state={draft}
            defaultState={draft}
            onStateChange={setDraft}
            stepId={activeStep}
            onStepChange={setActiveStep}
          />
          <output aria-label="Paso activo">{activeStep}:{draft.name}</output>
        </>
      )
    }
    render(<ChakraProvider value={defaultSystem}><ControlledExample /></ChakraProvider>)

    fireEvent.change(screen.getByRole("textbox", { name: "Nombre" }), { target: { value: "Actualizado" } })
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }))

    await waitFor(() => expect(screen.getByRole("status", { name: "Paso activo" })).toHaveTextContent("review:Actualizado"))
    expect(screen.getByText("Revisar Actualizado")).toBeInTheDocument()
  })

  it("permite volver y seleccionar pasos anteriores en un flujo lineal", async () => {
    renderFlow({ defaultState: { name: "Ana", confirmed: false }, defaultStepId: "review" })

    fireEvent.click(screen.getByRole("button", { name: "Anterior" }))
    expect(await screen.findByRole("textbox", { name: "Nombre" })).toHaveValue("Ana")

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }))
    await screen.findByText("Revisar Ana")
    fireEvent.click(screen.getByRole("tab", { name: /Datos, paso 1 de 2/ }))
    expect(await screen.findByRole("textbox", { name: "Nombre" })).toBeInTheDocument()
  })

  it("valida y finaliza de forma asíncrona sin duplicar acciones", async () => {
    let resolveComplete: ((value: boolean) => void) | undefined
    const onComplete = vi.fn(() => new Promise<boolean>((resolve) => { resolveComplete = resolve }))
    renderFlow({ defaultState: { name: "Ana", confirmed: false }, defaultStepId: "review", onComplete })

    fireEvent.click(screen.getByRole("button", { name: "Finalizar" }))
    expect(screen.getByRole("button", { name: "Procesando" })).toBeDisabled()
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1))

    resolveComplete?.(true)
    await waitFor(() => expect(screen.getByRole("button", { name: "Finalizar" })).toBeEnabled())
  })

  it("trata el último paso habilitado como final aunque existan pasos deshabilitados después", async () => {
    const onComplete = vi.fn()
    const stepsWithDisabledTail: NStepFlowStep<WizardState>[] = [
      { id: "review", title: "Revisión", render: () => <Text>Contenido final</Text> },
      { id: "archive", title: "Archivo", disabled: true, render: () => <Text>No disponible</Text> },
    ]
    renderFlow({ steps: stepsWithDisabledTail, defaultStepId: "review", onComplete })

    fireEvent.click(screen.getByRole("button", { name: "Finalizar" }))

    await waitFor(() => expect(onComplete).toHaveBeenCalledWith({ name: "", confirmed: false }))
    expect(screen.queryByText("No disponible")).not.toBeInTheDocument()
  })

  it("admite acciones reemplazables con el mismo contexto tipado", async () => {
    renderFlow({
      defaultState: { name: "Ana", confirmed: false },
      renderActions: ({ stepId, goNext }) => <button type="button" onClick={() => void goNext()}>Acción {stepId}</button>,
    })

    fireEvent.click(screen.getByRole("button", { name: "Acción details" }))
    expect(await screen.findByText("Revisar Ana")).toBeInTheDocument()
  })

  it("ofrece estados de carga, error y vacío traducibles", () => {
    const view = renderFlow({ loading: true, labels: { loading: "Loading flow" } })
    expect(screen.getByRole("status")).toHaveTextContent("Loading flow")

    view.rerender(
      <ChakraProvider value={defaultSystem}>
        <NStepFlow steps={steps} defaultState={{ name: "", confirmed: false }} error={<Text>Servicio no disponible</Text>} />
      </ChakraProvider>,
    )
    expect(screen.getByRole("alert")).toHaveTextContent("Servicio no disponible")

    view.rerender(
      <ChakraProvider value={defaultSystem}>
        <NStepFlow steps={[]} defaultState={{ name: "", confirmed: false }} />
      </ChakraProvider>,
    )
    expect(screen.getByRole("status")).toHaveTextContent("No hay pasos configurados")
  })
})
