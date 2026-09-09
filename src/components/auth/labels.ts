import type { NAuthLabels } from "./types"

export const defaultNAuthLabels: NAuthLabels = {
  email: "Correo electrónico", username: "Usuario", emailOrUsername: "Correo o usuario", phone: "Teléfono",
  password: "Contraseña", confirmPassword: "Confirmar contraseña", currentPassword: "Contraseña actual", newPassword: "Nueva contraseña",
  showPassword: "Mostrar contraseña", hidePassword: "Ocultar contraseña", rememberMe: "Recordarme", forgotPassword: "¿Olvidaste tu contraseña?",
  register: "Crear una cuenta", login: "Iniciar sesión", createAccount: "Crear cuenta", continueWith: "O continúa con",
  required: "Este campo es obligatorio.", invalidEmail: "Ingresa un correo válido.", invalidPhone: "Ingresa un teléfono válido.",
  passwordMinLength: (length) => `Usa al menos ${length} caracteres.`, passwordsDoNotMatch: "Las contraseñas no coinciden.",
  acceptTerms: "Acepto los términos y condiciones", name: "Nombre", firstName: "Nombre", lastName: "Apellidos", company: "Empresa",
  sendRecovery: "Enviar enlace de recuperación", recoverySentTitle: "Revisa tu correo",
  recoverySentDescription: (identifier) => `Enviamos instrucciones de recuperación a ${identifier}.`, resetPassword: "Restablecer contraseña",
  resetSuccess: "Tu contraseña se actualizó correctamente.", verifyEmailTitle: "Verifica tu correo", verifyEmailDescription: "Confirma tu dirección para continuar.",
  verifyEmailAction: "Ya verifiqué mi correo", otpTitle: "Introduce el código", otpDescription: "Escribe el código de verificación que enviamos.",
  otpDigit: (index, length) => `Dígito ${index} de ${length}`, verifyCode: "Verificar código", resendCode: "Reenviar código", resendIn: (time) => `Reenviar en ${time}`,
  passwordStrength: ["Muy débil", "Débil", "Aceptable", "Fuerte", "Muy fuerte"],
  passwordRequirements: { length: (length) => `${length} caracteres`, uppercase: "Mayúscula", lowercase: "Minúscula", number: "Número", symbol: "Símbolo" },
}

export function resolveNAuthLabels(labels?: Partial<NAuthLabels>): NAuthLabels {
  return { ...defaultNAuthLabels, ...labels, passwordRequirements: { ...defaultNAuthLabels.passwordRequirements, ...labels?.passwordRequirements } }
}
