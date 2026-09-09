import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

import { NAuthLayout, NAuthSocialButtons, NLogin, NOtpVerification, NPasswordField, NRegister, type NLoginData } from "."

function renderAuth(node: ReactNode) { return render(<ChakraProvider value={defaultSystem}>{node}</ChakraProvider>) }

describe("Nissi Auth", () => {
  it("renderiza el layout split como una región principal responsive", () => {
    renderAuth(<NAuthLayout variant="split" brandName="Nissi" title="Opera mejor"><NLogin /></NAuthLayout>)
    expect(screen.getByRole("main")).toHaveAttribute("data-scope", "n-auth-layout")
    expect(screen.getByRole("heading", { name: "Opera mejor" })).toBeInTheDocument()
  })

  it("valida y entrega credenciales tipadas sin doble submit", async () => {
    let release: (() => void) | undefined
    const onSubmit = vi.fn((_data: NLoginData) => new Promise<void>((resolve) => { release = resolve }))
    renderAuth(<NLogin allowRememberMe onSubmit={onSubmit} />)
    fireEvent.submit(screen.getByRole("button", { name: "Iniciar sesión" }).closest("form")!)
    expect(await screen.findAllByText("Este campo es obligatorio.")).toHaveLength(2)
    fireEvent.change(screen.getByRole("textbox", { name: "Correo electrónico" }), { target: { value: "persona@nissi.mx" } })
    fireEvent.change(screen.getByLabelText(/Contraseña/), { target: { value: "secreto123" } })
    fireEvent.click(screen.getByText("Recordarme"))
    const form = screen.getByRole("button", { name: "Iniciar sesión" }).closest("form")!
    fireEvent.submit(form); fireEvent.submit(form)
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ identifier: "persona@nissi.mx", email: "persona@nissi.mx", password: "secreto123", rememberMe: true })
    release?.(); await waitFor(() => expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeEnabled())
  })

  it("muestra y oculta la contraseña con nombre accesible", () => {
    renderAuth(<NPasswordField label="Clave" />)
    const input = screen.getByLabelText("Clave")
    expect(input).toHaveAttribute("type", "password")
    fireEvent.click(screen.getByRole("button", { name: "Mostrar contraseña" }))
    expect(input).toHaveAttribute("type", "text")
  })

  it("reparte los proveedores sociales sin desbordar su contenedor", () => {
    renderAuth(<div style={{ width: 320 }}><NAuthSocialButtons providers={["google", "github"]} /></div>)
    const root = document.querySelector("[data-scope='n-auth-social-buttons']")
    const buttons = screen.getAllByRole("button")
    expect(root).toHaveStyle({ width: "var(--chakra-sizes-full)" })
    expect(buttons).toHaveLength(2)
    buttons.forEach((button) => expect(button).toHaveStyle({ flex: "1 1 0" }))
  })

  it("acepta pegar un OTP completo y emite onComplete", () => {
    const onComplete = vi.fn()
    renderAuth(<NOtpVerification length={6} onComplete={onComplete} />)
    fireEvent.paste(screen.getByLabelText("Dígito 1 de 6"), { clipboardData: { getData: () => "821479" } })
    expect(onComplete).toHaveBeenCalledWith("821479")
    expect(screen.getByLabelText("Dígito 6 de 6")).toHaveValue("9")
  })

  it("valida confirmación y campos configurables del registro", async () => {
    const onSubmit = vi.fn()
    renderAuth(<NRegister fields={["email", "password", "confirmPassword", "terms"]} onSubmit={onSubmit} />)
    fireEvent.change(screen.getByRole("textbox", { name: "Correo electrónico" }), { target: { value: "persona@nissi.mx" } })
    const passwords = screen.getAllByLabelText(/Contraseña|Confirmar contraseña/)
    fireEvent.change(passwords[0]!, { target: { value: "Secreto1!" } }); fireEvent.change(passwords[1]!, { target: { value: "distinta" } })
    fireEvent.click(screen.getByText("Acepto los términos y condiciones")); fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }))
    expect(await screen.findByText("Las contraseñas no coinciden.")).toBeInTheDocument(); expect(onSubmit).not.toHaveBeenCalled()
  })
})
