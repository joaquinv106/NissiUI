import type { NFileUploadLabels, NNotificationCenterLabels } from "./types"

export const defaultNFileUploadLabels: NFileUploadLabels = { label: "Archivos", description: "Arrastra archivos aquí o selecciónalos desde tu dispositivo.", browse: "Seleccionar archivos", remove: (name) => `Quitar ${name}`, rejected: "Algunos archivos no cumplen los límites permitidos." }
export const defaultNNotificationCenterLabels: NNotificationCenterLabels = { trigger: "Notificaciones", title: "Notificaciones", markAllRead: "Marcar todo como leído", empty: "No hay notificaciones.", unreadCount: (count) => `${count} sin leer` }
export const resolveLabels = <T extends object>(base: T, custom?: Partial<T>): T => ({ ...base, ...custom })
