import { Checkbox } from "@chakra-ui/react"

import { NTooltip } from "../../internal/NTooltip"

interface TableCheckboxProps {
  checked: boolean | "indeterminate"
  label: string
  onChange: (checked: boolean) => void
}

/** Checkbox accesible con tooltip, usado para seleccionar filas o "todas las filas visibles". */
export function TableCheckbox({ checked, label, onChange }: TableCheckboxProps) {
  return (
    <NTooltip content={label}>
      <Checkbox.Root
        checked={checked}
        aria-label={label}
        onCheckedChange={(details) => onChange(Boolean(details.checked))}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
      </Checkbox.Root>
    </NTooltip>
  )
}
