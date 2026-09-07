# NStepFlow

`NStepFlow<TState>` coordina procesos de varios pasos sin conocer la forma del borrador ni el sector. Sirve para onboarding, altas, checkout, contratación, configuración, solicitudes y cualquier captura secuencial.

## Diferencia frente a `Steps` de Chakra UI

`Steps` aporta la estructura visual y semántica. `NStepFlow` agrega la responsabilidad de aplicación que no pertenece a Chakra: borrador tipado, navegación controlada/no controlada, validación síncrona o asíncrona, finalización y estados operativos.

Usa `Steps` directamente si sólo necesitas presentar progreso. Usa `NStepFlow` cuando varios pasos editan un mismo estado y deben validar antes de avanzar.

## Uso

```tsx
import { Field, Input, Stack, Text } from "@chakra-ui/react"
import { NStepFlow, type NStepFlowStep } from "nissi-ui"

interface Draft {
  name: string
  email: string
}

const steps: NStepFlowStep<Draft>[] = [
  {
    id: "identity",
    title: "Identidad",
    validate: (state) => state.name ? undefined : "Escribe un nombre.",
    render: ({ state, setState }) => (
      <Field.Root>
        <Field.Label>Nombre</Field.Label>
        <Input value={state.name} onChange={(event) => setState({ ...state, name: event.target.value })} />
      </Field.Root>
    ),
  },
  {
    id: "review",
    title: "Revisión",
    render: ({ state }) => <Text>{state.name}</Text>,
  },
]

<NStepFlow
  steps={steps}
  defaultState={{ name: "", email: "" }}
  onComplete={async (draft) => saveDraft(draft)}
/>
```

## Estado controlado

`state`/`onStateChange` controlan el borrador y `stepId`/`onStepChange` controlan el paso. Los equivalentes `defaultState` y `defaultStepId` permiten estado local.

```tsx
<NStepFlow
  steps={steps}
  state={draft}
  defaultState={initialDraft}
  onStateChange={setDraft}
  stepId={activeStepId}
  onStepChange={setActiveStepId}
/>
```

## Validación y navegación

- `step.validate` puede devolver un mensaje o una promesa.
- Un resultado inválido conserva el paso y se anuncia mediante `role="alert"`.
- `linear` impide saltar pasos pendientes; pasos deshabilitados se omiten al avanzar o volver.
- `skippable` permite omitir la validación de un paso.
- `renderActions` sustituye las acciones predeterminadas y recibe `goNext`, `goBack`, `goTo`, estado y metadatos.
- Mientras una validación o finalización está pendiente, las acciones quedan bloqueadas para evitar envíos duplicados.

## API principal

| Prop | Tipo | Predeterminado | Uso |
| --- | --- | --- | --- |
| `steps` | `NStepFlowStep<TState>[]` | requerido | Pasos, contenido y validación. |
| `defaultState` | `TState` | requerido | Estado inicial y forma tipada del borrador. |
| `state` / `onStateChange` | controlado | — | Fuente de verdad externa del borrador. |
| `stepId` / `onStepChange` | controlado | — | Paso activo externo. |
| `defaultStepId` | `string` | primer paso | Paso inicial no controlado. |
| `onComplete` | `(state) => void \| boolean \| Promise` | — | Finalización del flujo. |
| `linear` | `boolean` | `true` | Restringe saltos hacia delante. |
| `orientation` | `horizontal \| vertical` | `horizontal` | Presentación del indicador. |
| `renderActions` | función | acciones estándar | Sustituye navegación inferior. |
| `labels` | `Partial<NStepFlowLabels>` | español | Textos e i18n. |

## Accesibilidad y responsive

- La lista usa la semántica de pestañas de `Steps`, `aria-current` y nombres con posición.
- Los pasos seleccionables y las acciones se operan con teclado y foco visible.
- El indicador horizontal permite desplazamiento en pantallas estrechas; las acciones se apilan en móvil.
- Carga, error, vacío y validación se anuncian mediante regiones semánticas.
