import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AuthView } from "./AuthView"

describe("AuthView", () => {
  it("carga y permite recorrer todos los flujos del laboratorio", () => {
    render(<ChakraProvider value={defaultSystem}><AuthView /></ChakraProvider>)

    expect(screen.getByRole("heading", { name: "Nissi Auth" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Bienvenido nuevamente" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "register" }))
    expect(screen.getByRole("heading", { name: "Crea tu cuenta" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "forgot" }))
    expect(screen.getByRole("heading", { name: "Recupera tu contraseña" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "reset" }))
    expect(screen.getByRole("heading", { name: "Crea una nueva contraseña" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "otp" }))
    expect(screen.getByRole("heading", { name: "Introduce el código" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "verify" }))
    expect(screen.getByRole("heading", { name: "Verifica tu correo" })).toBeInTheDocument()
  })
})
