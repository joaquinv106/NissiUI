"use client"

import { Button, Stack, Text } from "@chakra-ui/react"
import { Apple } from "lucide-react"

import type { NAuthSocialButtonsProps } from "./types"

const providerNames: Record<string, string> = { google: "Google", github: "GitHub", apple: "Apple", microsoft: "Microsoft" }

function ProviderIcon({ provider }: { provider: string }) {
  if (provider === "apple") return <Apple aria-hidden size={18} />
  return <Text aria-hidden fontWeight="bold" fontSize="sm">{provider === "microsoft" ? "⊞" : provider === "google" ? "G" : provider.slice(0, 1).toUpperCase()}</Text>
}

/** UI de acceso social desacoplada de cualquier implementación OAuth. */
export function NAuthSocialButtons({ providers, orientation = "horizontal", loadingProvider, disabled = false, labels, onProviderClick, unstyled = false, classNames, styles }: NAuthSocialButtonsProps) {
  return <Stack className={classNames?.root} css={styles?.root} data-scope="n-auth-social-buttons" data-part="root" direction={orientation === "vertical" ? "column" : { base: "column", sm: "row" }} width="full" minW="0" gap="3">
    {providers.map((provider) => {
      const name = labels?.[provider] ?? providerNames[provider] ?? provider
      return <Button key={provider} unstyled={unstyled} className={classNames?.button} css={styles?.button} data-part="button" type="button" variant="outline" width={orientation === "vertical" ? "full" : { base: "full", sm: "auto" }} flex={orientation === "horizontal" ? "1 1 0" : undefined} minW="0" loading={loadingProvider === provider} disabled={disabled || Boolean(loadingProvider)} aria-label={`Continuar con ${name}`} onClick={() => onProviderClick?.(provider)}>
        <span className={classNames?.icon} data-part="icon"><ProviderIcon provider={provider} /></span><span className={classNames?.label} data-part="label">{name}</span>
      </Button>
    })}
  </Stack>
}
