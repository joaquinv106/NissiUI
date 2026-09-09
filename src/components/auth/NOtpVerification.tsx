"use client"

import { Button, HStack, Input, Stack, Text } from "@chakra-ui/react"
import { type ClipboardEvent, type FormEvent, type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react"

import { resolveNAuthLabels } from "./labels"
import { NAuthAlert, NAuthHeader } from "./NAuthPrimitives"
import type { NOtpVerificationProps } from "./types"
import { formatCountdown } from "./utils"

function cleanCode(value: string, length: number) { return value.replace(/\D/g, "").slice(0, length) }

/** Captura OTP accesible con pegado completo, teclado y reenvío temporizado. */
export function NOtpVerification({ length = 6, value, defaultValue = "", maskedDestination, resendSeconds = 0, autoFocus = true, onValueChange, onComplete, onSubmit, onResend, title, subtitle, labels: labelsProp, loading = false, disabled = false, error, success, colorPalette = "blue", classNames, styles }: NOtpVerificationProps) {
  const labels = useMemo(() => resolveNAuthLabels(labelsProp), [labelsProp])
  const [internal, setInternal] = useState(() => cleanCode(defaultValue, length)); const code = cleanCode(value ?? internal, length)
  const [remaining, setRemaining] = useState(resendSeconds); const refs = useRef<Array<HTMLInputElement | null>>([])
  useEffect(() => { if (remaining <= 0) return; const timer = window.setInterval(() => setRemaining((current) => Math.max(0, current - 1)), 1000); return () => window.clearInterval(timer) }, [remaining > 0])
  const publish = (next: string) => { const clean = cleanCode(next, length); if (value === undefined) setInternal(clean); onValueChange?.(clean); if (clean.length === length && code.length !== length) onComplete?.(clean) }
  const setDigit = (index: number, digit: string) => { const parts = code.padEnd(length, " ").split(""); parts[index] = digit.slice(-1); publish(parts.join("").trimEnd()); if (digit && index < length - 1) refs.current[index + 1]?.focus() }
  const keyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => { if (event.key === "Backspace" && !code[index] && index > 0) { event.preventDefault(); const next = code.slice(0, index - 1) + code.slice(index); publish(next); refs.current[index - 1]?.focus() } else if (event.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus(); else if (event.key === "ArrowRight" && index < length - 1) refs.current[index + 1]?.focus() }
  const paste = (event: ClipboardEvent<HTMLInputElement>) => { const next = cleanCode(event.clipboardData.getData("text"), length); if (!next) return; event.preventDefault(); publish(next); refs.current[Math.min(next.length, length) - 1]?.focus() }
  const submit = async (event: FormEvent<HTMLDivElement>) => { event.preventDefault(); if (code.length === length) await onSubmit?.(code, event as unknown as FormEvent<HTMLFormElement>) }
  const resend = async () => { if (remaining || loading || disabled) return; await onResend?.(); setRemaining(resendSeconds) }
  return <Stack className={classNames?.root} css={styles?.root} data-scope="n-otp-verification" data-part="root" gap="5"><NAuthHeader title={title ?? labels.otpTitle} subtitle={subtitle ?? labels.otpDescription} />{maskedDestination ? <Text color="fg.muted" textAlign="center">{maskedDestination}</Text> : null}{error ? <NAuthAlert status="error">{error}</NAuthAlert> : success ? <NAuthAlert status="success">{success}</NAuthAlert> : null}<Stack as="form" className={classNames?.form} css={styles?.form} data-part="form" gap="4" onSubmit={submit}>
    <HStack className={classNames?.digits} css={styles?.digits} data-part="digits" justify="center" gap={{ base: "1.5", sm: "2" }}>
      {Array.from({ length }, (_, index) => <Input key={index} ref={(node) => { refs.current[index] = node }} className={classNames?.digit} css={styles?.digit} data-part="digit" value={code[index] ?? ""} aria-label={labels.otpDigit(index + 1, length)} inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} pattern="[0-9]*" maxLength={1} width={{ base: "2.45rem", sm: "3rem" }} height={{ base: "3rem", sm: "3.5rem" }} textAlign="center" fontSize="xl" fontWeight="bold" disabled={disabled || loading} autoFocus={autoFocus && index === 0} onFocus={(event) => event.currentTarget.select()} onChange={(event) => setDigit(index, cleanCode(event.currentTarget.value, 1))} onKeyDown={(event) => keyDown(event, index)} onPaste={paste} />)}
    </HStack><Button type="submit" colorPalette={colorPalette} loading={loading} disabled={disabled || code.length !== length}>{labels.verifyCode}</Button>{onResend ? <Button className={classNames?.resend} css={styles?.resend} data-part="resend" type="button" variant="plain" disabled={disabled || loading || remaining > 0} onClick={resend}>{remaining ? labels.resendIn(formatCountdown(remaining)) : labels.resendCode}</Button> : null}
  </Stack></Stack>
}
