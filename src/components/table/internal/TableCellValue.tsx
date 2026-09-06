import { Avatar, Badge, HStack, Link, Text } from "@chakra-ui/react"
import type { ReactNode } from "react"

import type { NTableColumn, NTableRow } from "../types"
import { formatTableValue, valueToText } from "../utils"

interface TableCellValueProps<T extends NTableRow> {
  column: NTableColumn<T>
  row: T
  iconMap?: Record<string, ReactNode>
}

/** Renderiza el valor de una celda según `presentation`/`type`: avatar, badge, icono, enlace o texto. */
export function TableCellValue<T extends NTableRow>({ column, row, iconMap }: TableCellValueProps<T>) {
  const value = row[column.key]
  if (column.format) return column.format(value, row)

  if (column.presentation === "avatar") {
    const name = valueToText(row[column.avatarNameKey ?? column.key])
    return (
      <HStack gap="2">
        <Avatar.Root size="sm">
          <Avatar.Fallback name={name} />
          <Avatar.Image src={valueToText(value)} alt={name} />
        </Avatar.Root>
        {column.avatarNameKey ? <Text>{name}</Text> : null}
      </HStack>
    )
  }

  if (column.presentation === "badge") {
    return <Badge colorPalette={column.badgeColorPalette ?? "blue"}>{formatTableValue(value, column)}</Badge>
  }

  if (column.presentation === "icon") {
    return (
      <HStack gap="2">
        {iconMap?.[valueToText(value)] ?? null}
        <Text>{formatTableValue(value, column)}</Text>
      </HStack>
    )
  }

  if (column.type === "url") {
    return (
      <Link color="colorPalette.fg" href={valueToText(value)} target="_blank" rel="noreferrer">
        {formatTableValue(value, column)}
      </Link>
    )
  }

  if (column.type === "email") {
    return <Link color="colorPalette.fg" href={`mailto:${valueToText(value)}`}>{formatTableValue(value, column)}</Link>
  }

  return <>{formatTableValue(value, column)}</>
}
