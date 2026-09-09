import type { NAuthLabels, NAuthLoginWith, NLoginData } from "./types"

export function getPasswordScore(value: string, minLength = 8) {
  const checks = {
    length: value.length >= minLength,
    uppercase: /[A-ZÁÉÍÓÚÑ]/.test(value),
    lowercase: /[a-záéíóúñ]/.test(value),
    number: /\d/.test(value),
    symbol: /[^\p{L}\p{N}\s]/u.test(value),
  }
  return { score: Math.min(5, Object.values(checks).filter(Boolean).length), checks }
}

export function loginField(loginWith: NAuthLoginWith, labels: NAuthLabels) {
  if (loginWith === "username") return { label: labels.username, type: "text", autoComplete: "username", inputMode: "text" as const }
  if (loginWith === "phone") return { label: labels.phone, type: "tel", autoComplete: "tel", inputMode: "tel" as const }
  if (loginWith === "emailOrUsername") return { label: labels.emailOrUsername, type: "text", autoComplete: "username", inputMode: "email" as const }
  return { label: labels.email, type: "email", autoComplete: "email", inputMode: "email" as const }
}

export function createLoginData(identifier: string, password: string, rememberMe: boolean, loginWith: NAuthLoginWith): NLoginData {
  const named = loginWith === "email" ? { email: identifier } : loginWith === "username" ? { username: identifier } : loginWith === "phone" ? { phone: identifier } : {}
  return { identifier, ...named, password, rememberMe }
}

export function formatCountdown(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
}
