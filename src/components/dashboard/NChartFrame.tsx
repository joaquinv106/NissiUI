import { Box, Card, Flex, Stack, Table, Text } from "@chakra-ui/react"

import type { NChartFrameLabels, NChartFrameProps } from "./types"

export const defaultNChartFrameLabels: NChartFrameLabels = { empty: "No hay datos para mostrar.", dataTable: "Datos de la gráfica", category: "Categoría", value: "Valor" }

export function NChartFrame({ title, description, data, series = [{ key: "value", label: "Valor" }], renderer, actions, height = "18rem", colorPalette = "blue", labels: custom }: NChartFrameProps) {
  const labels = { ...defaultNChartFrameLabels, ...custom }
  const max = Math.max(1, ...data.map((item) => Math.abs(item.value)))
  return <Card.Root variant="outline" bg="bg.panel" height="full" colorPalette={colorPalette}><Card.Header><Flex justify="space-between" gap="4"><Stack gap="1"><Card.Title>{title}</Card.Title>{description ? <Text color="fg.muted" textStyle="sm">{description}</Text> : null}</Stack>{actions}</Flex></Card.Header><Card.Body pt="0">{data.length ? <Box height={height} minH="12rem" width="full">{renderer ? renderer({ data, series }) : <Flex height="full" align="end" gap="2" role="img" aria-label={String(title)}>{data.map((item) => <Stack key={item.label} flex="1" height="full" justify="end" align="stretch" gap="2"><Box title={`${item.label}: ${item.value}`} bg="colorPalette.solid" opacity="0.82" roundedTop="sm" minH="2px" height={`${Math.abs(item.value) / max * 82}%`} /><Text textStyle="xs" color="fg.muted" textAlign="center" truncate>{item.label}</Text></Stack>)}</Flex>}</Box> : <Flex height={height} align="center" justify="center"><Text color="fg.muted">{labels.empty}</Text></Flex>}<Box position="absolute" width="1px" height="1px" overflow="hidden" clip="rect(0 0 0 0)"><Table.Root aria-label={labels.dataTable}><Table.Header><Table.Row><Table.ColumnHeader>{labels.category}</Table.ColumnHeader><Table.ColumnHeader>{labels.value}</Table.ColumnHeader></Table.Row></Table.Header><Table.Body>{data.map((item) => <Table.Row key={item.label}><Table.Cell>{item.label}</Table.Cell><Table.Cell>{item.value}</Table.Cell></Table.Row>)}</Table.Body></Table.Root></Box></Card.Body></Card.Root>
}
