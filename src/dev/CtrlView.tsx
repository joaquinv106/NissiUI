import { Badge, Button, Card, Flex, Heading, Stack, Text } from "@chakra-ui/react"
import { Banknote, CreditCard, Pause, Play, ReceiptText, RotateCcw } from "lucide-react"
import { useMemo, useState } from "react"

import { useNCtrlShortcuts, type NCtrlShortcut } from "../index"
import { ComponentDocs } from "./ComponentDocs"

export function CtrlView() {
  const [saleState, setSaleState] = useState<"idle" | "open" | "charged">("idle")
  const [payment, setPayment] = useState("Sin pago")
  const shortcuts = useMemo<readonly NCtrlShortcut[]>(() => [
    { id: "new-sale", keys: "F2", label: "Nueva venta", description: "Limpia la operación e inicia una venta.", group: "Venta", icon: <Play />, handler: () => { setSaleState("open"); setPayment("Pendiente") } },
    { id: "hold-sale", keys: "F3", label: "Pausar venta", description: "Conserva la venta para recuperarla después.", group: "Venta", icon: <Pause />, disabled: saleState !== "open", handler: () => setSaleState("idle") },
    { id: "checkout", keys: ["F4", "Ctrl+Enter"], label: "Ir al cobro", description: "Abre el paso de selección de pago.", group: "Cobro", icon: <ReceiptText />, disabled: saleState !== "open", allowInEditable: true, handler: () => setPayment("Selecciona una forma de pago") },
    { id: "cash", keys: "F6", label: "Cobrar en efectivo", description: "Finaliza directamente con pago en efectivo.", group: "Cobro directo", icon: <Banknote />, disabled: saleState !== "open", allowInEditable: true, handler: () => { setPayment("Efectivo"); setSaleState("charged") } },
    { id: "card", keys: "F7", label: "Cobrar con tarjeta", description: "Inicia el flujo de terminal bancaria.", group: "Cobro directo", icon: <CreditCard />, disabled: saleState !== "open", allowInEditable: true, handler: async () => { await Promise.resolve(); setPayment("Tarjeta"); setSaleState("charged") } },
    { id: "cancel", keys: "Escape", label: "Cancelar operación", description: "Regresa la demostración al estado inicial.", group: "Venta", icon: <RotateCcw />, disabled: saleState === "idle", handler: () => { setSaleState("idle"); setPayment("Sin pago") } },
  ], [saleState])
  useNCtrlShortcuts(shortcuts)

  return <Stack gap="8">
    <Stack gap="2" maxW="3xl">
      <Text color="colorPalette.fg" fontWeight="semibold" fontSize="sm" textTransform="uppercase">Productividad y accesibilidad</Text>
      <Heading as="h1" size={{ base: "2xl", md: "3xl" }}>NCtrl</Heading>
      <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }}>Pulsa F11 para consultar y ejecutar los atajos disponibles en esta vista. La demostración simula la operación rápida de una caja.</Text>
    </Stack>
    <Card.Root variant="outline"><Card.Body gap="5">
      <Flex justify="space-between" align={{ base: "stretch", sm: "center" }} direction={{ base: "column", sm: "row" }} gap="3">
        <Stack gap="1"><Text fontWeight="semibold">Venta de demostración</Text><Text color="fg.muted" fontSize="sm">Usa F2 para comenzar; después F4, F6 o F7.</Text></Stack>
        <Badge alignSelf={{ base: "start", sm: "center" }} colorPalette={saleState === "charged" ? "green" : saleState === "open" ? "blue" : "gray"}>{saleState === "charged" ? "Cobrada" : saleState === "open" ? "En captura" : "Sin iniciar"}</Badge>
      </Flex>
      <Text role="status" p="3" rounded="md" bg="bg.muted"><Text as="span" color="fg.muted">Forma de pago: </Text><Text as="span" fontWeight="semibold">{payment}</Text></Text>
      <Button alignSelf="start" variant="outline" onClick={() => { setSaleState("open"); setPayment("Pendiente") }}><Play aria-hidden size={16} />Iniciar con mouse</Button>
    </Card.Body></Card.Root>
    <ComponentDocs
      purpose="NCtrl convierte los atajos de la vista activa en acciones ejecutables y en una referencia descubrible. El host conserva las reglas de negocio y sólo registra funciones que ya puede realizar el usuario."
      steps={["Monta NCtrlProvider alrededor de la aplicación.", "Registra acciones con shortcuts o useNCtrlShortcut(s).", "Actualiza viewId y la colección al cambiar de vista.", "Monta un NCtrl global; F11 y el botón flotante abren su panel."]}
      variants={[{ name: "declarative", description: "La vista entrega una colección de atajos directamente." }, { name: "registered", description: "Componentes descendientes publican acciones mediante hooks." }, { name: "guideOnly", description: "executeShortcuts={false} muestra documentación sin escuchar acciones." }]}
      variantExamples={[{ id: "pos", label: "Caja", summary: "F2 · F4 · F6 · F7", preview: <Text color="fg.muted">Los atajos de esta demostración están registrados en el NCtrl global. Pulsa F11 para verlos.</Text>, code: `<NCtrlProvider><POS /><NCtrl viewId="pos" /></NCtrlProvider>` }]}
      propExamples={[{ label: "Acción de cobro", code: `<NCtrl shortcuts={[{ id: "cash", keys: "F6", label: "Cobrar en efectivo", handler: chargeCash, allowInEditable: true }]} />` }, { label: "Alternativas multiplataforma", code: `{ id: "save", keys: ["Mod+S", "F8"], label: "Guardar", handler: save }` }]}
      code={`function POS() {
  useNCtrlShortcuts([
    { id: "checkout", keys: "F4", label: "Ir al cobro", handler: checkout },
    { id: "cash", keys: "F6", label: "Cobrar en efectivo", handler: chargeCash },
  ])
  return <SaleScreen />
}

<NCtrlProvider>
  <POS />
  <NCtrl viewId="pos" viewLabel="Punto de venta" />
</NCtrlProvider>`}
    />
  </Stack>
}
