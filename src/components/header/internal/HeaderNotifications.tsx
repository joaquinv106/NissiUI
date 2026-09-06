import { Badge, Box, IconButton, Menu, Portal, Text } from "@chakra-ui/react"
import { Bell } from "lucide-react"

import { NTooltip } from "../../internal/NTooltip"
import { countUnreadNotifications } from "../utils"
import type { NHeaderLabels, NHeaderNotification } from "../types"

/** Menú de notificaciones con contador de no leídas sobre el icono de campana. */
export function HeaderNotifications({ notifications, labels }: { notifications: NHeaderNotification[]; labels: NHeaderLabels }) {
  const unread = countUnreadNotifications(notifications)
  return (
    <Menu.Root positioning={{ placement: "bottom-end" }}>
      <NTooltip content={labels.notifications}>
        <Box display="inline-flex">
          <Menu.Trigger asChild>
            <IconButton aria-label={unread ? labels.unreadNotifications(unread) : labels.notifications} variant="ghost" position="relative">
              <Bell size={18} />
              {unread > 0 ? (
                <Badge position="absolute" top="0" insetInlineEnd="0" minW="4" height="4" px="1" justifyContent="center" colorPalette="red" rounded="full" fontSize="2xs">
                  {unread}
                </Badge>
              ) : null}
            </IconButton>
          </Menu.Trigger>
        </Box>
      </NTooltip>
      <Portal>
        <Menu.Positioner>
          <Menu.Content width="min(22rem, calc(100vw - 2rem))" maxH="min(28rem, calc(100dvh - 6rem))" overflowY="auto">
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel>{labels.notifications}</Menu.ItemGroupLabel>
              {notifications.length === 0 ? <Text color="fg.muted" px="2" py="3" fontSize="sm">{labels.noNotifications}</Text> : null}
              {notifications.map((notification) => (
                <Menu.Item
                  key={notification.id}
                  value={notification.id}
                  alignItems="start"
                  bg={notification.unread ? "colorPalette.subtle" : undefined}
                  onClick={() => notification.onClick?.(notification)}
                  asChild={Boolean(notification.href)}
                >
                  {notification.href ? (
                    <a href={notification.href}>
                      <Box><Text fontWeight="medium">{notification.title}</Text>{notification.description ? <Text color="fg.muted" fontSize="sm">{notification.description}</Text> : null}</Box>
                    </a>
                  ) : (
                    <Box><Text fontWeight="medium">{notification.title}</Text>{notification.description ? <Text color="fg.muted" fontSize="sm">{notification.description}</Text> : null}</Box>
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
