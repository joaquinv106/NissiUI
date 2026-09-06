import { ChakraProvider, Button, defaultSystem } from "@chakra-ui/react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { NPermissionGate, NPermissionsProvider, canAccess, useCanAccess } from "../../index"

function renderWithPermissions(node: React.ReactNode, permissions: string[]) {
  return render(
    <ChakraProvider value={defaultSystem}>
      <NPermissionsProvider permissions={permissions}>{node}</NPermissionsProvider>
    </ChakraProvider>,
  )
}

function Probe({ requires }: { requires: string | string[] }) {
  return <span>{useCanAccess(requires) ? "allowed" : "denied"}</span>
}

describe("canAccess", () => {
  it("resuelve comodines de capacidad", () => {
    expect(canAccess(["facturacion:*"], "facturacion:editar")).toBe(true)
    expect(canAccess(["facturacion:ver"], "facturacion:editar")).toBe(false)
    expect(canAccess(["*"], "cualquier:cosa")).toBe(true)
  })

  it("soporta modo any y all", () => {
    expect(canAccess(["a"], ["a", "b"], "any")).toBe(true)
    expect(canAccess(["a"], ["a", "b"], "all")).toBe(false)
  })
})

describe("useCanAccess / NPermissionsProvider", () => {
  it("permite todo sin proveedor montado", () => {
    render(<ChakraProvider value={defaultSystem}><Probe requires="ventas:editar" /></ChakraProvider>)
    expect(screen.getByText("allowed")).toBeInTheDocument()
  })

  it("evalúa la capacidad otorgada por el proveedor", () => {
    renderWithPermissions(<Probe requires="ventas:editar" />, ["ventas:ver"])
    expect(screen.getByText("denied")).toBeInTheDocument()
  })
})

describe("NPermissionGate", () => {
  it("oculta el contenido cuando no hay permiso (comportamiento hide)", () => {
    renderWithPermissions(
      <NPermissionGate requires="facturacion:eliminar">
        <button type="button">Eliminar</button>
      </NPermissionGate>,
      ["facturacion:ver"],
    )
    expect(screen.queryByRole("button", { name: "Eliminar" })).not.toBeInTheDocument()
  })

  it("muestra el fallback cuando se indica", () => {
    renderWithPermissions(
      <NPermissionGate requires="facturacion:eliminar" fallback={<span>Sin acceso</span>}>
        <button type="button">Eliminar</button>
      </NPermissionGate>,
      [],
    )
    expect(screen.getByText("Sin acceso")).toBeInTheDocument()
  })

  it("deshabilita el contenido con comportamiento disable", () => {
    renderWithPermissions(
      <NPermissionGate requires="facturacion:eliminar" behavior="disable">
        <Button>Eliminar</Button>
      </NPermissionGate>,
      [],
    )
    expect(screen.getByRole("button", { name: "Eliminar" })).toBeDisabled()
  })

  it("muestra el contenido cuando el permiso está otorgado", () => {
    renderWithPermissions(
      <NPermissionGate requires="facturacion:eliminar">
        <button type="button">Eliminar</button>
      </NPermissionGate>,
      ["facturacion:*"],
    )
    expect(screen.getByRole("button", { name: "Eliminar" })).toBeInTheDocument()
  })
})
