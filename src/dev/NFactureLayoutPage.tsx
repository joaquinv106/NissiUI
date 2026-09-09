import { Badge, Box, Button, HStack, Image, Stack, Text } from "@chakra-ui/react"
import { FilePlus2, HelpCircle, LogOut, Settings, ShieldCheck } from "lucide-react"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import nissiMarkUrl from "../../docs/assets/nissi-mark.png"
import {
  NFacture,
  NPermissionsProvider,
  NissiInvoicingProvider,
  Nlayout,
  createNFactureNavigation,
  defaultNFactureLabels,
  useNroutes,
  type NFactureNavigationData,
  type NFactureView,
  type NlayoutRoute,
} from "../index"
import { demoFactureAdapter, demoFactureData } from "./FactureProjectView"

const routePath = (view: NFactureView) => `/facturacion/${view}`
const routeHref = (view: NFactureView) => `#${routePath(view)}`

const viewDescriptions: Record<NFactureView, string> = {
  dashboard: "Una lectura clara del estado fiscal y los comprobantes recientes.",
  issue: "Captura receptor, conceptos e impuestos antes de solicitar el timbrado.",
  history: "Consulta, revisa y recupera los comprobantes de tu organización.",
  ticket: "Convierte una venta existente en CFDI sin duplicar la operación.",
  certificates: "Administra la vigencia del CSD y el perfil fiscal de forma segura.",
  catalogs: "Mantén productos y servicios alineados con las claves vigentes del SAT.",
  integrations: "Conecta PAC, API y webhooks desde una superficie controlada.",
  docs: "Consulta el contrato de integración, seguridad y navegación del módulo.",
}

const viewTitles: Record<NFactureView, string> = {
  dashboard: defaultNFactureLabels.dashboard,
  issue: defaultNFactureLabels.issue,
  history: defaultNFactureLabels.history,
  ticket: defaultNFactureLabels.ticket,
  certificates: defaultNFactureLabels.certificates,
  catalogs: defaultNFactureLabels.catalogs,
  integrations: defaultNFactureLabels.integrations,
  docs: defaultNFactureLabels.documentation,
}

function FactureContent({ view }: { view: NFactureView }) {
  const { navigate } = useNroutes<NFactureNavigationData>()
  return (
    <NissiInvoicingProvider data={demoFactureData} adapter={demoFactureAdapter}>
      <NFacture
        role="admin"
        view={view}
        onViewChange={(nextView) => navigate(routePath(nextView))}
        showNavigation={false}
        showHeader={false}
        contentMaxHeight="calc(100dvh - 15rem)"
      />
    </NissiInvoicingProvider>
  )
}

const factureViews = Object.keys(viewTitles) as NFactureView[]
const routes: NlayoutRoute<NFactureNavigationData>[] = factureViews.map((view) => ({
  id: `nfacture-${view}`,
  path: routePath(view),
  title: viewTitles[view],
  navigationId: `facture-${view}`,
  data: { view },
  pageHeader: {
    eyebrow: "NFacture · CFDI 4.0",
    subtitle: viewDescriptions[view],
    breadcrumbs: [
      { id: "workspace", label: "Nissi Suite", href: routeHref("dashboard") },
      { id: "facture", label: "Facturación", href: routeHref("dashboard") },
      { id: view, label: viewTitles[view], current: true },
    ],
    actions: view === "issue" ? undefined : (
      <Button asChild colorPalette="blue" size="sm">
        <a href={routeHref("issue")}><FilePlus2 aria-hidden="true" size={17} />Emitir CFDI</a>
      </Button>
    ),
  },
  element: <FactureContent view={view} />,
}))

const navigation = createNFactureNavigation({ basePath: "#/facturacion", role: "admin" })

function NFactureBrand() {
  return (
    <HStack minW="0" gap="2.5">
      <Image src={nissiMarkUrl} alt="" boxSize="9" objectFit="contain" flexShrink="0" />
      <Box minW="0" display={{ base: "none", sm: "block" }}>
        <Text fontWeight="bold" lineHeight="short" truncate>NFacture</Text>
        <Text color="fg.muted" fontSize="xs" truncate>Facturación electrónica</Text>
      </Box>
    </HStack>
  )
}

export function NFactureLayoutPage() {
  return (
    <NPermissionsProvider permissions={["facture:*"]}>
      <Nlayout<NFactureNavigationData>
        routes={routes}
        navigation={navigation}
        routeStrategy="hash"
        defaultPath={routePath("dashboard")}
        brand={<NFactureBrand />}
        themeProviderProps={{ defaultTheme: "nissi", storageKey: "nissi-ui-nfacture-theme" }}
        shellProps={{ contentMaxWidth: "full", contentPadding: "compact" }}
        sidebarProps={{
          searchable: true,
          variant: "plain",
          expandedWidth: "18.5rem",
          labels: { navigationLabel: "Navegación de NFacture" },
        }}
        sidebarFooter={(
          <Stack gap="2" px="2">
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="medium">Entorno fiscal</Text>
              <Badge colorPalette="orange" variant="subtle">Sandbox</Badge>
            </HStack>
            <Text color="fg.muted" fontSize="xs">Datos demostrativos · Sin operaciones reales</Text>
          </Stack>
        )}
        headerProps={{
          themePresentation: "icon",
          actions: [
            { id: "help", label: "Centro de ayuda", icon: <HelpCircle size={18} />, presentation: "icon" },
            { id: "settings", label: "Configuración", icon: <Settings size={18} />, presentation: "icon" },
          ],
          notifications: [
            { id: "certificate", title: "CSD vigente", description: "El certificado demo vence en marzo de 2028.", unread: true },
          ],
          user: {
            name: "Joaquín Villegas",
            role: "Administrador",
            avatarFallback: "JV",
            actions: [
              { id: "security", label: "Seguridad", icon: <ShieldCheck size={17} /> },
              { id: "logout", label: "Cerrar sesión", icon: <LogOut size={17} /> },
            ],
          },
          labels: { notifications: "Notificaciones de NFacture" },
        }}
        routeLabels={{ loading: "Cargando módulo fiscal" }}
        styles={{ content: { minWidth: 0 }, pageHeader: { maxWidth: "80rem" } }}
      />
    </NPermissionsProvider>
  )
}

const root = document.getElementById("root")
if (root) {
  createRoot(root).render(
    <StrictMode>
      <NFactureLayoutPage />
    </StrictMode>,
  )
}
