import { ChakraProvider, defaultSystem, Link, Stack, Text } from "@chakra-ui/react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { NLink, NOutlet, NRouteOutlet, Nroutes, matchRoute, redirect, useNLoaderData, useNLocation, useNroutes, useNSearchParams } from "./index"
import { NPermissionsProvider } from "../permissions"
import type { NRouteDefinition } from "./types"

const routes: NRouteDefinition[] = [
  { id: "home", path: "/", title: "Inicio", element: <Text>Resumen principal</Text> },
  { id: "invoice", path: "/comprobantes/:folio", title: "Comprobante", element: ({ params }) => <Text>Folio {params.folio}</Text> },
]

function RouterFixture() {
  const { createLinkProps } = useNroutes()
  return (
    <Stack>
      <Link {...createLinkProps("/comprobantes/A-1042")}>Abrir comprobante</Link>
      <NRouteOutlet />
    </Stack>
  )
}

describe("Nroutes", () => {
  it("navega sin recargar, resuelve parámetros y enfoca el contenido", () => {
    const onPathChange = vi.fn()
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes routes={routes} strategy="memory" defaultPath="/" onPathChange={onPathChange}>
          <RouterFixture />
        </Nroutes>
      </ChakraProvider>,
    )

    expect(screen.getByText("Resumen principal")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("link", { name: "Abrir comprobante" }))
    expect(screen.getByText("Folio A-1042")).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Contenido de Comprobante" })).toHaveFocus()
    expect(onPathChange).toHaveBeenCalledWith("/comprobantes/A-1042", expect.objectContaining({ params: { folio: "A-1042" } }))
  })

  it("muestra un estado traducible cuando ninguna ruta coincide", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes
          routes={routes}
          strategy="memory"
          defaultPath="/inexistente"
          labels={{ notFoundTitle: "Ruta desconocida", notFoundDescription: "Revisa la dirección." }}
        />
      </ChakraProvider>,
    )

    expect(screen.getByText("Ruta desconocida")).toBeInTheDocument()
    expect(screen.getByText("Revisa la dirección.")).toBeInTheDocument()
  })

  it("sincroniza History API, basePath y navegación del navegador", () => {
    window.history.replaceState({}, "", "/suite/")
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes routes={routes} strategy="history" basePath="/suite">
          <RouterFixture />
        </Nroutes>
      </ChakraProvider>,
    )

    fireEvent.click(screen.getByRole("link", { name: "Abrir comprobante" }))
    expect(window.location.pathname).toBe("/suite/comprobantes/A-1042")

    act(() => {
      window.history.replaceState({}, "", "/suite/")
      window.dispatchEvent(new PopStateEvent("popstate"))
    })
    expect(screen.getByText("Resumen principal")).toBeInTheDocument()
  })

  it("rankea rutas por especificidad y renderiza outlets anidados", () => {
    const nested: NRouteDefinition[] = [
      { id: "catch", path: "*", title: "Fallback", element: <Text>Wildcard</Text> },
      {
        id: "billing",
        path: "/facturas",
        title: "Facturas",
        element: <><Text>Layout facturas</Text><NOutlet /></>,
        children: [
          { id: "detail", path: ":folio", title: "Detalle", element: <Text>Detalle dinámico</Text> },
          { id: "new", path: "nueva", title: "Nueva", element: <Text>Nueva factura</Text> },
        ],
      },
    ]
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes routes={nested} strategy="memory" defaultPath="/facturas/nueva" />
      </ChakraProvider>,
    )
    expect(screen.getByText("Layout facturas")).toBeInTheDocument()
    expect(screen.getByText("Nueva factura")).toBeInTheDocument()
    expect(screen.queryByText("Detalle dinámico")).not.toBeInTheDocument()
    expect(matchRoute([{ id: "wild", path: "*", title: "Wildcard", element: null }, { id: "root", path: "/", title: "Raíz", element: null }], "/")?.route.id).toBe("root")
  })

  it("combina parámetros y wildcard a través de tres niveles", () => {
    function ParamsProbe() {
      const { match } = useNroutes()
      return <Text>{`${match?.params.tenant}|${match?.params.folio}|${match?.params["*"]}`}</Text>
    }
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes
          strategy="memory"
          defaultPath="/acme/facturas/A-1/anexos/xml/original"
          routes={[{
            id: "tenant",
            path: "/:tenant",
            title: "Tenant",
            element: <NOutlet />,
            children: [{
              id: "invoice",
              path: "facturas/:folio",
              title: "Factura",
              element: <NOutlet />,
              children: [{ id: "attachment", path: "anexos/*", title: "Anexo", element: <ParamsProbe /> }],
            }],
          }]}
        />
      </ChakraProvider>,
    )
    expect(screen.getByText("acme|A-1|xml/original")).toBeInTheDocument()
  })

  it("conserva search y hash y permite actualizar parámetros", () => {
    function SearchFixture() {
      const location = useNLocation()
      const [params, setParams] = useNSearchParams()
      return <><Text>{`${location.pathname}|${params.get("estado")}|${params.get("pagina") ?? "-"}|${location.hash}`}</Text><button onClick={() => setParams({ pagina: 2 }, { mode: "merge" })}>Paginar</button></>
    }
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes routes={routes} strategy="memory" defaultPath="/?estado=pendiente#tabla"><SearchFixture /></Nroutes>
      </ChakraProvider>,
    )
    expect(screen.getByText("/|pendiente|-|#tabla")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Paginar" }))
    expect(screen.getByText("/|pendiente|2|#tabla")).toBeInTheDocument()
  })

  it("sincroniza query y hash internos con la estrategia hash", () => {
    window.history.replaceState({}, "", "/#/comprobantes/A-1042?tab=pagos#detalle")
    function HashProbe() {
      const { location } = useNroutes()
      return <Text>{`${location.pathname}${location.search}${location.hash}`}</Text>
    }
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes routes={routes} strategy="hash"><HashProbe /></Nroutes>
      </ChakraProvider>,
    )
    expect(screen.getByText("/comprobantes/A-1042?tab=pagos#detalle")).toBeInTheDocument()
    act(() => {
      window.history.replaceState({}, "", "/#/")
      window.dispatchEvent(new HashChangeEvent("hashchange"))
    })
    expect(screen.getByText("/")).toBeInTheDocument()
  })

  it("bloquea deep links sin permiso", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NPermissionsProvider permissions={["core:ver"]}>
          <Nroutes
            routes={[{ id: "treasury", path: "/tesoreria", title: "Tesorería", requiredPermission: "tesoreria:ver", element: <Text>Datos sensibles</Text> }]}
            strategy="memory"
            defaultPath="/tesoreria"
          />
        </NPermissionsProvider>
      </ChakraProvider>,
    )
    expect(screen.getByText("Acceso restringido")).toBeInTheDocument()
    expect(screen.queryByText("Datos sensibles")).not.toBeInTheDocument()
  })

  it("ejecuta guards, redirects y loaders antes de mostrar el contenido", async () => {
    function LoadedInvoice() {
      const data = useNLoaderData<{ folio: string }>()
      return <Text>Loader {data?.folio}</Text>
    }
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes
          routes={[
            { id: "home", path: "/", title: "Inicio", element: <Text>Inicio redirigido</Text> },
            { id: "legacy", path: "/anterior", title: "Anterior", element: <Text>Anterior</Text>, beforeEnter: () => redirect("/") },
            { id: "invoice", path: "/factura/:folio", title: "Factura", element: <LoadedInvoice />, loader: async ({ params }) => ({ folio: params.folio }) },
          ]}
          strategy="memory"
          defaultPath="/factura/A-20"
        />
      </ChakraProvider>,
    )
    expect(screen.getByText("Cargando contenido")).toBeInTheDocument()
    expect(await screen.findByText("Loader A-20")).toBeInTheDocument()
  })

  it("procesa redirects de guards sin renderizar la ruta de origen", async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes
          routes={[
            { id: "home", path: "/", title: "Inicio", element: <Text>Destino seguro</Text> },
            { id: "legacy", path: "/anterior", title: "Anterior", element: <Text>No debe aparecer</Text>, beforeEnter: () => redirect("/") },
          ]}
          strategy="memory"
          defaultPath="/anterior"
        />
      </ChakraProvider>,
    )
    expect(await screen.findByText("Destino seguro")).toBeInTheDocument()
    expect(screen.queryByText("No debe aparecer")).not.toBeInTheDocument()
  })

  it("descarta respuestas obsoletas cuando una navegación más nueva termina primero", async () => {
    const resolvers = new Map<string, (value: string) => void>()
    const signals = new Map<string, AbortSignal>()
    function DataView() {
      return <Text>Resultado {useNLoaderData<string>()}</Text>
    }
    function RaceNavigation() {
      const { navigate } = useNroutes()
      return <><button onClick={() => navigate("/dato/a")}>Abrir A</button><button onClick={() => navigate("/dato/b")}>Abrir B</button><NRouteOutlet /></>
    }
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes
          routes={[
            { id: "home", path: "/", title: "Inicio", element: <Text>Inicio</Text> },
            {
              id: "data",
              path: "/dato/:id",
              title: "Dato",
              element: <DataView />,
              loader: ({ params, signal }) => new Promise<string>((resolve) => {
                signals.set(params.id!, signal)
                resolvers.set(params.id!, resolve)
              }),
            },
          ]}
          strategy="memory"
        >
          <RaceNavigation />
        </Nroutes>
      </ChakraProvider>,
    )
    fireEvent.click(screen.getByRole("button", { name: "Abrir A" }))
    await waitFor(() => expect(resolvers.has("a")).toBe(true))
    fireEvent.click(screen.getByRole("button", { name: "Abrir B" }))
    await waitFor(() => expect(resolvers.has("b")).toBe(true))
    expect(signals.get("a")?.aborted).toBe(true)
    await act(async () => resolvers.get("b")?.("B"))
    expect(await screen.findByText("Resultado B")).toBeInTheDocument()
    await act(async () => resolvers.get("a")?.("A"))
    expect(screen.getByText("Resultado B")).toBeInTheDocument()
    expect(screen.queryByText("Resultado A")).not.toBeInTheDocument()
  })

  it("usa el boundary más cercano para errores de loader", async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes
          routes={[{
            id: "parent",
            path: "/protegida",
            title: "Protegida",
            element: <NOutlet />,
            errorElement: (error) => <Text>Error controlado: {String(error)}</Text>,
            children: [{ id: "child", path: "detalle", title: "Detalle", element: <Text>No visible</Text>, loader: () => { throw new Error("falló loader") } }],
          }]}
          strategy="memory"
          defaultPath="/protegida/detalle"
        />
      </ChakraProvider>,
    )
    expect(await screen.findByText(/Error controlado: Error: falló loader/)).toBeInTheDocument()
    expect(screen.queryByText("No visible")).not.toBeInTheDocument()
  })

  it("ofrece NLink con prefetch por intención y adaptador de router externo", async () => {
    const navigate = vi.fn()
    const prefetch = vi.fn()
    const preload = vi.fn()
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes
          routes={[{ id: "home", path: "/", title: "Inicio", element: <NLink to="/reportes" prefetch="intent">Reportes</NLink> }, { id: "reports", path: "/reportes", title: "Reportes", element: <Text>Reportes</Text>, preload }]}
          router={{ location: "/", navigate, prefetch, createHref: (to) => `/app${to}` }}
        />
      </ChakraProvider>,
    )
    const link = screen.getByRole("link", { name: "Reportes" })
    expect(link).toHaveAttribute("href", "/app/reportes")
    fireEvent.focus(link)
    await waitFor(() => expect(preload).toHaveBeenCalled())
    expect(prefetch).toHaveBeenCalledWith("/reportes")
    fireEvent.click(link)
    expect(navigate).toHaveBeenCalledWith("/reportes", expect.objectContaining({ replace: undefined }))
  })

  it("conserva modificadores, target, download y enlaces externos como navegación nativa", () => {
    const onPathChange = vi.fn()
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes routes={routes} strategy="memory" onPathChange={onPathChange}>
          <NLink to="/comprobantes/A-1">Interno</NLink>
          <NLink to="/comprobantes/A-2" target="_blank">Nueva pestaña</NLink>
          <NLink to="/comprobantes/A-3" download>Descargar</NLink>
          <NLink to="https://example.com/report">Externo</NLink>
        </Nroutes>
      </ChakraProvider>,
    )
    fireEvent.click(screen.getByRole("link", { name: "Interno" }), { ctrlKey: true })
    fireEvent.click(screen.getByRole("link", { name: "Nueva pestaña" }))
    fireEvent.click(screen.getByRole("link", { name: "Descargar" }))
    fireEvent.click(screen.getByRole("link", { name: "Externo" }))
    expect(onPathChange).not.toHaveBeenCalled()
    expect(screen.getByRole("link", { name: "Externo" })).toHaveAttribute("href", "https://example.com/report")
  })

  it("restablece el scroll después de una navegación terminada", async () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined)
    function ScrollFixture() {
      const { navigate } = useNroutes()
      return <button onClick={() => navigate("/comprobantes/A-9")}>Navegar</button>
    }
    render(
      <ChakraProvider value={defaultSystem}>
        <Nroutes routes={routes} strategy="memory" scrollRestoration="top"><ScrollFixture /></Nroutes>
      </ChakraProvider>,
    )
    fireEvent.click(screen.getByRole("button", { name: "Navegar" }))
    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(0, 0))
    scrollTo.mockRestore()
  })
})
