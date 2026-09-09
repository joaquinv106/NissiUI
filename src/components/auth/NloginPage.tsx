"use client"

import { Badge, Box, Flex, HStack, Image, Stack, Text } from "@chakra-ui/react"
import { MonitorSmartphone, Palette, ShieldCheck } from "lucide-react"
import { useMemo } from "react"

import nissiMarkUrl from "../../../docs/assets/nissi-mark.png"
import { NTheme, NThemeProvider } from "../theme"
import { NauthFooter, NauthLayout } from "./NAuthPrimitives"
import { NauthLogin } from "./NAuthForms"
import type { NloginPageLabels, NloginPageProps } from "./types"

export const defaultNloginPageLabels: NloginPageLabels = {
  brandName: "Nissi UI",
  logoAlt: "Isotipo de Nissi UI",
  eyebrow: "Acceso a tu espacio",
  heroTitle: "Construye productos modulares. Avanza más rápido.",
  heroDescription: "Una experiencia consistente para conectar tus herramientas y concentrarte en lo importante.",
  loginTitle: "Bienvenido de nuevo",
  loginSubtitle: "Ingresa tus credenciales para continuar.",
  responsiveFeature: "Una experiencia consistente en cualquier pantalla",
  accessibleFeature: "Interacciones claras y accesibles",
  themeFeature: "Tu tema, tu forma de trabajar",
  featuresLabel: "Características de la experiencia",
  footer: "Interfaz creada con Nissi UI",
}

export function resolveNloginPageLabels(labels?: Partial<NloginPageLabels>): NloginPageLabels {
  return { ...defaultNloginPageLabels, ...labels }
}

function DefaultBrandMark({ alt }: { alt: string }) {
  return (
    <Image
      src={nissiMarkUrl}
      alt={alt}
      width={{ base: "4.75rem", sm: "5.5rem", md: "9rem", xl: "11rem" }}
      maxH={{ base: "5.5rem", md: "12rem" }}
      objectFit="contain"
      objectPosition="center"
    />
  )
}

function NloginPageContent({
  logo,
  brandName,
  eyebrow,
  heroTitle,
  heroDescription,
  features,
  loginTitle,
  loginSubtitle,
  footer,
  labels: labelsProp,
  loginProps,
  themeProps,
  layoutProps,
  unstyled = false,
  classNames,
  styles,
}: Omit<NloginPageProps, "provideTheme" | "themeProviderProps">) {
  const labels = useMemo(() => resolveNloginPageLabels(labelsProp), [labelsProp])
  const featureItems = features === false ? [] : features ?? [
    labels.responsiveFeature,
    labels.accessibleFeature,
    labels.themeFeature,
  ]
  const featureIcons = [MonitorSmartphone, ShieldCheck, Palette]
  const {
    classNames: layoutClassNames,
    styles: layoutStyles,
    containerProps,
    panelProps,
    ...safeLayoutProps
  } = layoutProps ?? {}

  const visualDetails = featureItems.length > 0 ? (
    <Stack
      className={classNames?.featureList}
      css={styles?.featureList}
      data-part="feature-list"
      gap="3"
      role="list"
      aria-label={labels.featuresLabel}
      display={{ base: "none", md: "flex" }}
    >
      {featureItems.map((feature, index) => {
        const FeatureIcon = featureIcons[index % featureIcons.length]!
        return (
          <HStack
            key={index}
            className={classNames?.feature}
            css={styles?.feature}
            data-part="feature"
            gap="3"
            align="center"
            role="listitem"
          >
            <Flex
              aria-hidden
              flex="0 0 auto"
              align="center"
              justify="center"
              width="9"
              height="9"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="border"
              bg="bg.panel"
              color="colorPalette.fg"
            >
              <FeatureIcon size={17} />
            </Flex>
            <Text fontSize={{ base: "sm", lg: "md" }} fontWeight="medium">{feature}</Text>
          </HStack>
        )
      })}
    </Stack>
  ) : undefined

  return (
    <Box
      className={classNames?.root}
      css={styles?.root}
      data-scope="n-login-page"
      data-part="root"
      position="relative"
      minH={safeLayoutProps.minHeight ?? "100dvh"}
      colorPalette={loginProps?.colorPalette ?? "blue"}
      bg={unstyled ? undefined : "bg.subtle"}
    >
      <Box
        className={classNames?.themeControl}
        css={styles?.themeControl}
        data-part="theme-control"
        position="absolute"
        zIndex="docked"
        insetBlockStart={{ base: "3", sm: "5" }}
        insetInlineEnd={{ base: "3", sm: "5" }}
        borderWidth={unstyled ? undefined : "1px"}
        borderColor="border"
        borderRadius="xl"
        bg={unstyled ? undefined : "bg.panel"}
        boxShadow={unstyled ? undefined : "sm"}
        p={unstyled ? undefined : "1"}
      >
        <NTheme presentation="button" unstyled={themeProps?.unstyled ?? unstyled} {...themeProps} />
      </Box>

      <NauthLayout
        variant="branded"
        {...safeLayoutProps}
        logo={(
          <Box className={classNames?.brandMark} css={styles?.brandMark} data-part="brand-mark">
            {logo ?? <DefaultBrandMark alt={labels.logoAlt} />}
          </Box>
        )}
        brandName={brandName ?? labels.brandName}
        title={heroTitle ?? labels.heroTitle}
        subtitle={heroDescription ?? labels.heroDescription}
        illustration={visualDetails}
        footer={footer ?? <NauthFooter>{labels.footer}</NauthFooter>}
        unstyled={unstyled}
        containerProps={containerProps}
        panelProps={panelProps}
        classNames={{ ...layoutClassNames, content: classNames?.loginSurface ?? layoutClassNames?.content }}
        styles={{ ...layoutStyles, content: styles?.loginSurface ?? layoutStyles?.content }}
      >
        <Stack gap="5">
          {eyebrow === false ? null : (
            <Badge alignSelf="start" colorPalette={loginProps?.colorPalette ?? "blue"} variant="subtle">
              {eyebrow ?? labels.eyebrow}
            </Badge>
          )}
          <NauthLogin
            allowRememberMe
            {...loginProps}
            allowForgotPassword={loginProps?.allowForgotPassword ?? Boolean(loginProps?.onForgotPassword)}
            showRegisterLink={loginProps?.showRegisterLink ?? Boolean(loginProps?.onRegister)}
            title={loginProps?.title ?? loginTitle ?? labels.loginTitle}
            subtitle={loginProps?.subtitle ?? loginSubtitle ?? labels.loginSubtitle}
            unstyled={loginProps?.unstyled ?? unstyled}
          />
        </Stack>
      </NauthLayout>
    </Box>
  )
}

/** Página de acceso autónoma con tema oscuro inicial y selector de tema integrado. */
export function NloginPage({ provideTheme = true, themeProviderProps, ...props }: NloginPageProps) {
  const content = <NloginPageContent {...props} />
  if (!provideTheme) return content

  return (
    <NThemeProvider defaultTheme="dark" {...themeProviderProps}>
      {content}
    </NThemeProvider>
  )
}
