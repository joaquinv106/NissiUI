import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NForm, type NFormConfig } from "../../index"

type Employee = {
  name: string
  email: string
  department: string
  active: boolean
}

const config: NFormConfig<Employee> = {
  fields: [
    { key: "name", label: "Nombre", validation: { required: true } },
    { key: "email", label: "Correo", type: "email", validation: { required: true, pattern: /@/, patternMessage: "Correo inválido" } },
    {
      key: "department",
      label: "Departamento",
      type: "select",
      options: [{ label: "Diseño", value: "diseno" }, { label: "Ingeniería", value: "ingenieria" }],
    },
    { key: "active", label: "Activo", type: "checkbox" },
  ],
}

function renderForm(node: React.ReactNode) {
  return render(<ChakraProvider value={defaultSystem}>{node}</ChakraProvider>)
}

describe("NForm", () => {
  it("bloquea el envío cuando faltan campos requeridos", async () => {
    const onSubmit = vi.fn()
    renderForm(<NForm config={config} onSubmit={onSubmit} />)

    fireEvent.click(screen.getByRole("button", { name: "Crear" }))

    expect(await screen.findAllByText("Este campo es obligatorio.")).toHaveLength(2)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("envía los valores y muestra el mensaje de éxito", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ success: true })
    renderForm(<NForm config={config} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Ana Torres" } })
    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "ana@nissi.mx" } })
    fireEvent.click(screen.getByRole("button", { name: "Crear" }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Ana Torres", email: "ana@nissi.mx" }),
      "create",
    ))
    expect(await screen.findByText("Los cambios se guardaron correctamente.")).toBeInTheDocument()
  })

  it("precarga datos en modo edición y usa la etiqueta de guardar", () => {
    renderForm(<NForm config={config} data={{ name: "Bruno Díaz", email: "bruno@nissi.mx" }} onSubmit={vi.fn()} />)

    expect(screen.getByLabelText("Nombre")).toHaveValue("Bruno Díaz")
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument()
  })

  it("muestra errores del backend y llama a onCancel", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ success: false, message: "Error del servidor", errors: { email: "Correo ya registrado" } })
    const onCancel = vi.fn()
    renderForm(<NForm config={config} onCancel={onCancel} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Ana" } })
    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "ana@nissi.mx" } })
    fireEvent.click(screen.getByRole("button", { name: "Crear" }))

    expect(await screen.findByText("Correo ya registrado")).toBeInTheDocument()
    expect(await screen.findByText("Error del servidor")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }))
    expect(onCancel).toHaveBeenCalled()
  })
})
