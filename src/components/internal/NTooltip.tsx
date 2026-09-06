import { Portal, Tooltip } from "@chakra-ui/react"
import type { ReactElement, ReactNode } from "react"

interface NTooltipProps {
  children: ReactElement
  content: ReactNode
  disabled?: boolean
  zIndex?: string | number
}

/** Tooltip accesible compartido por toda la librería; se omite por completo si `disabled` o sin contenido. */
export function NTooltip({ children, content, disabled = false, zIndex }: NTooltipProps) {
  if (disabled || !content) return children

  return (
    <Tooltip.Root openDelay={350} closeDelay={100} positioning={{ placement: "top" }}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner zIndex={zIndex}>
          <Tooltip.Content>
            {content}
            <Tooltip.Arrow><Tooltip.ArrowTip /></Tooltip.Arrow>
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  )
}
