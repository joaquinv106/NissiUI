"use client"

import { Box, Button, IconButton, Menu, Portal, Text } from "@chakra-ui/react"
import { Check, Gem, MonitorCog, Moon, Palette, Sun } from "lucide-react"
import { useMemo } from "react"

import { NTooltip } from "../internal/NTooltip"
import { useNTheme } from "./context"
import { getNThemeLabel, resolveNThemeLabels } from "./labels"
import type { NThemePreference, NThemeProps } from "./types"

const themeIcons = {
  light: Sun,
  dark: Moon,
  navy: Palette,
  nissi: Gem,
  system: MonitorCog,
} as const

/** Selector visual de temas conectado con el NThemeProvider más cercano. */
export function NTheme({
  presentation = "icon",
  themes,
  colorPalette = "blue",
  labels: customLabels,
}: NThemeProps) {
  const context = useNTheme()
  const labels = useMemo(() => resolveNThemeLabels(customLabels), [customLabels])
  const availableThemes = useMemo(() => {
    if (!themes) return context.themes
    const supportedThemes = themes.filter((theme) => context.themes.includes(theme))
    return supportedThemes.length > 0 ? supportedThemes : context.themes
  }, [context.themes, themes])
  const displayTheme: NThemePreference = context.mounted
    ? context.theme
    : context.themes.includes("system") ? "system" : "light"
  const CurrentIcon = themeIcons[displayTheme]
  const currentLabel = getNThemeLabel(displayTheme, labels)
  const accessibleLabel = labels.currentTheme(currentLabel)

  const trigger = presentation === "button" ? (
    <Menu.Trigger asChild>
      <Button variant="outline" colorPalette={colorPalette} aria-label={`${labels.selectorLabel}. ${accessibleLabel}`}>
        <CurrentIcon aria-hidden="true" size={17} />
        <Text as="span" display={{ base: "none", sm: "inline" }}>{currentLabel}</Text>
      </Button>
    </Menu.Trigger>
  ) : (
    <NTooltip content={accessibleLabel}>
      <Menu.Trigger asChild>
        <IconButton variant="ghost" colorPalette={colorPalette} aria-label={`${labels.selectorLabel}. ${accessibleLabel}`}>
          <CurrentIcon aria-hidden="true" size={18} />
        </IconButton>
      </Menu.Trigger>
    </NTooltip>
  )

  return (
    <Menu.Root positioning={{ placement: "bottom-end" }}>
      {trigger}
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="13rem">
            <Menu.RadioItemGroup
              value={context.theme}
              onValueChange={(details) => context.setTheme(details.value as NThemePreference)}
            >
              <Menu.ItemGroupLabel>{labels.menuLabel}</Menu.ItemGroupLabel>
              {availableThemes.map((theme) => {
                const Icon = themeIcons[theme]
                const label = getNThemeLabel(theme, labels)
                return (
                  <Menu.RadioItem
                    key={theme}
                    value={theme}
                  >
                    <Box aria-hidden="true" color="fg.muted"><Icon size={17} /></Box>
                    <Text flex="1">{label}</Text>
                    <Menu.ItemIndicator><Check aria-hidden="true" size={16} /></Menu.ItemIndicator>
                  </Menu.RadioItem>
                )
              })}
            </Menu.RadioItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
