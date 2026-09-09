import { describe, expect, it, vi } from "vitest"

import { compileRouteBranches, matchRoutes } from "../matcher"
import { parseRouteLocation } from "../location"
import type { NRouteDefinition } from "../types"
import { scheduleNRouteLoaders } from "./scheduler"

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => { resolve = next })
  return { promise, resolve }
}

function createMatch(routes: NRouteDefinition[]) {
  return matchRoutes(compileRouteBranches(routes), parseRouteLocation("/workspace/invoices/A-1"))!
}

describe("scheduleNRouteLoaders", () => {
  it("inicia loaders independientes en paralelo", async () => {
    const tenant = deferred<string>()
    const invoice = deferred<string>()
    const starts: string[] = []
    const routes: NRouteDefinition[] = [{
      id: "workspace",
      path: "/workspace",
      title: "Workspace",
      element: null,
      loader: () => { starts.push("workspace"); return tenant.promise },
      children: [{
        id: "invoice",
        path: "invoices/:folio",
        title: "Factura",
        element: null,
        loader: () => { starts.push("invoice"); return invoice.promise },
      }],
    }]
    const match = createMatch(routes)
    const controller = new AbortController()
    const result = scheduleNRouteLoaders({
      match,
      routeIds: new Set(["workspace", "invoice"]),
      context: undefined,
      signal: controller.signal,
      execute: (entry, details) => entry.route.loader!(details),
    })

    await vi.waitFor(() => expect(starts).toEqual(["workspace", "invoice"]))
    invoice.resolve("A-1")
    tenant.resolve("acme")
    await expect(result).resolves.toEqual({ workspace: "acme", invoice: "A-1" })
  })

  it("respeta dependencias explícitas y entrega loaderData resuelto", async () => {
    const tenant = deferred<string>()
    const starts: string[] = []
    const routes: NRouteDefinition[] = [{
      id: "workspace",
      path: "/workspace",
      title: "Workspace",
      element: null,
      loader: () => { starts.push("workspace"); return tenant.promise },
      children: [{
        id: "invoice",
        path: "invoices/:folio",
        title: "Factura",
        element: null,
        dependsOn: ["workspace"],
        loader: ({ loaderData }) => { starts.push(`invoice:${loaderData.workspace}`); return "A-1" },
      }],
    }]
    const match = createMatch(routes)
    const result = scheduleNRouteLoaders({
      match,
      routeIds: new Set(["workspace", "invoice"]),
      context: undefined,
      signal: new AbortController().signal,
      execute: (entry, details) => entry.route.loader!(details),
    })

    await vi.waitFor(() => expect(starts).toEqual(["workspace"]))
    tenant.resolve("acme")
    await expect(result).resolves.toEqual({ workspace: "acme", invoice: "A-1" })
    expect(starts).toEqual(["workspace", "invoice:acme"])
  })

  it("rechaza ciclos y dependencias inexistentes de forma determinista", async () => {
    const cyclic: NRouteDefinition[] = [{
      id: "workspace",
      path: "/workspace",
      title: "Workspace",
      element: null,
      loader: () => "workspace",
      dependsOn: ["invoice"],
      children: [{
        id: "invoice",
        path: "invoices/:folio",
        title: "Factura",
        element: null,
        loader: () => "invoice",
        dependsOn: ["workspace"],
      }],
    }]
    const cyclicMatch = createMatch(cyclic)
    await expect(scheduleNRouteLoaders({
      match: cyclicMatch,
      routeIds: new Set(["workspace", "invoice"]),
      context: undefined,
      signal: new AbortController().signal,
      execute: (entry, details) => entry.route.loader!(details),
    })).rejects.toMatchObject({ routeId: "workspace", routeIndex: 0 })

    cyclic[0]!.dependsOn = ["missing"]
    const missingMatch = createMatch(cyclic)
    await expect(scheduleNRouteLoaders({
      match: missingMatch,
      routeIds: new Set(["workspace", "invoice"]),
      context: undefined,
      signal: new AbortController().signal,
      execute: (entry, details) => entry.route.loader!(details),
    })).rejects.toMatchObject({ routeId: "workspace", routeIndex: 0 })
  })

  it("selecciona el error de menor índice cuando fallan loaders paralelos", async () => {
    const routes: NRouteDefinition[] = [{
      id: "workspace",
      path: "/workspace",
      title: "Workspace",
      element: null,
      loader: () => { throw new Error("parent") },
      children: [{
        id: "invoice",
        path: "invoices/:folio",
        title: "Factura",
        element: null,
        loader: () => { throw new Error("child") },
      }],
    }]
    const match = createMatch(routes)
    await expect(scheduleNRouteLoaders({
      match,
      routeIds: new Set(["workspace", "invoice"]),
      context: undefined,
      signal: new AbortController().signal,
      execute: (entry, details) => entry.route.loader!(details),
    })).rejects.toMatchObject({ routeId: "workspace", routeIndex: 0, cause: expect.any(Error) })
  })

  it("cancela antes de ejecutar tareas cuando el signal ya fue abortado", async () => {
    const routes: NRouteDefinition[] = [{
      id: "workspace",
      path: "/workspace/invoices/:folio",
      title: "Workspace",
      element: null,
      loader: () => "workspace",
    }]
    const match = createMatch(routes)
    const controller = new AbortController()
    const execute = vi.fn()
    controller.abort()

    await expect(scheduleNRouteLoaders({
      match,
      routeIds: new Set(["workspace"]),
      context: undefined,
      signal: controller.signal,
      execute,
    })).rejects.toMatchObject({ name: "AbortError" })
    expect(execute).not.toHaveBeenCalled()
  })
})
