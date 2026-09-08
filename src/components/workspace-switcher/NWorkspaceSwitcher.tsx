"use client"

import { Avatar, Badge, Box, Button, Menu, Portal, Stack, Text } from "@chakra-ui/react"
import { Building2, Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"

import type { NWorkspace, NWorkspaceSwitcherProps } from "./types"
import { defaultNWorkspaceSwitcherLabels } from "./labels"

/** Selector accesible de organización, tenant, sucursal o proyecto actual. */
export function NWorkspaceSwitcher<TData = unknown>({
  workspaces,
  value,
  defaultValue,
  onValueChange,
  compact = false,
  colorPalette = "blue",
  labels: labelsProp,
  unstyled = false,
  classNames,
  styles,
}: NWorkspaceSwitcherProps<TData>) {
  const labels = { ...defaultNWorkspaceSwitcherLabels, ...labelsProp }
  const firstAvailable = workspaces.find((workspace) => !workspace.disabled)
  const [internalValue, setInternalValue] = useState(defaultValue ?? firstAvailable?.id)
  const selectedId = value ?? internalValue
  const selected = workspaces.find((workspace) => workspace.id === selectedId) ?? firstAvailable

  const selectWorkspace = (workspace: NWorkspace<TData>) => {
    if (workspace.disabled) return
    if (value === undefined) setInternalValue(workspace.id)
    onValueChange?.(workspace)
  }

  if (!selected) return <Text role="status" color="fg.muted" fontSize="sm" className={classNames?.empty} css={styles?.empty ?? styles?.root} data-scope="n-workspace-switcher" data-part="empty">{labels.noWorkspaces}</Text>

  return (
    <Menu.Root positioning={{ placement: "bottom-start" }}>
      <Menu.Trigger asChild>
        <Button
          unstyled={unstyled}
          variant={unstyled ? undefined : "outline"}
          colorPalette={colorPalette}
          aria-label={`${labels.selectorLabel}: ${selected.name}`}
          minW="0"
          width={compact ? "11" : "full"}
          height="11"
          px={compact ? "2" : "3"}
          justifyContent={compact ? "center" : "flex-start"}
          className={classNames?.trigger}
          css={styles?.trigger ?? styles?.root}
          data-scope="n-workspace-switcher"
          data-part="trigger"
        >
          <Avatar.Root size="sm" flexShrink="0" bg="colorPalette.subtle" color="colorPalette.fg">
            <Avatar.Fallback>{selected.name.slice(0, 2).toLocaleUpperCase()}</Avatar.Fallback>
            {selected.avatarSrc ? <Avatar.Image src={selected.avatarSrc} alt="" /> : null}
          </Avatar.Root>
          {!compact ? (
            <Stack gap="0" minW="0" flex="1" align="start" textAlign="start">
              <Text truncate width="full" fontSize="sm" fontWeight="semibold">{selected.name}</Text>
              {selected.description ? <Text truncate width="full" color="fg.muted" fontSize="xs">{selected.description}</Text> : null}
            </Stack>
          ) : null}
          {!compact ? <ChevronsUpDown aria-hidden="true" size={15} /> : null}
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content unstyled={unstyled} width="min(20rem, calc(100vw - 2rem))" maxH="min(28rem, calc(100dvh - 6rem))" overflowY="auto" className={classNames?.content} css={styles?.content} data-scope="n-workspace-switcher" data-part="content">
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel>{labels.menuLabel}</Menu.ItemGroupLabel>
              {workspaces.map((workspace) => (
                <Menu.Item
                  key={workspace.id}
                  value={workspace.id}
                  disabled={workspace.disabled}
                  onClick={() => selectWorkspace(workspace)}
                  className={classNames?.workspace}
                  css={styles?.workspace}
                  data-part="workspace"
                >
                  <Box aria-hidden="true" color="fg.muted">{workspace.icon ?? <Building2 size={17} />}</Box>
                  <Stack gap="0" minW="0" flex="1">
                    <Text truncate fontWeight="medium">{workspace.name}</Text>
                    {workspace.description ? <Text truncate color="fg.muted" fontSize="xs">{workspace.description}</Text> : null}
                  </Stack>
                  {workspace.badge ? <Badge variant="subtle">{workspace.badge}</Badge> : null}
                  {workspace.id === selected.id ? <Check aria-label={labels.selected} size={16} /> : null}
                </Menu.Item>
              ))}
            </Menu.ItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
