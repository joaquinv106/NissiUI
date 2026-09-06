import { Box, HStack, Input } from "@chakra-ui/react"
import { Search } from "lucide-react"
import { type FormEvent, useState } from "react"

import type { NHeaderLabels, NHeaderSearchConfig } from "../types"

interface HeaderSearchProps {
  config: NHeaderSearchConfig
  labels: NHeaderLabels
}

/** Campo de búsqueda de NHeader, controlado o no controlado según `config.value`. */
export function HeaderSearch({ config, labels }: HeaderSearchProps) {
  const [internalValue, setInternalValue] = useState(config.defaultValue ?? "")
  const value = config.value ?? internalValue

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    config.onSubmit?.(value)
  }

  return (
    <Box width="full" maxW="28rem" minW="0">
      <form role="search" onSubmit={submit}>
        <HStack
          width="full"
          minW="0"
          px="3"
          bg="bg"
          borderWidth="1px"
          borderColor="border"
          rounded="md"
          _focusWithin={{ borderColor: "colorPalette.solid", boxShadow: "0 0 0 1px var(--chakra-colors-color-palette-solid)" }}
        >
          <Box color="fg.muted" display="inline-flex" flexShrink="0"><Search size={16} aria-hidden="true" /></Box>
          <Input
          aria-label={labels.searchAriaLabel}
          type="search"
          placeholder={labels.searchPlaceholder}
            value={value}
            minW="0"
            border="0"
            px="0"
            outline="none"
            _placeholder={{ color: "fg.muted" }}
            _focusVisible={{ boxShadow: "none", outline: "none" }}
            onChange={(event) => {
              if (config.value === undefined) setInternalValue(event.target.value)
              config.onChange?.(event.target.value)
            }}
          />
        </HStack>
      </form>
    </Box>
  )
}
