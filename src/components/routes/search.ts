import type {
  NRouteSearchCodec,
  NRouteSearchInput,
  NRouteSearchParam,
  NRouteSearchSchema,
  NRouteSearchValues,
} from "./types"

function param<TValue>(codec: NRouteSearchCodec<TValue>): NRouteSearchParam<TValue> {
  return {
    ...codec,
    default<TDefault extends Exclude<TValue, undefined>>(value: TDefault) {
      return param<Exclude<TValue, undefined>>({
        parse(values) {
          const parsed = codec.parse(values)
          return (parsed === undefined ? value : parsed) as Exclude<TValue, undefined>
        },
        serialize(next) {
          return codec.serialize(next as TValue)
        },
      })
    },
  }
}

/** Conserva los literales del schema para inferir su resultado y sus targets. */
export function defineNRouteSearch<const TSchema extends NRouteSearchSchema>(schema: TSchema): TSchema {
  return schema
}

/** Adapta un codec propio al contrato público sin imponer Zod u otra dependencia. */
export function createNRouteSearchCodec<TValue>(codec: NRouteSearchCodec<TValue>): NRouteSearchCodec<TValue> {
  return codec
}

/** Agrega un default a cualquier codec, incluido uno definido por la aplicación. */
export function defaultNRouteSearchParam<TValue>(
  codec: NRouteSearchCodec<TValue | undefined>,
  value: Exclude<TValue, undefined>,
): NRouteSearchParam<Exclude<TValue, undefined>> {
  return param(codec).default(value)
}

export function stringParam(): NRouteSearchParam<string | undefined> {
  return param({
    parse: (values) => values[0],
    serialize: (value) => value,
  })
}

export function numberParam(): NRouteSearchParam<number | undefined> {
  return param({
    parse(values) {
      const source = values[0]
      if (source === undefined || source.trim() === "") return undefined
      const value = Number(source)
      return Number.isFinite(value) ? value : undefined
    },
    serialize: (value) => value === undefined ? undefined : String(value),
  })
}

export function booleanParam(): NRouteSearchParam<boolean | undefined> {
  return param({
    parse(values) {
      const value = values[0]?.toLowerCase()
      if (value === "true" || value === "1") return true
      if (value === "false" || value === "0") return false
      return undefined
    },
    serialize: (value) => value === undefined ? undefined : String(value),
  })
}

export function enumParam<const TValues extends readonly string[]>(
  values: TValues,
): NRouteSearchParam<TValues[number] | undefined> {
  const allowed = new Set<string>(values)
  return param({
    parse: (source) => source[0] !== undefined && allowed.has(source[0]) ? source[0] as TValues[number] : undefined,
    serialize: (value) => value,
  })
}

export function parseNRouteSearch<const TSchema extends NRouteSearchSchema>(
  schema: TSchema,
  searchParams: URLSearchParams,
): NRouteSearchValues<TSchema> {
  const result: Record<string, unknown> = {}
  Object.entries(schema).forEach(([key, codec]) => {
    result[key] = codec.parse(searchParams.getAll(key))
  })
  return result as NRouteSearchValues<TSchema>
}

export function serializeNRouteSearch<const TSchema extends NRouteSearchSchema>(
  schema: TSchema,
  values: NRouteSearchInput<TSchema>,
  base?: URLSearchParams,
): URLSearchParams {
  const result = new URLSearchParams(base)
  Object.entries(schema).forEach(([key, codec]) => {
    if (!(key in values)) return
    result.delete(key)
    const value = values[key]
    if (value === null || value === undefined) return
    const serialized = codec.serialize(value)
    if (serialized === undefined) return
    const entries: readonly string[] = typeof serialized === "string" ? [serialized] : serialized
    entries.forEach((entry) => result.append(key, entry))
  })
  return result
}

export function rawNRouteSearch(searchParams: URLSearchParams): Readonly<Record<string, string | readonly string[]>> {
  const result: Record<string, string | readonly string[]> = {}
  searchParams.forEach((_value, key) => {
    if (key in result) return
    const values = searchParams.getAll(key)
    result[key] = values.length === 1 ? values[0]! : values
  })
  return result
}
