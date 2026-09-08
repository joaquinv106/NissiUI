import type { ReactNode } from "react"
import type { NComponentStyleProps } from "../styling"
export type NKanbanSlot = "root"
export type NSchedulerSlot = "root"
export type NMapViewSlot = "root"

export interface NKanbanCard { id: string; title: ReactNode; description?: ReactNode; meta?: ReactNode; content?: ReactNode }
export interface NKanbanColumn { id: string; title: ReactNode; cards: NKanbanCard[]; limit?: number; colorPalette?: string }
export interface NKanbanMove { cardId: string; fromColumnId: string; toColumnId: string; toIndex: number }
export interface NKanbanLabels { board: string; movePrevious: (card: string) => string; moveNext: (card: string) => string; limit: (count: number, limit: number) => string }
export interface NKanbanProps extends NComponentStyleProps<NKanbanSlot> { columns: NKanbanColumn[]; onMove?: (move: NKanbanMove) => void; renderCardActions?: (card: NKanbanCard, column: NKanbanColumn) => ReactNode; labels?: Partial<NKanbanLabels> }

export interface NSchedulerEvent { id: string; title: ReactNode; start: Date | string; end?: Date | string; description?: ReactNode; colorPalette?: string; resource?: ReactNode }
export interface NSchedulerLabels { schedule: string; empty: string; allDay: string }
export interface NSchedulerProps extends NComponentStyleProps<NSchedulerSlot> { events: NSchedulerEvent[]; startDate?: Date | string; days?: number; onEventSelect?: (event: NSchedulerEvent) => void; labels?: Partial<NSchedulerLabels> }

export interface NMapMarker { id: string; latitude: number; longitude: number; label: ReactNode; description?: ReactNode; data?: unknown }
export interface NMapRenderContext { markers: NMapMarker[]; selectedId?: string; onSelect?: (marker: NMapMarker) => void }
export interface NMapViewLabels { region: string; locations: string; empty: string; providerPlaceholder: string }
export interface NMapViewProps extends NComponentStyleProps<NMapViewSlot> { markers: NMapMarker[]; renderer?: (context: NMapRenderContext) => ReactNode; selectedId?: string; onSelect?: (marker: NMapMarker) => void; height?: string; labels?: Partial<NMapViewLabels> }
