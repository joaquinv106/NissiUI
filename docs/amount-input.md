# NAmountInput

`NAmountInput` captura cualquier valor numérico sin asumir moneda ni dominio. Sirve para cantidades, importes, porcentajes, horas, distancias, capacidades o unidades configurando límites, paso, locale y `Intl.NumberFormatOptions`.

## Frente a `NumberInput` de Chakra UI

`NAmountInput` no sustituye la primitiva de Chakra: la compone como un campo de formulario estandarizado para Nissi UI.

| Necesidad | Chakra `NumberInput` | `NAmountInput` |
| --- | --- | --- |
| Estado público | Cadena localizada y `valueAsNumber` en detalles | `number \| null` como fuente de verdad |
| Campo completo | Se compone aparte con `Field` | Etiqueta, ayuda, error y requerido integrados |
| Atajos frecuentes | Se implementan externamente | `quickValues` incluidos |
| Textos accesibles | Se configuran en cada composición | Contrato `labels` común e internacionalizable |
| Uso en patrones Nissi | Integración manual | Contrato compartido por `NAmountAllocator` |

Usa directamente `NumberInput` de Chakra cuando sólo necesites un control numérico aislado o una composición visual totalmente personalizada. Usa `NAmountInput` cuando quieras el contrato de formulario anterior repetido de forma consistente en distintas aplicaciones.

## Uso

```tsx
import { NAmountInput } from "nissi-ui"

const [amount, setAmount] = useState<number | null>(null)

<NAmountInput
  label="Presupuesto"
  value={amount}
  onValueChange={setAmount}
  min={0}
  step={0.01}
  locale="es-MX"
  formatOptions={{ style: "currency", currency: "MXN" }}
/>
```

`value`/`onValueChange` habilitan estado controlado y `defaultValue` activa estado local. El callback recibe también `{ value, valueText, reason }`; `reason` distingue escritura normal de un valor rápido.

Con `showControls`, los botones incrementan y decrementan mediante clic o teclado, respetan `step`, `min` y `max`, y publican inmediatamente el nuevo valor tanto en modo controlado como no controlado.

## Formatos y captura

La presentación usa `Intl.NumberFormatOptions`, por lo que la misma primitiva cubre diferentes medidas:

```tsx
<NAmountInput label="Avance" min={0} max={1} step={0.05} formatOptions={{ style: "percent" }} />
<NAmountInput label="Peso" formatOptions={{ style: "unit", unit: "kilogram" }} />
<NAmountInput label="Horas" min={0} max={40} step={0.5} showControls />
```

La entrada escrita se analiza usando los separadores del `locale`. Un texto vacío se entrega como `null`, lo que permite distinguir ausencia de valor de cero.

Mientras el campo tiene foco conserva un borrador numérico sin símbolo monetario, separadores de miles ni decimales de relleno. Esto permite reemplazar `0.00`, escribir desde el final del campo y completar temporalmente textos como `12.` sin que un render controlado mueva el cursor o destruya la captura. Al perder foco vuelve a aplicar `Intl.NumberFormat`.

## Valores rápidos y estados

`quickValues` agrega atajos opcionales que respetan `min` y `max`. `label`, `helperText`, `errorText`, `required`, `invalid`, `disabled` y `readOnly` se integran mediante `Field` de Chakra UI v3.

```tsx
<NAmountInput
  label="Capacidad"
  min={0}
  max={100}
  quickValues={[{ value: 25 }, { value: 50 }, { value: 100, label: "Completo" }]}
/>
```

## API principal

| Prop | Tipo | Predeterminado | Uso |
| --- | --- | --- | --- |
| `value` / `defaultValue` | `number \| null` | `null` | Estado controlado/no controlado. |
| `onValueChange` | `(value, details) => void` | — | Publica número, texto y causa. |
| `min` / `max` / `step` | `number` | — / — / `1` | Restricciones e incremento. |
| `locale` | `string` | entorno | Separadores y formato regional. |
| `formatOptions` | `Intl.NumberFormatOptions` | decimal | Moneda, porcentaje, unidad o decimal. |
| `showControls` | `boolean` | `false` | Botones de incremento y decremento. |
| `quickValues` | `NAmountInputQuickValue[]` | `[]` | Atajos de captura. |
| `allowOverflow` | `boolean` | `false` | Permite exceder límites temporalmente. |
| `clampValueOnBlur` | `boolean` | `true` | Ajusta al rango al perder foco. |
| `labels` | `Partial<NAmountInputLabels>` | español | Nombres accesibles e i18n. |

## Accesibilidad

- `Field.Label`, ayuda, requerido y error quedan asociados al control.
- Sin etiqueta visible se usa `labels.amountAriaLabel`.
- El spinbutton conserva flechas, rueda opcional y semántica ARIA de Chakra.
- Los controles y valores rápidos son botones nativos con nombres traducibles.
- Foco, error, bordes y superficies usan recetas y tokens semánticos.
