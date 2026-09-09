import { describe, expect, it, vi } from "vitest"

import { parseRouteLocation } from "../location"
import type { NRouteDefinition, NRouteMatchEntry } from "../types"
import { createNRouteCacheKey, NRouteCache } from "./cache"

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => { resolve = next })
  return { promise, resolve }
}

describe("NRouteCache", () => {
  it("deduplica misses concurrentes y sirve hits fresh", async () => {
    const cache = new NRouteCache()
    const pending = deferred<string>()
    const loader = vi.fn(() => pending.promise)
    const options = { key: "invoice:A1", routeId: "invoice", signal: new AbortController().signal, load: loader }
    const first = cache.load(options)
    const second = cache.load(options)

    await vi.waitFor(() => expect(loader).toHaveBeenCalledTimes(1))
    pending.resolve("A1")
    await expect(Promise.all([first, second])).resolves.toEqual(["A1", "A1"])
    await expect(cache.load(options)).resolves.toBe("A1")
    expect(loader).toHaveBeenCalledTimes(1)
  })

  it("revalida stale en background y entrega el valor disponible", async () => {
    let now = 0
    const cache = new NRouteCache(() => now)
    const loader = vi.fn<() => Promise<string>>()
      .mockResolvedValueOnce("old")
      .mockResolvedValueOnce("new")
    const signal = new AbortController().signal
    const policy = { mode: "stale-while-revalidate" as const, staleTime: 10, gcTime: 100 }

    await expect(cache.load({ key: "invoice:A1", routeId: "invoice", signal, policy, load: loader })).resolves.toBe("old")
    now = 11
    const onBackgroundUpdate = vi.fn()
    await expect(cache.load({ key: "invoice:A1", routeId: "invoice", signal, policy, load: loader, onBackgroundUpdate })).resolves.toBe("old")
    await vi.waitFor(() => expect(onBackgroundUpdate).toHaveBeenCalledWith("new"))
    expect(loader).toHaveBeenCalledTimes(2)
  })

  it("usa stale como fallback de network-first y recolecta por gcTime", async () => {
    let now = 0
    const cache = new NRouteCache(() => now)
    const signal = new AbortController().signal
    const policy = { mode: "network-first" as const, staleTime: 5, gcTime: 10 }
    await cache.load({ key: "tenant:acme", routeId: "tenant", signal, policy, load: () => "cached" })
    now = 6
    await expect(cache.load({ key: "tenant:acme", routeId: "tenant", signal, policy, load: () => { throw new Error("offline") } })).resolves.toBe("cached")
    now = 17
    expect(cache.snapshot()).toEqual([])
  })

  it("invalida por tag, route id y clear; aborta misses sin consumidores", async () => {
    const cache = new NRouteCache()
    const signal = new AbortController().signal
    await cache.load({ key: "one", routeId: "invoice", signal, policy: { tags: ["invoices"] }, load: () => 1 })
    await cache.load({ key: "two", routeId: "tenant", signal, policy: { tags: ["tenants"] }, load: () => 2 })
    cache.invalidate({ tags: ["invoices"] })
    expect(cache.snapshot().map(({ key }) => key)).toEqual(["two"])
    cache.invalidateRoute("tenant")
    expect(cache.snapshot()).toEqual([])
    await cache.load({ key: "three", routeId: "other", signal, load: () => 3 })
    cache.clear()
    expect(cache.snapshot()).toEqual([])
  })

  it("cancela sólo al consumidor abortado durante una deduplicación", async () => {
    const cache = new NRouteCache()
    const pending = deferred<string>()
    const firstController = new AbortController()
    const secondController = new AbortController()
    const loader = vi.fn(() => pending.promise)
    const first = cache.load({ key: "shared", routeId: "invoice", signal: firstController.signal, load: loader })
    const second = cache.load({ key: "shared", routeId: "invoice", signal: secondController.signal, load: loader })
    firstController.abort()
    await expect(first).rejects.toMatchObject({ name: "AbortError" })
    pending.resolve("ready")
    await expect(second).resolves.toBe("ready")
    expect(loader).toHaveBeenCalledTimes(1)
  })
})

describe("createNRouteCacheKey", () => {
  it("usa route id, params por nivel y search declarado; omite hash", () => {
    const route: NRouteDefinition = {
      id: "invoice",
      path: "/invoices/:folio",
      title: "Factura",
      element: null,
      reloadOnSearch: ["tab"],
    }
    const entry: NRouteMatchEntry = { route, pathname: "/invoices/A1", params: { folio: "A1" } }
    const first = createNRouteCacheKey(entry, parseRouteLocation("/invoices/A1?tab=payments&debug=1#top"))
    const second = createNRouteCacheKey(entry, parseRouteLocation("/invoices/A1?debug=2&tab=payments#bottom"))
    expect(first).toBe(second)
    expect(first).not.toContain("top")
    expect(first).not.toContain("debug")
  })
})
