import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NPermissionsProvider } from "../permissions"
import { NModuleRegistry } from "./NModuleRegistry"

describe("NModuleRegistry", () => {
  it("selecciona módulos contratados y conserva estado no controlado", () => {
    const onSelect = vi.fn()
    render(
      <ChakraProvider value={defaultSystem}>
        <NModuleRegistry
          modules={[{ id: "crm", label: "CRM" }, { id: "billing", label: "Facturación" }]}
          defaultActiveModuleId="crm"
          onModuleSelect={onSelect}
        />
      </ChakraProvider>,
    )

    expect(screen.getByRole("button", { name: /CRM/ })).toHaveAttribute("aria-current", "page")
    fireEvent.click(screen.getByRole("button", { name: /Facturación/ }))
    expect(screen.getByRole("button", { name: /Facturación/ })).toHaveAttribute("aria-current", "page")
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "billing" }))
  })

  it("oculta capacidades denegadas y puede mostrar módulos no contratados", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NPermissionsProvider permissions={["crm:ver"]}>
          <NModuleRegistry
            showUnavailable
            modules={[
              { id: "crm", label: "CRM", requiredPermission: "crm:ver" },
              { id: "billing", label: "Facturación", requiredPermission: "billing:ver" },
              { id: "reports", label: "Reportes", purchased: false },
            ]}
          />
        </NPermissionsProvider>
      </ChakraProvider>,
    )

    expect(screen.getByRole("button", { name: /CRM/ })).toBeInTheDocument()
    expect(screen.queryByText("Facturación")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Reportes/ })).toBeDisabled()
    expect(screen.getByText("No contratado")).toBeInTheDocument()
  })
})
