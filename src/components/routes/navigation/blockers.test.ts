import { describe, expect, it, vi } from "vitest"

import { parseRouteLocation } from "../location"
import { NRouteBlockerRegistry } from "./blockers"

const details = {
  from: parseRouteLocation("/editor"),
  to: parseRouteLocation("/dashboard"),
  action: "push" as const,
}

describe("NRouteBlockerRegistry", () => {
  it("compone condiciones y sólo notifica al blocker que detuvo la navegación", () => {
    const registry = new NRouteBlockerRegistry()
    registry.register("dirty", () => true)
    registry.register("clean", () => false)
    const commit = vi.fn()

    expect(registry.request(details, commit)).toBe(true)
    expect(registry.getSnapshot("dirty")).toMatchObject({ state: "blocked", from: details.from, to: details.to, action: "push" })
    expect(registry.getSnapshot("clean").state).toBe("idle")

    registry.getSnapshot("dirty").proceed()
    expect(commit).toHaveBeenCalledOnce()
    expect(registry.getSnapshot("dirty").state).toBe("idle")
  })

  it("reset cancela el intento y desmontar el último blocker activo lo libera", () => {
    const registry = new NRouteBlockerRegistry()
    const unregister = registry.register("dirty", () => true)
    const firstCommit = vi.fn()
    registry.request(details, firstCommit)
    registry.getSnapshot("dirty").reset()
    expect(firstCommit).not.toHaveBeenCalled()

    const secondCommit = vi.fn()
    registry.request(details, secondCommit)
    unregister()
    expect(registry.getSnapshot("dirty").state).toBe("idle")
    registry.proceed()
    expect(secondCommit).not.toHaveBeenCalled()
  })

  it("permite condiciones por destino y consulta unload sin crear estado pendiente", () => {
    const registry = new NRouteBlockerRegistry()
    registry.register("conditional", () => ({ action }) => action === "unload")

    expect(registry.shouldBlock({ ...details, action: "unload" })).toBe(true)
    expect(registry.request(details, vi.fn())).toBe(false)
    expect(registry.getSnapshot("conditional").state).toBe("idle")
  })
})
