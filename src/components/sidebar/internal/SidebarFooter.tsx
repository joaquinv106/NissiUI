import { Box } from "@chakra-ui/react"
import type { ReactNode } from "react"

/** Slot de pie del sidebar; no se renderiza nada si no hay contenido. */
export function SidebarFooter({ children }: { children?: ReactNode }) {
  if (!children) return null
  return <Box as="footer" bg="bg.subtle" borderTopWidth="1px" borderColor="border" p="2">{children}</Box>
}
