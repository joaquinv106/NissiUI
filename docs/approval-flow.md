# NApprovalFlow

`NApprovalFlow<TRequest>` presenta una solicitud tipada, captura decisiones y muestra trazabilidad sin asumir compras, vacaciones, accesos, contratación, contenido ni otro dominio.

## Responsabilidad y seguridad

El componente controla experiencia de usuario, no autorización. `canPerformAction` sólo decide qué controles presenta o deshabilita; el servidor debe revalidar identidad, tenant, permisos, versión de la solicitud y transición de estado al procesar `onDecision`.

## Uso

```tsx
import { NApprovalFlow } from "nissi-ui"

<NApprovalFlow
  request={request}
  getRequestId={(item) => item.id}
  getRequestTitle={(item) => item.title}
  getRequestDescription={(item) => item.description}
  status={request.status}
  onDecision={async (item, decision) => {
    const response = await api.decide(item.id, decision)
    return response.ok
      ? { success: true }
      : { success: false, message: response.message }
  }}
  onStatusChange={(status) => updateLocalStatus(status)}
/>
```

Las acciones predeterminadas son aprobar, solicitar cambios y rechazar. Las dos últimas exigen comentario. `actions` permite sustituirlas conservando el mismo ciclo asíncrono y los estados estándar.

## Estado y decisiones

- `status`/`onStatusChange` habilitan estado controlado; `defaultStatus` activa estado local.
- `onDecision` puede devolver `false` o `{ success: false, message }` para conservar el estado anterior y mostrar el problema.
- Mientras la promesa está pendiente se bloquean todas las decisiones para evitar duplicados.
- Después de una decisión, las acciones se bloquean por defecto. `allowRepeatDecisions` debe habilitarse únicamente cuando el flujo lo permita.
- `canPerformAction` integra políticas externas sin incorporarlas al núcleo.

## Acciones personalizadas

```tsx
const actions = [
  { id: "accept", label: "Aceptar", status: "approved", colorPalette: "green" },
  { id: "return", label: "Devolver", status: "changes-requested", requiresComment: true },
] as const

<NApprovalFlow request={request} actions={actions} {...adapters} />
```

## Historial

`history` recibe entradas con identidad estable, estado, actor, comentario y fecha. `renderHistoryEntry` permite una presentación propia y `formatTimestamp` adapta zona horaria o formato. El componente no fabrica eventos porque no conoce al actor autenticado ni puede garantizar una escritura persistida.

## API principal

| Prop | Tipo | Predeterminado | Uso |
| --- | --- | --- | --- |
| `request` | `TRequest \| null` | — | Solicitud actual. |
| `getRequestId` | adaptador | requerido | Identidad estable. |
| `getRequestTitle` | adaptador | requerido | Título visible. |
| `status` / `defaultStatus` | `NApprovalStatus` | `pending` | Estado controlado/no controlado. |
| `onDecision` | función asíncrona | — | Persiste o valida la decisión. |
| `onStatusChange` | función | — | Publica una transición exitosa. |
| `actions` | `NApprovalAction[]` | acciones estándar | Decisiones disponibles. |
| `history` | `NApprovalHistoryEntry[]` | `[]` | Trazabilidad recibida del consumidor. |
| `canPerformAction` | función | permite todo | Restricción visual externa. |
| `allowRepeatDecisions` | `boolean` | `false` | Permite nuevas decisiones tras resolver. |
| `labels` | `Partial<NApprovalFlowLabels>` | español | Textos e i18n. |

## Accesibilidad y responsive

- Solicitud, estado y decisiones forman una región con nombre accesible.
- El estado se anuncia cuando cambia y los errores usan `role="alert"`.
- Comentario, ayuda y error están asociados mediante `Field`.
- Las acciones se apilan en móvil y conservan botones nativos, foco visible y estados disabled/loading.
- El historial es una lista semántica independiente.
