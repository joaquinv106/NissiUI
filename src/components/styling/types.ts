import type { SystemStyleObject } from "@chakra-ui/react"

/** Clases estables asignables a las partes públicas de un componente. */
export type NComponentClassNames<TSlot extends string> = Partial<Record<TSlot, string>>

/** Estilos Chakra asignables a las partes públicas de un componente. */
export type NComponentStyles<TSlot extends string> = Partial<Record<TSlot, SystemStyleObject>>

/** Contrato aditivo de personalización compartido por componentes Nissi UI. */
export interface NComponentStyleProps<TSlot extends string> {
  /** Retira la decoración predeterminada sin alterar semántica, estado ni interacción. */
  unstyled?: boolean
  /** Clases de consumidor aplicadas a slots públicos y estables. */
  classNames?: NComponentClassNames<TSlot>
  /** Estilos Chakra de consumidor aplicados a slots públicos y estables. */
  styles?: NComponentStyles<TSlot>
}
