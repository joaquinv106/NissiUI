# Personalización compatible

Nissi UI conserva su apariencia predeterminada y permite personalizar componentes gradualmente mediante un contrato compartido. `NComponentStyleProps<TSlot>` expone tres propiedades opcionales:

```ts
interface NComponentStyleProps<TSlot extends string> {
  unstyled?: boolean
  classNames?: Partial<Record<TSlot, string>>
  styles?: Partial<Record<TSlot, SystemStyleObject>>
}
```

- `unstyled` retira decoración predeterminada, pero conserva semántica, layout funcional, estados, callbacks, foco y teclado.
- `classNames` permite integrar CSS propio usando nombres de slot tipados.
- `styles` aplica objetos `SystemStyleObject` de Chakra UI v3 a esos mismos slots.
- Cada slot genera `data-scope` y `data-part`; las clases internas de Chakra no forman parte del contrato público.

El valor predeterminado de `unstyled` es `false`, por lo que las aplicaciones existentes no cambian.

## Ejemplo

```tsx
import { NPanel } from "nissi-ui/panel"

<NPanel
  open
  title="Detalle"
  classNames={{ content: "company-panel", body: "company-panel__body" }}
  styles={{ body: { px: "8", bg: "bg.subtle" } }}
>
  <Detail />
</NPanel>
```

Para controlar completamente la superficie:

```tsx
<NPanel
  unstyled
  classNames={{ content: "raw-dialog", closeTrigger: "raw-dialog__close" }}
  styles={{ content: { width: "min(42rem, 100vw)", bg: "bg.panel" } }}
>
  <Detail />
</NPanel>
```

## Cobertura completa

Todos los componentes visuales públicos aceptan el contrato compartido. Cada uno exporta además su unión de slots, por ejemplo `NTableSlot`, `NFormSlot`, `NHeaderSlot` o `NReceiptSlot`. Los providers sin DOM visual conservan su contrato específico; `NThemeProvider` permite sustituir el sistema Chakra completo mediante `system`.

| Familia | Componentes | Slots representativos |
| --- | --- | --- |
| Navegación y plataforma | `NAppShell`, `NHeader`, `NSidebar`, `NModuleRegistry`, `NWorkspaceSwitcher`, `NTheme`, `NCtrl`, `NPermissionGate` | `root`, `content`, `navigation`, `surface`, `trigger` |
| Datos y formularios | `NTable`, `NDataTable`, `NForm`, `NAmountInput`, `NItemPicker`, `NLineItemEditor`, `NAmountAllocator`, `NCodeCapture` | `surface`, `form`, `fields`, `input`, `picker`, `summary` |
| Flujos | `NStepFlow`, `NApprovalFlow`, `NBalanceSession`, `NAdjustmentEditor`, `NDocumentView`, `NSyncStatus`, `NOfflineBoundary` | `root`, `request`, `document`, `error`, `loading`, `banner` |
| Comercio e impresión | `NCart`, `NCheckout`, `NReceipt`, `NThermalPrint` | `editor`, `allocator`, `lines`, `total`, `source` |
| Patrones de página y datos | `NPageHeader`, `NBreadcrumbs`, `NEmptyState`, `NAsyncState`, `NConfirmDialog`, `NFilterBar`, `NDateRangePicker`, `NDescriptionList`, `NDetailPanel` | `title`, `actions`, `menu`, `content`, `fields`, `item` |
| Actividad y dashboard | `NFileUpload`, `NActivityTimeline`, `NNotificationCenter`, `NStatCard`, `NDashboardGrid`, `NDashboardGridItem`, `NChartFrame` | `dropzone`, `marker`, `content`, `value`, `plot` |
| SaaS y verticales | `NSubscriptionGate`, `NPlanComparison`, `NAuditLog`, `NImpersonationBanner`, `NKanban`, `NScheduler`, `NMapView`, `NFacture` | `root`, `plan`, `entry`, `content`, `navigation` |

Los slots pequeños exponen al menos `root`; los componentes compuestos exponen las partes cuya personalización puede mantenerse estable sin revelar módulos `internal/`. La lista exacta está tipada por componente y es la fuente canónica para autocompletado.

## Sistema Chakra propio

`NThemeProvider` usa `nissiSystem` de forma predeterminada, pero acepta `system` para organizaciones que mantienen una configuración Chakra propia:

```tsx
<NThemeProvider system={companySystem} defaultTheme="system">
  <App />
</NThemeProvider>
```

El sistema alternativo debe definir los tokens consumidos por la aplicación. Para conservar la apariencia adaptativa de Nissi UI se recomiendan `bg`, `bg.panel`, `bg.muted`, `fg`, `fg.muted`, `border` y las paletas semánticas de estado.

## Compatibilidad

- No dependas de clases hash generadas por Chakra o Emotion.
- Considera nombres de slots y atributos `data-*` como API versionada.
- Prefiere `styles` para ajustes locales y un sistema Chakra propio para decisiones globales.
- Un modo `unstyled` no desactiva reglas de permisos, validación, estado controlado ni adaptadores.
