import type { NSyncStatusLabels } from "./types"

export const defaultNSyncStatusLabels: NSyncStatusLabels = {
  regionLabel: "Estado de sincronización",
  synced: "Sincronizado",
  syncing: "Sincronizando",
  pending: "Cambios pendientes",
  offline: "Sin conexión",
  error: "Error de sincronización",
  pendingCount: (count) => `${count} ${count === 1 ? "cambio pendiente" : "cambios pendientes"}`,
  lastSynced: "Última sincronización",
  neverSynced: "Aún no se ha sincronizado",
  retry: "Reintentar",
  retrying: "Reintentando",
  retryFailed: "No fue posible iniciar la sincronización.",
  details: "Detalles de sincronización",
}

export function resolveNSyncStatusLabels(labels?: Partial<NSyncStatusLabels>): NSyncStatusLabels {
  return { ...defaultNSyncStatusLabels, ...labels }
}
