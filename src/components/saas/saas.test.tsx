import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NAuditLog, NImpersonationBanner, NPlanComparison, NSubscriptionGate } from "./index"

const renderUI = (node: React.ReactNode) => render(<ChakraProvider value={defaultSystem}>{node}</ChakraProvider>)
describe("administración SaaS", () => {
  it("protege una función y emite upgrade", () => { const upgrade = vi.fn(); renderUI(<NSubscriptionGate allowed={false} feature="Reportes" onUpgrade={upgrade}><p>Privado</p></NSubscriptionGate>); fireEvent.click(screen.getByRole("button", { name: "Ver planes" })); expect(upgrade).toHaveBeenCalledOnce(); expect(screen.queryByText("Privado")).not.toBeInTheDocument() })
  it("compara planes de forma accesible", () => { renderUI(<NPlanComparison features={[{ id: "audit", label: "Auditoría" }]} plans={[{ id: "basic", name: "Básico", features: { audit: false } }, { id: "pro", name: "Pro", features: { audit: true } }]} />); expect(screen.getByLabelText("Auditoría incluida en Pro")).toBeInTheDocument() })
  it("presenta auditoría", () => { renderUI(<NAuditLog entries={[{ id: "1", action: "Actualizó pago", actor: "Ana", timestamp: "Hoy" }]} />); expect(screen.getByRole("region", { name: "Registro de auditoría" })).toHaveTextContent("Actualizó pago") })
  it("bloquea salidas duplicadas de suplantación", () => { const exit = vi.fn(() => new Promise<void>(() => undefined)); renderUI(<NImpersonationBanner subject="Cuenta Norte" onExit={exit} />); const button = screen.getByRole("button", { name: "Salir de la suplantación" }); fireEvent.click(button); fireEvent.click(button); expect(exit).toHaveBeenCalledOnce() })
})
