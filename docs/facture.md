# NFacture

`NFacture` es una composición vertical para facturación electrónica mexicana. Reutiliza `NSidebar`, `NTable`, `NLineItemEditor`, `NPageHeader`, `NStatCard` y permisos; no sustituye un backend fiscal, un PAC ni la validación del SAT.

## Alcance

- Emisión con receptor, conceptos, UsoCFDI, FormaPago, MétodoPago, IVA, IEPS, descuento y totales.
- Conversión de tickets, historial, métricas y visor de PDF/XML en `NPanel`.
- Administración de CSD, lectura de Constancia de Situación Fiscal mediante adaptador, PAC, API keys, webhooks y mapeo de productos.
- Roles `admin`, `operator` y `pos`, o capacidades explícitas `facture:*`.
- Uso integrado o standalone mediante `NissiInvoicingProvider` y `NFactureDataAdapter`.
- Alta de receptores fiscales en `NPanel`, sin abandonar el borrador de emisión.
- Esquemas de menú exportables para `NSidebar` y `NHeader`; incluyen la ruta `docs`.

## Integración

```tsx
import {
  NFacture,
  NissiInvoicingProvider,
  type NFactureData,
  type NFactureDataAdapter,
} from "nissi-ui"

const adapter: NFactureDataAdapter = {
  load: () => api.get("/billing/bootstrap"),
  findTicket: (folio) => api.get(`/tickets/${folio}`),
  stampInvoice: (draft) => api.post("/cfdi", draft),
  inspectCertificate: (certificate, privateKey, password) =>
    api.inspectCsd({ certificate, privateKey, password }),
  inspectTaxStatus: (file) => api.readTaxStatus(file),
  createApiKey: (environment) => api.createBillingKey(environment),
  saveWebhook: (endpoint, environment) => api.saveBillingWebhook({ endpoint, environment }),
  createCustomer: (customer) => api.post("/billing/customers", customer),
}

<NissiInvoicingProvider data={initialData} adapter={adapter}>
  <NFacture role="admin" view={billingView} onViewChange={setBillingView} />
</NissiInvoicingProvider>
```

El adaptador debe transportar secretos exclusivamente por HTTPS, evitar logs de contraseñas/llaves, cifrar material sensible en reposo, aplicar rotación y ejecutar el sellado en infraestructura controlada. `NFacture` no persiste archivos ni API keys.

## Navegación compartida

`NFacture` no dibuja un segundo menú por defecto. La aplicación anfitriona consume el árbol del módulo y controla `view`; así sus submenús forman parte del sidebar general.

```tsx
import { NSidebar, createNFactureNavigation } from "nissi-ui"

const factureItems = createNFactureNavigation({
  basePath: "/facturacion",
  role: "operator",
})

<NSidebar
  items={[...applicationItems, ...factureItems]}
  activeItemId={`facture-${billingView}`}
  onItemSelect={(item) => item.data?.view && setBillingView(item.data.view)}
/>

<NFacture role="operator" view={billingView} onViewChange={setBillingView} />
```

Cada hoja contiene `data.view` y `requiredPermission`. El árbol incluye resumen, emisión, historial, tickets, administración y documentación. Sin `basePath`, el host puede usar `onItemSelect`; con `basePath`, también obtiene rutas `/facturacion/issue`, `/history`, `/docs`, etc.

Para presentar el módulo como dropdown en el header:

```tsx
import { NHeader, createNFactureHeaderNavigation } from "nissi-ui"

const factureHeaderItems = createNFactureHeaderNavigation({
  basePath: "/facturacion",
  role: "admin",
})

<NHeader
  variant="site"
  items={[...applicationItems, ...factureHeaderItems]}
  onItemSelect={(item) => item.data?.view && setBillingView(item.data.view)}
/>
```

`createNFactureHeaderNavigation` filtra las hojas según `role` o `permissions` antes de entregarlas, ya que el contrato de `NHeader` no procesa permisos directamente. Para un widget standalone que sí necesite navegación propia puede usarse `showNavigation` explícitamente.

## Superficies y longitud de pantalla

- El contenido se limita con `contentMaxHeight` y desplaza sólo la zona operativa.
- Alta de receptor, visor de comprobante, CSD, catálogos e integraciones abren `NPanel` responsive.
- Las rutas administrativas muestran una tarjeta breve de contexto y una acción para abrir su panel.
- La documentación usa pestañas para mantener visibles sólo los detalles solicitados.

## Permisos

| Capacidad | Uso |
| --- | --- |
| `facture:view` | Resumen |
| `facture:issue` | Emisión |
| `facture:history` | Historial |
| `facture:ticket` | Conversión de tickets |
| `facture:admin` | CSD, catálogos e integraciones |
| `facture:*` | Acceso administrativo completo |

El RBAC del cliente sólo controla presentación. El backend debe verificar nuevamente usuario, tenant, permiso, folio, idempotencia y acceso al CSD en cada operación.

## Contrato fiscal y límites

La implementación fue contrastada el 7 de septiembre de 2026 con fuentes oficiales. El SAT indica que CFDI 4.0 es la única versión válida desde el 1 de abril de 2023 y exige, entre otros datos del receptor, RFC, nombre o razón social, régimen fiscal, código postal y UsoCFDI. `ClaveProdServ` y `ClaveUnidad` son requeridos por concepto. La compatibilidad UsoCFDI–régimen debe salir del catálogo vigente, no de una tabla congelada en la librería.

Referencias oficiales:

- [Formato de factura electrónica (Anexo 20)](https://wwwmat.sat.gob.mx/consultas/35025/formato-de-factura-electronica-%28anexo-20%29)
- [Requisitos de la factura electrónica](https://www.sat.gob.mx/minisitio/Factura/solicita_requisitos.htm)
- [Proveedores autorizados de certificación](https://wwwmat.sat.gob.mx/aplicacion/30796/proveedor-de-certificacion-de-factura-electronica-)
- [Proceso y motivos de cancelación](https://www.sat.gob.mx/minisitio/Factura/cancela_procesocancelacion.htm)

Las expresiones regulares sólo revisan la estructura del RFC; no prueban que esté inscrito, activo o asociado al nombre. El PAC debe validar el XML contra XSD, catálogos vigentes y reglas aplicables antes de timbrar.

## Accesibilidad y responsive

La navegación usa la semántica y teclado de `NSidebar`; formularios conservan labels; estados asíncronos usan `status`/`alert`; tablas pasan a registros apilados en móvil. Todos los textos propios del módulo se pueden sustituir con `labels` y los colores usan tokens semánticos.
