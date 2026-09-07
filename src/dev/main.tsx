import {
  Badge,
  Box,
  Button,
  Card,
  Code,
  Field,
  Flex,
  Heading,
  HStack,
  Image,
  Input,
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
  ChartPie,
  CircleDollarSign,
  ClipboardList,
  CloudOff,
  CreditCard,
  Database,
  Home,
  Keyboard,
  Layers3,
  LayoutDashboard,
  ListPlus,
  LogOut,
  Moon,
  PanelLeft,
  PanelRight,
  PanelTop,
  PackageCheck,
  Palette,
  RefreshCw,
  ReceiptText,
  ScanLine,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  ShoppingCart,
  TableProperties,
  Users,
} from "lucide-react"
import { StrictMode, useState } from "react"
import { createRoot } from "react-dom/client"

import { NAdjustmentEditor, NAmountAllocator, NAmountInput, NAppShell, NApprovalFlow, NBalanceSession, NCodeCapture, NCtrl, NCtrlProvider, NDataTable, NDocumentView, NForm, NHeader, NItemPicker, NLineItemEditor, NModuleRegistry, NOfflineBoundary, NPermissionGate, NPermissionsProvider, NSidebar, NStepFlow, NSyncStatus, NTable, NTheme, NWorkspaceSwitcher, canUseNFactureView, createNFactureNavigation, useNTheme, type NAdjustmentField, type NAmountAllocation, type NApprovalHistoryEntry, type NApprovalStatus, type NCtrlShortcut, type NDocumentAction, type NFactureRole, type NFactureView, type NFormConfig, type NLineItemField, type NModuleDefinition, type NSidebarItem, type NStepFlowStep, type NSyncState, type NTableConfig, type NWorkspace } from "../index"
import { ComponentDocs } from "./ComponentDocs"
import { PanelView } from "./PanelView"
import { CartView, CheckoutView, PosExampleView, ReceiptView, ThermalPrintView } from "./Phase7Views"
import { ActivityPatternsView, DashboardPatternsView, DataPatternsView, PagePatternsView, SaasPatternsView, VerticalPatternsView } from "./FinalPhaseViews"
import { DemoProvider } from "./provider"
import { FactureProjectView } from "./FactureProjectView"
import { CtrlView } from "./CtrlView"
import { BeginnerAccessibilityGuideView, DashboardStylesView } from "./AccessibilityViews"

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


type DemoView = "overview" | "theme" | "item-picker" | "line-item-editor" | "amount-input" | "amount-allocator" | "step-flow" | "approval-flow" | "balance-session" | "adjustment-editor" | "document-view" | "code-capture" | "sync-status" | "offline-boundary" | "cart" | "checkout" | "receipt" | "thermal-print" | "pos-example" | "panel" | "ctrl" | "page-patterns" | "data-patterns" | "activity-patterns" | "dashboard-patterns" | "saas-patterns" | "vertical-patterns" | "app-shell" | "modules" | "workspaces" | "header" | "sidebar" | "table" | "datatable" | "form" | "permissions" | "facture" | "accessibility-styles" | "accessibility-guide"
type DemoNavigationData = { view?: DemoView; factureView?: NFactureView }

function createFactureProjectNavigation(role: NFactureRole): NSidebarItem<DemoNavigationData> {
  const factureNavigation = createNFactureNavigation({ role })[0]!
  return {
  id: factureNavigation.id,
  label: factureNavigation.label,
  icon: factureNavigation.icon,
  href: factureNavigation.href,
  badge: factureNavigation.badge,
  disabled: factureNavigation.disabled,
  requiredPermission: factureNavigation.requiredPermission,
  permissionMode: factureNavigation.permissionMode,
  data: { view: "facture", factureView: "dashboard" },
  children: factureNavigation.children?.map((item) => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
    href: item.href,
    badge: item.badge,
    disabled: item.disabled,
    requiredPermission: item.requiredPermission,
    permissionMode: item.permissionMode,
    data: { view: "facture", factureView: item.data?.view },
  })),
  }
}

const factureProjectNavigation = createFactureProjectNavigation("admin")

const catalogNavigation: NSidebarItem<DemoNavigationData>[] = [
  { id: "overview", label: "Inicio", icon: <Home size={18} />, data: { view: "overview" } },
  {
    id: "components",
    label: "Componentes",
    icon: <Blocks size={18} />,
    children: [
      { id: "theme", label: "NTheme", icon: <Palette size={17} />, badge: "Nuevo", data: { view: "theme" } },
      { id: "item-picker", label: "NItemPicker", icon: <PackageCheck size={17} />, badge: "Nuevo", data: { view: "item-picker" } },
      { id: "line-item-editor", label: "NLineItemEditor", icon: <ListPlus size={17} />, badge: "Nuevo", data: { view: "line-item-editor" } },
      { id: "amount-input", label: "NAmountInput", icon: <CircleDollarSign size={17} />, badge: "Nuevo", data: { view: "amount-input" } },
      { id: "amount-allocator", label: "NAmountAllocator", icon: <ChartPie size={17} />, badge: "Nuevo", data: { view: "amount-allocator" } },
      { id: "step-flow", label: "NStepFlow", icon: <ListPlus size={17} />, badge: "Nuevo", data: { view: "step-flow" } },
      { id: "approval-flow", label: "NApprovalFlow", icon: <ShieldCheck size={17} />, badge: "Nuevo", data: { view: "approval-flow" } },
      { id: "balance-session", label: "NBalanceSession", icon: <CircleDollarSign size={17} />, badge: "Nuevo", data: { view: "balance-session" } },
      { id: "adjustment-editor", label: "NAdjustmentEditor", icon: <ListPlus size={17} />, badge: "Nuevo", data: { view: "adjustment-editor" } },
      { id: "document-view", label: "NDocumentView", icon: <ClipboardList size={17} />, badge: "Nuevo", data: { view: "document-view" } },
      { id: "code-capture", label: "NCodeCapture", icon: <ScanLine size={17} />, badge: "Nuevo", data: { view: "code-capture" } },
      { id: "sync-status", label: "NSyncStatus", icon: <RefreshCw size={17} />, badge: "Nuevo", data: { view: "sync-status" } },
      { id: "offline-boundary", label: "NOfflineBoundary", icon: <CloudOff size={17} />, badge: "Nuevo", data: { view: "offline-boundary" } },
      { id: "cart", label: "NCart", icon: <ShoppingCart size={17} />, badge: "Nuevo", data: { view: "cart" } },
      { id: "checkout", label: "NCheckout", icon: <CreditCard size={17} />, badge: "Nuevo", data: { view: "checkout" } },
      { id: "receipt", label: "NReceipt", icon: <ReceiptText size={17} />, badge: "Nuevo", data: { view: "receipt" } },
      { id: "thermal-print", label: "NThermalPrint", icon: <ReceiptText size={17} />, badge: "Nuevo", data: { view: "thermal-print" } },
      { id: "pos-example", label: "Ejemplo POS", icon: <Store size={17} />, badge: "Fase 7", data: { view: "pos-example" } },
      { id: "panel", label: "NPanel", icon: <PanelRight size={17} />, badge: "Nuevo", data: { view: "panel" } },
      { id: "ctrl", label: "NCtrl", icon: <Keyboard size={17} />, badge: "Nuevo", data: { view: "ctrl" } },
      { id: "page-patterns", label: "Estados y navegación", icon: <Layers3 size={17} />, badge: "Final", data: { view: "page-patterns" } },
      { id: "data-patterns", label: "Datos server-side", icon: <Database size={17} />, badge: "Final", data: { view: "data-patterns" } },
      { id: "activity-patterns", label: "Actividad y archivos", icon: <Bell size={17} />, badge: "Final", data: { view: "activity-patterns" } },
      { id: "dashboard-patterns", label: "Dashboards", icon: <BarChart3 size={17} />, badge: "Final", data: { view: "dashboard-patterns" } },
      { id: "saas-patterns", label: "Administración SaaS", icon: <ShieldCheck size={17} />, badge: "Final", data: { view: "saas-patterns" } },
      { id: "vertical-patterns", label: "Patrones verticales", icon: <LayoutDashboard size={17} />, badge: "Final", data: { view: "vertical-patterns" } },
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
      { ...factureProjectNavigation, badge: "Nuevo" },
      {
        id: "accessibility",
        label: "Accesibilidad",
        icon: <Check size={17} />,
        badge: "Nuevo",
        children: [
          { id: "accessibility-styles", label: "Estilos de dashboard", icon: <Palette size={17} />, data: { view: "accessibility-styles" } },
          { id: "accessibility-guide", label: "Guía desde cero", icon: <ClipboardList size={17} />, data: { view: "accessibility-guide" } },
        ],
      },
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
  theme: "NTheme",
  "item-picker": "NItemPicker",
  "line-item-editor": "NLineItemEditor",
  "amount-input": "NAmountInput",
  "amount-allocator": "NAmountAllocator",
  "step-flow": "NStepFlow",
  "approval-flow": "NApprovalFlow",
  "balance-session": "NBalanceSession",
  "adjustment-editor": "NAdjustmentEditor",
  "document-view": "NDocumentView",
  "code-capture": "NCodeCapture",
  "sync-status": "NSyncStatus",
  "offline-boundary": "NOfflineBoundary",
  cart: "NCart",
  checkout: "NCheckout",
  receipt: "NReceipt",
  "thermal-print": "NThermalPrint",
  "pos-example": "Ejemplo POS integrado",
  panel: "NPanel",
  ctrl: "NCtrl · Atajos contextuales",
  "page-patterns": "Estados y navegación",
  "data-patterns": "Datos server-side",
  "activity-patterns": "Actividad y archivos",
  "dashboard-patterns": "Dashboards",
  "saas-patterns": "Administración SaaS",
  "vertical-patterns": "Patrones verticales",
  "app-shell": "NAppShell",
  modules: "NModuleRegistry",
  workspaces: "NWorkspaceSwitcher",
  header: "NHeader",
  sidebar: "NSidebar",
  table: "NTable",
  datatable: "NDataTable",
  form: "NForm",
  permissions: "NPermissionGate",
  facture: "NFacture · Facturación México",
  "accessibility-styles": "Accesibilidad · Estilos de dashboard",
  "accessibility-guide": "Accesibilidad · Guía desde cero",
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
            ["NTheme", "Sincroniza temas, persistencia y superficies en toda la aplicación.", "theme", <Palette key="theme" size={20} />],
            ["NItemPicker", "Busca, agrupa y selecciona cualquier tipo de entidad.", "item-picker", <PackageCheck key="picker" size={20} />],
            ["NLineItemEditor", "Compone y edita partidas sin imponer reglas de un sector.", "line-item-editor", <ListPlus key="lines" size={20} />],
            ["NAmountInput", "Captura cantidades e importes con formato y límites configurables.", "amount-input", <CircleDollarSign key="amount" size={20} />],
            ["NAmountAllocator", "Distribuye un total entre opciones tipadas sin reglas financieras internas.", "amount-allocator", <ChartPie key="allocator" size={20} />],
            ["NStepFlow", "Coordina borradores tipados, validación y navegación por pasos.", "step-flow", <ListPlus key="step-flow" size={20} />],
            ["NApprovalFlow", "Presenta solicitudes, decisiones y trazabilidad adaptable.", "approval-flow", <ShieldCheck key="approval-flow" size={20} />],
            ["NBalanceSession", "Compara valores esperados y observados en una sesión operativa.", "balance-session", <CircleDollarSign key="balance-session" size={20} />],
            ["NAdjustmentEditor", "Propone correcciones sin ocultar el valor original ni su motivo.", "adjustment-editor", <ListPlus key="adjustment-editor" size={20} />],
            ["NDocumentView", "Presenta documentos y acciones con una estructura imprimible.", "document-view", <ClipboardList key="document-view" size={20} />],
            ["NCodeCapture", "Captura códigos por teclado, pegado o un lector externo.", "code-capture", <ScanLine key="code-capture" size={20} />],
            ["NSyncStatus", "Comunica el estado real, la cola y los reintentos de sincronización.", "sync-status", <RefreshCw key="sync-status" size={20} />],
            ["NOfflineBoundary", "Mantiene o sustituye contenido cuando cambia la conectividad.", "offline-boundary", <CloudOff key="offline-boundary" size={20} />],
            ["NCart", "Compone partidas y totales comerciales inyectados por la aplicación.", "cart", <ShoppingCart key="cart" size={20} />],
            ["NCheckout", "Coordina pagos divididos y confirmación asíncrona de la operación.", "checkout", <CreditCard key="checkout" size={20} />],
            ["NReceipt", "Presenta comprobantes adaptables, responsive e imprimibles.", "receipt", <ReceiptText key="receipt" size={20} />],
            ["Ejemplo POS", "Integra captura, carrito, checkout, recibo y operación offline.", "pos-example", <Store key="pos-example" size={20} />],
            ["NPanel", "Presenta y alterna procesos completos en una superficie lateral modal.", "panel", <PanelRight key="panel" size={20} />],
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

type DemoDocumentLine = {
  id: string
  itemId: number
  label: string
  category: string
  quantity: number
  unit: "pieza" | "servicio"
  unitValue: number
}

type DemoAllocationMethod = {
  id: string
  label: string
  description: string
}

type DemoFlowState = {
  name: string
  owner: string
  notes: string
}

type DemoApprovalRequest = {
  id: string
  title: string
  description: string
  area: string
}

const demoAllocationMethods: DemoAllocationMethod[] = [
  { id: "operations", label: "Operación", description: "Recursos para la ejecución diaria." },
  { id: "growth", label: "Crecimiento", description: "Iniciativas de adquisición y expansión." },
  { id: "reserve", label: "Reserva", description: "Margen para contingencias." },
]

/** Vista de ejemplo y documentación del controlador global de temas. */
function ThemeView() {
  const { theme, resolvedTheme } = useNTheme()

  return (
    <Stack gap="8">
      <PageIntro
        eyebrow="Sistema visual"
        title="NTheme"
        description="Un único puente para elegir, persistir y sincronizar temas, incluido Nissi Dark con la paleta prismática del isotipo."
      />

      <Card.Root variant="outline" bg="bg.panel">
        <Card.Body gap="6">
          <Flex direction={{ base: "column", md: "row" }} align={{ base: "stretch", md: "center" }} justify="space-between" gap="4">
            <Stack gap="1">
              <Heading as="h2" size="lg">Tema activo: {theme}</Heading>
              <Text color="fg.muted">Apariencia efectiva: {resolvedTheme}. La preferencia se comparte con header, sidebar, tablas y formularios.</Text>
            </Stack>
            <HStack gap="3"><NTheme /><NTheme presentation="button" /></HStack>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
            {([
              ["Fondo sutil", "bg.subtle"],
              ["Superficie elevada", "bg.muted"],
              ["Panel", "bg.panel"],
            ] as const).map(([label, background]) => (
              <Box key={label} bg={background} borderWidth="1px" borderColor="border" rounded="lg" p="5">
                <Text fontWeight="semibold">{label}</Text>
                <Text color="fg.muted" fontSize="sm" mt="1">Texto secundario y borde semánticos.</Text>
              </Box>
            ))}
          </SimpleGrid>

          <Stack gap="3">
            <Stack gap="1">
              <Heading as="h3" size="sm">Paleta de Nissi Dark</Heading>
              <Text color="fg.muted" fontSize="sm">Azul e índigo conducen la interfaz; cian, violeta y lavanda se reservan para foco y acentos.</Text>
            </Stack>
            <SimpleGrid columns={{ base: 2, sm: 3, lg: 5 }} gap="3">
              {([
                ["Cian", "nissi.cyan", "#5ACFFD"],
                ["Azul", "nissi.blue", "#1461DE"],
                ["Índigo", "nissi.indigo", "#1D2EAF"],
                ["Violeta", "nissi.violet", "#6947DB"],
                ["Lavanda", "nissi.lavender", "#CD97FC"],
              ] as const).map(([name, token, value]) => (
                <Box key={name} overflow="hidden" borderWidth="1px" borderColor="border" rounded="lg" bg="bg.subtle">
                  <Box height="14" bg={token} />
                  <Stack gap="0" p="3">
                    <Text fontSize="sm" fontWeight="semibold">{name}</Text>
                    <Text color="fg.muted" fontFamily="mono" fontSize="xs">{value}</Text>
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
          </Stack>
        </Card.Body>
      </Card.Root>

      <ComponentDocs
        purpose="NTheme centraliza el contrato visual de Nissi UI. NThemeProvider instala el sistema Chakra, restaura la preferencia y publica el tema efectivo; NTheme ofrece el selector accesible que NHeader también consume automáticamente."
        steps={[
          "Envuelve una sola vez la raíz de la aplicación con NThemeProvider.",
          "Coloca NTheme donde el usuario deba elegir su apariencia, usando presentación de icono o botón.",
          "Usa useNTheme únicamente cuando otra lógica de aplicación necesite conocer el tema efectivo.",
          "Personaliza los textos mediante labels y conserva tokens semánticos en todos los componentes visuales.",
        ]}
        variants={[
          { name: "presentation=\"icon\"", description: "Control compacto con tooltip, ideal para NHeader." },
          { name: "presentation=\"button\"", description: "Muestra icono y nombre del tema actual; útil en preferencias." },
          { name: "themes={[...]}", description: "Limita localmente las opciones visibles sin romper la sincronización global." },
          { name: "theme / defaultTheme", description: "NThemeProvider admite estado controlado o persistencia automática." },
          { name: "theme=\"nissi\"", description: "Nissi Dark aplica superficies índigo-tinta y los acentos del isotipo." },
        ]}
        variantExamples={[
          { id: "icon", label: "Icono", summary: "presentation=\"icon\"", preview: <NTheme />, code: `<NTheme presentation="icon" />` },
          { id: "button", label: "Botón", summary: "presentation=\"button\"", preview: <NTheme presentation="button" />, code: `<NTheme presentation="button" />` },
          { id: "limited", label: "Opciones", summary: "themes={[\"light\", \"dark\", \"navy\", \"nissi\"]}", preview: <NTheme presentation="button" themes={["light", "dark", "navy", "nissi"]} />, code: `<NTheme themes={["light", "dark", "navy", "nissi"]} presentation="button" />` },
        ]}
        propExamples={[
          { label: "Proveedor controlado", code: `<NThemeProvider theme={theme} onThemeChange={setTheme}>\n  <App />\n</NThemeProvider>` },
          { label: "Integración automática con el header", code: `<NHeader showThemeToggle themePresentation="button" />` },
        ]}
        code={`import { NTheme, NThemeProvider } from "nissi-ui"

createRoot(document.getElementById("root")!).render(
  <NThemeProvider defaultTheme="system">
    <App />
    <NTheme presentation="button" />
  </NThemeProvider>,
)`}
      />
    </Stack>
  )
}

/** Vista de ejemplo del selector genérico que inicia el roadmap de flujos operativos. */
function ItemPickerView() {
  const [selectedIds, setSelectedIds] = useState<string[]>(["1"])
  const formatPrice = (price: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(price)
  const renderProductPicker = () => (
    <NItemPicker
      items={productConfig.data}
      getItemId={(product) => String(product.id)}
      getItemLabel={(product) => product.product}
      getItemDescription={(product) => `${product.category} · ${product.stock} disponibles`}
      getSearchText={(product) => `${product.id} ${product.category}`}
      groupBy={(product) => product.category}
      selectionMode="multiple"
      selectedIds={selectedIds}
      onSelectionChange={(_, ids) => setSelectedIds([...ids])}
      renderLeading={() => (
        <Flex align="center" justify="center" boxSize="9" rounded="md" bg="colorPalette.subtle" color="colorPalette.fg">
          <PackageCheck size={18} />
        </Flex>
      )}
      renderTrailing={(product) => <Text color="colorPalette.fg" fontWeight="semibold">{formatPrice(product.price)}</Text>}
    />
  )

  return (
    <Stack gap="8">
      <PageIntro
        eyebrow="Flujos generalizables · Fase 1"
        title="NItemPicker"
        description="Selección visible, buscable y componible para productos, servicios, personas, activos o cualquier entidad tipada."
      />

      <Card.Root variant="outline" bg="bg.panel">
        <Card.Body gap="5">
          <Flex direction={{ base: "column", md: "row" }} align={{ base: "stretch", md: "center" }} justify="space-between" gap="3">
            <Stack gap="1">
              <Heading as="h2" size="lg">Catálogo de ejemplo</Heading>
              <Text color="fg.muted">Busca por nombre, categoría o identificador y prueba la selección múltiple.</Text>
            </Stack>
            <Badge alignSelf={{ base: "start", md: "center" }} colorPalette="blue">{selectedIds.length} seleccionados</Badge>
          </Flex>
          {renderProductPicker()}
        </Card.Body>
      </Card.Root>

      <ComponentDocs
        purpose="NItemPicker desacopla la selección de entidades de cualquier dominio. El consumidor aporta identidad, etiqueta y adaptadores opcionales; el componente resuelve búsqueda, selección, responsive y accesibilidad."
        steps={[
          "Entrega la colección y define getItemId/getItemLabel con identidad estable.",
          "Añade descripción, texto de búsqueda o agrupación sólo cuando aporten contexto.",
          "Elige selección single, multiple o none y controla selectedIds cuando otra capa sea la fuente de verdad.",
          "Usa los slots visuales y labels sin introducir reglas comerciales dentro del selector.",
        ]}
        variants={[
          { name: "layout=\"grid\" | \"list\"", description: "Alterna entre exploración visual responsive y lectura compacta." },
          { name: "selectionMode=\"single\" | \"multiple\" | \"none\"", description: "Cubre elección persistente o activación directa para agregar a otra estructura." },
          { name: "groupBy", description: "Organiza cualquier colección sin modificar sus datos." },
          { name: "shouldFilter={false}", description: "Permite controlar búsquedas remotas y estados de carga desde el consumidor." },
        ]}
        variantExamples={[
          {
            id: "grid",
            label: "Grid",
            summary: "layout=\"grid\"",
            preview: renderProductPicker(),
            code: `<NItemPicker
  items={products}
  getItemId={(product) => product.sku}
  getItemLabel={(product) => product.name}
  selectionMode="multiple"
/>`,
          },
          {
            id: "list",
            label: "Lista agrupada",
            summary: "layout=\"list\" groupBy={...}",
            preview: (
              <NItemPicker
                items={productConfig.data.slice(0, 4)}
                getItemId={(product) => String(product.id)}
                getItemLabel={(product) => product.product}
                getItemDescription={(product) => formatPrice(product.price)}
                groupBy={(product) => product.category}
                layout="list"
                defaultSelectedIds={["2"]}
              />
            ),
            code: `<NItemPicker
  items={services}
  getItemId={(service) => service.id}
  getItemLabel={(service) => service.name}
  groupBy={(service) => service.category}
  layout="list"
/>`,
          },
          {
            id: "action",
            label: "Acción directa",
            summary: "selectionMode=\"none\"",
            preview: (
              <NItemPicker
                items={productConfig.data.slice(0, 3)}
                getItemId={(product) => String(product.id)}
                getItemLabel={(product) => product.product}
                getItemDescription={(product) => formatPrice(product.price)}
                selectionMode="none"
                searchable={false}
              />
            ),
            code: `<NItemPicker
  items={products}
  getItemId={(product) => product.sku}
  getItemLabel={(product) => product.name}
  selectionMode="none"
  onItemSelect={addLine}
/>`,
          },
        ]}
        propExamples={[
          { label: "Búsqueda remota", code: `<NItemPicker searchValue={query} onSearchValueChange={setQuery} shouldFilter={false} loading={isLoading} {...props} />` },
          { label: "Contenido personalizado", code: `<NItemPicker renderLeading={renderAvatar} renderTrailing={renderStatus} {...props} />` },
        ]}
        code={`const [selectedIds, setSelectedIds] = useState<string[]>([])

<NItemPicker
  items={items}
  getItemId={(item) => item.id}
  getItemLabel={(item) => item.name}
  getItemDescription={(item) => item.description}
  getSearchText={(item) => item.code}
  groupBy={(item) => item.category}
  selectionMode="multiple"
  selectedIds={selectedIds}
  onSelectionChange={(_, ids) => setSelectedIds([...ids])}
/>`}
      />
    </Stack>
  )
}

/** Vista del patrón genérico para construir y editar partidas operativas. */
function LineItemEditorView() {
  const [lines, setLines] = useState<DemoDocumentLine[]>([
    { id: "line-1", itemId: 1, label: "Teclado mecánico", category: "Accesorios", quantity: 1, unit: "pieza", unitValue: 1899 },
    { id: "line-2", itemId: 2, label: "Monitor 27 pulgadas", category: "Pantallas", quantity: 2, unit: "pieza", unitValue: 6299 },
  ])
  const formatValue = (value: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value)
  const fields: NLineItemField<DemoDocumentLine>[] = [
    {
      id: "quantity",
      header: "Cantidad",
      inputType: "number",
      width: "7rem",
      min: 1,
      step: 1,
      getValue: (line) => line.quantity,
      setValue: (line, value) => ({ ...line, quantity: Number(value) }),
      validate: (value) => Number(value) > 0 ? undefined : "Usa un valor mayor que cero.",
    },
    {
      id: "unit",
      header: "Unidad",
      inputType: "select",
      width: "8rem",
      options: [{ label: "Pieza", value: "pieza" }, { label: "Servicio", value: "servicio" }],
      getValue: (line) => line.unit,
      setValue: (line, value) => ({ ...line, unit: String(value) as DemoDocumentLine["unit"] }),
    },
    {
      id: "unitValue",
      header: "Valor unitario",
      width: "9rem",
      align: "end",
      getValue: (line) => line.unitValue,
      formatValue: (value) => formatValue(Number(value)),
    },
    {
      id: "total",
      header: "Importe",
      width: "9rem",
      align: "end",
      getValue: (line) => line.quantity * line.unitValue,
      formatValue: (value) => <Text fontWeight="semibold">{formatValue(Number(value))}</Text>,
    },
  ]

  const editor = (readOnly = false) => (
    <NLineItemEditor
      items={productConfig.data}
      getItemId={(product) => String(product.id)}
      getItemLabel={(product) => product.product}
      createLine={(product): DemoDocumentLine => ({
        id: `line-${product.id}`,
        itemId: product.id,
        label: product.product,
        category: product.category,
        quantity: 1,
        unit: "pieza",
        unitValue: product.price,
      })}
      getLineId={(line) => line.id}
      getLineLabel={(line) => line.label}
      getLineDescription={(line) => line.category}
      fields={fields}
      lines={lines}
      onLinesChange={(nextLines) => setLines([...nextLines])}
      resolveAdd={({ line, lines: currentLines }) => {
        const exists = currentLines.some((current) => current.itemId === line.itemId)
        return exists
          ? currentLines.map((current) => current.itemId === line.itemId ? { ...current, quantity: current.quantity + 1 } : current)
          : [...currentLines, line]
      }}
      pickerProps={{
        getItemDescription: (product) => `${product.category} · ${product.stock} disponibles`,
        getSearchText: (product) => `${product.id} ${product.category}`,
        groupBy: (product) => product.category,
        columns: { base: 1, md: 2 },
        renderTrailing: (product) => <Text color="colorPalette.fg" fontWeight="semibold">{formatValue(product.price)}</Text>,
      }}
      renderLineLeading={() => (
        <Flex align="center" justify="center" boxSize="9" flexShrink="0" rounded="md" bg="colorPalette.subtle" color="colorPalette.fg">
          <ListPlus size={18} />
        </Flex>
      )}
      readOnly={readOnly}
    />
  )

  return (
    <Stack gap="8">
      <PageIntro
        eyebrow="Flujos generalizables · Fase 2"
        title="NLineItemEditor"
        description="Construye y edita partidas tipadas para documentos y operaciones sin asumir productos, cantidades, precios, impuestos ni monedas."
      />

      <Card.Root variant="outline" bg="bg.panel">
        <Card.Body gap="5">
          <Stack gap="1">
            <Heading as="h2" size="lg">Documento de ejemplo</Heading>
            <Text color="fg.muted">Agrega elementos, cambia valores, reordena o elimina. Repetir un elemento incrementa su cantidad mediante un adaptador externo.</Text>
          </Stack>
          {editor()}
        </Card.Body>
      </Card.Root>

      <ComponentDocs
        purpose="NLineItemEditor separa la mecánica común de las partidas de las reglas del negocio. El consumidor conserva sus tipos, crea cada línea, configura los campos y decide cómo tratar duplicados; el componente aporta interacción, responsive, estados y accesibilidad."
        steps={[
          "Entrega el catálogo y sus adaptadores getItemId/getItemLabel.",
          "Implementa createLine, getLineId y getLineLabel con la forma real de tu documento.",
          "Declara campos editables o de sólo lectura mediante NLineItemField<TLine>.",
          "Controla lines/onLinesChange y coloca cálculos o políticas de duplicados fuera del componente.",
        ]}
        variants={[
          { name: "lines / defaultLines", description: "Admite estado controlado o local para borradores simples." },
          { name: "resolveAdd", description: "Agrega, fusiona, reemplaza o rechaza duplicados según el sistema." },
          { name: "readOnly", description: "Conserva el documento legible sin controles de edición ni acciones destructivas." },
          { name: "pickerProps", description: "Reutiliza búsqueda, agrupación, layouts y slots de NItemPicker." },
        ]}
        variantExamples={[
          {
            id: "editable",
            label: "Editable",
            summary: "fields + onLinesChange",
            preview: editor(),
            code: `<NLineItemEditor
  items={catalog}
  createLine={createLine}
  fields={fields}
  lines={lines}
  onLinesChange={setLines}
  {...identityAdapters}
/>`,
          },
          {
            id: "readonly",
            label: "Sólo lectura",
            summary: "readOnly",
            preview: editor(true),
            code: `<NLineItemEditor lines={lines} fields={fields} readOnly {...adapters} />`,
          },
          {
            id: "empty",
            label: "Vacío",
            summary: "defaultLines={[]}",
            preview: (
              <NLineItemEditor
                items={productConfig.data.slice(0, 3)}
                getItemId={(product) => String(product.id)}
                getItemLabel={(product) => product.product}
                createLine={(product): DemoDocumentLine => ({ id: String(product.id), itemId: product.id, label: product.product, category: product.category, quantity: 1, unit: "pieza", unitValue: product.price })}
                getLineId={(line) => line.id}
                getLineLabel={(line) => line.label}
                fields={fields}
              />
            ),
            code: `<NLineItemEditor defaultLines={[]} emptyState={<CustomEmpty />} {...props} />`,
          },
        ]}
        propExamples={[
          { label: "Fusionar duplicados", code: `<NLineItemEditor resolveAdd={({ line, lines }) => mergeLine(lines, line)} {...props} />` },
          { label: "Campo personalizado", code: `<NLineItemEditor fields={[{ id: "owner", header: "Responsable", getValue, render: renderOwner }]} {...props} />` },
          { label: "Restricciones por línea", code: `<NLineItemEditor canRemoveLine={canDelete} canReorderLine={canMove} isLineDisabled={isLocked} {...props} />` },
        ]}
        code={`const fields: NLineItemField<MyLine>[] = [
  {
    id: "amount",
    header: "Cantidad",
    inputType: "number",
    getValue: (line) => line.amount,
    setValue: (line, value) => ({ ...line, amount: Number(value) }),
  },
]

<NLineItemEditor
  items={items}
  getItemId={(item) => item.id}
  getItemLabel={(item) => item.name}
  createLine={createLine}
  getLineId={(line) => line.id}
  getLineLabel={(line) => line.label}
  fields={fields}
  lines={lines}
  onLinesChange={(next) => setLines([...next])}
/>`}
      />
    </Stack>
  )
}

/** Vista de la primitiva neutral para capturar valores medibles. */
function AmountInputView() {
  const [hours, setHours] = useState<number | null>(8)
  const [budget, setBudget] = useState<number | null>(2500)
  const [progress, setProgress] = useState<number | null>(0.25)

  return (
    <Stack gap="8">
      <PageIntro
        eyebrow="Flujos generalizables · Fase 3"
        title="NAmountInput"
        description="Captura cantidades, importes, porcentajes, horas o cualquier valor numérico con una API controlable, internacionalizable y accesible."
      />

      <Card.Root variant="outline" bg="bg.panel">
        <Card.Body gap="6">
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="5">
            <NAmountInput label="Horas asignadas" value={hours} onValueChange={(nextHours) => setHours(nextHours)} min={0} max={40} step={0.5} showControls helperText="Incrementos de media hora." />
            <NAmountInput
              label="Presupuesto"
              value={budget}
              onValueChange={(nextBudget) => setBudget(nextBudget)}
              min={0}
              locale="es-MX"
              formatOptions={{ style: "currency", currency: "MXN", maximumFractionDigits: 2 }}
              quickValues={[{ value: 1000, label: "$1,000" }, { value: 2500, label: "$2,500" }, { value: 5000, label: "$5,000" }]}
            />
            <NAmountInput label="Avance" value={progress} onValueChange={(nextProgress) => setProgress(nextProgress)} min={0} max={1} step={0.05} locale="es-MX" formatOptions={{ style: "percent", maximumFractionDigits: 0 }} showControls />
          </SimpleGrid>
          <Text aria-live="polite" color="fg.muted" fontSize="sm">
            Valores actuales: {hours ?? "—"} h · {budget === null ? "—" : budget.toLocaleString("es-MX", { style: "currency", currency: "MXN" })} · {progress === null ? "—" : progress.toLocaleString("es-MX", { style: "percent", maximumFractionDigits: 0 })}
          </Text>
          <Text color="fg.muted" fontSize="sm">Los tres controles comparten la misma primitiva; sólo cambian límites, paso y `Intl.NumberFormatOptions`.</Text>
        </Card.Body>
      </Card.Root>

      <ComponentDocs
        purpose="NAmountInput es una capa fina de formulario sobre NumberInput de Chakra UI v3: conserva number | null como contrato público e integra Field, errores, ayuda, labels y valores rápidos. Para un número aislado sin este contrato compartido, conviene usar Chakra directamente."
        steps={[
          "Usa value/onValueChange si el formulario o store es la fuente de verdad, o defaultValue para estado local.",
          "Configura min, max y step según la medida real del sistema.",
          "Entrega locale y formatOptions para presentación internacional, sin concatenar símbolos manualmente.",
          "Añade labels, ayuda, errores y valores rápidos cuando mejoren la captura.",
        ]}
        variants={[
          { name: "showControls", description: "Activa incrementos accesibles para cantidades discretas o pasos conocidos." },
          { name: "formatOptions", description: "Admite cualquier formato de Intl: decimal, moneda, porcentaje o unidad." },
          { name: "quickValues", description: "Expone atajos opcionales que respetan los límites configurados." },
          { name: "readOnly / disabled", description: "Distingue presentación no editable de indisponibilidad operativa." },
        ]}
        variantExamples={[
          { id: "quantity", label: "Cantidad", summary: "step={0.5} showControls", preview: <NAmountInput label="Horas" defaultValue={8} min={0} max={40} step={0.5} showControls />, code: `<NAmountInput label="Horas" defaultValue={8} min={0} max={40} step={0.5} showControls />` },
          { id: "currency", label: "Importe", summary: "formatOptions={{ style: \"currency\" }}", preview: <NAmountInput label="Importe" defaultValue={1250} locale="es-MX" formatOptions={{ style: "currency", currency: "MXN" }} />, code: `<NAmountInput label="Importe" locale="es-MX" formatOptions={{ style: "currency", currency: "MXN" }} />` },
          { id: "quick", label: "Valores rápidos", summary: "quickValues={[...]}", preview: <NAmountInput label="Capacidad" defaultValue={25} min={0} max={100} quickValues={[{ value: 25 }, { value: 50 }, { value: 100 }]} />, code: `<NAmountInput quickValues={[{ value: 25 }, { value: 50 }, { value: 100 }]} {...props} />` },
        ]}
        propExamples={[
          { label: "Estado controlado", code: `<NAmountInput value={amount} onValueChange={setAmount} />` },
          { label: "Porcentaje", code: `<NAmountInput min={0} max={1} step={0.05} formatOptions={{ style: "percent" }} />` },
          { label: "Validación", code: `<NAmountInput required invalid={Boolean(error)} errorText={error} />` },
        ]}
        code={`const [amount, setAmount] = useState<number | null>(null)

<NAmountInput
  label="Valor"
  value={amount}
  onValueChange={setAmount}
  min={0}
  step={0.01}
  locale="es-MX"
  formatOptions={{ style: "currency", currency: "MXN" }}
/>`}
      />
    </Stack>
  )
}

/** Vista del patrón de distribución neutral de valores. */
function AmountAllocatorView() {
  const [allocations, setAllocations] = useState<NAmountAllocation<DemoAllocationMethod>[]>([
    { method: demoAllocationMethods[0], amount: 45000 },
    { method: demoAllocationMethods[1], amount: 30000 },
    { method: demoAllocationMethods[2], amount: 0 },
  ])
  const commonProps = {
    total: 120000,
    methods: demoAllocationMethods,
    getMethodId: (method: DemoAllocationMethod) => method.id,
    getMethodLabel: (method: DemoAllocationMethod) => method.label,
    getMethodDescription: (method: DemoAllocationMethod) => method.description,
    locale: "es-MX",
    formatOptions: { style: "currency", currency: "MXN" } as Intl.NumberFormatOptions,
  }

  return (
    <Stack gap="8">
      <PageIntro
        eyebrow="Flujos generalizables · Fase 3"
        title="NAmountAllocator"
        description="Distribuye un total entre métodos de pago, presupuestos, centros de costo, comisiones o cualquier colección tipada."
      />

      <Card.Root variant="outline" bg="bg.panel">
        <Card.Body gap="5">
          <Stack gap="1">
            <Heading as="h2" size="lg">Distribución de ejemplo</Heading>
            <Text color="fg.muted">La colección representa categorías presupuestarias, pero el componente sólo conoce identidad, etiqueta y valor.</Text>
          </Stack>
          <NAmountAllocator
            {...commonProps}
            allocations={allocations}
            onAllocationsChange={(nextAllocations) => setAllocations([...nextAllocations])}
            amountInputProps={{ step: 500, quickValues: [{ value: 10000, label: "$10k" }, { value: 25000, label: "$25k" }] }}
            renderMethodLeading={() => <Flex align="center" justify="center" boxSize="9" rounded="md" bg="colorPalette.subtle" color="colorPalette.fg"><ChartPie size={18} /></Flex>}
          />
        </Card.Body>
      </Card.Root>

      <ComponentDocs
        purpose="NAmountAllocator coordina múltiples NAmountInput y mantiene exacta la relación total/asignado/restante. La identidad y descripción de los destinos son adaptadores genéricos; ninguna opción se interpreta como pago, cuenta o presupuesto dentro del núcleo."
        steps={[
          "Entrega total, methods y adaptadores de identidad y etiqueta.",
          "Controla allocations/onAllocationsChange o inicia un borrador con defaultAllocations.",
          "Configura precisión y formato, y decide si se admite sobreasignación o valores negativos.",
          "Usa restricciones, validación y slots por método para integrar reglas externas.",
        ]}
        variants={[
          { name: "manual", description: "Cada opción recibe un valor y puede completar el restante con una sola acción." },
          { name: "distribución equitativa", description: "Reparte unidades mínimas sin perder el total por redondeo." },
          { name: "allowOverAllocation", description: "Permite excesos explícitos y los comunica como estado diferenciado." },
          { name: "readOnly", description: "Presenta resumen y distribución sin acciones ni edición." },
        ]}
        variantExamples={[
          { id: "manual", label: "Manual", summary: "allocations + onAllocationsChange", preview: <NAmountAllocator {...commonProps} allocations={allocations} onAllocationsChange={(next) => setAllocations([...next])} />, code: `<NAmountAllocator total={total} methods={methods} allocations={allocations} onAllocationsChange={setAllocations} {...adapters} />` },
          { id: "readonly", label: "Sólo lectura", summary: "readOnly", preview: <NAmountAllocator {...commonProps} allocations={allocations} readOnly />, code: `<NAmountAllocator allocations={allocations} readOnly {...props} />` },
          { id: "over", label: "Sobreasignación", summary: "allowOverAllocation", preview: <NAmountAllocator {...commonProps} defaultAllocations={[{ method: demoAllocationMethods[0], amount: 140000 }]} allowOverAllocation />, code: `<NAmountAllocator allowOverAllocation defaultAllocations={initial} {...props} />` },
        ]}
        propExamples={[
          { label: "Límites por destino", code: `<NAmountAllocator getMethodMin={getMinimum} getMethodMax={getCapacity} {...props} />` },
          { label: "Opciones bloqueadas", code: `<NAmountAllocator isMethodDisabled={(method) => method.locked} {...props} />` },
          { label: "Validación externa", code: `<NAmountAllocator validateAllocation={(allocation, summary) => validate(allocation, summary)} {...props} />` },
        ]}
        code={`<NAmountAllocator
  total={budget}
  methods={costCenters}
  getMethodId={(center) => center.id}
  getMethodLabel={(center) => center.name}
  allocations={allocations}
  onAllocationsChange={(next, summary) => {
    setAllocations([...next])
    setBalanced(summary.status === "balanced")
  }}
/>`}
      />
    </Stack>
  )
}

/** Vista del patrón genérico para procesos secuenciales con un borrador compartido. */
function StepFlowView() {
  const initialState: DemoFlowState = { name: "Implementación regional", owner: "", notes: "" }
  const [draft, setDraft] = useState<DemoFlowState>(initialState)
  const [flowStepId, setFlowStepId] = useState("details")
  const [completed, setCompleted] = useState(false)
  const steps: NStepFlowStep<DemoFlowState>[] = [
    {
      id: "details",
      title: "Datos",
      description: "Contexto principal",
      validate: (state) => state.name.trim() ? undefined : "Escribe un nombre para continuar.",
      render: ({ state, setState }) => (
        <Field.Root required>
          <Field.Label>Nombre del proceso<Field.RequiredIndicator /></Field.Label>
          <Input value={state.name} onChange={(event) => setState((current) => ({ ...current, name: event.target.value }))} />
        </Field.Root>
      ),
    },
    {
      id: "assignment",
      title: "Asignación",
      description: "Responsabilidad",
      validate: (state) => state.owner.trim() ? undefined : "Asigna una persona o equipo responsable.",
      render: ({ state, setState }) => (
        <Stack gap="4">
          <Field.Root required>
            <Field.Label>Responsable<Field.RequiredIndicator /></Field.Label>
            <Input value={state.owner} placeholder="Persona, equipo o proveedor" onChange={(event) => setState((current) => ({ ...current, owner: event.target.value }))} />
          </Field.Root>
          <Field.Root>
            <Field.Label>Notas</Field.Label>
            <Input value={state.notes} onChange={(event) => setState((current) => ({ ...current, notes: event.target.value }))} />
          </Field.Root>
        </Stack>
      ),
    },
    {
      id: "review",
      title: "Revisión",
      description: "Confirmación final",
      render: ({ state }) => (
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
          <Stack gap="1"><Text color="fg.muted" fontSize="xs">Proceso</Text><Text fontWeight="semibold">{state.name}</Text></Stack>
          <Stack gap="1"><Text color="fg.muted" fontSize="xs">Responsable</Text><Text fontWeight="semibold">{state.owner}</Text></Stack>
          {state.notes ? <Stack gap="1" gridColumn={{ sm: "1 / -1" }}><Text color="fg.muted" fontSize="xs">Notas</Text><Text>{state.notes}</Text></Stack> : null}
        </SimpleGrid>
      ),
    },
  ]

  return (
    <Stack gap="8">
      <PageIntro
        eyebrow="Flujos generalizables · Fase 4"
        title="NStepFlow"
        description="Coordina procesos de varios pasos con un borrador tipado, validación y finalización asíncrona sin asumir onboarding, checkout ni otro dominio."
      />

      <Card.Root variant="outline" bg="bg.panel">
        <Card.Body gap="5">
          <Flex justify="space-between" align={{ base: "start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap="3">
            <Stack gap="1">
              <Heading as="h2" size="lg">Flujo interactivo</Heading>
              <Text color="fg.muted">Edita los datos, avanza, vuelve y finaliza. Cada pantalla comparte el mismo estado React.</Text>
            </Stack>
            <Button type="button" size="sm" variant="ghost" onClick={() => { setDraft(initialState); setFlowStepId("details"); setCompleted(false) }}>Reiniciar ejemplo</Button>
          </Flex>
          <NStepFlow
            steps={steps}
            state={draft}
            defaultState={initialState}
            onStateChange={(nextState) => { setDraft(nextState); setCompleted(false) }}
            stepId={flowStepId}
            onStepChange={setFlowStepId}
            onComplete={() => { setCompleted(true) }}
            disabled={completed}
          />
          {completed ? <Badge alignSelf="start" colorPalette="green">Flujo finalizado correctamente</Badge> : null}
        </Card.Body>
      </Card.Root>

      <ComponentDocs
        purpose="NStepFlow agrega a Steps de Chakra la orquestación que pertenece a la aplicación: un borrador TState, validación síncrona/asíncrona, navegación controlada y finalización. No conoce campos, productos, usuarios ni reglas de un sector."
        steps={[
          "Define el tipo del borrador y una colección estable de pasos.",
          "Cada render recibe state/setState y acciones de navegación tipadas.",
          "Devuelve un mensaje desde validate para bloquear y anunciar el avance.",
          "Persiste el resultado en onComplete; el consumidor decide qué ocurre después.",
        ]}
        variants={[
          { name: "linear", description: "Impide saltar pasos pendientes y valida antes de avanzar." },
          { name: "orientation", description: "Presenta el indicador horizontal o vertical sin cambiar el contrato." },
          { name: "renderActions", description: "Sustituye la navegación inferior usando el mismo contexto seguro." },
          { name: "controlado", description: "state y stepId pueden vivir en formulario, store o URL." },
        ]}
        variantExamples={[
          { id: "horizontal", label: "Horizontal", summary: "linear por defecto", preview: <NStepFlow steps={steps.slice(0, 2)} defaultState={initialState} />, code: `<NStepFlow steps={steps} defaultState={initialDraft} />` },
          { id: "vertical", label: "Vertical", summary: "orientation=vertical", preview: <NStepFlow steps={steps.slice(0, 2)} defaultState={{ ...initialState, owner: "Equipo Norte" }} orientation="vertical" />, code: `<NStepFlow orientation="vertical" steps={steps} defaultState={initialDraft} />` },
          { id: "loading", label: "Cargando", summary: "loading", preview: <NStepFlow steps={steps} defaultState={initialState} loading />, code: `<NStepFlow loading steps={steps} defaultState={initialDraft} />` },
        ]}
        propExamples={[
          { label: "Estado controlado", code: `<NStepFlow state={draft} onStateChange={setDraft} stepId={stepId} onStepChange={setStepId} {...props} />` },
          { label: "Validación asíncrona", code: `{ id: "account", validate: async (state) => await validateAccount(state) }` },
          { label: "Acciones propias", code: `<NStepFlow renderActions={({ goNext }) => <Button onClick={goNext}>Guardar y seguir</Button>} {...props} />` },
        ]}
        code={`const steps: NStepFlowStep<MyDraft>[] = [
  {
    id: "details",
    title: "Datos",
    validate: (draft) => draft.name ? undefined : "Campo requerido",
    render: ({ state, setState }) => <MyFields value={state} onChange={setState} />,
  },
  { id: "review", title: "Revisión", render: ({ state }) => <Summary value={state} /> },
]

<NStepFlow steps={steps} defaultState={initialDraft} onComplete={saveDraft} />`}
      />
    </Stack>
  )
}

/** Vista del patrón genérico para solicitudes, decisiones y trazabilidad. */
function ApprovalFlowView() {
  const demoRequest: DemoApprovalRequest = {
    id: "request-2048",
    title: "Habilitación temporal de recursos",
    description: "Solicitud válida por 30 días para el equipo de implementación.",
    area: "Operaciones",
  }
  const [approvalStatus, setApprovalStatus] = useState<NApprovalStatus>("pending")
  const [history, setHistory] = useState<NApprovalHistoryEntry[]>([
    { id: "created", status: "pending", actor: "Mesa de control", comment: "Solicitud recibida y lista para revisión.", timestamp: "2026-09-06T15:00:00Z" },
  ])

  const resetApproval = () => {
    setApprovalStatus("pending")
    setHistory((current) => current.slice(0, 1))
  }

  return (
    <Stack gap="8">
      <PageIntro
        eyebrow="Flujos generalizables · Fase 4"
        title="NApprovalFlow"
        description="Presenta solicitudes tipadas, captura decisiones asíncronas y muestra trazabilidad sin incorporar permisos ni reglas de transición del negocio."
      />

      <Card.Root variant="outline" bg="bg.panel">
        <Card.Body gap="5">
          <Flex justify="space-between" align={{ base: "start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap="3">
            <Stack gap="1">
              <Heading as="h2" size="lg">Decisión interactiva</Heading>
              <Text color="fg.muted">Prueba aprobar, solicitar cambios o rechazar; las dos últimas opciones exigen comentario.</Text>
            </Stack>
            <Button type="button" size="sm" variant="ghost" onClick={resetApproval}>Reiniciar ejemplo</Button>
          </Flex>
          <NApprovalFlow
            request={demoRequest}
            getRequestId={(item) => item.id}
            getRequestTitle={(item) => item.title}
            getRequestDescription={(item) => `${item.area} · ${item.description}`}
            status={approvalStatus}
            onStatusChange={setApprovalStatus}
            history={history}
            onDecision={(_item, decision) => {
              setHistory((current) => [...current, {
                id: `${decision.actionId}-${current.length}`,
                status: decision.status,
                actor: "Usuario actual",
                comment: decision.comment || "Decisión registrada sin comentario.",
                timestamp: new Date(),
              }])
              return { success: true }
            }}
          />
        </Card.Body>
      </Card.Root>

      <ComponentDocs
        purpose="NApprovalFlow estandariza la experiencia de revisión, comentario, espera y error. El consumidor conserva TRequest, persiste la decisión y aporta las capacidades; el servidor siempre revalida autorización y transición."
        steps={[
          "Entrega la solicitud y adaptadores para identidad, título y descripción.",
          "Controla status o usa defaultStatus para un borrador local.",
          "Persiste la decisión en onDecision y devuelve success sólo después de confirmarla.",
          "Pasa history desde la fuente auditada; el componente nunca inventa actores ni eventos.",
        ]}
        variants={[
          { name: "acciones estándar", description: "Aprobar, solicitar cambios y rechazar con comentario configurable." },
          { name: "actions", description: "Reemplaza decisiones y paletas manteniendo el mismo ciclo asíncrono." },
          { name: "canPerformAction", description: "Aplica restricciones visuales externas sin simular seguridad de backend." },
          { name: "readOnly", description: "Presenta solicitud, estado e historial sin controles de decisión." },
        ]}
        variantExamples={[
          { id: "pending", label: "Pendiente", summary: "acciones disponibles", preview: <NApprovalFlow request={demoRequest} getRequestId={(item) => item.id} getRequestTitle={(item) => item.title} showHistory={false} />, code: `<NApprovalFlow request={request} {...adapters} />` },
          { id: "resolved", label: "Resuelta", summary: "readOnly + history", preview: <NApprovalFlow request={demoRequest} getRequestId={(item) => item.id} getRequestTitle={(item) => item.title} defaultStatus="approved" readOnly history={history} />, code: `<NApprovalFlow defaultStatus="approved" readOnly history={history} {...props} />` },
          { id: "empty", label: "Vacía", summary: "request=null", preview: <NApprovalFlow<DemoApprovalRequest> request={null} getRequestId={(item) => item.id} getRequestTitle={(item) => item.title} />, code: `<NApprovalFlow request={null} {...adapters} />` },
        ]}
        propExamples={[
          { label: "Persistencia asíncrona", code: `<NApprovalFlow onDecision={async (request, decision) => api.decide(request.id, decision)} {...props} />` },
          { label: "Acciones personalizadas", code: `<NApprovalFlow actions={[{ id: "accept", label: "Aceptar", status: "approved" }]} {...props} />` },
          { label: "Restricción visual", code: `<NApprovalFlow canPerformAction={(request, action) => can(action.id, request)} {...props} />` },
        ]}
        code={`<NApprovalFlow
  request={request}
  getRequestId={(item) => item.id}
  getRequestTitle={(item) => item.title}
  status={request.status}
  history={history}
  onDecision={persistDecision}
  onStatusChange={setStatus}
/>`}
      />
    </Stack>
  )
}

type DemoBalanceEntry = { id: string; label: string; description: string; amount: number }
const demoBalanceEntries: DemoBalanceEntry[] = [
  { id: "opening-sale", label: "Operación confirmada", description: "Ingreso registrado", amount: 1850 },
  { id: "expense", label: "Salida operativa", description: "Comprobante asociado", amount: -350 },
]

/** Vista del patrón para arqueos, conciliaciones y cierres operativos. */
function BalanceSessionView() {
  const [counted, setCounted] = useState<number | null>(null)
  const money = (amount: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount)
  const common = { sessionId: "turno-2026-09", entries: demoBalanceEntries, openingAmount: 1000, getEntryId: (entry: DemoBalanceEntry) => entry.id, getEntryLabel: (entry: DemoBalanceEntry) => entry.label, getEntryDescription: (entry: DemoBalanceEntry) => entry.description, getEntryAmount: (entry: DemoBalanceEntry) => entry.amount, formatAmount: money }
  return <Stack gap="8">
    <PageIntro eyebrow="Flujos generalizables · Fase 5" title="NBalanceSession" description="Compara saldos esperados y observados para turnos, cajas, inventarios, conciliaciones o cualquier sesión medible." />
    <Card.Root variant="outline" bg="bg.panel"><Card.Body gap="5"><Flex justify="space-between" align={{ base: "start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap="3"><Box><Heading as="h2" size="lg">Cierre interactivo</Heading><Text color="fg.muted">Captura $2,500.00 para balancear el ejemplo.</Text></Box><Button size="sm" variant="ghost" onClick={() => setCounted(null)}>Reiniciar</Button></Flex><NBalanceSession {...common} countedAmount={counted} onCountedAmountChange={setCounted} locale="es-MX" formatOptions={{ style: "currency", currency: "MXN" }} onClose={() => ({ success: true })} /></Card.Body></Card.Root>
    <ComponentDocs
      purpose="NBalanceSession suma movimientos con signo y compara el resultado esperado con un valor observado. El consumidor define qué representa cada entrada y persiste el cierre; el componente no contabiliza ni autoriza."
      steps={["Entrega un sessionId estable y entradas adaptadas.", "Define saldo inicial, tolerancia y formato.", "Controla countedAmount o usa el modo no controlado.", "Confirma el cierre en onClose desde el backend."]}
      variants={[{ name: "tolerance", description: "Acepta diferencias operativas dentro de un umbral explícito." }, { name: "allowCloseWithVariance", description: "Permite cerrar con diferencia sólo cuando el dominio lo autoriza." }, { name: "readOnly", description: "Presenta un cierre histórico sin edición." }]}
      variantExamples={[{ id: "open", label: "Abierta", summary: "sin conteo", preview: <NBalanceSession {...common} />, code: `<NBalanceSession sessionId={id} entries={entries} {...adapters} />` }, { id: "balanced", label: "Balanceada", summary: "countedAmount=2500", preview: <NBalanceSession {...common} countedAmount={2500} readOnly />, code: `<NBalanceSession countedAmount={2500} readOnly {...props} />` }, { id: "closed", label: "Cerrada", summary: "status=closed", preview: <NBalanceSession {...common} countedAmount={2500} status="closed" readOnly />, code: `<NBalanceSession status="closed" readOnly {...props} />` }]}
      propExamples={[{ label: "Tolerancia", code: `<NBalanceSession tolerance={0.01} {...props} />` }, { label: "Cierre asíncrono", code: `<NBalanceSession onClose={(details) => api.close(details)} {...props} />` }]}
      code={`<NBalanceSession
  sessionId={session.id}
  entries={entries}
  openingAmount={session.opening}
  getEntryId={(entry) => entry.id}
  getEntryLabel={(entry) => entry.label}
  getEntryAmount={(entry) => entry.signedAmount}
  countedAmount={counted}
  onCountedAmountChange={setCounted}
  onClose={closeSession}
/>`}
    />
  </Stack>
}

type DemoAdjustment = { id: string; title: string; amount: number; category: string; note: string }
const demoAdjustment: DemoAdjustment = { id: "movement-18", title: "Movimiento operativo 18", amount: 1250, category: "general", note: "Registro inicial" }
const demoAdjustmentFields: NAdjustmentField<DemoAdjustment>[] = [
  { id: "amount", label: "Importe", inputType: "number", getValue: (value) => value.amount, setValue: (value, amount) => ({ ...value, amount: Number(amount) }), validate: (amount) => Number(amount) > 0 ? undefined : "El importe debe ser positivo." },
  { id: "category", label: "Clasificación", inputType: "select", options: [{ label: "General", value: "general" }, { label: "Proyecto", value: "project" }], getValue: (value) => value.category, setValue: (value, category) => ({ ...value, category: String(category) }) },
  { id: "note", label: "Descripción", inputType: "textarea", getValue: (value) => value.note, setValue: (value, note) => ({ ...value, note: String(note) }) },
]

/** Vista del patrón de correcciones trazables. */
function AdjustmentEditorView() {
  return <Stack gap="8">
    <PageIntro eyebrow="Flujos generalizables · Fase 5" title="NAdjustmentEditor" description="Mantiene visible el registro original mientras construye una corrección tipada, validada y acompañada por un motivo auditable." />
    <Card.Root variant="outline" bg="bg.panel"><Card.Body><NAdjustmentEditor item={demoAdjustment} getItemId={(item) => item.id} getItemTitle={(item) => item.title} getItemDescription={() => "Ejemplo neutral: puede ser una operación, reserva, movimiento o registro."} createAdjustment={(item) => ({ ...item })} fields={demoAdjustmentFields} onSubmit={() => ({ success: true })} /></Card.Body></Card.Root>
    <ComponentDocs
      purpose="NAdjustmentEditor construye una propuesta sin mutar ni ocultar el original. El consumidor define campos, clonación, validación y persistencia; las correcciones definitivas deben conservarse en la auditoría del dominio."
      steps={["Adapta identidad y encabezado del elemento.", "Crea un borrador independiente con createAdjustment.", "Declara campos o usa renderEditor para una interfaz especializada.", "Valida y persiste el motivo junto con changedFieldIds."]}
      variants={[{ name: "fields", description: "Editor declarativo para texto, número, selección y texto largo." }, { name: "renderEditor", description: "Composición completa para modelos especializados." }, { name: "value/reason", description: "Estado totalmente controlado por formulario o store." }]}
      variantExamples={[{ id: "editable", label: "Editable", summary: "fields declarativos", preview: <NAdjustmentEditor item={demoAdjustment} getItemId={(item) => item.id} getItemTitle={(item) => item.title} createAdjustment={(item) => ({ ...item })} fields={demoAdjustmentFields.slice(0, 1)} />, code: `<NAdjustmentEditor item={record} fields={fields} {...adapters} />` }, { id: "readonly", label: "Lectura", summary: "readOnly", preview: <NAdjustmentEditor item={demoAdjustment} getItemId={(item) => item.id} getItemTitle={(item) => item.title} createAdjustment={(item) => ({ ...item })} fields={demoAdjustmentFields.slice(0, 1)} readOnly />, code: `<NAdjustmentEditor readOnly {...props} />` }, { id: "empty", label: "Vacío", summary: "item=null", preview: <NAdjustmentEditor<DemoAdjustment> item={null} getItemId={(item) => item.id} getItemTitle={(item) => item.title} createAdjustment={(item) => ({ ...item })} />, code: `<NAdjustmentEditor item={null} {...adapters} />` }]}
      propExamples={[{ label: "Validación remota", code: `<NAdjustmentEditor validate={(details) => api.validate(details)} {...props} />` }, { label: "Motivo opcional", code: `<NAdjustmentEditor requireReason={false} {...props} />` }]}
      code={`<NAdjustmentEditor
  item={record}
  getItemId={(item) => item.id}
  getItemTitle={(item) => item.title}
  createAdjustment={(item) => ({ ...item })}
  fields={fields}
  onSubmit={saveAdjustment}
/>`}
    />
  </Stack>
}

type DemoDocument = { id: string; title: string; folio: string; status: string; total: number }
const demoDocument: DemoDocument = { id: "document-2048", title: "Documento operativo", folio: "DOC-2048", status: "Emitido", total: 2850 }

/** Vista del patrón de documentos adaptable e imprimible. */
function DocumentViewView() {
  const actions: NDocumentAction<DemoDocument>[] = [{ id: "download", label: "Preparar descarga", variant: "solid", onAction: async () => ({ success: true }) }]
  const common = { document: demoDocument, getDocumentId: (item: DemoDocument) => item.id, getDocumentTitle: (item: DemoDocument) => item.title, getDocumentSubtitle: (item: DemoDocument) => item.folio, getDocumentStatus: (item: DemoDocument) => item.status, fields: [{ id: "folio", label: "Folio", getValue: (item: DemoDocument) => item.folio }, { id: "total", label: "Total", getValue: (item: DemoDocument) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(item.total) }], sections: [{ id: "detail", title: "Contenido", description: "El consumidor decide si aquí aparecen partidas, firmas, gráficos o anexos.", render: () => <Box p="4" bg="bg.subtle" rounded="md">Sección documental adaptable</Box> }] }
  return <Stack gap="8">
    <PageIntro eyebrow="Flujos generalizables · Fase 5" title="NDocumentView" description="Presenta órdenes, recibos, reportes o expedientes con metadatos, secciones, estado, impresión y acciones asíncronas." />
    <NDocumentView {...common} actions={actions} showPrint onPrint={() => undefined} />
    <ComponentDocs
      purpose="NDocumentView estandariza la lectura y las acciones alrededor de un documento, no su modelo. Campos, secciones y renderizadores permiten usarlo en cualquier sector y mantener una salida limpia para impresión."
      steps={["Adapta identidad, título y estado.", "Declara metadatos y secciones tipadas.", "Agrega acciones asíncronas con restricciones externas.", "Conecta impresión o deja que el navegador la ejecute."]}
      variants={[{ name: "paper", description: "Superficie elevada y preparada para impresión." }, { name: "plain", description: "Sin contenedor visual para integrarse en otra pantalla." }, { name: "renderBody", description: "Cuerpo completamente sustituible con contexto tipado." }]}
      variantExamples={[{ id: "paper", label: "Papel", summary: "variant=paper", preview: <NDocumentView {...common} />, code: `<NDocumentView variant="paper" {...props} />` }, { id: "plain", label: "Plano", summary: "variant=plain", preview: <NDocumentView {...common} variant="plain" />, code: `<NDocumentView variant="plain" {...props} />` }, { id: "loading", label: "Cargando", summary: "loading", preview: <NDocumentView {...common} loading />, code: `<NDocumentView loading {...props} />` }]}
      propExamples={[{ label: "Acción protegida", code: `<NDocumentView canPerformAction={(doc, action) => can(action.id, doc)} {...props} />` }, { label: "Impresión propia", code: `<NDocumentView showPrint onPrint={(doc) => printPdf(doc)} {...props} />` }]}
      code={`<NDocumentView
  document={document}
  getDocumentId={(item) => item.id}
  getDocumentTitle={(item) => item.title}
  fields={metadata}
  sections={sections}
  actions={actions}
  showPrint
/>`}
    />
  </Stack>
}

/** Demostración reactiva de captura manual, HID y mediante proveedor externo estructurado. */
function CodeCaptureView() {
  const [lastCapture, setLastCapture] = useState("Ningún código procesado")
  const [externalSequence, setExternalSequence] = useState(100)
  return <Stack gap="8">
    <PageIntro eyebrow="Flujos generalizables · Fase 6" title="NCodeCapture" description="Integra teclado, lectores HID, cámaras y handhelds con sesiones cancelables, metadatos de simbología e interpretación tipada." />
    <Card.Root variant="outline"><Card.Body gap="4">
      <NCodeCapture
        validate={(code) => code.length < 3 ? "El código debe contener al menos tres caracteres." : undefined}
        keyboardWedge={{ captureGlobally: true, minLength: 3 }}
        onRequestScan={async () => { const next = externalSequence + 1; setExternalSequence(next); return { code: `EXT-${next}`, source: "camera", format: "qr_code", device: { id: "demo", type: "camera" } } }}
        parse={(code) => ({ identifier: code, family: code.split("-")[0] })}
        onCapture={async (code, details) => { setLastCapture(`${code} · ${details.source} · ${details.format ?? "sin formato"}`); return { success: true, message: `Código ${code} aceptado.` } }}
      />
      <Box p="3" rounded="md" bg="bg.subtle"><Text color="fg.muted" fontSize="xs">Última captura confirmada</Text><Text fontWeight="semibold">{lastCapture}</Text></Box>
    </Card.Body></Card.Root>
    <ComponentDocs
      purpose="NCodeCapture unifica identificadores y delega el driver/decodificador a un adaptador neutral. Administra sesiones, cola, permisos, desconexión, linterna, validación e interpretación sin acoplar el paquete a una marca."
      steps={["Recibe texto o una lectura estructurada con formato y dispositivo.", "Normaliza, valida e interpreta antes de publicar.", "Serializa ráfagas y bloquea duplicados accidentales.", "Cancela el hardware y anuncia estados accesibles al desmontar."]}
      variants={[{ name: "manual", description: "Entrada y botón explícito para cualquier identificador." }, { name: "keyboardWedge", description: "Lectores USB/Bluetooth HID con sufijo y captura global opcional." }, { name: "scannerAdapter", description: "Sesión continua de cámara, handheld o bridge nativo." }]}
      variantExamples={[{ id: "manual", label: "Manual", summary: "entrada + Enter", preview: <NCodeCapture onCapture={() => true} />, code: `<NCodeCapture onCapture={processCode} />` }, { id: "external", label: "Lector externo", summary: "onRequestScan", preview: <NCodeCapture onCapture={() => true} onRequestScan={() => "QR-001"} />, code: `<NCodeCapture onRequestScan={camera.scan} onCapture={processCode} />` }, { id: "readonly", label: "Lectura", summary: "readOnly", preview: <NCodeCapture defaultValue="DOC-2048" readOnly onCapture={() => true} />, code: `<NCodeCapture readOnly defaultValue="DOC-2048" onCapture={processCode} />` }]}
      propExamples={[{ label: "Lector HID global", code: `<NCodeCapture keyboardWedge={{ captureGlobally: true, minLength: 6 }} {...props} />` }, { label: "Interpretación tipada", code: `<NCodeCapture<GS1> parse={(code) => gs1.parse(code)} {...props} />` }, { label: "Sesión continua", code: `<NCodeCapture scannerAdapter={adapter} continuousScan autoStartScanner {...props} />` }]}
      code={`<NCodeCapture
  scannerAdapter={scannerAdapter}
  continuousScan
  parse={(code, input) => parser.read(code, input.format)}
  validate={(code) => validateFormat(code)}
  onCapture={(code, details) => api.process(code, details)}
/>`}
    />
  </Stack>
}

/** Demostración controlada del estado suministrado por un motor de sincronización. */
function SyncStatusView() {
  const [status, setStatus] = useState<NSyncState>("pending")
  const [pendingCount, setPendingCount] = useState(4)
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | undefined>()
  const retry = async () => {
    setStatus("syncing")
    await new Promise((resolve) => window.setTimeout(resolve, 500))
    setPendingCount(0)
    setLastSyncedAt(new Date())
    setStatus("synced")
    return { success: true }
  }
  return <Stack gap="8">
    <PageIntro eyebrow="Flujos generalizables · Fase 6" title="NSyncStatus" description="Representa sincronización, pendientes, errores y última confirmación sin asumir qué motor local, API o base de datos utiliza la aplicación." />
    <Stack gap="3">
      <Flex gap="2" wrap="wrap">
        <Button size="sm" variant="outline" onClick={() => { setStatus("pending"); setPendingCount(4) }}>Simular pendientes</Button>
        <Button size="sm" variant="outline" onClick={() => setStatus("offline")}>Simular sin conexión</Button>
        <Button size="sm" variant="outline" onClick={() => setStatus("error")}>Simular error</Button>
      </Flex>
      <NSyncStatus status={status} syncKey="catalog-demo" pendingCount={pendingCount} lastSyncedAt={lastSyncedAt} message={status === "error" ? "El servidor rechazó el último lote." : undefined} error={status === "error" ? "HTTP 503 · vuelve a intentarlo cuando el servicio esté disponible." : undefined} onRetry={retry} details={<Text>La cola y el estado pertenecen al motor de datos; el componente sólo los presenta.</Text>} />
    </Stack>
    <ComponentDocs
      purpose="NSyncStatus es una superficie controlada: nunca deduce que un lote llegó al servidor. La aplicación entrega el estado real, los pendientes y la fecha confirmada por su motor de sincronización."
      steps={["Obtén el estado desde el motor local o remoto.", "Publica pendingCount y lastSyncedAt confirmados.", "Conecta onRetry a una operación real.", "Actualiza status cuando esa operación termine."]}
      variants={[{ name: "panel", description: "Estado completo con fecha, cola, detalles y recuperación." }, { name: "compact", description: "Indicador breve para headers o barras móviles." }, { name: "controlled", description: "El consumidor conserva toda la fuente de verdad." }]}
      variantExamples={[{ id: "synced", label: "Sincronizado", summary: "status=synced", preview: <NSyncStatus status="synced" lastSyncedAt={new Date()} />, code: `<NSyncStatus status="synced" lastSyncedAt={date} />` }, { id: "pending", label: "Pendiente", summary: "4 en cola", preview: <NSyncStatus status="pending" pendingCount={4} onRetry={() => true} />, code: `<NSyncStatus status="pending" pendingCount={4} onRetry={sync} />` }, { id: "compact", label: "Compacto", summary: "variant=compact", preview: <NSyncStatus status="offline" pendingCount={2} variant="compact" />, code: `<NSyncStatus status="offline" variant="compact" />` }]}
      propExamples={[{ label: "Clave de contexto", code: `<NSyncStatus syncKey={workspaceId} status={sync.status} />` }, { label: "Fecha localizada", code: `<NSyncStatus formatTimestamp={(date) => formatter.format(date)} {...props} />` }]}
      code={`<NSyncStatus
  status={sync.status}
  pendingCount={sync.pendingCount}
  lastSyncedAt={sync.lastConfirmedAt}
  onRetry={sync.retry}
/>`}
    />
  </Stack>
}

/** Demostración controlada de continuidad de interfaz ante conectividad intermitente. */
function OfflineBoundaryView() {
  const [online, setOnline] = useState(false)
  return <Stack gap="8">
    <PageIntro eyebrow="Flujos generalizables · Fase 6" title="NOfflineBoundary" description="Comunica conectividad intermitente y decide si el contenido continúa visible o usa un fallback, sin prometer persistencia que la aplicación no haya implementado." />
    <Flex gap="2" wrap="wrap"><Button size="sm" onClick={() => setOnline((current) => !current)}>{online ? "Desconectar demo" : "Restablecer demo"}</Button></Flex>
    <NOfflineBoundary online={online} queuedCount={online ? 0 : 3} showOnlineStatus onOnlineChange={setOnline} onCheckConnectivity={async () => { await new Promise((resolve) => window.setTimeout(resolve, 400)); return { online: true } }}>
      <Card.Root variant="outline"><Card.Body><Heading as="h2" size="md">Formulario de visita</Heading><Text color="fg.muted">El contenido permanece operativo porque esta vista usa behavior=&quot;banner&quot;.</Text></Card.Body></Card.Root>
    </NOfflineBoundary>
    <ComponentDocs
      purpose="NOfflineBoundary conserva la jerarquía y comunica el riesgo de red. navigator.onLine sólo detecta la interfaz del navegador; para confirmar el servidor debe usarse onCheckConnectivity o el estado online controlado."
      steps={["Entrega online desde tu monitor de conectividad o permite eventos del navegador.", "Elige banner para continuidad o fallback para funciones dependientes de red.", "Muestra queuedCount sólo si existe una cola local real.", "Comprueba el servicio con onCheckConnectivity."]}
      variants={[{ name: "banner", description: "Advierte y mantiene disponible el contenido." }, { name: "fallback", description: "Sustituye funciones que realmente necesitan red." }, { name: "controlled", description: "Acepta conectividad verificada por el consumidor." }]}
      variantExamples={[{ id: "banner", label: "Banner", summary: "contenido preservado", preview: <NOfflineBoundary online={false} queuedCount={2}><Text>Edición local disponible</Text></NOfflineBoundary>, code: `<NOfflineBoundary online={false}>...</NOfflineBoundary>` }, { id: "fallback", label: "Fallback", summary: "función remota", preview: <NOfflineBoundary online={false} behavior="fallback" fallback={<Text>Consulta no disponible</Text>}><Text>Consulta remota</Text></NOfflineBoundary>, code: `<NOfflineBoundary behavior="fallback" fallback={<OfflineView />}>...</NOfflineBoundary>` }, { id: "online", label: "En línea", summary: "estado recuperado", preview: <NOfflineBoundary online showOnlineStatus><Text>Contenido disponible</Text></NOfflineBoundary>, code: `<NOfflineBoundary online showOnlineStatus>...</NOfflineBoundary>` }]}
      propExamples={[{ label: "Detección del navegador", code: `<NOfflineBoundary detectBrowserEvents>...</NOfflineBoundary>` }, { label: "Comprobación real", code: `<NOfflineBoundary onCheckConnectivity={() => api.healthcheck()}>...</NOfflineBoundary>` }]}
      code={`<NOfflineBoundary
  online={connectivity.online}
  queuedCount={queue.pendingCount}
  onCheckConnectivity={connectivity.checkServer}
>
  <FieldApplication />
</NOfflineBoundary>`}
    />
  </Stack>
}

/** Vista de ejemplo y documentación de NHeader. */
function HeaderView() {
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
            themePresentation="button"
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
          { name: "themePresentation=\"icon\" | \"button\"", description: "Elige un selector compacto o uno con el nombre del tema activo." },
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
  themePresentation="button"
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
  const [activeView, setActiveView] = useState<DemoView>(() => {
    const requestedView = new URLSearchParams(window.location.search).get("view")
    const allowed: DemoView[] = ["overview", "theme", "item-picker", "line-item-editor", "amount-input", "amount-allocator", "step-flow", "approval-flow", "balance-session", "adjustment-editor", "document-view", "code-capture", "sync-status", "offline-boundary", "cart", "checkout", "receipt", "thermal-print", "pos-example", "panel", "ctrl", "page-patterns", "data-patterns", "activity-patterns", "dashboard-patterns", "saas-patterns", "vertical-patterns", "app-shell", "modules", "workspaces", "header", "sidebar", "table", "datatable", "form", "permissions", "facture", "accessibility-styles", "accessibility-guide"]
    return requestedView && allowed.includes(requestedView as DemoView) ? requestedView as DemoView : "overview"
  })
  const [activeFactureView, setActiveFactureView] = useState<NFactureView>(() => {
    const requested = new URLSearchParams(window.location.search).get("factureView")
    const allowed: NFactureView[] = ["dashboard", "issue", "history", "ticket", "certificates", "catalogs", "integrations", "docs"]
    return requested && allowed.includes(requested as NFactureView) ? requested as NFactureView : "dashboard"
  })
  const [activeFactureRole, setActiveFactureRole] = useState<NFactureRole>("admin")
  const navigationItems = catalogNavigation.map((item) => item.id === "project" ? {
    ...item,
    children: [createFactureProjectNavigation(activeFactureRole), ...(item.children?.filter((child) => child.id !== "facture") ?? [])],
  } : item)
  const ctrlShortcuts: readonly NCtrlShortcut[] = [
    { id: "catalog-home", keys: "Alt+H", label: "Ir al inicio", description: "Abre la vista general del catálogo.", group: "Navegación", handler: () => setActiveView("overview") },
    { id: "catalog-pos", keys: "Alt+P", label: "Abrir ejemplo POS", description: "Abre el flujo integrado de punto de venta.", group: "Navegación", handler: () => setActiveView("pos-example") },
    { id: "catalog-ctrl", keys: "Alt+K", label: "Abrir demostración NCtrl", description: "Muestra el ejemplo de operación rápida.", group: "Navegación", handler: () => setActiveView("ctrl") },
    ...(activeView === "table" || activeView === "datatable" ? [
      { id: "table-columns", keys: ["Alt+ArrowLeft", "Alt+ArrowRight"], label: "Reordenar columna", description: "Con el asa de columna enfocada.", group: "Tabla" },
      { id: "table-rows", keys: ["Alt+ArrowUp", "Alt+ArrowDown"], label: "Reordenar fila", description: "Con el asa de fila enfocada.", group: "Tabla" },
    ] satisfies NCtrlShortcut[] : []),
    ...(activeView === "sidebar" ? [
      { id: "sidebar-navigation", keys: ["ArrowUp", "ArrowDown", "Home", "End"], label: "Recorrer navegación", group: "NSidebar" },
      { id: "sidebar-groups", keys: ["ArrowLeft", "ArrowRight"], label: "Contraer o expandir grupos", group: "NSidebar" },
    ] satisfies NCtrlShortcut[] : []),
    ...(activeView === "item-picker" ? [{ id: "picker-navigation", keys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"], label: "Recorrer opciones", group: "NItemPicker" }] satisfies NCtrlShortcut[] : []),
    ...(activeView === "code-capture" ? [{ id: "capture-enter", keys: "Enter", label: "Procesar código", group: "NCodeCapture", allowInEditable: true }] satisfies NCtrlShortcut[] : []),
    ...(activeView === "panel" ? [{ id: "panel-close", keys: "Escape", label: "Cerrar panel", group: "NPanel" }] satisfies NCtrlShortcut[] : []),
    ...(activeView === "facture" ? [
      { id: "facture-dashboard", keys: "F2", label: "Resumen de facturación", group: "NFacture", handler: () => setActiveFactureView("dashboard") },
      { id: "facture-issue", keys: "F3", label: "Emitir CFDI", group: "NFacture", handler: () => setActiveFactureView("issue") },
      { id: "facture-history", keys: "F4", label: "Historial CFDI", group: "NFacture", handler: () => setActiveFactureView("history") },
      { id: "facture-ticket", keys: "F5", label: "Facturar ticket", group: "NFacture", handler: () => setActiveFactureView("ticket") },
      { id: "facture-docs", keys: "F10", label: "Documentación NFacture", group: "NFacture", handler: () => setActiveFactureView("docs") },
    ] satisfies NCtrlShortcut[] : []),
  ]

  const content = activeView === "facture"
    ? <FactureProjectView view={activeFactureView} onViewChange={setActiveFactureView} role={activeFactureRole} onRoleChange={(nextRole) => { setActiveFactureRole(nextRole); if (!canUseNFactureView(nextRole, activeFactureView)) setActiveFactureView("dashboard") }} />
    : activeView === "theme"
    ? <ThemeView />
    : activeView === "item-picker"
      ? <ItemPickerView />
    : activeView === "line-item-editor"
      ? <LineItemEditorView />
    : activeView === "amount-input"
      ? <AmountInputView />
    : activeView === "amount-allocator"
      ? <AmountAllocatorView />
    : activeView === "step-flow"
      ? <StepFlowView />
    : activeView === "approval-flow"
      ? <ApprovalFlowView />
    : activeView === "balance-session"
      ? <BalanceSessionView />
    : activeView === "adjustment-editor"
      ? <AdjustmentEditorView />
    : activeView === "document-view"
      ? <DocumentViewView />
    : activeView === "code-capture"
      ? <CodeCaptureView />
    : activeView === "sync-status"
      ? <SyncStatusView />
    : activeView === "offline-boundary"
      ? <OfflineBoundaryView />
    : activeView === "cart"
      ? <CartView />
    : activeView === "checkout"
      ? <CheckoutView />
    : activeView === "receipt"
      ? <ReceiptView />
    : activeView === "thermal-print"
      ? <ThermalPrintView />
    : activeView === "pos-example"
      ? <PosExampleView />
    : activeView === "panel"
      ? <PanelView />
    : activeView === "ctrl"
      ? <CtrlView />
    : activeView === "accessibility-styles"
      ? <DashboardStylesView />
    : activeView === "accessibility-guide"
      ? <BeginnerAccessibilityGuideView />
    : activeView === "page-patterns"
      ? <PagePatternsView />
    : activeView === "data-patterns"
      ? <DataPatternsView />
    : activeView === "activity-patterns"
      ? <ActivityPatternsView />
    : activeView === "dashboard-patterns"
      ? <DashboardPatternsView />
    : activeView === "saas-patterns"
      ? <SaasPatternsView />
    : activeView === "vertical-patterns"
      ? <VerticalPatternsView />
    : activeView === "header"
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
    <NCtrlProvider>
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
          themePresentation="button"
        />
      )}
      sidebar={(
        <NSidebar
          items={navigationItems}
          activeItemId={activeView === "facture" ? `facture-${activeFactureView}` : activeView}
          onItemSelect={(item) => {
            if (item.data?.factureView) setActiveFactureView(item.data.factureView)
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
              <Text color="fg.muted" fontSize="xs">v0.1.2 · En desarrollo</Text>
            </Stack>
          )}
        />
      )}
    >
      {content}
    </NAppShell>
    <NCtrl
      viewId={activeView === "facture" ? `facture-${activeFactureView}` : activeView}
      viewLabel={viewTitles[activeView]}
      shortcuts={ctrlShortcuts}
    />
    </NCtrlProvider>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DemoProvider>
      <DevelopmentApp />
    </DemoProvider>
  </StrictMode>,
)
