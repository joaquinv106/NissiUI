# NForm

`NForm` genera formularios reactivos a partir de una configuración declarativa en JSON: campos con su tipo de dato, validación, secciones y el resultado del envío hacia el backend. Comparte arquitectura, tokens de tema y convenciones de accesibilidad con `NTable`, `NSidebar` y `NHeader`.

## Instalación y uso básico

```tsx
import { NForm, type NFormConfig } from "nissi-ui"

type Employee = {
  name: string
  email: string
  department: string
}

const config: NFormConfig<Employee> = {
  fields: [
    { key: "name", label: "Nombre completo", validation: { required: true } },
    { key: "email", label: "Correo", type: "email", validation: { required: true, pattern: /@/ } },
    {
      key: "department",
      label: "Departamento",
      type: "select",
      options: [{ label: "Diseño", value: "diseno" }, { label: "Ingeniería", value: "ingenieria" }],
    },
  ],
}

<NForm
  config={config}
  title="Nuevo colaborador"
  onSubmit={async (values, mode) => {
    const response = await api.saveEmployee(values, mode)
    return response.ok
      ? { success: true, message: "Colaborador guardado." }
      : { success: false, message: response.error, errors: response.fieldErrors }
  }}
/>
```

## Contrato de datos

- `config.fields`: arreglo de `NFormField<T>` con `key`, `label`, `type`, `validation`, `options`, `section`, `colSpan`, `hidden`, `disabled`, `defaultValue` y `render` (control personalizado).
- `config.sections`: agrupa campos bajo un título/descr. opcional y controla columnas por sección (`1 | 2 | 3`). Los campos sin `section` se muestran al final, en su propia rejilla.
- `data`: valores iniciales; su presencia infiere `mode="edit"` cuando no se especifica `mode` explícitamente. Sin `data`, el modo es `"create"`.
- `onSubmit(values, mode)`: retorna (o resuelve una promesa con) `{ success, message?, errors? }`. `errors` mapea `key` de campo a mensaje y se muestra bajo cada control; `message` se muestra en un `Toaster` flotante de éxito o error.
- `resetOnSuccess` (por defecto `true`): limpia el formulario a sus valores iniciales tras un envío exitoso en modo `create`. En `edit` no se limpia porque normalmente el diálogo/página se cierra o navega tras guardar.

## Tipos de campo soportados

`text`, `email`, `password`, `tel`, `url`, `number`, `currency`, `textarea`, `select`, `multiselect`, `checkbox`, `switch`, `radio`, `date`, `datetime`, `hidden` y `custom` (vía `render`).

## Validación

- `validation.required` acepta `true` (mensaje predeterminado) o una cadena personalizada.
- `min`/`max` aplican a `number`/`currency`; `minLength`/`maxLength`/`pattern` aplican a texto.
- `validate(value, values)` permite reglas síncronas o asíncronas adicionales (por ejemplo, contra otros campos del formulario).
- La validación se ejecuta al perder el foco (`onBlur`) por campo y de forma completa al enviar; el envío se bloquea si hay errores.
- Los errores devueltos por `onSubmit` (`result.errors`) se combinan con la validación de cliente y se muestran de la misma forma.

## Diseño responsive

- Cada sección usa una rejilla (`Grid`) de hasta 3 columnas en escritorio y 1 columna en móvil.
- `colSpan` (`1 | 2 | 3 | "full"`) controla cuántas columnas ocupa un campo dentro de su sección.
- El formulario vive dentro de un `Card` opcional (`card`, por defecto `true`) que respeta `variant="outline" | "elevated" | "plain"`, igual que `NTable`.

## Accesibilidad

- Cada campo usa `Field.Root` con `Field.Label`, `Field.HelperText` y `Field.ErrorText`; los errores marcan `aria-invalid` y quedan asociados por `aria-describedby`.
- Los controles nativos (`Input`, `Textarea`, `NativeSelect`, `Checkbox`, `Switch`, `RadioGroup`) se deshabilitan mientras el formulario envía datos, evitando doble envío.
- El mensaje de éxito/error aparece en un `Toaster` con ancho máximo (`calc(100vw - 2rem)`) y fondo `bg.muted` con borde, para mantenerse legible y dentro de la pantalla en tema claro y oscuro.

## Integración con otros componentes

- Comparte tokens (`bg.panel`, `bg.muted`, `border`, `colorPalette`) con `NTable`, `NSidebar` y `NHeader` para verse en armonía dentro del mismo layout.
- Puede usarse dentro de un `Dialog` (como el editor de filas de `NDataTable`) o como página completa dentro del área principal junto a `NHeader`/`NSidebar`.
- Los módulos de `form/internal/` (`FormField`, `FormSection`, `FormActions`) no se exportan; cualquier necesidad de personalización adicional debe resolverse con `render` en el campo o `actions` en `NForm`.
