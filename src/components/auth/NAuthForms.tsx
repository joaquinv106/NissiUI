"use client"

import { Button, Checkbox, Field, HStack, Input, Link, Stack, Text } from "@chakra-ui/react"
import { type FormEvent, useMemo, useRef, useState } from "react"

import { resolveNauthLabels } from "./labels"
import { NauthAlert, NauthDivider, NauthFooter, NauthHeader, NauthPasswordField } from "./NAuthPrimitives"
import { NauthSocialButtons } from "./NAuthSocialButtons"
import type { NauthForgotPasswordProps, NauthLoginProps, NauthRegisterData, NauthRegisterFieldName, NauthRegisterProps, NauthResetPasswordProps, NauthVerifyEmailProps } from "./types"
import { createLoginData, loginField } from "./utils"

function AuthState({ error, success }: { error?: React.ReactNode; success?: React.ReactNode }) {
  if (error) return <NauthAlert status="error">{error}</NauthAlert>
  if (success) return <NauthAlert status="success">{success}</NauthAlert>
  return null
}

function fieldNameLabel(name: NauthRegisterFieldName, labels: ReturnType<typeof resolveNauthLabels>) {
  return name === "confirmPassword" ? labels.confirmPassword : labels[name as keyof typeof labels] as string
}

export function NauthLogin({ title = "Bienvenido nuevamente", subtitle = "Ingresa tus credenciales", loginWith = "email", allowRememberMe = false, allowForgotPassword = false, showRegisterLink = false, socialProviders = [], validation, defaultValues, onSubmit, onForgotPassword, onRegister, onSocialProviderClick, labels: labelsProp, loading = false, disabled = false, error, success, size = "md", colorPalette = "blue", unstyled = false, classNames, styles }: NauthLoginProps) {
  const labels = useMemo(() => resolveNauthLabels(labelsProp), [labelsProp])
  const descriptor = loginField(loginWith, labels)
  const [errors, setErrors] = useState<Partial<Record<"identifier" | "password", string>>>({})
  const [pending, setPending] = useState(false)
  const submitting = useRef(false)
  const busy = loading || pending
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (busy || disabled || submitting.current) return
    submitting.current = true
    const form = new FormData(event.currentTarget)
    const data = createLoginData(String(form.get("identifier") ?? ""), String(form.get("password") ?? ""), form.get("rememberMe") === "on", loginWith)
    const nextErrors: typeof errors = {}
    if (!data.identifier) nextErrors.identifier = validation?.identifier?.required ?? labels.required
    else if (loginWith === "email" && !/^\S+@\S+\.\S+$/.test(data.identifier)) nextErrors.identifier = validation?.identifier?.invalid ?? labels.invalidEmail
    const minimum = typeof validation?.password?.minLength === "object" ? validation.password.minLength.value : validation?.password?.minLength
    if (!data.password) nextErrors.password = validation?.password?.required ?? labels.required
    else if (minimum && data.password.length < minimum) nextErrors.password = typeof validation?.password?.minLength === "object" ? validation.password.minLength.message : labels.passwordMinLength(minimum)
    Object.assign(nextErrors, await validation?.validate?.(data))
    setErrors(nextErrors); if (Object.keys(nextErrors).length) { submitting.current = false; return }
    setPending(true); try { await onSubmit?.(data, event) } finally { submitting.current = false; setPending(false) }
  }
  return <Stack className={classNames?.root} css={styles?.root} data-scope="n-login" data-part="root" gap="5">
    <NauthHeader title={title} subtitle={subtitle} /><AuthState error={error} success={success} />
    <Stack as="form" className={classNames?.form} css={styles?.form} data-part="form" gap="4" onSubmit={submit as never}>
      <Field.Root className={classNames?.field} css={styles?.field} data-part="field" invalid={Boolean(errors.identifier)} required disabled={disabled || busy}><Field.Label>{descriptor.label}</Field.Label><Input className={classNames?.input} css={styles?.input} data-part="input" name="identifier" type={descriptor.type} inputMode={descriptor.inputMode} autoComplete={descriptor.autoComplete} defaultValue={defaultValues?.identifier} size={size} /><Field.ErrorText>{errors.identifier}</Field.ErrorText></Field.Root>
      <NauthPasswordField name="password" label={labels.password} autoComplete="current-password" defaultValue={defaultValues?.password} size={size} required disabled={disabled || busy} errorText={errors.password} />
      {(allowRememberMe || allowForgotPassword) ? <HStack justify="space-between" align="center" gap="3" flexWrap="wrap">
        {allowRememberMe ? <Checkbox.Root name="rememberMe" defaultChecked={defaultValues?.rememberMe} disabled={disabled || busy}><Checkbox.HiddenInput /><Checkbox.Control /><Checkbox.Label>{labels.rememberMe}</Checkbox.Label></Checkbox.Root> : <span />}
        {allowForgotPassword ? <Link as="button" type="button" colorPalette={colorPalette} onClick={onForgotPassword}>{labels.forgotPassword}</Link> : null}
      </HStack> : null}
      <Button className={classNames?.submit} css={styles?.submit} data-part="submit" type="submit" formNoValidate colorPalette={colorPalette} size={size} loading={busy} disabled={disabled}>{labels.login}</Button>
    </Stack>
    {socialProviders.length ? <><NauthDivider>{labels.continueWith}</NauthDivider><NauthSocialButtons providers={socialProviders} disabled={disabled || busy} onProviderClick={onSocialProviderClick} /></> : null}
    {showRegisterLink ? <NauthFooter><Button type="button" variant="plain" colorPalette={colorPalette} onClick={onRegister}>{labels.register}</Button></NauthFooter> : null}
  </Stack>
}

const defaultRegisterFields: readonly NauthRegisterFieldName[] = ["name", "email", "password", "confirmPassword"]
export function NauthRegister({ title = "Crea tu cuenta", subtitle = "Comienza en unos minutos", fields = defaultRegisterFields, customFields = [], socialProviders = [], showLoginLink = false, passwordMinLength = 8, onSubmit, onLogin, onSocialProviderClick, labels: labelsProp, loading = false, disabled = false, error, success, size = "md", colorPalette = "blue", classNames, styles }: NauthRegisterProps) {
  const labels = useMemo(() => resolveNauthLabels(labelsProp), [labelsProp]); const [errors, setErrors] = useState<Record<string, string>>({}); const [pending, setPending] = useState(false); const busy = loading || pending
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (busy || disabled) return; const form = new FormData(event.currentTarget); const data: NauthRegisterData = {}; [...fields, ...customFields.map((field) => field.name)].forEach((name) => { data[name] = form.get(name) === "on" ? true : String(form.get(name) ?? "") }); const next: Record<string, string> = {}; fields.forEach((name) => { if (name !== "terms" && !data[name]) next[name] = labels.required }); if (fields.includes("terms") && data.terms !== true) next.terms = labels.required; if (String(data.password ?? "").length < passwordMinLength) next.password = labels.passwordMinLength(passwordMinLength); if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) next.confirmPassword = labels.passwordsDoNotMatch; setErrors(next); if (Object.keys(next).length) return; setPending(true); try { await onSubmit?.(data, event) } finally { setPending(false) } }
  return <Stack className={classNames?.root} css={styles?.root} data-scope="n-register" data-part="root" gap="5"><NauthHeader title={title} subtitle={subtitle} /><AuthState error={error} success={success} /><Stack as="form" className={classNames?.form} css={styles?.form} data-part="form" gap="4" onSubmit={submit as never}>
    {fields.map((name) => name === "terms" ? <Field.Root key={name} invalid={Boolean(errors[name])}><Checkbox.Root name={name} disabled={disabled || busy}><Checkbox.HiddenInput /><Checkbox.Control /><Checkbox.Label>{labels.acceptTerms}</Checkbox.Label></Checkbox.Root><Field.ErrorText>{errors[name]}</Field.ErrorText></Field.Root> : name === "password" || name === "confirmPassword" ? <NauthPasswordField key={name} name={name} label={fieldNameLabel(name, labels)} autoComplete="new-password" required size={size} disabled={disabled || busy} showStrength={name === "password"} strengthMinLength={passwordMinLength} errorText={errors[name]} /> : <Field.Root key={name} invalid={Boolean(errors[name])} required disabled={disabled || busy}><Field.Label>{fieldNameLabel(name, labels)}</Field.Label><Input name={name} type={name === "email" ? "email" : name === "phone" ? "tel" : "text"} autoComplete={name === "email" ? "email" : name === "phone" ? "tel" : name} size={size} /><Field.ErrorText>{errors[name]}</Field.ErrorText></Field.Root>)}
    {customFields.map((field) => <Field.Root key={field.name} invalid={Boolean(errors[field.name])} required={field.required} disabled={disabled || busy}><Field.Label>{field.label}</Field.Label><Input name={field.name} type={field.type ?? "text"} placeholder={field.placeholder} autoComplete={field.autoComplete} size={size} /><Field.ErrorText>{errors[field.name]}</Field.ErrorText></Field.Root>)}
    <Button type="submit" colorPalette={colorPalette} size={size} loading={busy} disabled={disabled}>{labels.createAccount}</Button></Stack>{socialProviders.length ? <><NauthDivider>{labels.continueWith}</NauthDivider><NauthSocialButtons providers={socialProviders} disabled={disabled || busy} onProviderClick={onSocialProviderClick} /></> : null}{showLoginLink ? <NauthFooter><Button type="button" variant="plain" colorPalette={colorPalette} onClick={onLogin}>{labels.login}</Button></NauthFooter> : null}</Stack>
}

export function NauthForgotPassword({ title = "Recupera tu contraseña", subtitle = "Te enviaremos instrucciones para volver a entrar", loginWith = "email", onSubmit, onBackToLogin, labels: labelsProp, loading = false, disabled = false, error, success, colorPalette = "blue" }: NauthForgotPasswordProps) {
  const labels = useMemo(() => resolveNauthLabels(labelsProp), [labelsProp]); const [sentTo, setSentTo] = useState(""); const descriptor = loginField(loginWith, labels)
  const submit = async (event: FormEvent<HTMLDivElement>) => { event.preventDefault(); const identifier = String(new FormData(event.currentTarget as unknown as HTMLFormElement).get("identifier") ?? ""); if (!identifier) return; await onSubmit?.({ identifier }, event as unknown as FormEvent<HTMLFormElement>); setSentTo(identifier) }
  if (sentTo && !error) return <Stack data-scope="n-forgot-password" gap="5"><NauthAlert status="success" title={labels.recoverySentTitle}>{success ?? labels.recoverySentDescription(sentTo)}</NauthAlert>{onBackToLogin ? <Button type="button" variant="outline" onClick={onBackToLogin}>{labels.login}</Button> : null}</Stack>
  return <Stack data-scope="n-forgot-password" gap="5"><NauthHeader title={title} subtitle={subtitle} /><AuthState error={error} success={success} /><Stack as="form" gap="4" onSubmit={submit}><Field.Root required disabled={disabled || loading}><Field.Label>{descriptor.label}</Field.Label><Input name="identifier" type={descriptor.type} inputMode={descriptor.inputMode} autoComplete={descriptor.autoComplete} required /></Field.Root><Button type="submit" colorPalette={colorPalette} loading={loading} disabled={disabled}>{labels.sendRecovery}</Button></Stack></Stack>
}

export function NauthResetPassword({ token, title = "Crea una nueva contraseña", subtitle, passwordMinLength = 8, showStrength = true, onSubmit, labels: labelsProp, loading = false, disabled = false, error, success, colorPalette = "blue" }: NauthResetPasswordProps) {
  const labels = useMemo(() => resolveNauthLabels(labelsProp), [labelsProp]); const [fieldError, setFieldError] = useState("")
  const submit = async (event: FormEvent<HTMLDivElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget as unknown as HTMLFormElement); const password = String(form.get("password") ?? ""); const confirmPassword = String(form.get("confirmPassword") ?? ""); const next = password.length < passwordMinLength ? labels.passwordMinLength(passwordMinLength) : password !== confirmPassword ? labels.passwordsDoNotMatch : ""; setFieldError(next); if (!next) await onSubmit?.({ password, confirmPassword, token }, event as unknown as FormEvent<HTMLFormElement>) }
  return <Stack data-scope="n-reset-password" gap="5"><NauthHeader title={title} subtitle={subtitle} /><AuthState error={error} success={success} /><Stack as="form" gap="4" onSubmit={submit}><NauthPasswordField name="password" label={labels.newPassword} autoComplete="new-password" required disabled={disabled || loading} showStrength={showStrength} strengthMinLength={passwordMinLength} errorText={fieldError} /><NauthPasswordField name="confirmPassword" label={labels.confirmPassword} autoComplete="new-password" required disabled={disabled || loading} errorText={fieldError === labels.passwordsDoNotMatch ? fieldError : undefined} /><Button type="submit" colorPalette={colorPalette} loading={loading} disabled={disabled}>{labels.resetPassword}</Button></Stack></Stack>
}

export function NauthVerifyEmail({ email, title, subtitle, actionLabel, onVerify, onResend, labels: labelsProp, loading = false, disabled = false, error, success, colorPalette = "blue" }: NauthVerifyEmailProps) {
  const labels = useMemo(() => resolveNauthLabels(labelsProp), [labelsProp])
  return <Stack data-scope="n-verify-email" gap="5"><NauthHeader title={title ?? labels.verifyEmailTitle} subtitle={subtitle ?? (email ? `${labels.verifyEmailDescription} ${email}` : labels.verifyEmailDescription)} /><AuthState error={error} success={success} /><Button type="button" colorPalette={colorPalette} loading={loading} disabled={disabled} onClick={onVerify}>{actionLabel ?? labels.verifyEmailAction}</Button>{onResend ? <Button type="button" variant="outline" disabled={disabled || loading} onClick={onResend}>{labels.resendCode}</Button> : null}</Stack>
}

/** @deprecated Usa `NauthLogin`. */
export const NLogin = NauthLogin
/** @deprecated Usa `NauthRegister`. */
export const NRegister = NauthRegister
/** @deprecated Usa `NauthForgotPassword`. */
export const NForgotPassword = NauthForgotPassword
/** @deprecated Usa `NauthResetPassword`. */
export const NResetPassword = NauthResetPassword
/** @deprecated Usa `NauthVerifyEmail`. */
export const NVerifyEmail = NauthVerifyEmail
