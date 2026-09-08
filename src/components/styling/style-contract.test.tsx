import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  NActivityTimeline,
  NAppShell,
  NEmptyState,
  NForm,
  NHeader,
  NItemPicker,
  NKanban,
  NStatCard,
  NSubscriptionGate,
  NTable,
} from "../../index"

const renderUI = (node: React.ReactNode) => render(<ChakraProvider value={defaultSystem}>{node}</ChakraProvider>)

describe("contrato visual compartido", () => {
  it.each([
    ["plataforma", <NAppShell classNames={{ root: "custom-root" }}><span>Contenido</span></NAppShell>, "n-app-shell"],
    ["navegación", <NHeader classNames={{ root: "custom-root" }} brand="Nissi" />, "n-header"],
    ["datos", <NTable classNames={{ root: "custom-root" }} config={{ headers: [], data: [] }} />, "n-table"],
    ["formularios", <NForm classNames={{ root: "custom-root" }} config={{ fields: [] }} onSubmit={() => ({ success: true })} />, "n-form"],
    ["selección", <NItemPicker classNames={{ root: "custom-root" }} items={[]} getItemId={() => "id"} getItemLabel={() => "Elemento"} />, "n-item-picker"],
    ["página", <NEmptyState classNames={{ root: "custom-root" }} />, "n-empty-state"],
    ["actividad", <NActivityTimeline classNames={{ root: "custom-root" }} items={[]} />, "n-activity-timeline"],
    ["dashboard", <NStatCard classNames={{ root: "custom-root" }} label="Ventas" value="10" />, "n-stat-card"],
    ["SaaS", <NSubscriptionGate classNames={{ root: "custom-root" }} allowed={false}><span>Premium</span></NSubscriptionGate>, "n-subscription-gate"],
    ["verticales", <NKanban classNames={{ root: "custom-root" }} columns={[]} />, "n-kanban"],
  ])("aplica clase y scope en %s", (_family, component, scope) => {
    const { container } = renderUI(component)
    const target = container.querySelector(`[data-scope="${scope}"]`)
    expect(target).toHaveClass("custom-root")
  })
})
