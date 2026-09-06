import { Avatar, Box, Button, Menu, Portal, Text } from "@chakra-ui/react"
import { ChevronDown } from "lucide-react"

import type { NHeaderLabels, NHeaderUser } from "../types"

/** Menú del usuario actual: avatar, nombre/rol y acciones de cuenta (perfil, cerrar sesión, etc.). */
export function HeaderUserMenu({ user, labels }: { user: NHeaderUser; labels: NHeaderLabels }) {
  const fallback = user.avatarFallback ?? user.name.slice(0, 2).toLocaleUpperCase()
  return (
    <Menu.Root positioning={{ placement: "bottom-end" }}>
      <Menu.Trigger asChild>
        <Button aria-label={labels.userMenu(user.name)} variant="ghost" px="2" minW="0">
          <Avatar.Root size="sm" flexShrink="0">
            <Avatar.Fallback>{fallback}</Avatar.Fallback>
            {user.avatarSrc ? <Avatar.Image src={user.avatarSrc} alt="" /> : null}
          </Avatar.Root>
          <Box display={{ base: "none", md: "block" }} minW="0" textAlign="start">
            <Text truncate fontSize="sm" fontWeight="medium">{user.name}</Text>
            {user.role ? <Text truncate color="fg.muted" fontSize="xs">{user.role}</Text> : null}
          </Box>
          <ChevronDown aria-hidden="true" size={14} />
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content width="min(16rem, calc(100vw - 2rem))">
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel>
                <Text color="fg" fontWeight="medium">{user.name}</Text>
                {user.role ? <Text color="fg.muted" fontWeight="normal" fontSize="xs">{user.role}</Text> : null}
              </Menu.ItemGroupLabel>
              {(user.actions ?? []).map((action) => (
                <Menu.Item
                  key={action.id}
                  value={action.id}
                  disabled={action.disabled}
                  colorPalette={action.colorPalette}
                  onClick={() => action.onClick?.(action)}
                  asChild={Boolean(action.href)}
                >
                  {action.href ? (
                    <a href={action.href}>{action.icon ? <Box aria-hidden="true">{action.icon}</Box> : null}{action.label}</a>
                  ) : (
                    <>{action.icon ? <Box aria-hidden="true">{action.icon}</Box> : null}{action.label}</>
                  )}
                </Menu.Item>
              ))}
            </Menu.ItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
