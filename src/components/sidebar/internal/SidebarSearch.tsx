import { Box, HStack, Input } from "@chakra-ui/react"
import { Search } from "lucide-react"

import type { NSidebarLabels } from "../types"

interface SidebarSearchProps {
  value: string
  labels: NSidebarLabels
  onChange: (value: string) => void
}

/** Campo de búsqueda del sidebar; el foco se aplica al contenedor completo, no solo al input. */
export function SidebarSearch({ value, labels, onChange }: SidebarSearchProps) {
  return (
    <HStack
      borderWidth="1px"
      borderColor="border"
      rounded="md"
      px="3"
      mx="2"
      bg="bg"
      color="fg"
      _focusWithin={{ borderColor: "colorPalette.solid", boxShadow: "0 0 0 1px var(--chakra-colors-color-palette-solid)" }}
    >
      <Box color="fg.muted" display="inline-flex" flexShrink="0">
        <Search size={16} aria-hidden="true" />
      </Box>
      <Input
        aria-label={labels.searchAriaLabel}
        placeholder={labels.searchPlaceholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        border="0"
        color="fg"
        px="0"
        outline="none"
        _placeholder={{ color: "fg.muted" }}
        _focusVisible={{ boxShadow: "none", outline: "none" }}
      />
    </HStack>
  )
}
