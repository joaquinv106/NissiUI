import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { NThemeProvider } from "../components/theme"
import { AuthView } from "./AuthView"

describe("AuthView", () => {
  it("carga y permite recorrer todos los flujos del laboratorio", () => {
    render(<NThemeProvider theme="dark"><AuthView /></NThemeProvider>)

    expect(screen.getByRole("heading", { name: "Nauth y NloginPage" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Bienvenido de nuevo" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Registro" }))
    expect(screen.getByRole("heading", { name: "Crea tu cuenta" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Recuperación" }))
    expect(screen.getByRole("heading", { name: "Recupera tu contraseña" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Nueva contraseña" }))
    expect(screen.getByRole("heading", { name: "Crea una nueva contraseña" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "OTP" }))
    expect(screen.getByRole("heading", { name: "Introduce el código" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Verificación" }))
    expect(screen.getByRole("heading", { name: "Verifica tu correo" })).toBeInTheDocument()
  })
})
