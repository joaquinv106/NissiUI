import { ChakraProvider, Text, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NAmountAllocator } from "./NAmountAllocator"

interface Method {
  id: string
  name: string
  locked?: boolean
}

const methods: Method[] = [
  { id: "operations", name: "Operación" },
  { id: "marketing", name: "Marketing" },
  { id: "reserve", name: "Reserva" },
]

function renderAllocator(props: Partial<React.ComponentProps<typeof NAmountAllocator<Method>>> = {}) {
  return render(
    <ChakraProvider value={defaultSystem}>
      <NAmountAllocator
        total={100}
        methods={methods}
        getMethodId={(method) => method.id}
        getMethodLabel={(method) => method.name}
        {...props}
      />
    </ChakraProvider>,
  )
}

describe("NAmountAllocator", () => {
  it("resume asignaciones iniciales y comunica el estado pendiente", () => {
    renderAllocator({ defaultAllocations: [{ method: methods[0], amount: 30 }] })

    expect(screen.getByText("30.00")).toBeInTheDocument()
    expect(screen.getByText("70.00")).toBeInTheDocument()
    expect(screen.getByText("Valor pendiente por distribuir")).toBeInTheDocument()
    expect(screen.getByRole("progressbar", { name: "Progreso de la distribución" })).toHaveAttribute("aria-valuenow", "30")
  })

  it("actualiza un método y publica asignaciones, resumen y causa", () => {
    const onAllocationsChange = vi.fn()
    renderAllocator({ onAllocationsChange })

    fireEvent.input(screen.getByRole("spinbutton", { name: "Valor asignado a Operación" }), { target: { value: "40" } })

    expect(onAllocationsChange).toHaveBeenLastCalledWith(
      [
        { method: methods[0], amount: 40 },
        { method: methods[1], amount: 0 },
        { method: methods[2], amount: 0 },
      ],
      { total: 100, allocated: 40, remaining: 60, status: "under" },
      { reason: "update", method: methods[0] },
    )
  })

  it("permite reemplazar y escribir importes monetarios desde el final del campo", () => {
    const onAllocationsChange = vi.fn()
    renderAllocator({
      locale: "es-MX",
      formatOptions: { style: "currency", currency: "MXN" },
      onAllocationsChange,
    })

    const input = screen.getByRole("spinbutton", { name: "Valor asignado a Operación" })
    expect(input).toHaveValue("$0.00")
    fireEvent.focus(input)
    expect(input).toHaveValue("0")
    fireEvent.input(input, { target: { value: "75" } })
    expect(input).toHaveValue("75")
    expect(onAllocationsChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([{ method: methods[0], amount: 75 }]),
      expect.objectContaining({ allocated: 75, remaining: 25 }),
      expect.objectContaining({ reason: "update" }),
    )
    fireEvent.blur(input)
    expect(input).toHaveValue("$75.00")
  })

  it("mantiene el estado controlado fuera del componente", () => {
    const onAllocationsChange = vi.fn()
    renderAllocator({ allocations: [{ method: methods[0], amount: 20 }], onAllocationsChange })

    fireEvent.input(screen.getByRole("spinbutton", { name: "Valor asignado a Operación" }), { target: { value: "60" } })

    expect(onAllocationsChange).toHaveBeenCalledWith(expect.any(Array), expect.objectContaining({ allocated: 60 }), expect.any(Object))
    expect(screen.getByText("80.00")).toBeInTheDocument()
  })

  it("asigna el restante a una opción", () => {
    const onAllocationsChange = vi.fn()
    renderAllocator({ defaultAllocations: [{ method: methods[0], amount: 35 }], onAllocationsChange })

    fireEvent.click(screen.getByRole("button", { name: "Asignar el restante a Marketing" }))

    expect(onAllocationsChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([{ method: methods[1], amount: 65 }]),
      { total: 100, allocated: 100, remaining: 0, status: "balanced" },
      { reason: "remaining", method: methods[1] },
    )
    expect(screen.getByText("Distribución completa")).toBeInTheDocument()
  })

  it("distribuye unidades mínimas sin perder el total por redondeo", () => {
    const onAllocationsChange = vi.fn()
    renderAllocator({ onAllocationsChange })

    fireEvent.click(screen.getByRole("button", { name: "Distribuir equitativamente" }))

    expect(onAllocationsChange).toHaveBeenLastCalledWith(
      [
        { method: methods[0], amount: 33.34 },
        { method: methods[1], amount: 33.33 },
        { method: methods[2], amount: 33.33 },
      ],
      { total: 100, allocated: 100, remaining: 0, status: "balanced" },
      { reason: "equal" },
    )
  })

  it("preserva opciones bloqueadas al distribuir y reiniciar", () => {
    const lockedMethods = [{ ...methods[0], locked: true }, methods[1], methods[2]]
    const onAllocationsChange = vi.fn()
    renderAllocator({
      methods: lockedMethods,
      defaultAllocations: [{ method: lockedMethods[0], amount: 20 }],
      isMethodDisabled: (method) => Boolean(method.locked),
      onAllocationsChange,
    })

    fireEvent.click(screen.getByRole("button", { name: "Distribuir equitativamente" }))
    expect(onAllocationsChange).toHaveBeenLastCalledWith(
      [
        { method: lockedMethods[0], amount: 20 },
        { method: lockedMethods[1], amount: 40 },
        { method: lockedMethods[2], amount: 40 },
      ],
      expect.objectContaining({ status: "balanced" }),
      { reason: "equal" },
    )

    fireEvent.click(screen.getByRole("button", { name: "Reiniciar distribución" }))
    expect(onAllocationsChange).toHaveBeenLastCalledWith(
      [
        { method: lockedMethods[0], amount: 20 },
        { method: lockedMethods[1], amount: 0 },
        { method: lockedMethods[2], amount: 0 },
      ],
      expect.objectContaining({ allocated: 20 }),
      { reason: "reset" },
    )
  })

  it("muestra validación por opción y permite sobreasignación explícita", () => {
    renderAllocator({
      allowOverAllocation: true,
      validateAllocation: (allocation) => allocation.amount > 80 ? "Supera el límite interno" : undefined,
    })

    fireEvent.input(screen.getByRole("spinbutton", { name: "Valor asignado a Operación" }), { target: { value: "120" } })

    expect(screen.getByText("La distribución supera el total")).toBeInTheDocument()
    expect(screen.getByText("Supera el límite interno")).toBeInTheDocument()
  })

  it("ofrece estados de sólo lectura, carga, error y vacío", () => {
    const view = renderAllocator({ readOnly: true, defaultAllocations: [{ method: methods[0], amount: 100 }] })
    expect(screen.queryByRole("button", { name: "Distribuir equitativamente" })).not.toBeInTheDocument()
    expect(screen.getByRole("spinbutton", { name: "Valor asignado a Operación" })).toHaveAttribute("readonly")

    view.rerender(
      <ChakraProvider value={defaultSystem}>
        <NAmountAllocator total={100} methods={methods} getMethodId={(method) => method.id} getMethodLabel={(method) => method.name} loading labels={{ loading: "Loading methods" }} />
      </ChakraProvider>,
    )
    expect(screen.getByRole("status")).toHaveTextContent("Loading methods")

    view.rerender(
      <ChakraProvider value={defaultSystem}>
        <NAmountAllocator total={100} methods={methods} getMethodId={(method) => method.id} getMethodLabel={(method) => method.name} error={<Text>Servicio no disponible</Text>} />
      </ChakraProvider>,
    )
    expect(screen.getByRole("alert")).toHaveTextContent("Servicio no disponible")

    view.rerender(
      <ChakraProvider value={defaultSystem}>
        <NAmountAllocator total={100} methods={[]} getMethodId={(method: Method) => method.id} getMethodLabel={(method) => method.name} emptyState={<Text role="status">Sin destinos</Text>} />
      </ChakraProvider>,
    )
    expect(within(screen.getByRole("status")).getByText("Sin destinos")).toBeInTheDocument()
  })

  it("ofrece un layout apilado para contenedores estrechos", () => {
    renderAllocator({ methodLayout: "stacked" })

    expect(screen.getByText("Operación")).toBeInTheDocument()
    expect(screen.getByRole("spinbutton", { name: "Valor asignado a Operación" })).toBeInTheDocument()
  })
})
