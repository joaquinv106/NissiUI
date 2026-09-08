"use client"

import { Badge, Box, Button, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import { useState } from "react"

import { NTooltip } from "../internal/NTooltip"
import { usePermissions } from "../permissions"
import { defaultNModuleRegistryLabels } from "./labels"
import type { NModuleDefinition, NModuleRegistryProps } from "./types"

/** Selector central de módulos contratados, con capacidades, estado activo y layouts responsive. */
export function NModuleRegistry<TData = unknown>({
  modules,
  activeModuleId,
  defaultActiveModuleId,
  onModuleSelect,
  layout = "grid",
  showUnavailable = false,
  colorPalette = "blue",
  labels: labelsProp,
  unstyled = false,
  classNames,
  styles,
}: NModuleRegistryProps<TData>) {
  const { can } = usePermissions()
  const labels = { ...defaultNModuleRegistryLabels, ...labelsProp }
  const [internalActiveId, setInternalActiveId] = useState(defaultActiveModuleId)
  const selectedId = activeModuleId ?? internalActiveId
  const visibleModules = modules.filter((module) => {
    if (module.requiredPermission && !can(module.requiredPermission, module.permissionMode)) return false
    return showUnavailable || module.purchased !== false
  })

  const selectModule = (module: NModuleDefinition<TData>) => {
    if (module.disabled || module.purchased === false) return
    if (activeModuleId === undefined) setInternalActiveId(module.id)
    onModuleSelect?.(module)
  }

  if (visibleModules.length === 0) {
    return <Text role="status" color="fg.muted" fontSize="sm" className={classNames?.empty} css={styles?.empty ?? styles?.root} data-scope="n-module-registry" data-part="empty">{labels.empty}</Text>
  }

  const renderModule = (module: NModuleDefinition<TData>) => {
    const unavailable = module.purchased === false
    const active = selectedId === module.id
    const compact = layout === "compact"
    const content = (
      <Button
        key={module.id}
        unstyled={unstyled}
        variant={unstyled ? undefined : active ? "subtle" : "ghost"}
        colorPalette={colorPalette}
        aria-current={active ? "page" : undefined}
        aria-label={compact ? `${module.label}${unavailable ? `: ${labels.unavailable}` : ""}` : undefined}
        disabled={module.disabled || unavailable}
        onClick={() => selectModule(module)}
        width="full"
        height={compact ? "11" : "auto"}
        minW="0"
        p={unstyled ? undefined : compact ? "2" : "4"}
        justifyContent={compact ? "center" : "flex-start"}
        whiteSpace="normal"
        borderWidth={unstyled ? undefined : "1px"}
        borderColor={active ? "colorPalette.muted" : "border"}
        bg={unstyled ? undefined : active ? "colorPalette.subtle" : "bg.panel"}
        className={classNames?.module}
        css={styles?.module}
        data-part="module"
      >
        {module.icon ? <Box aria-hidden="true" flexShrink="0">{module.icon}</Box> : null}
        {!compact ? (
          <Stack gap="0.5" minW="0" flex="1" align="start" textAlign="start">
            <Text fontWeight="semibold" lineClamp="1">{module.label}</Text>
            {module.description ? <Text color="fg.muted" fontSize="xs" lineClamp="2">{module.description}</Text> : null}
          </Stack>
        ) : null}
        {!compact && unavailable ? <Badge flexShrink="0" variant="subtle">{labels.unavailable}</Badge> : module.badge ? <Box flexShrink="0">{module.badge}</Box> : null}
      </Button>
    )

    return compact ? <NTooltip key={module.id} content={`${module.label}${unavailable ? `: ${labels.unavailable}` : ""}`}><Box>{content}</Box></NTooltip> : content
  }

  return (
    <Box as="nav" aria-label={labels.navigationLabel} className={classNames?.root} css={styles?.root} data-scope="n-module-registry" data-part="root">
      {layout === "grid" ? (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="3">{visibleModules.map(renderModule)}</SimpleGrid>
      ) : (
        <Stack direction={layout === "compact" ? "row" : "column"} gap="2" flexWrap="wrap">
          {visibleModules.map(renderModule)}
        </Stack>
      )}
    </Box>
  )
}
