"use client"

import { Alert, Box, Button, Field, Flex, Heading, HStack, Image, Input, Progress, Stack, Text } from "@chakra-ui/react"
import { Check, Eye, EyeOff } from "lucide-react"
import { forwardRef, useMemo, useState } from "react"

import { resolveNauthLabels } from "./labels"
import type { NauthAlertProps, NauthDividerProps, NauthFooterProps, NauthHeaderProps, NauthLayoutProps, NauthPasswordFieldProps, NauthPasswordStrengthProps } from "./types"
import { getPasswordScore } from "./utils"

export function NauthLayout({ variant = "centered", logo, brandName, title, subtitle, illustration, illustrationAlt = "", backgroundImage, children, footer, maxWidth = "28rem", reverse = false, embedded = false, minHeight = "100dvh", containerProps, panelProps, unstyled = false, classNames, styles }: NauthLayoutProps) {
  const split = variant === "split" || variant === "branded"
  const visual = split && (logo || brandName || title || subtitle || illustration)
  const { direction: _containerDirection, ...safeContainerProps } = containerProps ?? {}
  const { direction: _panelDirection, ...safePanelProps } = panelProps ?? {}
  return (
    <Flex as={embedded ? "section" : "main"} className={classNames?.root} css={styles?.root} data-scope="n-auth-layout" data-part="root" minH={minHeight} width="full" direction={{ base: "column", md: reverse ? "row-reverse" : "row" }} bg={unstyled ? undefined : "bg.subtle"} backgroundImage={backgroundImage ? `linear-gradient(color-mix(in srgb, var(--chakra-colors-bg) 25%, transparent), color-mix(in srgb, var(--chakra-colors-bg) 25%, transparent)), url(${backgroundImage})` : undefined} backgroundSize="cover" {...safeContainerProps}>
      {visual ? <Flex className={classNames?.visual} css={styles?.visual} data-part="visual" flex="1" minH={{ base: "14rem", md: minHeight }} p={{ base: "8", lg: "16" }} position="relative" overflow="hidden" align="center" justify="center" bg={unstyled ? undefined : "colorPalette.subtle"} color={unstyled ? undefined : "colorPalette.fg"}>
        <Stack maxW="38rem" gap="5" position="relative" zIndex="1">
          {logo}<Text fontWeight="bold" letterSpacing="0.12em">{brandName}</Text>
          {title ? <Heading as="h1" size={{ base: "2xl", lg: "4xl" }}>{title}</Heading> : null}
          {subtitle ? <Text fontSize={{ base: "md", lg: "xl" }} color="fg.muted">{subtitle}</Text> : null}
          {typeof illustration === "string" ? <Image src={illustration} alt={illustrationAlt} maxH="20rem" objectFit="contain" /> : illustration}
        </Stack>
      </Flex> : null}
      <Flex className={classNames?.panel} css={styles?.panel} data-part="panel" flex={split ? "0 1 42rem" : "1"} align="center" justify="center" p={{ base: "5", sm: "8", lg: "12" }} {...safePanelProps}>
        <Stack className={classNames?.content} css={styles?.content} data-part="content" width="full" maxW={maxWidth} gap="6" p={unstyled || variant === "minimal" ? undefined : { base: "6", sm: "8" }} borderWidth={unstyled || variant === "minimal" ? undefined : "1px"} borderColor="border" borderRadius={unstyled || variant === "minimal" ? undefined : "2xl"} bg={unstyled ? undefined : variant === "glass" ? "color-mix(in srgb, var(--chakra-colors-bg-panel) 78%, transparent)" : "bg.panel"} backdropFilter={variant === "glass" ? "blur(18px)" : undefined} boxShadow={unstyled || variant === "minimal" ? undefined : "lg"}>
          {children}
          {footer ? <Box className={classNames?.footer} css={styles?.footer} data-part="footer">{footer}</Box> : null}
        </Stack>
      </Flex>
    </Flex>
  )
}

export function NauthHeader({ title, subtitle, unstyled = false, classNames, styles }: NauthHeaderProps) {
  return <Stack className={classNames?.root} css={styles?.root} data-scope="n-auth-header" data-part="root" gap="2">
    {title ? <Heading className={classNames?.title} css={styles?.title} data-part="title" as="h2" size={unstyled ? undefined : "2xl"}>{title}</Heading> : null}
    {subtitle ? <Text className={classNames?.subtitle} css={styles?.subtitle} data-part="subtitle" color={unstyled ? undefined : "fg.muted"}>{subtitle}</Text> : null}
  </Stack>
}

export function NauthFooter({ children, unstyled = false, classNames, styles }: NauthFooterProps) {
  return <Text className={classNames?.root} css={styles?.root} data-scope="n-auth-footer" data-part="root" textAlign={unstyled ? undefined : "center"} color={unstyled ? undefined : "fg.muted"} fontSize={unstyled ? undefined : "sm"}>{children}</Text>
}

export function NauthDivider({ children, unstyled = false, classNames, styles }: NauthDividerProps) {
  return <HStack className={classNames?.root} css={styles?.root} data-scope="n-auth-divider" data-part="root" gap="3">
    <Box className={classNames?.line} css={styles?.line} data-part="line" height={unstyled ? undefined : "1px"} flex="1" bg={unstyled ? undefined : "border"} />
    <Text className={classNames?.label} css={styles?.label} data-part="label" color={unstyled ? undefined : "fg.muted"} fontSize={unstyled ? undefined : "sm"}>{children}</Text>
    <Box className={classNames?.line} css={styles?.line} data-part="line" height={unstyled ? undefined : "1px"} flex="1" bg={unstyled ? undefined : "border"} />
  </HStack>
}

export function NauthAlert({ status = "info", title, children, unstyled = false, classNames, styles }: NauthAlertProps) {
  return <Alert.Root unstyled={unstyled} className={classNames?.root} css={styles?.root} data-scope="n-auth-alert" data-part="root" status={status} role={status === "error" ? "alert" : "status"}>
    <Alert.Indicator className={classNames?.indicator} css={styles?.indicator} data-part="indicator" />
    <Alert.Content className={classNames?.content} css={styles?.content} data-part="content">
      {title ? <Alert.Title className={classNames?.title} css={styles?.title} data-part="title">{title}</Alert.Title> : null}
      {children ? <Alert.Description className={classNames?.description} css={styles?.description} data-part="description">{children}</Alert.Description> : null}
    </Alert.Content>
  </Alert.Root>
}

export function NauthPasswordStrength({ value, minLength = 8, labels: labelsProp, disabled = false, showRequirements = true, unstyled = false, classNames, styles }: NauthPasswordStrengthProps) {
  const labels = useMemo(() => resolveNauthLabels(labelsProp), [labelsProp])
  const { score, checks } = getPasswordScore(value, minLength)
  const displayScore = value ? Math.max(1, score) : 0
  return <Stack className={classNames?.root} css={styles?.root} data-scope="n-password-strength" data-part="root" gap="2" opacity={disabled ? 0.5 : 1} aria-live="polite">
    <Progress.Root className={classNames?.meter} css={styles?.meter} data-part="meter" value={displayScore} max={5} size="xs" colorPalette={displayScore < 3 ? "red" : displayScore < 4 ? "yellow" : "green"}><Progress.Track><Progress.Range /></Progress.Track></Progress.Root>
    {value ? <Text className={classNames?.label} css={styles?.label} data-part="label" fontSize="xs" fontWeight="medium">{labels.passwordStrength[displayScore - 1]}</Text> : null}
    {showRequirements ? <Flex className={classNames?.requirements} css={styles?.requirements} data-part="requirements" gap="2" flexWrap="wrap">
      {Object.entries({ length: labels.passwordRequirements.length(minLength), uppercase: labels.passwordRequirements.uppercase, lowercase: labels.passwordRequirements.lowercase, number: labels.passwordRequirements.number, symbol: labels.passwordRequirements.symbol }).map(([key, label]) => <HStack key={key} gap="1" color={checks[key as keyof typeof checks] ? "green.fg" : "fg.muted"} fontSize="xs"><Check aria-hidden size={12} /><Text>{label}</Text></HStack>)}
    </Flex> : null}
  </Stack>
}

export const NauthPasswordField = forwardRef<HTMLInputElement, NauthPasswordFieldProps>(function NauthPasswordField({ label, helperText, errorText, showStrength = false, strengthLabels, strengthMinLength = 8, size = "md", required, disabled, value, defaultValue, onChange, autoComplete = "current-password", unstyled = false, classNames, styles, ...props }, ref) {
  const labels = useMemo(() => resolveNauthLabels(strengthLabels), [strengthLabels])
  const [visible, setVisible] = useState(false)
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? ""))
  const password = value === undefined ? internalValue : String(value)
  return <Field.Root unstyled={unstyled} className={classNames?.root} css={styles?.root} data-scope="n-password-field" data-part="root" invalid={Boolean(errorText)} required={required} disabled={disabled}>
    {label ? <Field.Label className={classNames?.label} css={styles?.label} data-part="label">{label}<Field.RequiredIndicator /></Field.Label> : null}
    <Box className={classNames?.control} css={styles?.control} data-part="control" position="relative" width="full">
      <Input ref={ref} unstyled={unstyled} className={classNames?.input} css={styles?.input} data-part="input" type={visible ? "text" : "password"} value={value} defaultValue={defaultValue} autoComplete={autoComplete} pe="12" size={size} required={required} disabled={disabled} aria-invalid={Boolean(errorText)} onChange={(event) => { setInternalValue(event.currentTarget.value); onChange?.(event) }} {...props} />
      <Button unstyled={unstyled} className={classNames?.toggle} css={styles?.toggle} data-part="toggle" type="button" variant="ghost" size="sm" position="absolute" insetInlineEnd="1" top="50%" transform="translateY(-50%)" minW="9" aria-label={visible ? labels.hidePassword : labels.showPassword} aria-pressed={visible} disabled={disabled} onClick={() => setVisible((current) => !current)}>{visible ? <EyeOff aria-hidden size={18} /> : <Eye aria-hidden size={18} />}</Button>
    </Box>
    {helperText ? <Field.HelperText className={classNames?.helper} css={styles?.helper} data-part="helper">{helperText}</Field.HelperText> : null}
    {errorText ? <Field.ErrorText className={classNames?.error} css={styles?.error} data-part="error">{errorText}</Field.ErrorText> : null}
    {showStrength ? <Box className={classNames?.strength} css={styles?.strength} data-part="strength" width="full"><NauthPasswordStrength value={password} minLength={strengthMinLength} labels={strengthLabels} disabled={disabled} /></Box> : null}
  </Field.Root>
})

/** @deprecated Usa `NauthLayout`. */
export const NAuthLayout = NauthLayout
/** @deprecated Usa `NauthHeader`. */
export const NAuthHeader = NauthHeader
/** @deprecated Usa `NauthFooter`. */
export const NAuthFooter = NauthFooter
/** @deprecated Usa `NauthDivider`. */
export const NAuthDivider = NauthDivider
/** @deprecated Usa `NauthAlert`. */
export const NAuthAlert = NauthAlert
/** @deprecated Usa `NauthPasswordStrength`. */
export const NPasswordStrength = NauthPasswordStrength
/** @deprecated Usa `NauthPasswordField`. */
export const NPasswordField = NauthPasswordField
