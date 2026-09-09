import { render, screen } from "@testing-library/react"
import type { ReactElement } from "react"
import { describe, expect, it, vi } from "vitest"

import { compileRouteBranches, matchRoutes } from "./matcher"
import { parseRouteLocation } from "./location"
import { NRouteModuleRegistry, resolveNRouteModules } from "./modules"
import type { NRouteDefinition } from "./types"

function createMatch(route: NRouteDefinition) {
  return matchRoutes(compileRouteBranches([route]), parseRouteLocation("/lazy"))!
}

describe("NRouteModuleRegistry", () => {
  it("deduplica imports y aplica el contrato del módulo", async () => {
    const lazy = vi.fn(async () => ({
      Component: () => <p>Módulo listo</p>,
      loader: () => "data",
      pendingElement: <p>Cargando módulo</p>,
      data: { area: "treasury" },
    }))
    const route: NRouteDefinition<{ area: string }> = { id: "lazy", path: "/lazy", title: "Lazy", lazy }
    const match = createMatch(route)
    const registry = new NRouteModuleRegistry<{ area: string }>()
    const signal = new AbortController().signal
    const [first, second] = await Promise.all([
      resolveNRouteModules(match, registry, signal),
      resolveNRouteModules(match, registry, signal),
    ])

    expect(lazy).toHaveBeenCalledTimes(1)
    expect(first.route.loader).toBeTypeOf("function")
    expect(first.route.data).toEqual({ area: "treasury" })
    render(first.route.element as ReactElement)
    expect(screen.getByText("Módulo listo")).toBeInTheDocument()
    expect(second.route.element).toEqual(first.route.element)
  })

  it("no memoriza fallos y permite reintentar el chunk", async () => {
    const lazy = vi.fn<() => Promise<{ Component: () => ReactElement }>>()
      .mockRejectedValueOnce(new Error("chunk offline"))
      .mockResolvedValueOnce({ Component: () => <p>Reintentado</p> })
    const route: NRouteDefinition = { id: "lazy", path: "/lazy", title: "Lazy", lazy }
    const match = createMatch(route)
    const registry = new NRouteModuleRegistry()
    await expect(resolveNRouteModules(match, registry, new AbortController().signal)).rejects.toMatchObject({ routeId: "lazy" })
    await expect(resolveNRouteModules(match, registry, new AbortController().signal)).resolves.toMatchObject({ route: { id: "lazy" } })
    expect(lazy).toHaveBeenCalledTimes(2)
  })

  it("deja terminar el import compartido aunque un consumidor aborte", async () => {
    let resolveModule!: (module: { Component: () => ReactElement }) => void
    const importPromise = new Promise<{ Component: () => ReactElement }>((resolve) => { resolveModule = resolve })
    const lazy = vi.fn(() => importPromise)
    const route: NRouteDefinition = { id: "lazy", path: "/lazy", title: "Lazy", lazy }
    const registry = new NRouteModuleRegistry()
    const first = new AbortController()
    const second = new AbortController()
    const firstLoad = registry.load(route, first.signal)
    const secondLoad = registry.load(route, second.signal)
    first.abort()
    await expect(firstLoad).rejects.toMatchObject({ name: "AbortError" })
    resolveModule({ Component: () => <p>Compartido</p> })
    await expect(secondLoad).resolves.toBeDefined()
    expect(lazy).toHaveBeenCalledTimes(1)
  })
})
