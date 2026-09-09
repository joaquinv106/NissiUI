import type { BoxProps, InputProps } from "@chakra-ui/react"
import type { FormEvent, ReactNode } from "react"

import type { NComponentStyleProps } from "../styling"
import type { NThemeProps, NThemeProviderProps } from "../theme"

export type NAuthState = "default" | "loading" | "success" | "error" | "disabled"
export type NAuthLayoutVariant = "centered" | "split" | "glass" | "minimal" | "branded"
export type NAuthLoginWith = "email" | "username" | "emailOrUsername" | "phone"
export type NAuthSocialProvider = "google" | "github" | "apple" | "microsoft" | (string & {})

export interface NAuthLabels {
  email: string
  username: string
  emailOrUsername: string
  phone: string
  password: string
  confirmPassword: string
  currentPassword: string
  newPassword: string
  showPassword: string
  hidePassword: string
  rememberMe: string
  forgotPassword: string
  register: string
  login: string
  createAccount: string
  continueWith: string
  required: string
  invalidEmail: string
  invalidPhone: string
  passwordMinLength: (length: number) => string
  passwordsDoNotMatch: string
  acceptTerms: string
  name: string
  firstName: string
  lastName: string
  company: string
  sendRecovery: string
  recoverySentTitle: string
  recoverySentDescription: (identifier: string) => string
  resetPassword: string
  resetSuccess: string
  verifyEmailTitle: string
  verifyEmailDescription: string
  verifyEmailAction: string
  otpTitle: string
  otpDescription: string
  otpDigit: (index: number, length: number) => string
  verifyCode: string
  resendCode: string
  resendIn: (time: string) => string
  passwordStrength: readonly [string, string, string, string, string]
  passwordRequirements: {
    length: (length: number) => string
    uppercase: string
    lowercase: string
    number: string
    symbol: string
  }
}

export type NAuthSlot = "root" | "header" | "title" | "subtitle" | "form" | "field" | "input" | "actions" | "submit" | "footer" | "alert"

export interface NAuthBaseProps extends NComponentStyleProps<NAuthSlot> {
  title?: ReactNode
  subtitle?: ReactNode
  labels?: Partial<NAuthLabels>
  loading?: boolean
  disabled?: boolean
  success?: ReactNode
  error?: ReactNode
  size?: "sm" | "md" | "lg"
  colorPalette?: string
}

export interface NAuthLayoutProps extends NComponentStyleProps<"root" | "visual" | "panel" | "content" | "footer"> {
  variant?: NAuthLayoutVariant
  logo?: ReactNode
  brandName?: ReactNode
  title?: ReactNode
  subtitle?: ReactNode
  illustration?: string | ReactNode
  illustrationAlt?: string
  backgroundImage?: string
  children: ReactNode
  footer?: ReactNode
  maxWidth?: BoxProps["maxWidth"]
  reverse?: boolean
  /** Usa una sección en lugar de `main` cuando la composición vive dentro de otra página. */
  embedded?: boolean
  /** Altura mínima del layout; `100dvh` conserva el comportamiento de pantalla completa. */
  minHeight?: BoxProps["minHeight"]
  containerProps?: BoxProps
  panelProps?: BoxProps
}

export interface NAuthHeaderProps extends NComponentStyleProps<"root" | "title" | "subtitle"> {
  title?: ReactNode
  subtitle?: ReactNode
}

export interface NAuthFooterProps extends NComponentStyleProps<"root"> { children?: ReactNode }
export interface NAuthDividerProps extends NComponentStyleProps<"root" | "line" | "label"> { children?: ReactNode }
export interface NAuthAlertProps extends NComponentStyleProps<"root" | "indicator" | "content" | "title" | "description"> {
  status?: "info" | "warning" | "success" | "error" | "neutral"
  title?: ReactNode
  children?: ReactNode
}

export interface NPasswordStrengthProps extends NComponentStyleProps<"root" | "meter" | "segment" | "label" | "requirements"> {
  value: string
  minLength?: number
  labels?: Partial<NAuthLabels>
  disabled?: boolean
  showRequirements?: boolean
}

export interface NPasswordFieldProps extends Omit<InputProps, "size">, NComponentStyleProps<"root" | "label" | "control" | "input" | "toggle" | "helper" | "error" | "strength"> {
  label?: ReactNode
  helperText?: ReactNode
  errorText?: ReactNode
  showStrength?: boolean
  strengthLabels?: Partial<NAuthLabels>
  strengthMinLength?: number
  size?: "sm" | "md" | "lg"
}

export interface NLoginData {
  identifier: string
  email?: string
  username?: string
  phone?: string
  password: string
  rememberMe?: boolean
}

export interface NLoginValidation {
  identifier?: { required?: string; invalid?: string }
  password?: { required?: string; minLength?: number | { value: number; message: string } }
  validate?: (data: NLoginData) => Partial<Record<"identifier" | "password", string>> | Promise<Partial<Record<"identifier" | "password", string>>>
}

export interface NLoginProps extends NAuthBaseProps {
  loginWith?: NAuthLoginWith
  allowRememberMe?: boolean
  allowForgotPassword?: boolean
  showRegisterLink?: boolean
  socialProviders?: readonly NAuthSocialProvider[]
  validation?: NLoginValidation
  defaultValues?: Partial<NLoginData>
  onSubmit?: (data: NLoginData, event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onForgotPassword?: () => void
  onRegister?: () => void
  onSocialProviderClick?: (provider: NAuthSocialProvider) => void
}

export type NRegisterFieldName = "firstName" | "lastName" | "name" | "username" | "email" | "phone" | "password" | "confirmPassword" | "company" | "terms"
export interface NRegisterCustomField {
  name: string
  label: ReactNode
  type?: "text" | "email" | "tel" | "password" | "checkbox"
  required?: boolean
  placeholder?: string
  autoComplete?: string
}
export type NRegisterData = Record<string, string | boolean>
export interface NRegisterProps extends NAuthBaseProps {
  fields?: readonly NRegisterFieldName[]
  customFields?: readonly NRegisterCustomField[]
  socialProviders?: readonly NAuthSocialProvider[]
  showLoginLink?: boolean
  passwordMinLength?: number
  onSubmit?: (data: NRegisterData, event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onLogin?: () => void
  onSocialProviderClick?: (provider: NAuthSocialProvider) => void
}

export interface NForgotPasswordData { identifier: string }
export interface NForgotPasswordProps extends NAuthBaseProps {
  loginWith?: "email" | "username" | "phone"
  onSubmit?: (data: NForgotPasswordData, event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onBackToLogin?: () => void
}

export interface NResetPasswordData { password: string; confirmPassword: string; token?: string }
export interface NResetPasswordProps extends NAuthBaseProps {
  token?: string
  passwordMinLength?: number
  showStrength?: boolean
  onSubmit?: (data: NResetPasswordData, event: FormEvent<HTMLFormElement>) => void | Promise<void>
}

export interface NVerifyEmailProps extends NAuthBaseProps {
  email?: string
  actionLabel?: ReactNode
  onVerify?: () => void | Promise<void>
  onResend?: () => void | Promise<void>
}

export interface NOtpVerificationProps extends Omit<NAuthBaseProps, keyof NComponentStyleProps<NAuthSlot>>, NComponentStyleProps<NAuthSlot | "digits" | "digit" | "resend"> {
  length?: 4 | 6 | 8
  value?: string
  defaultValue?: string
  maskedDestination?: ReactNode
  resendSeconds?: number
  autoFocus?: boolean
  onValueChange?: (value: string) => void
  onComplete?: (value: string) => void
  onSubmit?: (value: string, event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onResend?: () => void | Promise<void>
}

export interface NAuthSocialButtonsProps extends NComponentStyleProps<"root" | "button" | "icon" | "label"> {
  providers: readonly NAuthSocialProvider[]
  orientation?: "horizontal" | "vertical"
  loadingProvider?: NAuthSocialProvider
  disabled?: boolean
  labels?: Partial<Record<string, string>>
  onProviderClick?: (provider: NAuthSocialProvider) => void
}

export interface NloginPageLabels {
  brandName: string
  logoAlt: string
  eyebrow: string
  heroTitle: string
  heroDescription: string
  loginTitle: string
  loginSubtitle: string
  responsiveFeature: string
  accessibleFeature: string
  themeFeature: string
  featuresLabel: string
  footer: string
}

export type NloginPageSlot = "root" | "themeControl" | "brandMark" | "featureList" | "feature" | "loginSurface"

export interface NloginPageProps extends NComponentStyleProps<NloginPageSlot> {
  logo?: ReactNode
  brandName?: ReactNode
  eyebrow?: ReactNode
  heroTitle?: ReactNode
  heroDescription?: ReactNode
  features?: readonly ReactNode[] | false
  loginTitle?: ReactNode
  loginSubtitle?: ReactNode
  footer?: ReactNode
  labels?: Partial<NloginPageLabels>
  loginProps?: NLoginProps
  themeProps?: NThemeProps
  /** Configura el proveedor autónomo de la página. El tema inicial es `dark`. */
  themeProviderProps?: Omit<NThemeProviderProps, "children">
  /** Desactívalo únicamente cuando ya exista un `NThemeProvider` ancestro. */
  provideTheme?: boolean
  layoutProps?: Omit<NAuthLayoutProps, "children" | "logo" | "brandName" | "title" | "subtitle" | "illustration" | "footer">
}

/** Nombres `Nauth*` preferidos para el contrato público. */
export type NauthState = NAuthState
export type NauthLayoutVariant = NAuthLayoutVariant
export type NauthLoginWith = NAuthLoginWith
export type NauthSocialProvider = NAuthSocialProvider
export type NauthLabels = NAuthLabels
export type NauthSlot = NAuthSlot
export type NauthBaseProps = NAuthBaseProps
export type NauthLayoutProps = NAuthLayoutProps
export type NauthHeaderProps = NAuthHeaderProps
export type NauthFooterProps = NAuthFooterProps
export type NauthDividerProps = NAuthDividerProps
export type NauthAlertProps = NAuthAlertProps
export type NauthPasswordStrengthProps = NPasswordStrengthProps
export type NauthPasswordFieldProps = NPasswordFieldProps
export type NauthLoginData = NLoginData
export type NauthLoginValidation = NLoginValidation
export type NauthLoginProps = NLoginProps
export type NauthRegisterFieldName = NRegisterFieldName
export type NauthRegisterCustomField = NRegisterCustomField
export type NauthRegisterData = NRegisterData
export type NauthRegisterProps = NRegisterProps
export type NauthForgotPasswordData = NForgotPasswordData
export type NauthForgotPasswordProps = NForgotPasswordProps
export type NauthResetPasswordData = NResetPasswordData
export type NauthResetPasswordProps = NResetPasswordProps
export type NauthVerifyEmailProps = NVerifyEmailProps
export type NauthOtpVerificationProps = NOtpVerificationProps
export type NauthSocialButtonsProps = NAuthSocialButtonsProps
