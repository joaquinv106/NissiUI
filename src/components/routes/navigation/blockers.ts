import type {
  NRouteBlocker,
  NRouteBlockerCondition,
  NRouteBlockerDetails,
} from "../types"

type BlockerId = string
type Listener = () => void

interface PendingNavigation {
  details: NRouteBlockerDetails
  blockerIds: ReadonlySet<BlockerId>
  commit: () => void
}

/** Registro aislado por router para componer blockers y una sola navegación pendiente. */
export class NRouteBlockerRegistry {
  private readonly conditions = new Map<BlockerId, () => NRouteBlockerCondition>()
  private readonly listeners = new Set<Listener>()
  private readonly snapshots = new Map<BlockerId, NRouteBlocker>()
  private readonly fallbackSnapshot: NRouteBlocker
  private pending?: PendingNavigation

  constructor() {
    this.fallbackSnapshot = this.idleSnapshot()
  }

  readonly proceed = (): void => {
    const pending = this.pending
    if (!pending) return
    this.pending = undefined
    this.refreshSnapshots()
    pending.commit()
  }

  readonly reset = (): void => {
    if (!this.pending) return
    this.pending = undefined
    this.refreshSnapshots()
  }

  readonly subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  register(id: BlockerId, condition: () => NRouteBlockerCondition): () => void {
    this.conditions.set(id, condition)
    this.snapshots.set(id, this.idleSnapshot())
    return () => {
      this.conditions.delete(id)
      this.snapshots.delete(id)
      if (this.pending?.blockerIds.has(id)) {
        const remaining = new Set([...this.pending.blockerIds].filter((blockerId) => blockerId !== id))
        this.pending = remaining.size > 0 ? { ...this.pending, blockerIds: remaining } : undefined
        this.refreshSnapshots()
      }
    }
  }

  getSnapshot(id: BlockerId): NRouteBlocker {
    return this.snapshots.get(id) ?? this.fallbackSnapshot
  }

  shouldBlock(details: NRouteBlockerDetails): boolean {
    return this.blockingIds(details).size > 0
  }

  request(details: NRouteBlockerDetails, commit: () => void): boolean {
    const blockerIds = this.blockingIds(details)
    if (blockerIds.size === 0) return false
    this.pending = { details, blockerIds, commit }
    this.refreshSnapshots()
    return true
  }

  private blockingIds(details: NRouteBlockerDetails): ReadonlySet<BlockerId> {
    const result = new Set<BlockerId>()
    this.conditions.forEach((readCondition, id) => {
      const condition = readCondition()
      if (typeof condition === "function" ? condition(details) : condition) result.add(id)
    })
    return result
  }

  private idleSnapshot(): NRouteBlocker {
    return { state: "idle", proceed: this.proceed, reset: this.reset }
  }

  private refreshSnapshots(): void {
    this.conditions.forEach((_condition, id) => {
      const blocked = this.pending?.blockerIds.has(id) ?? false
      this.snapshots.set(id, blocked ? {
        state: "blocked",
        from: this.pending!.details.from,
        to: this.pending!.details.to,
        action: this.pending!.details.action,
        proceed: this.proceed,
        reset: this.reset,
      } : this.idleSnapshot())
    })
    this.listeners.forEach((listener) => listener())
  }
}
