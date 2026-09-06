import { Badge, Box, Button, IconButton } from "@chakra-ui/react"
import { Ellipsis } from "lucide-react"

import { NTooltip } from "../../internal/NTooltip"
import type { NHeaderAction } from "../types"

/** Lista de acciones del header: botón con etiqueta en escritorio o icono compacto en móvil. */
export function HeaderActions({
  actions,
  mobile = false,
  defaultPresentation = "icon",
}: {
  actions: NHeaderAction[]
  mobile?: boolean
  defaultPresentation?: "icon" | "button"
}) {
  const visible = mobile ? actions.filter((action) => action.showOnMobile) : actions
  return visible.map((action) => {
    const icon = action.icon ?? <Ellipsis size={18} />
    const badge = action.badge !== undefined ? (
      <Badge
        position="absolute"
        top="0"
        insetInlineEnd="0"
        minW="4"
        height="4"
        px="1"
        justifyContent="center"
        colorPalette={action.colorPalette ?? "red"}
        rounded="full"
        fontSize="2xs"
      >
        {action.badge}
      </Badge>
    ) : null

    if (!mobile && (action.presentation ?? defaultPresentation) === "button") {
      const content = <>{action.icon ? <Box aria-hidden="true">{action.icon}</Box> : null}{action.label}{badge}</>
      return action.href ? (
        <Button key={action.id} position="relative" colorPalette={action.colorPalette} disabled={action.disabled} asChild>
          <a href={action.href} onClick={() => action.onClick?.(action)}>{content}</a>
        </Button>
      ) : (
        <Button key={action.id} position="relative" colorPalette={action.colorPalette} disabled={action.disabled} onClick={() => action.onClick?.(action)}>{content}</Button>
      )
    }

    const iconContent = <>{icon}{badge}</>
    const control = (
      <IconButton
        aria-label={action.label}
        variant="ghost"
        colorPalette={action.colorPalette}
        disabled={action.disabled}
        position="relative"
        flexShrink="0"
        onClick={() => action.onClick?.(action)}
        asChild={Boolean(action.href)}
      >
        {action.href ? <a href={action.href}>{iconContent}</a> : iconContent}
      </IconButton>
    )
    return <NTooltip key={action.id} content={action.label}>{control}</NTooltip>
  })
}
