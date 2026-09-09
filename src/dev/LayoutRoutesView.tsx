import { Box, Button, Card, HStack, Stack, Text } from "@chakra-ui/react"
import { FileText, LayoutDashboard, MoveUpRight } from "lucide-react"

import { NRouteOutlet, Nlayout, Nroutes, useNroutes, type NlayoutRoute } from "../index"
import { ComponentDocs } from "./ComponentDocs"

const previewRoutes: NlayoutRoute[] = [
  {
    id: "preview-home",
    path: "/",
    title: "Resumen",
    navigationId: "preview-home",
    pageHeader: { subtitle: "Indicadores esenciales del espacio." },
    element: <Card.Root variant="subtle"><Card.Body><Text>Contenido del resumen</Text></Card.Body></Card.Root>,
  },
  {
    id: "preview-documents",
    path: "/documentos",
    title: "Documentos",
    navigationId: "preview-documents",
    pageHeader: { subtitle: "Consulta centralizada de documentos." },
    element: <Card.Root variant="subtle"><Card.Body><Text>Contenido de documentos</Text></Card.Body></Card.Root>,
  },
]

const previewNavigation = [
  { id: "preview-home", label: "Resumen", href: "/", icon: <LayoutDashboard size={17} /> },
  { id: "preview-documents", label: "Documentos", href: "/documentos", icon: <FileText size={17} /> },
]

function RoutesOnlyControls() {
  const { createLinkProps } = useNroutes()
  return (
    <Stack gap="4">
      <HStack>
        <Button asChild size="sm" variant="outline"><a {...createLinkProps("/resumen")}>Resumen</a></Button>
        <Button asChild size="sm" variant="outline"><a {...createLinkProps("/actividad")}>Actividad</a></Button>
      </HStack>
      <NRouteOutlet />
    </Stack>
  )
}

export function LayoutRoutesView() {
  return (
    <Stack gap="8">
      <Stack gap="2" maxW="3xl">
        <Text color="colorPalette.fg" fontWeight="semibold" fontSize="sm" letterSpacing="wide" textTransform="uppercase">Arquitectura de aplicación</Text>
        <Text as="h1" fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" lineHeight="shorter">Nlayout + Nroutes</Text>
        <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }}>Una composición lista para producto que conserva navegación, contexto y tema mientras cada ruta cambia sin recargar la página.</Text>
      </Stack>

      <Card.Root variant="outline" bg="bg.panel">
        <Card.Body gap="4">
          <Text fontWeight="semibold">Ejemplo completo: NFacture</Text>
          <Text color="fg.muted">Abre la aplicación independiente para revisar el sidebar, header, breadcrumbs, selector de tema y todas las rutas fiscales a escala real.</Text>
          <Button asChild alignSelf="start" colorPalette="blue">
            <a href="/nfacture.html" target="_blank" rel="noreferrer">Abrir demostración completa <MoveUpRight aria-hidden="true" size={17} /></a>
          </Button>
        </Card.Body>
      </Card.Root>

      <ComponentDocs
        purpose="Nlayout integra NAppShell, NSidebar, NHeader, NPageHeader, NBreadcrumbs y NThemeProvider. Nroutes administra History API, hash o memoria, intercepta enlaces internos y conserva la experiencia SPA."
        steps={[
          "Declara rutas estables con path, title, navigationId y element.",
          "Entrega a Nlayout el árbol de NSidebar y configura sus superficies mediante props.",
          "Usa history en producción con fallback del servidor, hash en hosting estático o memory para previews.",
          "Deja que NRouteOutlet anuncie, enfoque y anime el contenido; reduced motion elimina la transición.",
        ]}
        variants={[
          { name: "Nlayout", description: "Composición completa con navegación, encabezados, tema y outlet." },
          { name: "Nroutes", description: "Administrador desacoplado para aplicaciones con un layout propio." },
          { name: "history | hash | memory", description: "Estrategias para servidor, hosting estático y entornos contenidos." },
        ]}
        variantExamples={[
          {
            id: "layout",
            label: "Layout completo",
            summary: "Nlayout + memory",
            preview: (
              <Box borderWidth="1px" borderColor="border" rounded="xl" overflow="hidden">
                <Nlayout
                  provideTheme={false}
                  routes={previewRoutes}
                  navigation={previewNavigation}
                  routeStrategy="memory"
                  shellProps={{ minHeight: "26rem", contentPadding: "compact" }}
                  sidebarProps={{ collapsible: false, showMobileTrigger: false, expandedWidth: "12rem" }}
                  headerProps={{ showThemeToggle: true }}
                />
              </Box>
            ),
            code: `<Nlayout\n  routes={routes}\n  navigation={navigation}\n  routeStrategy="history"\n/>`,
          },
          {
            id: "routes",
            label: "Router aislado",
            summary: "Nroutes + NRouteOutlet",
            preview: (
              <Nroutes
                strategy="memory"
                defaultPath="/resumen"
                routes={[
                  { id: "summary", path: "/resumen", title: "Resumen", element: <Text>Vista de resumen</Text> },
                  { id: "activity", path: "/actividad", title: "Actividad", element: <Text>Vista de actividad</Text> },
                ]}
              >
                <RoutesOnlyControls />
              </Nroutes>
            ),
            code: `<Nroutes routes={routes}>\n  <Navigation />\n  <NRouteOutlet />\n</Nroutes>`,
          },
        ]}
        propExamples={[
          { label: "Ruta con parámetros", code: `{ id: "invoice", path: "/facturas/:folio", title: "Factura", element: ({ params }) => <Invoice folio={params.folio} /> }` },
          { label: "Provider existente", code: `<NThemeProvider>\n  <Nlayout provideTheme={false} routes={routes} navigation={items} />\n</NThemeProvider>` },
        ]}
        code={`import { Nlayout, type NlayoutRoute } from "nissi-ui/layout"\n\nconst routes: NlayoutRoute[] = [\n  { id: "home", path: "/", title: "Resumen", navigationId: "home", element: <Dashboard /> },\n]\n\n<Nlayout routes={routes} navigation={items} />`}
      />
    </Stack>
  )
}
