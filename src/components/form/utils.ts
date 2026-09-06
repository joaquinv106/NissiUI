import type { NPermissionMode } from "../permissions/types"
import type { NFormConfig, NFormField, NFormLabels, NFormRow, NFormSection } from "./types"

/** Combina los valores iniciales (`data`) con los `defaultValue` de cada campo. */
export function buildInitialValues<T extends NFormRow>(
  fields: NFormField<T>[],
  data?: Partial<T>,
): Partial<T> {
  const values: Partial<T> = {}
  for (const field of fields) {
    const fromData = data?.[field.key]
    values[field.key] = (fromData !== undefined ? fromData : field.defaultValue) as T[Extract<keyof T, string>]
  }
  return values
}

/** Oculta el campo si su condición `hidden` se cumple o si falta la capacidad requerida. */
export function isFieldHidden<T extends NFormRow>(
  field: NFormField<T>,
  values: Partial<T>,
  can: (required: string | string[], mode?: NPermissionMode) => boolean = () => true,
): boolean {
  if (typeof field.hidden === "function" ? field.hidden(values) : Boolean(field.hidden)) return true
  if (field.requiredPermission && !can(field.requiredPermission, field.permissionMode)) return true
  return false
}

/** Agrupa los campos por `section`, dejando al final los que no pertenecen a ninguna. */
export function groupFieldsBySection<T extends NFormRow>(
  config: NFormConfig<T>,
): Array<{ section?: NFormSection; fields: NFormField<T>[] }> {
  const sections = config.sections ?? []
  const bySection = new Map<string, NFormField<T>[]>()
  const unsectioned: NFormField<T>[] = []

  for (const field of config.fields) {
    if (field.section) {
      const list = bySection.get(field.section) ?? []
      list.push(field)
      bySection.set(field.section, list)
    } else {
      unsectioned.push(field)
    }
  }

  const groups: Array<{ section?: NFormSection; fields: NFormField<T>[] }> = []
  for (const section of sections) {
    const fields = bySection.get(section.id)
    if (fields && fields.length > 0) groups.push({ section, fields })
  }
  if (unsectioned.length > 0) groups.push({ fields: unsectioned })
  return groups
}

/** Convierte a número de forma segura; retorna `undefined` si el valor está vacío o no es numérico. */
function toNumber(value: unknown): number | undefined {
  if (value === "" || value === null || value === undefined) return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

/** Valida un campo contra sus reglas (`required`, min/max, patrón, `validate` personalizado). */
export async function validateFieldValue<T extends NFormRow>(
  field: NFormField<T>,
  value: unknown,
  values: Partial<T>,
  labels: NFormLabels,
): Promise<string | undefined> {
  const rules = field.validation
  if (!rules) return undefined

  const isEmpty = value === undefined || value === null || value === ""
    || (Array.isArray(value) && value.length === 0)

  if (rules.required && isEmpty) {
    return typeof rules.required === "string" ? rules.required : labels.requiredError
  }
  if (!isEmpty) {
    if (field.type === "number" || field.type === "currency") {
      const numeric = toNumber(value)
      if (numeric !== undefined) {
        if (rules.min !== undefined && numeric < rules.min) return labels.minError(rules.min)
        if (rules.max !== undefined && numeric > rules.max) return labels.maxError(rules.max)
      }
    } else if (typeof value === "string") {
      if (rules.minLength !== undefined && value.length < rules.minLength) return labels.minLengthError(rules.minLength)
      if (rules.maxLength !== undefined && value.length > rules.maxLength) return labels.maxLengthError(rules.maxLength)
      if (rules.pattern && !rules.pattern.test(value)) return rules.patternMessage ?? labels.patternError
    }
  }
  if (rules.validate) return rules.validate(value, values)
  return undefined
}

/** Valida todos los campos visibles del formulario y devuelve los errores indexados por `key`. */
export async function validateAllFields<T extends NFormRow>(
  config: NFormConfig<T>,
  values: Partial<T>,
  labels: NFormLabels,
  can?: (required: string | string[], mode?: NPermissionMode) => boolean,
): Promise<Record<string, string>> {
  const errors: Record<string, string> = {}
  for (const field of config.fields) {
    if (isFieldHidden(field, values, can)) continue
    const error = await validateFieldValue(field, values[field.key], values, labels)
    if (error) errors[field.key] = error
  }
  return errors
}

/** Convierte el texto del `<input>` a número para campos `number`/`currency`. */
export function coerceFieldValue<T extends NFormRow>(field: NFormField<T>, raw: unknown): unknown {
  if ((field.type === "number" || field.type === "currency") && typeof raw === "string") {
    return raw === "" ? "" : Number(raw)
  }
  return raw
}

/** Traduce `colSpan` a las columnas de rejilla responsive (1 en móvil). */
export function colSpanStyle(colSpan: NFormField["colSpan"]) {
  if (colSpan === "full") return { base: 1, md: 3 }
  if (colSpan === 2) return { base: 1, md: 2 }
  if (colSpan === 3) return { base: 1, md: 3 }
  return { base: 1, md: 1 }
}
