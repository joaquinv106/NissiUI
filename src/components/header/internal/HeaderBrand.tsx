import { Box } from "@chakra-ui/react"
import type { ReactNode } from "react"

export function HeaderBrand({ children }: { children?: ReactNode }) {
  if (!children) return null
  return <Box flexShrink="0" minW="0" display="flex" alignItems="center">{children}</Box>
}
