import {
  Badge,
  Box,
  Button,
  Card,
  Code,
  Flex,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import {
  BarChart3,
  Bell,
  Blocks,
  Building2,
  Check,
  CircleDollarSign,
  ClipboardList,
  Database,
  Home,
  Layers3,
  LayoutDashboard,
  LogOut,
  Moon,
  PanelLeft,
  PanelTop,
  PackageCheck,
  Settings,
  ShieldCheck,
  Sparkles,
  TableProperties,
  Users,
} from "lucide-react"
import { useTheme } from "next-themes"
import { StrictMode, useState } from "react"
import { createRoot } from "react-dom/client"

import { NAppShell, NDataTable, NForm, NHeader, NModuleRegistry, NPermissionGate, NPermissionsProvider, NSidebar, NTable, NWorkspaceSwitcher, type NFormConfig, type NModuleDefinition, type NSidebarItem, type NTableConfig, type NWorkspace } from "../index"
import { ComponentDocs } from "./ComponentDocs"
import { DemoProvider } from "./provider"

type Product = {
  id: number
  product: string
  category: string
  price: number
  stock: number
  active: boolean
}

type Employee = {
  id: number
  avatar: string
  name: string
  email: string
  department: string
  role: string
  salary: number
  hiredAt: string
  status: string
}

const productConfig: NTableConfig<Product> = {
  headers: [
    { key: "id", header: "ID", type: "number", group: "Producto", width: "16" },
    { key: "product", header: "Producto", group: "Producto" },
    { key: "category", header: "Categoría", presentation: "badge", group: "Clasificación" },
    { key: "price", header: "Precio", type: "currency", currency: "MXN", align: "end", group: "Inventario" },
    { key: "stock", header: "Existencias", type: "number", align: "end", group: "Inventario" },
    { key: "active", header: "Activo", type: "boolean", group: "Estado" },
  ],
  data: [
    { id: 1, product: "Teclado mecánico", category: "Accesorios", price: 1899, stock: 14, active: true },
    { id: 2, product: "Monitor 27 pulgadas", category: "Pantallas", price: 6299, stock: 8, active: true },
    { id: 3, product: "Mouse inalámbrico", category: "Accesorios", price: 749, stock: 31, active: true },
    { id: 4, product: "Base para laptop", category: "Oficina", price: 1099, stock: 17, active: true },
    { id: 5, product: "Webcam Full HD", category: "Video", price: 1349, stock: 11, active: false },
    { id: 6, product: "Audífonos USB", category: "Audio", price: 1599, stock: 22, active: true },
    { id: 7, product: "Hub USB-C", category: "Conectividad", price: 999, stock: 19, active: true },
    { id: 8, product: "Micrófono condensador", category: "Audio", price: 2199, stock: 6, active: false },
    { id: 9, product: "Lámpara de escritorio", category: "Oficina", price: 829, stock: 25, active: true },
    { id: 10, product: "Disco SSD 1 TB", category: "Almacenamiento", price: 1799, stock: 13, active: true },
  ],
}

const employeeConfig: NTableConfig<Employee> = {
  headers: [
    { key: "avatar", header: "Persona", presentation: "avatar", avatarNameKey: "name", editable: false, sortable: false },
    { key: "email", header: "Correo", type: "email" },
    {
      key: "department",
      header: "Departamento",
      type: "select",
      options: ["Diseño", "Ingeniería", "Producto", "Ventas"].map((value) => ({ label: value, value })),
    },
    { key: "role", header: "Puesto" },
    { key: "salary", header: "Salario", type: "currency", currency: "MXN", align: "end" },
    { key: "hiredAt", header: "Ingreso", type: "date" },
    { key: "status", header: "Estado", presentation: "badge" },
  ],
  data: [
    { id: 1, avatar: "https://i.pravatar.cc/80?img=1", name: "Ana Torres", email: "ana@nissi.mx", department: "Diseño", role: "Product Designer", salary: 42000, hiredAt: "2023-02-14", status: "Activo" },
    { id: 2, avatar: "https://i.pravatar.cc/80?img=2", name: "Bruno Díaz", email: "bruno@nissi.mx", department: "Ingeniería", role: "Frontend Engineer", salary: 51000, hiredAt: "2022-08-01", status: "Activo" },
    { id: 3, avatar: "https://i.pravatar.cc/80?img=3", name: "Carla Ruiz", email: "carla@nissi.mx", department: "Producto", role: "Product Manager", salary: 56000, hiredAt: "2021-11-18", status: "Activo" },
    { id: 4, avatar: "https://i.pravatar.cc/80?img=4", name: "Diego León", email: "diego@nissi.mx", department: "Ventas", role: "Account Executive", salary: 38500, hiredAt: "2024-01-08", status: "Activo" },
    { id: 5, avatar: "https://i.pravatar.cc/80?img=5", name: "Elena Soto", email: "elena@nissi.mx", department: "Ingeniería", role: "Backend Engineer", salary: 53000, hiredAt: "2022-05-23", status: "Vacaciones" },
    { id: 6, avatar: "https://i.pravatar.cc/80?img=6", name: "Fernando Paz", email: "fernando@nissi.mx", department: "Diseño", role: "UX Researcher", salary: 41000, hiredAt: "2023-07-10", status: "Activo" },
    { id: 7, avatar: "https://i.pravatar.cc/80?img=7", name: "Gabriela Mora", email: "gabriela@nissi.mx", department: "Ventas", role: "Sales Manager", salary: 59000, hiredAt: "2020-09-30", status: "Activo" },
    { id: 8, avatar: "https://i.pravatar.cc/80?img=8", name: "Hugo Flores", email: "hugo@nissi.mx", department: "Ingeniería", role: "QA Engineer", salary: 44500, hiredAt: "2023-10-02", status: "Inactivo" },
    { id: 9, avatar: "https://i.pravatar.cc/80?img=9", name: "Isabel Cruz", email: "isabel@nissi.mx", department: "Producto", role: "Data Analyst", salary: 47500, hiredAt: "2022-12-12", status: "Activo" },
    { id: 10, avatar: "https://i.pravatar.cc/80?img=10", name: "Jorge Luna", email: "jorge@nissi.mx", department: "Ingeniería", role: "DevOps Engineer", salary: 57500, hiredAt: "2021-04-19", status: "Activo" },
  ],
}

type EmployeeFormValues = {
  name: string
  email: string
  department: string
  role: string
  salary: number
  active: boolean
  bio: string
}

const employeeFormConfig: NFormConfig<EmployeeFormValues> = {
  sections: [
    { id: "personal", title: "Datos personales", columns: 2 },
    { id: "job", title: "Información laboral", columns: 2 },
  ],
  fields: [
    { key: "name", label: "Nombre completo", section: "personal", validation: { required: true, minLength: 3 } },
    { key: "email", label: "Correo", type: "email", section: "personal", validation: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMessage: "Ingresa un correo válido." } },
    {
      key: "department",
      label: "Departamento",
      type: "select",
      section: "job",
      options: ["Diseño", "Ingeniería", "Producto", "Ventas"].map((value) => ({ label: value, value })),
      validation: { required: true },
    },
    { key: "role", label: "Puesto", section: "job", validation: { required: true } },
    { key: "salary", label: "Salario", type: "currency", section: "job", validation: { required: true, min: 0 } },
    { key: "active", label: "Activo", type: "switch", section: "job" },
    { key: "bio", label: "Notas", type: "textarea", helperText: "Opcional: contexto adicional del colaborador.", colSpan: "full" },
  ],
}


type DemoView = "overview" | "app-shell" | "modules" | "workspaces" | "header" | "sidebar" | "table" | "datatable" | "form" | "permissions"
type DemoNavigationData = { view?: DemoView }

const catalogNavigation: NSidebarItem<DemoNavigationData>[] = [
  { id: "overview", label: "Inicio", icon: <Home size={18} />, data: { view: "overview" } },
  {
    id: "components",
    label: "Componentes",
    icon: <Blocks size={18} />,
    children: [
      { id: "app-shell", label: "NAppShell", icon: <LayoutDashboard size={17} />, badge: "Nuevo", data: { view: "app-shell" } },
      { id: "modules", label: "NModuleRegistry", icon: <Blocks size={17} />, badge: "Nuevo", data: { view: "modules" } },
      { id: "workspaces", label: "NWorkspaceSwitcher", icon: <Building2 size={17} />, badge: "Nuevo", data: { view: "workspaces" } },
      { id: "header", label: "NHeader", icon: <PanelTop size={17} />, badge: "Nuevo", data: { view: "header" } },
      { id: "sidebar", label: "NSidebar", icon: <PanelLeft size={17} />, badge: "Nuevo", data: { view: "sidebar" } },
      { id: "table", label: "NTable", icon: <TableProperties size={17} />, data: { view: "table" } },
      { id: "datatable", label: "NDataTable", icon: <Database size={17} />, data: { view: "datatable" } },
      { id: "form", label: "NForm", icon: <ClipboardList size={17} />, badge: "Nuevo", data: { view: "form" } },
      { id: "permissions", label: "NPermissionGate", icon: <ShieldCheck size={17} />, badge: "Nuevo", data: { view: "permissions" } },
    ],
  },
  {
    id: "project",
    label: "Proyecto",
    icon: <Layers3 size={18} />,
    children: [
      { id: "accessibility", label: "Accesibilidad", icon: <Check size={17} />, disabled: true },
      { id: "roadmap", label: "Próximamente", icon: <Sparkles size={17} />, disabled: true },
    ],
  },
]

const sidebarPreviewItems: NSidebarItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
  {
    id: "workspace",
    label: "Espacio de trabajo",
    icon: <Building2 size={18} />,
    children: [
      { id: "team", label: "Equipo", icon: <Users size={17} />, badge: 12 },
      { id: "analytics", label: "Analítica", icon: <BarChart3 size={17} /> },
    ],
  },
  { id: "notifications", label: "Notificaciones", icon: <Bell size={18} />, badge: 4 },
  { id: "settings", label: "Configuración", icon: <Settings size={18} /> },
]

type DemoModuleData = { route: string }
const platformModules: NModuleDefinition<DemoModuleData>[] = [
  { id: "operations", label: "Operaciones", description: "Pedidos, inventario y entregas", icon: <PackageCheck size={20} />, requiredPermission: "operations:use", data: { route: "/operations" } },
  { id: "customers", label: "Clientes", description: "CRM, cuentas y seguimiento", icon: <Users size={20} />, requiredPermission: "customers:use", badge: <Badge colorPalette="green">Activo</Badge>, data: { route: "/customers" } },
  { id: "analytics", label: "Analítica", description: "Indicadores y reportes ejecutivos", icon: <BarChart3 size={20} />, purchased: false, data: { route: "/analytics" } },
  { id: "billing", label: "Facturación", description: "CFDI, cobros y conciliación", icon: <CircleDollarSign size={20} />, requiredPermission: "billing:use", data: { route: "/billing" } },
]

const demoWorkspaces: NWorkspace[] = [
  { id: "acme", name: "Grupo Acme", description: "Organización principal", badge: "3 sedes" },
  { id: "north", name: "Sucursal Norte", description: "Monterrey" },
  { id: "center", name: "Sucursal Centro", description: "Ciudad de México" },
]

const viewTitles: Record<DemoView, string> = {
  overview: "Nissi UI",
  "app-shell": "NAppShell",
  modules: "NModuleRegistry",
  workspaces: "NWorkspaceSwitcher",
  header: "NHeader",
  sidebar: "NSidebar",
  table: "NTable",
  datatable: "NDataTable",
  form: "NForm",
  permissions: "NPermissionGate",
}

/** Encabezado repetido en cada vista del catálogo: eyebrow, título y descripción. */
function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <Stack gap="2" maxW="3xl">
      <Text color="colorPalette.fg" fontWeight="semibold" fontSize="sm" letterSpacing="wide" textTransform="uppercase">
        {eyebrow}
      </Text>
      <Heading as="h1" size={{ base: "3xl", md: "4xl" }}>{title}</Heading>
      <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }}>{description}</Text>
    </Stack>
  )
}

/** Wordmark compuesto con texto HTML: nítido, traducible y reutilizable sobre ambos temas. */
function NissiBrand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <HStack gap="2.5" minW="0" whiteSpace="nowrap" color={inverse ? "white" : undefined}>
      <Image src="/brand/nissi-mark.png" alt="" boxSize={compact ? "8" : "10"} objectFit="contain" flexShrink="0" />
      {!compact ? (
        <Box minW="0">
          <Text fontWeight="bold" lineHeight="short">Nissi UI</Text>
          <Text color={inverse ? "whiteAlpha.700" : "fg.muted"} fontSize="xs">React UI for modular products</Text>
        </Box>
      ) : null}
    </HStack>
  )
}

/** Atmósfera visual exclusiva de la landing; nunca alcanza los componentes públicos. */
function LandingCrystalAtmosphere() {
  const crystalAnimation = {
    animation: "landingCrystalFloat 7s ease-in-out infinite",
    "@keyframes landingCrystalFloat": {
      "0%, 100%": { transform: "translate3d(0, 0, 0) rotate(var(--crystal-rotation))" },
      "50%": { transform: "translate3d(0, -10px, 0) rotate(var(--crystal-rotation))" },
    },
    "@media (prefers-reduced-motion: reduce)": { animation: "none" },
  }

  return (
    <Box aria-hidden="true" position="absolute" inset="0" overflow="hidden" pointerEvents="none" zIndex="0">
      <Box
        position="absolute"
        inset="0"
        opacity="0.42"
        _dark={{ opacity: "0.72" }}
        backgroundImage="linear-gradient(rgba(37, 99, 235, 0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.09) 1px, transparent 1px)"
        backgroundSize={{ base: "28px 28px", md: "40px 40px" }}
        maskImage="linear-gradient(to bottom, black 0%, transparent 72%)"
      />
      <Box
        position="absolute"
        top={{ base: "-5rem", md: "-9rem" }}
        insetInlineStart={{ base: "-8rem", md: "8%" }}
        width={{ base: "22rem", md: "36rem" }}
        height={{ base: "18rem", md: "28rem" }}
        rounded="full"
        bg="blue.400"
        opacity="0.12"
        _dark={{ opacity: "0.2" }}
        filter="blur(80px)"
      />
      <Box
        position="absolute"
        top="2rem"
        insetInlineEnd={{ base: "-9rem", md: "2%" }}
        width={{ base: "20rem", md: "32rem" }}
        height={{ base: "18rem", md: "26rem" }}
        rounded="full"
        bg="purple.500"
        opacity="0.1"
        _dark={{ opacity: "0.2" }}
        filter="blur(92px)"
      />
      {[
        { top: "1.5rem", insetInlineStart: "7%", size: "3rem", rotation: "18deg", delay: "-1s" },
        { top: "8rem", insetInlineEnd: "4%", size: "2.2rem", rotation: "-14deg", delay: "-4s" },
        { top: "31rem", insetInlineStart: "2%", size: "1.6rem", rotation: "35deg", delay: "-2.5s" },
      ].map((crystal, index) => (
        <Box
          key={index}
          position="absolute"
          top={crystal.top}
          insetInlineStart={crystal.insetInlineStart}
          insetInlineEnd={crystal.insetInlineEnd}
          width={crystal.size}
          height={crystal.size}
          display={{ base: index === 2 ? "none" : "block", md: "block" }}
          opacity="0.34"
          _dark={{ opacity: "0.58" }}
          background="linear-gradient(145deg, rgba(125, 211, 252, 0.95), rgba(37, 99, 235, 0.52) 48%, rgba(139, 92, 246, 0.84))"
          clipPath="polygon(50% 0%, 100% 38%, 68% 100%, 18% 82%, 0% 26%)"
          filter="drop-shadow(0 0 12px rgba(59, 130, 246, 0.45))"
          css={{ ...crystalAnimation, "--crystal-rotation": crystal.rotation, animationDelay: crystal.delay }}
        />
      ))}
    </Box>
  )
}

const landingCardMotion = {
  transition: "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
  _hover: { transform: "translateY(-3px)", borderColor: "colorPalette.muted", shadow: "md" },
  "@media (prefers-reduced-motion: reduce)": { transition: "none", _hover: { transform: "none" } },
} as const

/** Portada del catálogo: presentación de la librería y accesos a cada componente. */
function OverviewView({ onNavigate }: { onNavigate: (view: DemoView) => void }) {
  const features = [
    "TypeScript estricto y APIs reutilizables",
    "Tema claro y oscuro con tokens semánticos",
    "Interacciones responsive y accesibles",
  ]

  return (
    <Box position="relative" isolation="isolate" px={{ base: "4", md: "8", xl: "12" }} pb={{ base: "10", md: "14" }}>
      <LandingCrystalAtmosphere />
      <Stack position="relative" zIndex="1" gap={{ base: "10", md: "14" }}>
      <Card.Root
        variant="outline"
        overflow="hidden"
        bg="gray.950"
        backgroundImage="linear-gradient(90deg, rgba(2, 6, 23, 0.98) 0%, rgba(2, 6, 23, 0.9) 42%, rgba(2, 6, 23, 0.2) 76%), url('/brand/nissi-hero.png')"
        backgroundSize="cover"
        backgroundPosition={{ base: "62% center", md: "center" }}
        minH={{ base: "34rem", md: "36rem" }}
        boxShadow="0 28px 80px rgba(15, 23, 42, 0.28), 0 0 48px rgba(37, 99, 235, 0.1)"
      >
        <Card.Body justifyContent="center" p={{ base: "6", md: "12" }}>
          <Stack gap="6" maxW={{ base: "full", md: "55%" }} color="white">
            <NissiBrand inverse />
            <Badge alignSelf="start" bg="whiteAlpha.200" color="white" borderWidth="1px" borderColor="whiteAlpha.300">The React UI foundation for modular products</Badge>
            <Heading as="h1" size={{ base: "4xl", md: "6xl" }} lineHeight="1.05">
              Construye productos modulares. Avanza más rápido.
            </Heading>
            <Text color="whiteAlpha.800" fontSize={{ base: "lg", md: "xl" }} maxW="3xl">
              Componentes React tipados, accesibles y preparados para convertir microsistemas independientes en una experiencia coherente.
            </Text>
            <Flex gap="3" wrap="wrap">
              <Button colorPalette="blue" onClick={() => onNavigate("app-shell")}>Explorar la plataforma</Button>
              <Button variant="outline" borderColor="whiteAlpha.500" color="white" _hover={{ bg: "whiteAlpha.200" }} onClick={() => onNavigate("datatable")}>Ver componentes</Button>
            </Flex>
            <Code alignSelf="start" bg="blackAlpha.700" color="whiteAlpha.900" borderWidth="1px" borderColor="whiteAlpha.300" px="4" py="3" rounded="md" fontSize="sm">npm install nissi-ui</Code>
          </Stack>
        </Card.Body>
      </Card.Root>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
        {features.map((feature, index) => (
          <Card.Root key={feature} variant="outline" bg="bg.panel" backdropFilter="blur(16px)" {...landingCardMotion}>
            <Card.Body gap="4">
              <Flex align="center" justify="center" width="10" height="10" rounded="md" bg="colorPalette.subtle" color="colorPalette.fg">
                {[<PackageCheck key="package" size={20} />, <Moon key="theme" size={20} />, <Sparkles key="quality" size={20} />][index]}
              </Flex>
              <Heading as="h2" size="md">{feature}</Heading>
              <Text color="fg.muted" fontSize="sm">
                Diseñado como parte de una librería pública, con documentación y pruebas de interacción.
              </Text>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Stack gap="5">
        <Heading as="h2" size="2xl">Componentes disponibles</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="4">
          {([
            ["NHeader", "Barra superior para sitios y aplicaciones.", "header", <PanelTop key="header" size={20} />],
            ["NSidebar", "Navegación lateral, grupos, búsqueda y Drawer móvil.", "sidebar", <PanelLeft key="sidebar" size={20} />],
            ["NTable", "Tablas de presentación configuradas desde JSON.", "table", <TableProperties key="table" size={20} />],
            ["NDataTable", "Datos, acciones, filtros, edición y exportaciones.", "datatable", <Database key="data" size={20} />],
            ["NForm", "Formularios reactivos desde JSON, con validación y estado de envío.", "form", <ClipboardList key="form" size={20} />],
            ["NPermissionGate", "Oculta o deshabilita UI según el rol o microservicio contratado.", "permissions", <ShieldCheck key="permissions" size={20} />],
            ["NAppShell", "Compone header, sidebar, contenido y footer en una base responsive.", "app-shell", <LayoutDashboard key="shell" size={20} />],
            ["NModuleRegistry", "Presenta solamente los módulos contratados y autorizados.", "modules", <Blocks key="modules" size={20} />],
            ["NWorkspaceSwitcher", "Cambia de empresa, sucursal, tenant o proyecto activo.", "workspaces", <Building2 key="workspaces" size={20} />],
          ] as const).map(([name, description, view, icon]) => (
            <Card.Root key={name} variant="outline" bg="bg.panel" backdropFilter="blur(16px)" {...landingCardMotion}>
              <Card.Body gap="4">
                <HStack color="colorPalette.fg">{icon}<Heading as="h3" size="lg">{name}</Heading></HStack>
                <Text color="fg.muted">{description}</Text>
                <Button variant="ghost" alignSelf="start" onClick={() => onNavigate(view)}>Abrir ejemplo</Button>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>
      </Stack>
      </Stack>
    </Box>
  )
}

/** Vista de ejemplo y documentación de NHeader. */
function HeaderView() {
  const { resolvedTheme, setTheme } = useTheme()
  const theme = resolvedTheme === "dark" ? "dark" : "light"
  const brand = (
    <HStack gap="2" whiteSpace="nowrap">
      <Flex align="center" justify="center" bg="colorPalette.solid" color="colorPalette.contrast" rounded="lg" boxSize="9" fontWeight="bold">N</Flex>
      <Text fontWeight="bold">Nissi UI</Text>
    </HStack>
  )

  return (
    <Stack gap="8">
      <PageIntro
        eyebrow="Navegación superior"
        title="NHeader"
        description="Una barra superior responsive para sitios públicos y aplicaciones, preparada para convivir con NSidebar y las tablas."
      />

      <Stack gap="3">
        <Heading as="h2" size="lg">Variante site</Heading>
        <Card.Root variant="outline" overflow="hidden" bg="bg.panel">
          <NHeader
            surface="plain"
            brand={brand}
            responsive="push"
            items={[
              { id: "home", label: "Inicio" },
              { id: "products", label: "Productos", children: [{ id: "tables", label: "Tablas" }, { id: "navigation", label: "Navegación" }] },
              { id: "docs", label: "Documentación" },
            ]}
            defaultActiveItemId="home"
            actions={[{ id: "start", label: "Comenzar", icon: <Sparkles size={16} />, presentation: "button", showOnMobile: true }]}
          />
          <Box p={{ base: "6", md: "10" }} bg="bg.subtle">
            <Heading as="h3" size="2xl">Una navegación lista para publicar.</Heading>
            <Text color="fg.muted" mt="2">Reduce el ancho para probar el panel móvil dentro del flujo.</Text>
          </Box>
        </Card.Root>
      </Stack>

      <Stack gap="3">
        <Heading as="h2" size="lg">Variante app con tabla</Heading>
        <Card.Root variant="outline" overflow="hidden" bg="bg.panel">
          <NHeader
            variant="app"
            surface="plain"
            brand={brand}
            extra={<Text fontWeight="medium">Inventario / Productos</Text>}
            search
            actions={[{ id: "settings", label: "Configuración", icon: <Settings size={18} />, showOnMobile: true }]}
            notifications={[{ id: "stock", title: "Stock bajo", description: "Tres productos necesitan revisión.", unread: true }]}
            user={{ name: "Ana Torres", role: "Administradora", actions: [{ id: "logout", label: "Cerrar sesión", icon: <LogOut size={16} /> }] }}
            showThemeToggle
            theme={theme}
            onThemeChange={setTheme}
          />
          <Box p={{ base: "3", md: "6" }} bg="bg.subtle">
            <NTable card={false} config={{ ...productConfig, data: productConfig.data.slice(0, 3) }} responsive="scroll" borderWidth="1px" />
          </Box>
        </Card.Root>
      </Stack>

      <ComponentDocs
        purpose="NHeader es la barra superior de la librería: funciona como navbar de un sitio público (marca, menú, CTA) o como barra de aplicación dentro de un dashboard (título de sección, búsqueda, notificaciones, tema y usuario), compartiendo tokens y alturas con NSidebar para verse en armonía."
        steps={[
          "Instala el paquete e importa NHeader desde \"nissi-ui\".",
          "Elige variant=\"site\" para landing/marketing o variant=\"app\" para el layout de un dashboard.",
          "Pasa brand, items (navegación), search, actions, notifications y user según lo que necesite tu sitio o microservicio.",
          "Si convive con NSidebar, usa sticky y deja que ambos compartan colorPalette para mantener la misma paleta.",
          "Traduce los textos con la prop labels si tu proyecto no usa español como idioma principal.",
        ]}
        variants={[
          { name: "variant=\"site\"", description: "Prioriza marca, navegación con dropdowns y un CTA principal." },
          { name: "variant=\"app\"", description: "Prioriza contexto (extra), búsqueda, acciones, notificaciones, tema y usuario." },
          { name: "responsive=\"overlay\" | \"push\" | \"hidden\"", description: "Controla cómo se comporta la navegación en móvil: Drawer, en flujo, u oculta." },
          { name: "surface=\"outline\" | \"elevated\" | \"plain\"", description: "Define el borde/sombra de la barra para adaptarse al layout que la envuelve." },
        ]}
        variantExamples={[
          {
            id: "site",
            label: "Site",
            summary: "variant=\"site\"",
            preview: (
              <NHeader
                surface="outline"
                brand={brand}
                responsive="push"
                items={[{ id: "home", label: "Inicio" }, { id: "docs", label: "Documentación" }]}
                defaultActiveItemId="home"
                actions={[{ id: "start", label: "Comenzar", presentation: "button" }]}
              />
            ),
            code: `<NHeader
  variant="site"
  brand={<Logo />}
  items={[{ id: "home", label: "Inicio" }, { id: "docs", label: "Documentación" }]}
  actions={[{ id: "start", label: "Comenzar", presentation: "button" }]}
/>`,
          },
          {
            id: "app",
            label: "App",
            summary: "variant=\"app\"",
            preview: (
              <NHeader
                variant="app"
                surface="outline"
                brand={brand}
                extra={<Text fontWeight="medium">Inventario</Text>}
                search
                notifications={[{ id: "stock", title: "Stock bajo", unread: true }]}
                user={{ name: "Ana Torres", role: "Administradora" }}
              />
            ),
            code: `<NHeader
  variant="app"
  extra={<Text>Inventario</Text>}
  search
  notifications={[{ id: "stock", title: "Stock bajo", unread: true }]}
  user={{ name: "Ana Torres", role: "Administradora" }}
/>`,
          },
          {
            id: "surfaces",
            label: "Superficies",
            summary: "surface=\"outline\" | \"elevated\" | \"plain\"",
            preview: (
              <Stack gap="3">
                <NHeader surface="outline" brand={brand} items={[{ id: "home", label: "Inicio" }]} />
                <NHeader surface="elevated" brand={brand} items={[{ id: "home", label: "Inicio" }]} />
                <NHeader surface="plain" brand={brand} items={[{ id: "home", label: "Inicio" }]} />
              </Stack>
            ),
            code: `<NHeader surface="outline" brand={<Logo />} />
<NHeader surface="elevated" brand={<Logo />} />
<NHeader surface="plain" brand={<Logo />} />`,
          },
        ]}
        propExamples={[
          {
            label: "Uso mínimo: solo marca y navegación",
            code: `<NHeader brand={<Logo />} items={[{ id: "home", label: "Inicio" }]} />`,
          },
          {
            label: "Barra fija sin Drawer móvil (sidebar propio en móvil)",
            code: `<NHeader sticky responsive="hidden" user={{ name: "Ana Torres" }} />`,
          },
        ]}
        code={`import { NHeader } from "nissi-ui"

<NHeader
  variant="app"
  sticky
  brand={<Logo />}
  extra={<Text>Inventario / Productos</Text>}
  search
  actions={[{ id: "settings", label: "Configuración", icon: <Settings /> }]}
  notifications={[{ id: "stock", title: "Stock bajo", unread: true }]}
  user={{ name: "Ana Torres", role: "Administradora" }}
  showThemeToggle
  theme={theme}
  onThemeChange={setTheme}
/>`}
      />
    </Stack>
  )
}

/** Vista de ejemplo y documentación de NSidebar. */
function SidebarView() {
  return (
    <Stack gap="8">
      <PageIntro
        eyebrow="Navegación"
        title="NSidebar"
        description="Menú lateral controlable con grupos, búsqueda, badges, modo colapsado y Drawer para dispositivos móviles."
      />
      <Card.Root variant="outline" overflow="hidden" bg="bg.panel">
        <Card.Body p="0">
          <Flex minH="34rem" align="stretch">
            <NSidebar
              items={sidebarPreviewItems}
              responsive="push"
              defaultActiveItemId="team"
              searchable
              expandedWidth="18rem"
              header={(
                <HStack gap="3" px="2" whiteSpace="nowrap">
                  <Flex align="center" justify="center" bg="colorPalette.solid" color="colorPalette.contrast" rounded="md" boxSize="8" fontWeight="bold">N</Flex>
                  <Text fontWeight="semibold">Nissi Workspace</Text>
                </HStack>
              )}
              footer={<Text px="2" color="fg.muted" fontSize="sm">usuario@nissi.mx</Text>}
            />
            <Box flex="1" p={{ base: "5", md: "8" }} bg="bg.subtle" minW="0">
              <Badge colorPalette="green" mb="3">Vista interactiva</Badge>
              <Heading as="h2" size="xl">Contenido de aplicación</Heading>
              <Text mt="2" color="fg.muted">Prueba la búsqueda, los grupos y el control para contraer el menú.</Text>
            </Box>
          </Flex>
        </Card.Body>
      </Card.Root>

      <ComponentDocs
        purpose="NSidebar es el menú lateral de navegación: agrupa módulos/microservicios en un árbol con badges, búsqueda y colapso, y en móvil se convierte en un Drawer accesible. Es el punto de entrada típico para organizar los distintos microsistemas de un mismo dashboard."
        steps={[
          "Define tu árbol de NSidebarItem (id, label, icon, href/onClick, badge, children para submenús).",
          "Controla el ítem activo con activeItemId/onItemSelect (o defaultActiveItemId si no necesitas control externo).",
          "Activa searchable si el menú puede crecer con muchos módulos, y collapsible para dejar más espacio al contenido.",
          "Usa requiredPermission en los ítems que dependan de un rol o microservicio contratado (ver NPermissionGate).",
          "Ajusta responsive (\"overlay\" | \"push\" | \"hidden\") según cómo tu layout deba comportarse en móvil.",
        ]}
        variants={[
          { name: "responsive=\"overlay\"", description: "Por defecto: Drawer de Chakra en móvil y sidebar fijo en escritorio." },
          { name: "responsive=\"push\"", description: "El sidebar vive dentro del flujo en todos los tamaños; útil en layouts personalizados." },
          { name: "variant=\"outline\" | \"elevated\" | \"plain\"", description: "Define el borde/sombra del panel para adaptarse al layout que lo envuelve." },
          { name: "position=\"start\" | \"end\"", description: "Ubica el sidebar a la izquierda o a la derecha del contenido." },
        ]}
        variantExamples={[
          {
            id: "collapsed",
            label: "Colapsado",
            summary: "defaultCollapsed",
            preview: (
              <Flex height="14rem" borderWidth="1px" borderColor="border" rounded="md" overflow="hidden">
                <NSidebar items={sidebarPreviewItems} responsive="push" defaultCollapsed expandedWidth="14rem" collapsedWidth="4rem" />
                <Box flex="1" p="4" bg="bg.subtle" />
              </Flex>
            ),
            code: `<NSidebar items={items} defaultCollapsed collapsedWidth="4rem" />`,
          },
          {
            id: "position-end",
            label: "Posición end",
            summary: "position=\"end\"",
            preview: (
              <Flex height="14rem" borderWidth="1px" borderColor="border" rounded="md" overflow="hidden">
                <Box flex="1" p="4" bg="bg.subtle" />
                <NSidebar items={sidebarPreviewItems.slice(0, 2)} responsive="push" position="end" expandedWidth="14rem" />
              </Flex>
            ),
            code: `<NSidebar items={items} position="end" />`,
          },
          {
            id: "variant",
            label: "Variantes de superficie",
            summary: "variant=\"outline\" | \"elevated\" | \"plain\"",
            preview: (
              <HStack gap="3" align="stretch">
                <NSidebar items={sidebarPreviewItems.slice(0, 2)} responsive="push" variant="outline" expandedWidth="12rem" />
                <NSidebar items={sidebarPreviewItems.slice(0, 2)} responsive="push" variant="elevated" expandedWidth="12rem" />
                <NSidebar items={sidebarPreviewItems.slice(0, 2)} responsive="push" variant="plain" expandedWidth="12rem" />
              </HStack>
            ),
            code: `<NSidebar items={items} variant="outline" />
<NSidebar items={items} variant="elevated" />
<NSidebar items={items} variant="plain" />`,
          },
        ]}
        propExamples={[
          {
            label: "Sidebar controlado externamente (colapso propio)",
            code: `const [collapsed, setCollapsed] = useState(false)

<NSidebar
  items={items}
  collapsed={collapsed}
  onCollapsedChange={setCollapsed}
/>`,
          },
          {
            label: "Identidad estable con datos externos (getItemId)",
            code: `<NSidebar
  items={modulosContratados}
  getItemId={(item) => String(item.data.moduleKey)}
  onItemSelect={(item) => navigate(item.data.route)}
/>`,
          },
        ]}
        code={`import { NSidebar } from "nissi-ui"

<NSidebar
  items={[
    { id: "dashboard", label: "Dashboard", icon: <Home /> },
    { id: "billing", label: "Facturación", icon: <FileText />,
      requiredPermission: "facturacion:ver",
      children: [{ id: "invoices", label: "Facturas" }] },
  ]}
  activeItemId={activeId}
  onItemSelect={(item) => setActiveId(item.id)}
  searchable
  collapsible
  responsive="overlay"
/>`}
      />
    </Stack>
  )
}

/** Vista de ejemplo y documentación de NTable. */
function TableView() {
  return (
    <Stack gap="8">
      <PageIntro
        eyebrow="Presentación de datos"
        title="NTable"
        description="Tabla declarativa para presentar datos con agrupación, cabecera pegajosa, paginación y diseño responsive."
      />
      <NTable
        config={productConfig}
        title="Inventario de productos"
        subtitle="Agrupación de columnas y comportamiento responsivo."
        caption="Inventario de productos · septiembre de 2026"
        variant="outline"
        striped
        interactive
        showColumnBorder
        borderWidth="1px"
        stickyHeader
        stickyColumn="product"
        maxHeight="32rem"
        columnGroups
        pagination={{ pageSize: 5 }}
        responsive="scroll"
        colorPalette="teal"
      />

      <ComponentDocs
        purpose="NTable es la base declarativa para presentar datos desde JSON (headers + data): agrupación de columnas, cabecera y columna pegajosas, paginación y modo responsive. Es la capa de presentación pura, sin selección ni edición; para eso existe NDataTable."
        steps={[
          "Define config.headers (key, header, type, group, width, align) y config.data con tus registros.",
          "Activa columnGroups si agrupaste columnas por header.group, y stickyHeader/stickyColumn para tablas largas.",
          "Elige responsive=\"scroll\" (desplazamiento horizontal) o \"stack\" (lista de tarjetas) según el contenido.",
          "Usa maxHeight junto con stickyHeader para tablas con muchas filas dentro de un contenedor fijo.",
          "Si necesitas búsqueda, selección, exportación o edición, usa NDataTable en vez de configurar todo manualmente.",
        ]}
        variants={[
          { name: "variant=\"line\" | \"outline\"", description: "Borde inferior por fila o borde completo alrededor de la tabla." },
          { name: "size=\"sm\" | \"md\" | \"lg\"", description: "Densidad tipográfica y de espaciado de celdas." },
          { name: "responsive=\"scroll\" | \"stack\"", description: "Desplazamiento horizontal en escritorio o lista apilada en móvil." },
          { name: "stickyHeader / stickyColumn", description: "Fija la cabecera y/o una columna al hacer scroll dentro de maxHeight." },
        ]}
        variantExamples={[
          {
            id: "variant",
            label: "line vs outline",
            summary: "variant=\"line\" | \"outline\"",
            preview: (
              <Stack gap="4">
                <NTable variant="line" config={{ headers: productConfig.headers.slice(0, 3), data: productConfig.data.slice(0, 2) }} />
                <NTable variant="outline" config={{ headers: productConfig.headers.slice(0, 3), data: productConfig.data.slice(0, 2) }} />
              </Stack>
            ),
            code: `<NTable variant="line" config={config} />
<NTable variant="outline" config={config} />`,
          },
          {
            id: "size",
            label: "Densidad",
            summary: "size=\"sm\" | \"md\" | \"lg\"",
            preview: (
              <Stack gap="4">
                <NTable size="sm" config={{ headers: productConfig.headers.slice(0, 3), data: productConfig.data.slice(0, 2) }} />
                <NTable size="lg" config={{ headers: productConfig.headers.slice(0, 3), data: productConfig.data.slice(0, 2) }} />
              </Stack>
            ),
            code: `<NTable size="sm" config={config} />
<NTable size="lg" config={config} />`,
          },
          {
            id: "responsive-stack",
            label: "Responsive stack",
            summary: "responsive=\"stack\"",
            preview: (
              <NTable
                responsive="stack"
                config={{ headers: productConfig.headers.slice(0, 4), data: productConfig.data.slice(0, 2) }}
              />
            ),
            code: `<NTable responsive="stack" config={config} />
// En móvil cada fila se muestra como tarjeta de definiciones.`,
          },
        ]}
        propExamples={[
          {
            label: "Sin Card envolvente (para incrustar en tu propio layout)",
            code: `<NTable card={false} config={config} />`,
          },
          {
            label: "Formato personalizado por columna (format)",
            code: `<NTable
  config={{
    headers: [
      { key: "active", header: "Estado", format: (value) =>
        value ? <Badge colorPalette="green">Activo</Badge> : <Badge colorPalette="red">Inactivo</Badge> },
    ],
    data,
  }}
/>`,
          },
        ]}
        code={`import { NTable } from "nissi-ui"

<NTable
  config={{
    headers: [
      { key: "product", header: "Producto", group: "Producto" },
      { key: "price", header: "Precio", type: "currency", group: "Inventario" },
    ],
    data: products,
  }}
  columnGroups
  stickyHeader
  maxHeight="32rem"
  responsive="scroll"
/>`}
      />
    </Stack>
  )
}

/** Vista de ejemplo y documentación de NDataTable. */
function DataTableView() {
  return (
    <Stack gap="8">
      <PageIntro
        eyebrow="Gestión de datos"
        title="NDataTable"
        description="Búsqueda, filtros, ordenamiento, exportación, selección, edición y reordenamiento en una sola API."
      />
      <NDataTable
        config={employeeConfig}
        title="Directorio de colaboradores"
        subtitle="Selecciona una o varias filas para probar la barra de acciones flotante."
        variant="outline"
        interactive
        borderWidth="1px"
        stickyHeader
        stickyColumn
        maxHeight="38rem"
        responsive="stack"
        colorPalette="blue"
        getRowId={(row) => String(row.id)}
        iconMap={{
          Diseño: <Building2 size={16} />,
          Ingeniería: <PackageCheck size={16} />,
          Ventas: <CircleDollarSign size={16} />,
        }}
        actions={[
          {
            id: "inspect",
            label: "Ver JSON",
            icon: <PackageCheck size={16} />,
            onClick: ({ headers, data }) => window.alert(`Headers:\n${headers}\n\nData:\n${data}`),
          },
        ]}
      />

      <ComponentDocs
        purpose="NDataTable extiende NTable con lo que necesita casi cualquier módulo de gestión: búsqueda, filtro, paginación, selección múltiple con ActionBar flotante, edición y borrado de filas, exportación (Excel/PDF/imprimir/copiar) y reordenamiento de columnas y filas."
        steps={[
          "Define config igual que en NTable; agrega getRowId si tus datos no tienen un id estable.",
          "Personaliza actions para acciones propias de tu microservicio (requiredPermission las filtra según el cliente).",
          "Usa selectionRequirement (\"single\" | \"multiple\" | \"any\") para decidir cuándo aparece cada acción.",
          "Ajusta exportOptions si necesitas desactivar Excel, PDF, impresión o copiado para un módulo en particular.",
          "En móvil, responsive=\"stack\" convierte cada fila en una tarjeta con las mismas acciones disponibles.",
        ]}
        variants={[
          { name: "selectable + actions", description: "Selección múltiple con ActionBar flotante para acciones sobre varias filas." },
          { name: "exportOptions", description: "Copiar, Excel, PDF e imprimir; cada uno puede desactivarse individualmente." },
          { name: "reorderableColumns / reorderableRows", description: "Arrastrar o usar Alt + flechas para reordenar; notifica vía onRowOrderChange." },
          { name: "responsive=\"stack\"", description: "Cada fila se convierte en tarjeta apilada en móvil, sin perder acciones ni edición." },
        ]}
        variantExamples={[
          {
            id: "export",
            label: "Solo exportar Excel",
            summary: "exportOptions={{ pdf: false, print: false }}",
            preview: (
              <NDataTable
                config={{ headers: employeeConfig.headers.slice(0, 3), data: employeeConfig.data.slice(0, 2) }}
                selectable={false}
                exportOptions={{ pdf: false, print: false, copy: false }}
                getRowId={(row) => String(row.id)}
              />
            ),
            code: `<NDataTable
  config={config}
  selectable={false}
  exportOptions={{ pdf: false, print: false, copy: false }}
/>`,
          },
          {
            id: "selection",
            label: "Selección + acción propia",
            summary: "actions + selectionRequirement",
            preview: (
              <NDataTable
                config={{ headers: employeeConfig.headers.slice(0, 3), data: employeeConfig.data.slice(0, 2) }}
                exportOptions={false}
                getRowId={(row) => String(row.id)}
                actions={[{ id: "archive", label: "Archivar", selectionRequirement: "any", onClick: () => {} }]}
              />
            ),
            code: `<NDataTable
  config={config}
  actions={[
    { id: "archive", label: "Archivar", selectionRequirement: "any",
      onClick: ({ selectedRows }) => archive(selectedRows) },
  ]}
/>`,
          },
          {
            id: "stack",
            label: "Responsive stack",
            summary: "responsive=\"stack\"",
            preview: (
              <NDataTable
                config={{ headers: employeeConfig.headers.slice(0, 4), data: employeeConfig.data.slice(0, 2) }}
                responsive="stack"
                exportOptions={false}
                getRowId={(row) => String(row.id)}
              />
            ),
            code: `<NDataTable config={config} responsive="stack" />`,
          },
        ]}
        propExamples={[
          {
            label: "Borrado con confirmación previa (onBeforeDelete)",
            code: `<NDataTable
  config={config}
  getRowId={(row) => String(row.id)}
  onBeforeDelete={async (rows) => window.confirm(\`¿Eliminar \${rows.length} registro(s)?\`)}
/>`,
          },
          {
            label: "Acción limitada a una sola fila seleccionada",
            code: `<NDataTable
  config={config}
  actions={[
    { id: "view-detail", label: "Ver detalle", selectionRequirement: "single",
      onClick: ({ row }) => navigate(\`/empleados/\${row.id}\`) },
  ]}
/>`,
          },
        ]}
        code={`import { NDataTable } from "nissi-ui"

<NDataTable
  config={employeeConfig}
  getRowId={(row) => String(row.id)}
  actions={[
    { id: "export", label: "Exportar", requiredPermission: "reportes:exportar",
      onClick: ({ selectedRows }) => exportPayroll(selectedRows) },
  ]}
  responsive="stack"
/>`}
      />
    </Stack>
  )
}

/** Vista de ejemplo y documentación de NForm. */
function FormView() {
  return (
    <Stack gap="8">
      <PageIntro
        eyebrow="Captura de datos"
        title="NForm"
        description="Formularios reactivos declarados desde JSON: secciones, validación, tipos de campo y resultado del backend."
      />
      <NForm<EmployeeFormValues>
        config={employeeFormConfig}
        title="Nuevo colaborador"
        subtitle="Los campos marcados como requeridos se validan al enviar y al salir del campo."
        colorPalette="blue"
        onSubmit={async (values, mode) => {
          await new Promise((resolve) => setTimeout(resolve, 600))
          if (!values.email.endsWith("@nissi.mx")) {
            return { success: false, message: "El backend rechazó la solicitud.", errors: { email: "Usa un correo corporativo @nissi.mx." } }
          }
          return { success: true, message: mode === "create" ? "Colaborador creado correctamente." : "Cambios guardados." }
        }}
      />

      <ComponentDocs
        purpose="NForm genera formularios reactivos a partir de una configuración JSON: campos con su tipo de dato, validación, secciones y el resultado del guardado. Sirve tanto para crear como para editar, ya que el modo se infiere de si le pasas data inicial."
        steps={[
          "Define config.fields (key, label, type, validation, options, section, colSpan) según tu modelo de datos.",
          "Agrupa campos relacionados con config.sections (title, description, columns) para formularios largos.",
          "Pasa data con los valores existentes para editar, o nada para crear; NForm infiere el modo automáticamente.",
          "Implementa onSubmit para enviar los valores a tu backend y retorna { success, message, errors }.",
          "Usa requiredPermission en los campos que dependan de un rol o microservicio contratado.",
        ]}
        variants={[
          { name: "type=\"text\" | \"select\" | \"switch\" | ...", description: "12 tipos de campo soportados, incluyendo custom vía render." },
          { name: "colSpan=\"1\" | \"2\" | \"3\" | \"full\"", description: "Controla cuántas columnas ocupa un campo dentro de su sección." },
          { name: "mode=\"create\" | \"edit\"", description: "Cambia la etiqueta del botón principal y si se limpia el formulario al terminar." },
          { name: "resetOnSuccess", description: "Limpia el formulario tras un envío exitoso en modo create (activado por defecto)." },
        ]}
        variantExamples={[
          {
            id: "edit",
            label: "Modo edición",
            summary: "data={valoresExistentes} → mode=\"edit\"",
            preview: (
              <NForm<{ name: string; channel: string }>
                config={{
                  fields: [
                    { key: "name", label: "Nombre" },
                    { key: "channel", label: "Canal preferido", type: "select", options: [{ label: "Email", value: "email" }, { label: "SMS", value: "sms" }] },
                  ],
                }}
                data={{ name: "Ana Torres", channel: "email" }}
                onSubmit={async () => ({ success: true, message: "Cambios guardados." })}
              />
            ),
            code: `<NForm
  config={config}
  data={{ name: "Ana Torres", channel: "email" }} // mode="edit" se infiere
  onSubmit={async (values) => guardar(values)}
/>`,
          },
          {
            id: "field-types",
            label: "Tipos de campo",
            summary: "switch, textarea, select",
            preview: (
              <NForm<{ active: boolean; notes: string }>
                config={{
                  fields: [
                    { key: "active", label: "Activo", type: "switch" },
                    { key: "notes", label: "Notas", type: "textarea", colSpan: "full" },
                  ],
                }}
                onSubmit={async () => ({ success: true })}
              />
            ),
            code: `fields: [
  { key: "active", label: "Activo", type: "switch" },
  { key: "notes", label: "Notas", type: "textarea", colSpan: "full" },
]`,
          },
          {
            id: "sections",
            label: "Secciones + colSpan",
            summary: "config.sections",
            preview: (
              <NForm<{ name: string; department: string }>
                config={{
                  sections: [{ id: "info", title: "Información", columns: 2 }],
                  fields: [
                    { key: "name", label: "Nombre", section: "info" },
                    { key: "department", label: "Departamento", section: "info" },
                  ],
                }}
                onSubmit={async () => ({ success: true })}
              />
            ),
            code: `config={{
  sections: [{ id: "info", title: "Información", columns: 2 }],
  fields: [
    { key: "name", label: "Nombre", section: "info" },
    { key: "department", label: "Departamento", section: "info" },
  ],
}}`,
          },
        ]}
        propExamples={[
          {
            label: "Validación personalizada (validate asíncrono)",
            code: `{ key: "email", label: "Correo", type: "email",
  validation: {
    required: true,
    validate: async (value) => (await existeCorreo(value)) ? "Ya está registrado." : undefined,
  } }`,
          },
          {
            label: "Campo oculto según otro valor del formulario",
            code: `{ key: "otherReason", label: "Especifica el motivo",
  hidden: (values) => values.reason !== "otro" }`,
          },
        ]}
        code={`import { NForm } from "nissi-ui"

<NForm
  config={{
    fields: [
      { key: "name", label: "Nombre", validation: { required: true } },
      { key: "email", label: "Correo", type: "email", validation: { required: true } },
    ],
  }}
  data={employee}
  onSubmit={async (values, mode) => {
    const response = await api.saveEmployee(values, mode)
    return response.ok
      ? { success: true, message: "Guardado correctamente." }
      : { success: false, errors: response.fieldErrors }
  }}
/>`}
      />
    </Stack>
  )
}

/** Capacidades otorgadas a cada rol simulado en la demo de NPermissionGate. */
const rolePermissions: Record<"lectura" | "administrador", string[]> = {
  lectura: ["core:*", "facturacion:ver"],
  administrador: ["core:*", "facturacion:*", "reportes:*"],
}

/** Sidebar + acciones controlados por un selector de rol, para demostrar NPermissionGate en vivo. */
function PermissionsDemo() {
  const [role, setRole] = useState<"lectura" | "administrador">("lectura")

  const permissionedItems: NSidebarItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
    {
      id: "billing",
      label: "Facturación",
      icon: <CircleDollarSign size={18} />,
      requiredPermission: "facturacion:ver",
      children: [
        { id: "invoices", label: "Facturas" },
        { id: "billing-settings", label: "Configuración", requiredPermission: "facturacion:*" },
      ],
    },
    { id: "reports", label: "Reportes", icon: <BarChart3 size={18} />, requiredPermission: "reportes:*" },
  ]

  return (
    <NPermissionsProvider permissions={rolePermissions[role]}>
      <Stack gap="6">
        <HStack gap="3" wrap="wrap">
          <Text color="fg.muted" fontSize="sm">Simular rol:</Text>
          <Button size="sm" variant={role === "lectura" ? "solid" : "outline"} onClick={() => setRole("lectura")}>Solo lectura</Button>
          <Button size="sm" variant={role === "administrador" ? "solid" : "outline"} onClick={() => setRole("administrador")}>Administrador</Button>
        </HStack>

        <Card.Root variant="outline" overflow="hidden" bg="bg.panel">
          <Card.Body p="0">
            <Flex minH="20rem" align="stretch">
              <NSidebar items={permissionedItems} responsive="push" defaultActiveItemId="dashboard" expandedWidth="16rem" />
              <Box flex="1" p="6" bg="bg.subtle">
                <Stack gap="4">
                  <Text color="fg.muted" fontSize="sm">
                    Con el rol <strong>{role}</strong>, "Reportes" y "Configuración" de Facturación
                    {role === "lectura" ? " están ocultos en el menú." : " están visibles porque el rol tiene esas capacidades."}
                  </Text>
                  <HStack>
                    <NPermissionGate requires="facturacion:*" behavior="disable" fallback={null}>
                      <Button colorPalette="blue">Emitir factura</Button>
                    </NPermissionGate>
                    <NPermissionGate requires="reportes:*">
                      <Button variant="outline">Exportar reporte</Button>
                    </NPermissionGate>
                  </HStack>
                </Stack>
              </Box>
            </Flex>
          </Card.Body>
        </Card.Root>
      </Stack>
    </NPermissionsProvider>
  )
}

/** Vista de ejemplo y documentación de NPermissionGate/useCanAccess. */
function PermissionsView() {
  return (
    <Stack gap="8">
      <PageIntro
        eyebrow="Control de acceso"
        title="NPermissionGate"
        description="Oculta o deshabilita navegación, acciones de tabla y campos de formulario según las capacidades (rol + microservicios contratados) del cliente actual."
      />
      <PermissionsDemo />

      <ComponentDocs
        purpose="NPermissionGate y useCanAccess son el mecanismo arquitectónico para decidir qué se muestra en un dashboard multi-tenant: una sola lista de capacidades (rol + microservicios comprados) controla NSidebar, NTable y NForm sin duplicar lógica en cada pantalla."
        steps={[
          "Envuelve tu app (o una sección) con NPermissionsProvider, entregando las capacidades otorgadas al cliente actual.",
          "Usa requiredPermission en NSidebarItem, NTableAction o NFormField para que se oculten automáticamente sin permiso.",
          "Para UI propia, envuelve el elemento con NPermissionGate requires=\"modulo:accion\".",
          "Usa behavior=\"disable\" cuando quieras mostrar la opción pero explicar por qué está bloqueada (tooltip incluido).",
          "Sin NPermissionsProvider montado, todo se permite por defecto: es seguro adoptarlo de forma incremental.",
        ]}
        variants={[
          { name: "behavior=\"hide\"", description: "Omite el contenido por completo cuando falta la capacidad (por defecto)." },
          { name: "behavior=\"disable\"", description: "Muestra el contenido deshabilitado con un tooltip explicando el motivo." },
          { name: "mode=\"any\" | \"all\"", description: "Con varias capacidades requeridas, exige al menos una o todas." },
          { name: "\"modulo:*\"", description: "Comodín que otorga todas las capacidades de un microservicio contratado." },
        ]}
        variantExamples={[
          {
            id: "hide",
            label: "hide (por defecto)",
            summary: "behavior=\"hide\"",
            preview: (
              <NPermissionsProvider permissions={["core:*"]}>
                <HStack>
                  <Text fontSize="sm" color="fg.muted">Sin la capacidad, el botón desaparece:</Text>
                  <NPermissionGate requires="facturacion:eliminar">
                    <Button size="sm">Eliminar factura</Button>
                  </NPermissionGate>
                </HStack>
              </NPermissionsProvider>
            ),
            code: `<NPermissionGate requires="facturacion:eliminar">
  <Button>Eliminar factura</Button>
</NPermissionGate>`,
          },
          {
            id: "disable",
            label: "disable + tooltip",
            summary: "behavior=\"disable\"",
            preview: (
              <NPermissionsProvider permissions={["core:*"]}>
                <NPermissionGate requires="facturacion:eliminar" behavior="disable">
                  <Button size="sm">Eliminar factura</Button>
                </NPermissionGate>
              </NPermissionsProvider>
            ),
            code: `<NPermissionGate requires="facturacion:eliminar" behavior="disable">
  <Button>Eliminar factura</Button>
</NPermissionGate>`,
          },
          {
            id: "fallback",
            label: "fallback (upsell)",
            summary: "fallback",
            preview: (
              <NPermissionsProvider permissions={["core:*"]}>
                <NPermissionGate
                  requires="reportes:*"
                  fallback={<Badge colorPalette="orange">Disponible en el plan Pro</Badge>}
                >
                  <Button size="sm">Exportar reporte</Button>
                </NPermissionGate>
              </NPermissionsProvider>
            ),
            code: `<NPermissionGate
  requires="reportes:*"
  fallback={<Badge colorPalette="orange">Disponible en el plan Pro</Badge>}
>
  <Button>Exportar reporte</Button>
</NPermissionGate>`,
          },
        ]}
        propExamples={[
          {
            label: "Requiere todas las capacidades (mode=\"all\")",
            code: `<NPermissionGate requires={["facturacion:*", "reportes:*"]} mode="all">
  <Button>Reporte financiero</Button>
</NPermissionGate>`,
          },
          {
            label: "Uso directo del hook en lógica propia",
            code: `const puedeEliminar = useCanAccess("facturacion:eliminar")

if (!puedeEliminar) return null`,
          },
        ]}
        code={`import { NPermissionGate, NPermissionsProvider } from "nissi-ui"

<NPermissionsProvider permissions={["core:*", "facturacion:ver"]}>
  <NSidebar items={[
    { id: "billing", label: "Facturación", requiredPermission: "facturacion:ver" },
  ]} />

  <NPermissionGate requires="facturacion:eliminar" behavior="disable">
    <Button onClick={deleteInvoice}>Eliminar factura</Button>
  </NPermissionGate>
</NPermissionsProvider>`}
      />
    </Stack>
  )
}

/** Documenta el shell que la propia galería utiliza como layout raíz. */
function AppShellView() {
  return (
    <Stack gap="8">
      <PageIntro
        eyebrow="Arquitectura de aplicación"
        title="NAppShell"
        description="Una raíz responsive y accesible para que header, sidebar, contenido y footer compartan geometría y superficies sin acoplar sus estados."
      />
      <Card.Root variant="outline" overflow="hidden" bg="bg.panel">
        <NAppShell
          minHeight="22rem"
          contentPadding="compact"
          header={<NHeader variant="app" surface="outline" extra={<Text fontWeight="semibold">Resumen operativo</Text>} />}
          footer={<Box borderTopWidth="1px" borderColor="border" px="5" py="3"><Text color="fg.muted" fontSize="xs">Estado del sistema: operativo</Text></Box>}
        >
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="3">
            {["Ventas del día", "Pedidos pendientes"].map((label, index) => (
              <Card.Root key={label} variant="subtle"><Card.Body><Text color="fg.muted" fontSize="sm">{label}</Text><Heading size="2xl">{index ? 18 : "$128,450"}</Heading></Card.Body></Card.Root>
            ))}
          </SimpleGrid>
        </NAppShell>
      </Card.Root>
      <ComponentDocs
        purpose="NAppShell establece las regiones semánticas y el flujo responsive de una app. La galería completa que estás viendo también usa NAppShell con NHeader y NSidebar reales."
        steps={["Importa NAppShell y entrega NHeader/NSidebar mediante sus slots.", "Elige sidebarPosition y la densidad de contenido.", "Mantén los estados de navegación en tu aplicación; el shell sólo coordina el layout.", "Traduce el enlace de salto y los nombres de región mediante labels."]}
        variants={[
          { name: "sidebarPosition=\"start\" | \"end\"", description: "Permite navegación lateral izquierda o derecha sin cambiar el orden semántico del contenido." },
          { name: "contentPadding", description: "Ofrece none, compact y comfortable para dashboards densos o páginas editoriales." },
          { name: "contentMaxWidth", description: "Limita el área principal o permite una superficie full-width." },
        ]}
        variantExamples={[
          { id: "compact", label: "Compacto", summary: "contentPadding=\"compact\"", preview: <NAppShell minHeight="12rem" contentPadding="compact"><Card.Root><Card.Body>Contenido compacto</Card.Body></Card.Root></NAppShell>, code: `<NAppShell contentPadding="compact">{content}</NAppShell>` },
          { id: "comfortable", label: "Cómodo", summary: "contentPadding=\"comfortable\"", preview: <NAppShell minHeight="12rem" contentPadding="comfortable"><Card.Root><Card.Body>Contenido cómodo</Card.Body></Card.Root></NAppShell>, code: `<NAppShell contentPadding="comfortable">{content}</NAppShell>` },
        ]}
        code={`<NAppShell
  header={<NHeader variant="app" />}
  sidebar={<NSidebar items={items} />}
  sidebarPosition="start"
>
  <Routes />
</NAppShell>`}
      />
    </Stack>
  )
}

/** Catálogo de módulos contratados y autorizados por el cliente actual. */
function ModuleRegistryView() {
  const [activeModuleId, setActiveModuleId] = useState("operations")
  return (
    <Stack gap="8">
      <PageIntro eyebrow="Plataforma modular" title="NModuleRegistry" description="Un catálogo interactivo para descubrir y abrir los microsistemas disponibles para cada cliente sin filtrar capacidades sensibles." />
      <NPermissionsProvider permissions={["operations:*", "customers:use", "billing:use"]}>
        <NModuleRegistry modules={platformModules} activeModuleId={activeModuleId} onModuleSelect={(module) => setActiveModuleId(module.id)} showUnavailable />
      </NPermissionsProvider>
      <Text role="status" color="fg.muted" fontSize="sm">Módulo activo: <Text as="span" color="fg" fontWeight="semibold">{platformModules.find((module) => module.id === activeModuleId)?.label}</Text></Text>
      <ComponentDocs
        purpose="NModuleRegistry separa el catálogo contratado de la navegación interna de cada microsistema. Aplica capacidades del NPermissionsProvider, soporta estado controlado y comunica el objeto completo al seleccionar."
        steps={["Modela cada módulo con id, etiqueta, estado de contratación y capacidad.", "Envuelve la app en NPermissionsProvider con capacidades emitidas por el backend.", "Controla activeModuleId para sincronizar rutas, telemetría o carga remota.", "Revalida siempre permisos y suscripciones en el backend."]}
        variants={[
          { name: "layout=\"grid\"", description: "Catálogo adaptable para home o marketplace de módulos." },
          { name: "layout=\"list\"", description: "Lista vertical para paneles laterales amplios." },
          { name: "layout=\"compact\"", description: "Rail de iconos con tooltips y nombres accesibles." },
        ]}
        variantExamples={[
          { id: "grid", label: "Grid", summary: "layout=\"grid\"", preview: <NModuleRegistry modules={platformModules.slice(0, 3)} defaultActiveModuleId="operations" showUnavailable />, code: `<NModuleRegistry modules={modules} layout="grid" showUnavailable />` },
          { id: "compact", label: "Compacto", summary: "layout=\"compact\"", preview: <NModuleRegistry modules={platformModules.slice(0, 2)} defaultActiveModuleId="operations" layout="compact" />, code: `<NModuleRegistry modules={modules} layout="compact" />` },
        ]}
        code={`<NPermissionsProvider permissions={session.capabilities}>
  <NModuleRegistry
    modules={modules}
    activeModuleId={activeModuleId}
    onModuleSelect={(module) => navigate(module.data.route)}
    showUnavailable
  />
</NPermissionsProvider>`}
      />
    </Stack>
  )
}

/** Selector de tenant/sucursal con estado vivo para validar su interacción. */
function WorkspaceSwitcherView() {
  const [workspaceId, setWorkspaceId] = useState("acme")
  const current = demoWorkspaces.find((workspace) => workspace.id === workspaceId)
  return (
    <Stack gap="8">
      <PageIntro eyebrow="Contexto multi-tenant" title="NWorkspaceSwitcher" description="Cambia de organización, sucursal, proyecto o entorno manteniendo visible el contexto operativo actual." />
      <Card.Root variant="outline" bg="bg.panel"><Card.Body gap="5"><Box maxW="sm"><NWorkspaceSwitcher workspaces={demoWorkspaces} value={workspaceId} onValueChange={(workspace) => setWorkspaceId(workspace.id)} /></Box><Text color="fg.muted">Los datos siguientes pertenecen a <Text as="span" color="fg" fontWeight="semibold">{current?.name}</Text>.</Text><NTable card={false} config={{ ...productConfig, data: productConfig.data.slice(0, 3) }} responsive="scroll" borderWidth="1px" /></Card.Body></Card.Root>
      <ComponentDocs
        purpose="NWorkspaceSwitcher mantiene explícito el tenant operativo y funciona en header, sidebar o formularios. Puede ser controlado por el router/store o administrar su selección local."
        steps={["Entrega una lista estable de workspaces con id y nombre.", "Usa value/onValueChange para recargar consultas al cambiar de contexto.", "Activa compact dentro de barras estrechas.", "Traduce todos los textos mediante labels."]}
        variants={[
          { name: "compact=false", description: "Muestra avatar, nombre, descripción y selector; ideal para sidebar." },
          { name: "compact", description: "Muestra un disparador compacto; ideal para header o móvil." },
        ]}
        variantExamples={[
          { id: "full", label: "Completo", summary: "compact={false}", preview: <Box maxW="sm"><NWorkspaceSwitcher workspaces={demoWorkspaces} /></Box>, code: `<NWorkspaceSwitcher workspaces={workspaces} />` },
          { id: "compact", label: "Compacto", summary: "compact", preview: <NWorkspaceSwitcher workspaces={demoWorkspaces} compact />, code: `<NWorkspaceSwitcher workspaces={workspaces} compact />` },
        ]}
        code={`<NWorkspaceSwitcher
  workspaces={workspaces}
  value={workspaceId}
  onValueChange={(workspace) => setWorkspaceId(workspace.id)}
/>`}
      />
    </Stack>
  )
}

/** Layout raíz del catálogo: NSidebar + NHeader globales y el contenido según la vista activa. */
function DevelopmentApp() {
  const { resolvedTheme, setTheme } = useTheme()
  const [activeView, setActiveView] = useState<DemoView>(() => {
    const requestedView = new URLSearchParams(window.location.search).get("view")
    const allowed: DemoView[] = ["overview", "app-shell", "modules", "workspaces", "header", "sidebar", "table", "datatable", "form", "permissions"]
    return requestedView && allowed.includes(requestedView as DemoView) ? requestedView as DemoView : "overview"
  })
  const isDark = resolvedTheme === "dark"

  const content = activeView === "header"
    ? <HeaderView />
    : activeView === "sidebar"
      ? <SidebarView />
      : activeView === "table"
        ? <TableView />
        : activeView === "datatable"
          ? <DataTableView />
          : activeView === "form"
            ? <FormView />
            : activeView === "permissions"
              ? <PermissionsView />
              : activeView === "app-shell"
                ? <AppShellView />
                : activeView === "modules"
                  ? <ModuleRegistryView />
                  : activeView === "workspaces"
                    ? <WorkspaceSwitcherView />
              : <OverviewView onNavigate={setActiveView} />

  return (
    <NAppShell
      contentPadding={activeView === "overview" ? "none" : "comfortable"}
      header={(
        <NHeader
          variant="app"
          sticky
          surface="outline"
          brand={<Box display={{ base: "block", md: "none" }}><NissiBrand compact /></Box>}
          extra={<Text fontWeight="semibold">{viewTitles[activeView]}</Text>}
          showThemeToggle
          theme={isDark ? "dark" : "light"}
          onThemeChange={setTheme}
        />
      )}
      sidebar={(
        <NSidebar
          items={catalogNavigation}
          activeItemId={activeView}
          onItemSelect={(item) => {
            if (item.data?.view) setActiveView(item.data.view)
          }}
          searchable
          variant="plain"
          expandedWidth="19rem"
          header={(
            <Box px="2"><NissiBrand /></Box>
          )}
          footer={(
            <Stack gap="1" px="2">
              <Text fontSize="sm" fontWeight="medium">nissi-ui</Text>
              <Text color="fg.muted" fontSize="xs">v0.1.0 · En desarrollo</Text>
            </Stack>
          )}
        />
      )}
    >
      {content}
    </NAppShell>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DemoProvider>
      <DevelopmentApp />
    </DemoProvider>
  </StrictMode>,
)
