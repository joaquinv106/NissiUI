import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { NAmountInput } from "./NAmountInput"

function renderAmountInput(props: Partial<React.ComponentProps<typeof NAmountInput>> = {}) {
  return render(
    <ChakraProvider value={defaultSystem}>
      <NAmountInput label="Horas asignadas" {...props} />
    </ChakraProvider>,
  )
}

describe("NAmountInput", () => {
  it("actualiza visualmente un ejemplo controlado al usar los triggers", async () => {
    function ControlledExample() {
      const [value, setValue] = useState<number | null>(8)
      return (
        <>
          <NAmountInput label="Horas asignadas" value={value} onValueChange={(nextValue) => setValue(nextValue)} step={0.5} showControls />
          <output aria-label="Valor actual">{value}</output>
        </>
      )
    }
    render(<ChakraProvider value={defaultSystem}><ControlledExample /></ChakraProvider>)

    const increment = screen.getByRole("button", { name: "Incrementar valor" })
    fireEvent.click(increment)
    await waitFor(() => expect(screen.getByRole("status", { name: "Valor actual" })).toHaveTextContent("8.5"))

    fireEvent.click(screen.getByRole("button", { name: "Disminuir valor" }))
    await waitFor(() => expect(screen.getByRole("status", { name: "Valor actual" })).toHaveTextContent("8"))
  })

  it("mantiene visible y reactivo un valor monetario controlado", async () => {
    function ControlledCurrency() {
      const [value, setValue] = useState<number | null>(2500)
      return (
        <NAmountInput
          label="Importe"
          value={value}
          onValueChange={setValue}
          locale="es-MX"
          formatOptions={{ style: "currency", currency: "MXN" }}
          showControls
        />
      )
    }
    render(<ChakraProvider value={defaultSystem}><ControlledCurrency /></ChakraProvider>)

    const input = screen.getByRole("spinbutton", { name: "Importe" }) as HTMLInputElement
    expect(input.value).toBe("$2,500.00")
    fireEvent.click(screen.getByRole("button", { name: "Incrementar valor" }))

    await waitFor(() => expect((screen.getByRole("spinbutton", { name: "Importe" }) as HTMLInputElement).value).toBe("$2,501.00"))
  })

  it("mantiene un borrador editable mientras escribe una moneda controlada", () => {
    function ControlledCurrencyDraft() {
      const [value, setValue] = useState<number | null>(0)
      return (
        <NAmountInput
          label="Importe editable"
          value={value}
          onValueChange={setValue}
          locale="es-MX"
          formatOptions={{ style: "currency", currency: "MXN" }}
        />
      )
    }
    render(<ChakraProvider value={defaultSystem}><ControlledCurrencyDraft /></ChakraProvider>)

    const input = screen.getByRole("spinbutton", { name: "Importe editable" })
    expect(input).toHaveValue("$0.00")
    fireEvent.focus(input)
    expect(input).toHaveValue("0")
    fireEvent.input(input, { target: { value: "12" } })
    expect(input).toHaveValue("12")
    fireEvent.input(input, { target: { value: "12." } })
    expect(input).toHaveValue("12.")
    fireEvent.input(input, { target: { value: "12.5" } })
    expect(input).toHaveValue("12.5")
    fireEvent.blur(input)
    expect(input).toHaveValue("$12.50")
  })

  it("interpreta el valor canónico antes de formatear porcentajes", async () => {
    function ControlledPercent() {
      const [value, setValue] = useState<number | null>(0.25)
      return (
        <NAmountInput
          label="Avance"
          value={value}
          onValueChange={setValue}
          min={0}
          max={1}
          step={0.05}
          locale="es-MX"
          formatOptions={{ style: "percent", maximumFractionDigits: 0 }}
          showControls
        />
      )
    }
    render(<ChakraProvider value={defaultSystem}><ControlledPercent /></ChakraProvider>)

    const input = screen.getByRole("spinbutton", { name: "Avance" }) as HTMLInputElement
    expect(input.value).toBe("25%")
    fireEvent.click(screen.getByRole("button", { name: "Incrementar valor" }))

    await waitFor(() => expect((screen.getByRole("spinbutton", { name: "Avance" }) as HTMLInputElement).value).toBe("30%"))
  })

  it("administra un valor no controlado y publica número y texto", () => {
    const onValueChange = vi.fn()
    renderAmountInput({ defaultValue: 2, onValueChange })
    const input = screen.getByRole("spinbutton", { name: "Horas asignadas" })

    fireEvent.input(input, { target: { value: "4.5" } })

    expect(input).toHaveValue("4.5")
    expect(onValueChange).toHaveBeenLastCalledWith(4.5, { value: 4.5, valueText: "4.5", reason: "input" })
  })

  it("respeta value como fuente de verdad controlada", () => {
    const onValueChange = vi.fn()
    renderAmountInput({ value: 10, onValueChange })
    const input = screen.getByRole("spinbutton", { name: "Horas asignadas" })

    fireEvent.input(input, { target: { value: "25" } })

    expect(onValueChange).toHaveBeenCalledWith(25, expect.objectContaining({ reason: "input" }))
  })

  it("admite valor vacío y lo entrega como null", () => {
    const onValueChange = vi.fn()
    renderAmountInput({ defaultValue: 8, onValueChange })

    fireEvent.input(screen.getByRole("spinbutton"), { target: { value: "" } })

    expect(onValueChange).toHaveBeenLastCalledWith(null, { value: null, valueText: "", reason: "input" })
  })

  it("ofrece valores rápidos traducibles y respeta límites", () => {
    const onValueChange = vi.fn()
    renderAmountInput({
      min: 0,
      max: 50,
      quickValues: [{ value: 10, label: "Diez" }, { value: 100 }],
      onValueChange,
    })

    fireEvent.click(screen.getByRole("button", { name: "Diez" }))
    expect(onValueChange).toHaveBeenLastCalledWith(10, { value: 10, valueText: "10", reason: "quick-value" })
    expect(screen.getByRole("button", { name: "Usar 100" })).toBeDisabled()
  })

  it("expone controles incrementales con nombres accesibles", async () => {
    const onValueChange = vi.fn()
    renderAmountInput({ defaultValue: 2, step: 0.5, showControls: true, labels: { increment: "Sumar", decrement: "Restar" }, onValueChange })
    const increment = screen.getByRole("button", { name: "Sumar" })
    const input = screen.getByRole("spinbutton", { name: "Horas asignadas" })
    expect(getComputedStyle(input).paddingInlineEnd).toBe("var(--chakra-spacing-12)")
    expect(increment.querySelector("svg")).toBeInTheDocument()
    fireEvent.click(increment)
    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(2.5, expect.objectContaining({ reason: "input" })))
    expect(screen.getByRole("button", { name: "Restar" })).toBeInTheDocument()
  })

  it("deshabilita cada control al alcanzar sus límites", async () => {
    const onValueChange = vi.fn()
    renderAmountInput({ defaultValue: 1, min: 0, max: 1, showControls: true, onValueChange })

    expect(screen.getByRole("button", { name: "Incrementar valor" })).toBeDisabled()
    const decrement = screen.getByRole("button", { name: "Disminuir valor" })
    expect(decrement).toBeEnabled()

    fireEvent.click(decrement)

    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(0, expect.objectContaining({ reason: "input" })))
    expect(screen.getByRole("button", { name: "Disminuir valor" })).toBeDisabled()
  })

  it("interpreta separadores regionales antes de publicar el número", () => {
    const onValueChange = vi.fn()
    renderAmountInput({ locale: "es-MX", formatOptions: { style: "currency", currency: "MXN" }, onValueChange })

    fireEvent.input(screen.getByRole("spinbutton"), { target: { value: "$1,234.50" } })

    expect(onValueChange).toHaveBeenLastCalledWith(1234.5, expect.objectContaining({ value: 1234.5 }))
  })

  it("conecta ayuda, error y estado requerido mediante Field", () => {
    renderAmountInput({ helperText: "Máximo semanal", errorText: "Valor inválido", required: true })
    const input = screen.getByRole("spinbutton", { name: /Horas asignadas/ })
    expect(input).toBeInvalid()
    expect(screen.getByText("Máximo semanal")).toBeInTheDocument()
    expect(screen.getByText("Valor inválido")).toBeInTheDocument()
  })
})
