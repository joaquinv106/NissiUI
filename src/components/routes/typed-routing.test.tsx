import { ChakraProvider, defaultSystem, Text } from "@chakra-ui/react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { NOutlet, NRouteOutlet, Nroutes, defineNroutes, resolveNRouteTarget, useNTypedNroutes } from "./index"

const typedRoutes = defineNroutes([
  {
    id: "tenant",
    path: "/tenants/:tenantId",
    title: "Tenant",
    element: <NOutlet />,
    children: [{
      id: "invoice-detail",
      path: "invoices/:folio",
      title: "Factura",
      element: <Text>Factura tipada</Text>,
    }],
  },
  { id: "home", path: "/", title: "Inicio", element: <Text>Inicio tipado</Text> },
] as const)

function TypedNavigation() {
  const router = useNTypedNroutes(typedRoutes)
  const target = { route: "invoice-detail", params: { tenantId: "acme", folio: "A 100" } } as const
  return <>
    <a {...router.createLinkProps(target)}>Abrir tipada</a>
    <span>{router.href(target)}</span>
    <NRouteOutlet />
  </>
}

function typeContract() {
  const router = useNTypedNroutes(typedRoutes)
  router.navigate({ route: "invoice-detail", params: { tenantId: "acme", folio: "A-100" } })
  router.navigate({ route: "home" })
  // @ts-expect-error falta folio
  router.navigate({ route: "invoice-detail", params: { tenantId: "acme" } })
  // @ts-expect-error customer no es un param declarado
  router.href({ route: "invoice-detail", params: { tenantId: "acme", folio: "A-100", customer: "100" } })
  // @ts-expect-error id inexistente
  router.prefetch({ route: "missing" })
}
void typeContract

describe("routing por id tipado", () => {
  it("construye paths anidados, codifica params y navega con el manifest", () => {
    expect(resolveNRouteTarget(typedRoutes, {
      route: "invoice-detail",
      params: { tenantId: "acme", folio: "A 100" },
      search: { tab: "payments" },
    })).toEqual({
      pathname: "/tenants/acme/invoices/A%20100",
      search: { tab: "payments" },
      hash: undefined,
    })

    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes routes={typedRoutes} strategy="memory"><TypedNavigation /></Nroutes>
      </ChakraProvider>,
    )
    expect(screen.getByText("/tenants/acme/invoices/A%20100")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("link", { name: "Abrir tipada" }))
    expect(screen.getByText("Factura tipada")).toBeInTheDocument()
  })

  it("reporta ids y params faltantes también en runtime", () => {
    expect(() => resolveNRouteTarget(typedRoutes, { route: "missing" })).toThrow(/no encontró/)
    expect(() => resolveNRouteTarget(typedRoutes, { route: "invoice-detail", params: { tenantId: "acme" } })).toThrow(/folio/)
  })
})
