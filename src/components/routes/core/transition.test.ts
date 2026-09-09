import { describe, expect, it } from "vitest"

import { compileRouteBranches, matchRoutes } from "../matcher"
import { parseRouteLocation } from "../location"
import type { NRouteDefinition, NRouteMatch } from "../types"
import { createNRouteTransition } from "./transition"

const routes: NRouteDefinition[] = [{
  id: "tenant",
  path: "/tenant/:tenant",
  title: "Tenant",
  element: null,
  children: [{
    id: "treasury",
    path: "treasury",
    title: "Tesorería",
    element: null,
    children: [
      { id: "payments", path: "payments", title: "Pagos", element: null },
      { id: "accounts", path: "accounts", title: "Cuentas", element: null },
      { id: "invoice", path: "invoices/:folio", title: "Factura", element: null },
    ],
  }],
}]

const compiled = compileRouteBranches(routes)
const match = (path: string): NRouteMatch => matchRoutes(compiled, parseRouteLocation(path))!

describe("createNRouteTransition", () => {
  it("retiene padres y sólo revalida el segmento cuyo param cambió", () => {
    const transition = createNRouteTransition(
      match("/tenant/acme/treasury/invoices/A1"),
      match("/tenant/acme/treasury/invoices/A2"),
    )

    expect(transition.retained.map(({ next }) => next.route.id)).toEqual(["tenant", "treasury", "invoice"])
    expect(transition.retained.filter(({ shouldReload }) => shouldReload).map(({ next }) => next.route.id)).toEqual(["invoice"])
    expect(transition.retained[2]?.changedParams).toEqual(["folio"])
    expect(transition.entering).toEqual([])
    expect(transition.leaving).toEqual([])
  })

  it("detecta segmentos entrantes y salientes entre siblings", () => {
    const transition = createNRouteTransition(
      match("/tenant/acme/treasury/payments"),
      match("/tenant/acme/treasury/accounts"),
    )

    expect(transition.retained.map(({ next }) => next.route.id)).toEqual(["tenant", "treasury"])
    expect(transition.entering.map(({ route }) => route.id)).toEqual(["accounts"])
    expect(transition.leaving.map(({ route }) => route.id)).toEqual(["payments"])
  })

  it("distingue search relevante y navegaciones exclusivas de hash", () => {
    const searchRoutes: NRouteDefinition[] = [{
      id: "list",
      path: "/invoices",
      title: "Facturas",
      element: null,
      reloadOnSearch: ["page"],
    }]
    const searchCompiled = compileRouteBranches(searchRoutes)
    const searchMatch = (path: string) => matchRoutes(searchCompiled, parseRouteLocation(path))!

    const ignored = createNRouteTransition(searchMatch("/invoices?page=1&tab=all"), searchMatch("/invoices?page=1&tab=paid"))
    expect(ignored.changes.search).toEqual(["tab"])
    expect(ignored.retained[0]?.shouldReload).toBe(false)

    const affected = createNRouteTransition(searchMatch("/invoices?page=1#top"), searchMatch("/invoices?page=2#top"))
    expect(affected.retained[0]?.shouldReload).toBe(true)

    const hashOnly = createNRouteTransition(searchMatch("/invoices?page=2#top"), searchMatch("/invoices?page=2#details"))
    expect(hashOnly.changes).toEqual({ pathname: false, search: [], hash: true })
    expect(hashOnly.retained[0]?.shouldReload).toBe(false)
  })
})
