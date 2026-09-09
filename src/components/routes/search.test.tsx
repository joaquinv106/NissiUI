import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
  NRouteOutlet,
  Nroutes,
  booleanParam,
  createNRouteSearchCodec,
  createNRouteSearchHook,
  defineNRouteSearch,
  defineNroutes,
  enumParam,
  numberParam,
  parseNRouteSearch,
  resolveNRouteTarget,
  serializeNRouteSearch,
  stringParam,
  useNSearchParams,
  useNTypedNroutes,
} from "./index"

const invoiceSearch = defineNRouteSearch({
  page: numberParam().default(1),
  status: enumParam(["all", "pending", "paid"] as const).default("all"),
  active: booleanParam(),
  query: stringParam(),
})

const useInvoiceSearch = createNRouteSearchHook(invoiceSearch)

const typedSearchRoutes = defineNroutes([{
  id: "invoices",
  path: "/invoices",
  title: "Facturas",
  search: invoiceSearch,
  reloadOnSearch: ["page", "status"],
  element: <SearchControls />,
}] as const)

defineNroutes([{
  id: "invalid-search-dependency",
  path: "/invalid-search-dependency",
  title: "Inválida",
  search: invoiceSearch,
  // @ts-expect-error reloadOnSearch sólo acepta claves del schema
  reloadOnSearch: ["sort"],
}] as const)

function SearchControls() {
  const search = useInvoiceSearch()
  const [nativeSearch, setNativeSearch] = useNSearchParams()
  return <>
    <span>página {search.page}</span>
    <span>estado {search.status}</span>
    <span>query nativa {nativeSearch.get("query")}</span>
    <button onClick={() => setNativeSearch({ tab: "grid" }, { mode: "merge" })}>Cambiar tab</button>
    <button onClick={() => setNativeSearch({ page: 2 }, { mode: "merge" })}>Cambiar página</button>
  </>
}

function typeContract() {
  const router = useNTypedNroutes(typedSearchRoutes)
  router.navigate({ route: "invoices", search: { page: 2, status: "paid", active: true } })
  router.navigate({ route: "invoices", search: new URLSearchParams("page=3") })
  // @ts-expect-error page pertenece al codec numérico
  router.navigate({ route: "invoices", search: { page: "2" } })
  // @ts-expect-error el schema no declara sort
  router.href({ route: "invoices", search: { sort: "date" } })
}
void typeContract

describe("search params tipados", () => {
  it("parsea defaults, valores inválidos, enums, booleanos y codecs propios", () => {
    const date = createNRouteSearchCodec<Date | undefined>({
      parse: ([value]) => value ? new Date(`${value}T00:00:00Z`) : undefined,
      serialize: (value) => value?.toISOString().slice(0, 10),
    })
    const schema = defineNRouteSearch({ ...invoiceSearch, date })
    const parsed = parseNRouteSearch(schema, new URLSearchParams("page=bad&status=paid&active=1&date=2026-09-09"))

    expect(parsed.page).toBe(1)
    expect(parsed.status).toBe("paid")
    expect(parsed.active).toBe(true)
    expect(parsed.query).toBeUndefined()
    expect(parsed.date?.toISOString()).toBe("2026-09-09T00:00:00.000Z")
  })

  it("serializa sólo claves declaradas y permite eliminar valores", () => {
    const result = serializeNRouteSearch(
      invoiceSearch,
      { page: 4, status: "pending", active: null },
      new URLSearchParams("active=true&external=kept"),
    )
    expect(result.toString()).toBe("external=kept&page=4&status=pending")

    const resolved = resolveNRouteTarget(typedSearchRoutes, {
      route: "invoices",
      search: { page: 2, status: "paid" },
      hash: "totals",
    })
    expect(typeof resolved).toBe("object")
    expect((resolved as { search: URLSearchParams }).search.toString()).toBe("page=2&status=paid")
  })

  it("expone un hook tipado y conserva URLSearchParams nativo", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes routes={typedSearchRoutes} strategy="memory" defaultPath="/invoices?page=3&status=paid&query=caja">
          <NRouteOutlet />
        </Nroutes>
      </ChakraProvider>,
    )

    expect(screen.getByText("página 3")).toBeInTheDocument()
    expect(screen.getByText("estado paid")).toBeInTheDocument()
    expect(screen.getByText("query nativa caja")).toBeInTheDocument()
  })

  it("no recarga loaders por search ajeno y sí por una dependencia declarada", async () => {
    const loader = vi.fn(() => "ok")
    const routes = [{ ...typedSearchRoutes[0], loader }] as const
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes routes={routes} strategy="memory" defaultPath="/invoices?page=1">
          <NRouteOutlet />
        </Nroutes>
      </ChakraProvider>,
    )
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1))

    fireEvent.click(await screen.findByRole("button", { name: "Cambiar tab" }))
    await waitFor(() => expect(screen.getByText("página 1")).toBeInTheDocument())
    expect(loader).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole("button", { name: "Cambiar página" }))
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(2))
    expect(screen.getByText("página 2")).toBeInTheDocument()
  })
})
