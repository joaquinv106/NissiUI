import { Box, Button, ButtonGroup, Stack, Text } from "@chakra-ui/react"
import { useState } from "react"

import { NForgotPassword, NLogin, NOtpVerification, NRegister, NResetPassword, NVerifyEmail } from "../components/auth"

type AuthDemo = "login" | "register" | "forgot" | "reset" | "otp" | "verify"

/** Laboratorio funcional del módulo; las acciones son deliberadamente locales. */
export function AuthView() {
  const [demo, setDemo] = useState<AuthDemo>("login")
  const [message, setMessage] = useState("Selecciona y prueba cada flujo.")
  return <Stack gap="6" p={{ base: "4", md: "8" }}>
    <Stack gap="1"><Text as="h1" fontSize="3xl" fontWeight="bold">Nissi Auth</Text><Text color="fg.muted">Sistema visual desacoplado de autenticación, sesión y backend.</Text></Stack>
    <ButtonGroup size="sm" variant="outline" flexWrap="wrap">{(["login", "register", "forgot", "reset", "otp", "verify"] as const).map((item) => <Button key={item} variant={demo === item ? "solid" : "outline"} onClick={() => setDemo(item)}>{item}</Button>)}</ButtonGroup>
    <Box maxW="30rem" width="full" mx="auto" p={{ base: "5", md: "8" }} bg="bg.panel" borderWidth="1px" borderColor="border" borderRadius="2xl" boxShadow="lg">
      {demo === "login" ? <NLogin allowRememberMe allowForgotPassword showRegisterLink socialProviders={["google", "github"]} onForgotPassword={() => setDemo("forgot")} onRegister={() => setDemo("register")} onSubmit={async ({ identifier }) => setMessage(`Login emitido para ${identifier}`)} /> : null}
      {demo === "register" ? <NRegister fields={["name", "email", "password", "confirmPassword", "terms"]} showLoginLink onLogin={() => setDemo("login")} onSubmit={async ({ email }) => setMessage(`Registro emitido para ${String(email)}`)} /> : null}
      {demo === "forgot" ? <NForgotPassword onBackToLogin={() => setDemo("login")} onSubmit={async ({ identifier }) => setMessage(`Recuperación emitida para ${identifier}`)} /> : null}
      {demo === "reset" ? <NResetPassword token="demo-token" onSubmit={async () => setMessage("Reset emitido")} /> : null}
      {demo === "otp" ? <NOtpVerification length={6} maskedDestination="j***@nissi.mx" resendSeconds={10} onComplete={(code) => setMessage(`OTP completo: ${code}`)} onResend={async () => setMessage("Código reenviado")} /> : null}
      {demo === "verify" ? <NVerifyEmail email="persona@nissi.mx" onVerify={() => setMessage("Verificación solicitada")} onResend={() => setMessage("Correo reenviado")} /> : null}
    </Box>
    <Text role="status" textAlign="center" color="fg.muted">{message}</Text>
  </Stack>
}
