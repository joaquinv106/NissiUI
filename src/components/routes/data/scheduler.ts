import type {
  NRouteMatch,
  NRouteMatchEntry,
  NRouteTransitionContext,
} from "../types"

export class NRouteLoaderSchedulerError extends Error {
  readonly routeId: string
  readonly routeIndex: number
  readonly cause: unknown
  readonly loaderData: Readonly<Record<string, unknown>>

  constructor(message: string, routeId: string, routeIndex: number, cause?: unknown, loaderData: Readonly<Record<string, unknown>> = {}) {
    super(message)
    this.name = "NRouteLoaderSchedulerError"
    this.routeId = routeId
    this.routeIndex = routeIndex
    this.cause = cause
    this.loaderData = loaderData
  }
}

interface NRouteLoaderTask<TData, TContext> {
  entry: NRouteMatchEntry<TData, TContext>
  index: number
  dependencies: readonly string[]
}

export interface NRouteLoaderSchedulerOptions<TData, TContext> {
  match: NRouteMatch<TData, TContext>
  routeIds: ReadonlySet<string>
  initialLoaderData?: Readonly<Record<string, unknown>>
  context: TContext
  signal: AbortSignal
  execute: (
    entry: NRouteMatchEntry<TData, TContext>,
    details: NRouteTransitionContext<TContext, TData>,
    index: number,
  ) => unknown | Promise<unknown>
}

function abortError(): DOMException {
  return new DOMException("Navigation aborted", "AbortError")
}

function validateDependencies<TData, TContext>(
  match: NRouteMatch<TData, TContext>,
  tasks: readonly NRouteLoaderTask<TData, TContext>[],
  loaderData: Readonly<Record<string, unknown>>,
): void {
  const routeById = new Map(match.branch.map((entry, index) => [entry.route.id, { entry, index }]))
  for (const task of tasks) {
    for (const dependencyId of task.dependencies) {
      const dependency = routeById.get(dependencyId)
      if (!dependency?.entry.route.loader) {
        throw new NRouteLoaderSchedulerError(
          `La ruta "${task.entry.route.id}" depende del loader inexistente "${dependencyId}".`,
          task.entry.route.id,
          task.index,
          undefined,
          loaderData,
        )
      }
      if (dependencyId === task.entry.route.id) {
        throw new NRouteLoaderSchedulerError(
          `La ruta "${task.entry.route.id}" no puede depender de su propio loader.`,
          task.entry.route.id,
          task.index,
          undefined,
          loaderData,
        )
      }
    }
  }
}

/** Ejecuta loaders por ondas: paralelos cuando son independientes y secuenciales sólo por `dependsOn`. */
export async function scheduleNRouteLoaders<TData, TContext>({
  match,
  routeIds,
  initialLoaderData = {},
  context,
  signal,
  execute,
}: NRouteLoaderSchedulerOptions<TData, TContext>): Promise<Record<string, unknown>> {
  const loaderData: Record<string, unknown> = { ...initialLoaderData }
  const tasks = match.branch.flatMap<NRouteLoaderTask<TData, TContext>>((entry, index) =>
    routeIds.has(entry.route.id) && entry.route.loader
      ? [{ entry, index, dependencies: entry.route.dependsOn ?? [] }]
      : [],
  )
  validateDependencies(match, tasks, loaderData)
  const pending = new Map(tasks.map((task) => [task.entry.route.id, task]))

  while (pending.size > 0) {
    if (signal.aborted) throw abortError()
    const ready = [...pending.values()].filter((task) =>
      task.dependencies.every((dependencyId) => !pending.has(dependencyId)),
    )
    if (ready.length === 0) {
      const task = [...pending.values()].sort((left, right) => left.index - right.index)[0]!
      throw new NRouteLoaderSchedulerError(
        `Se detectó un ciclo de loaders que incluye la ruta "${task.entry.route.id}".`,
        task.entry.route.id,
        task.index,
        undefined,
        loaderData,
      )
    }

    const availableData = Object.freeze({ ...loaderData })
    const settled = await Promise.allSettled(ready.map(async (task) => ({
      task,
      value: await execute(task.entry, {
        params: match.params,
        location: match.location,
        context,
        signal,
        route: task.entry.route,
        loaderData: availableData,
      }, task.index),
    })))
    if (signal.aborted) throw abortError()

    settled.forEach((result) => {
      if (result.status !== "fulfilled") return
      loaderData[result.value.task.entry.route.id] = result.value.value
      pending.delete(result.value.task.entry.route.id)
    })

    const failures = settled.flatMap((result, resultIndex) => result.status === "rejected"
      ? [{ task: ready[resultIndex]!, cause: result.reason }]
      : [])
      .sort((left, right) => left.task.index - right.task.index)
    const failure = failures[0]
    if (failure) {
      throw new NRouteLoaderSchedulerError(
        `Falló el loader de la ruta "${failure.task.entry.route.id}".`,
        failure.task.entry.route.id,
        failure.task.index,
        failure.cause,
        loaderData,
      )
    }
  }

  return loaderData
}
