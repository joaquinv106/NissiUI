import { Box, Button, ButtonGroup, Stack, Text } from "@chakra-ui/react"
import { useState } from "react"

import {
  NauthForgotPassword,
  NauthLogin,
  NauthOtpVerification,
  NauthRegister,
  NauthResetPassword,
  NauthVerifyEmail,
  NloginPage,
} from "../components/auth"
import { ComponentDocs } from "./ComponentDocs"

type AuthDemo = "page" | "login" | "register" | "forgot" | "reset" | "otp" | "verify"

const demos: ReadonlyArray<{ id: AuthDemo; label: string }> = [
  { id: "page", label: "Página de acceso" },
  { id: "login", label: "Login" },
  { id: "register", label: "Registro" },
  { id: "forgot", label: "Recuperación" },
  { id: "reset", label: "Nueva contraseña" },
  { id: "otp", label: "OTP" },
  { id: "verify", label: "Verificación" },
]

/** Laboratorio funcional del módulo; las acciones son deliberadamente locales. */
export function AuthView() {
  const [demo, setDemo] = useState<AuthDemo>("page")
  const [message, setMessage] = useState("Selecciona y prueba cada flujo.")

  return (
    <Stack gap="8" p={{ base: "4", md: "8" }}>
      <Stack gap="1">
        <Text as="h1" fontSize="3xl" fontWeight="bold">Nauth y NloginPage</Text>
        <Text color="fg.muted">Acceso visual responsive, desacoplado de sesión, proveedores y backend.</Text>
      </Stack>

      <ButtonGroup size="sm" variant="outline" flexWrap="wrap">
        {demos.map((item) => (
          <Button key={item.id} variant={demo === item.id ? "solid" : "outline"} onClick={() => setDemo(item.id)}>
            {item.label}
          </Button>
        ))}
      </ButtonGroup>

      {demo === "page" ? (
        <Box width="full" overflow="hidden" borderWidth="1px" borderColor="border" borderRadius="2xl">
          <NloginPage
            provideTheme={false}
            layoutProps={{ embedded: true, minHeight: "44rem" }}
            loginProps={{
              allowRememberMe: true,
              allowForgotPassword: true,
              showRegisterLink: true,
              socialProviders: ["google", "microsoft"],
              onForgotPassword: () => setDemo("forgot"),
              onRegister: () => setDemo("register"),
              onSubmit: async ({ identifier }) => setMessage(`Login emitido para ${identifier}`),
            }}
          />
        </Box>
      ) : (
        <Box maxW="30rem" width="full" mx="auto" p={{ base: "5", md: "8" }} bg="bg.panel" borderWidth="1px" borderColor="border" borderRadius="2xl" boxShadow="lg">
          {demo === "login" ? <NauthLogin allowRememberMe allowForgotPassword showRegisterLink socialProviders={["google", "github"]} onForgotPassword={() => setDemo("forgot")} onRegister={() => setDemo("register")} onSubmit={async ({ identifier }) => setMessage(`Login emitido para ${identifier}`)} /> : null}
          {demo === "register" ? <NauthRegister fields={["name", "email", "password", "confirmPassword", "terms"]} showLoginLink onLogin={() => setDemo("login")} onSubmit={async ({ email }) => setMessage(`Registro emitido para ${String(email)}`)} /> : null}
          {demo === "forgot" ? <NauthForgotPassword onBackToLogin={() => setDemo("login")} onSubmit={async ({ identifier }) => setMessage(`Recuperación emitida para ${identifier}`)} /> : null}
          {demo === "reset" ? <NauthResetPassword token="demo-token" onSubmit={async () => setMessage("Reset emitido")} /> : null}
          {demo === "otp" ? <NauthOtpVerification length={6} maskedDestination="j***@nissi.mx" resendSeconds={10} onComplete={(code) => setMessage(`OTP completo: ${code}`)} onResend={async () => setMessage("Código reenviado")} /> : null}
          {demo === "verify" ? <NauthVerifyEmail email="persona@nissi.mx" onVerify={() => setMessage("Verificación solicitada")} onResend={() => setMessage("Correo reenviado")} /> : null}
        </Box>
      )}

      <Text role="status" textAlign="center" color="fg.muted">{message}</Text>

      <ComponentDocs
        purpose="Construir una entrada completa con tema oscuro inicial, selector de tema, identidad de producto y formularios Nauth desacoplados del backend."
        steps={[
          "Monta NloginPage como pantalla de acceso autónoma; ya incluye NThemeProvider con dark como preferencia inicial.",
          "Conecta loginProps.onSubmit, recuperación, registro y proveedores con la capa de autenticación de tu aplicación.",
          "Usa labels, slots y props de layout para adaptar idioma y marca sin perder responsive ni accesibilidad.",
        ]}
        variants={[
          { name: "NloginPage", description: "Pantalla completa lista para rutas públicas y tema seleccionable." },
          { name: "NauthLogin", description: "Formulario aislado para superficies o layouts propios." },
          { name: "NauthOtpVerification", description: "Verificación accesible por código con teclado y pegado." },
        ]}
        variantExamples={[
          {
            id: "login",
            label: "Login",
            summary: "NauthLogin",
            preview: <Box maxW="28rem"><NauthLogin allowRememberMe /></Box>,
            code: '<NauthLogin allowRememberMe onSubmit={(data) => auth.login(data)} />',
          },
          {
            id: "otp",
            label: "OTP",
            summary: "NauthOtpVerification",
            preview: <Box maxW="28rem"><NauthOtpVerification length={6} autoFocus={false} /></Box>,
            code: '<NauthOtpVerification length={6} onComplete={(code) => auth.verify(code)} />',
          },
        ]}
        propExamples={[
          {
            label: "Usar un provider existente",
            code: '<NThemeProvider defaultTheme="dark">\n  <NloginPage provideTheme={false} />\n</NThemeProvider>',
          },
        ]}
        code={`import { NloginPage } from "nissi-ui/auth"

<NloginPage
  loginProps={{
    allowRememberMe: true,
    allowForgotPassword: true,
    onSubmit: (credentials) => authApi.login(credentials),
  }}
/>`}
      />
    </Stack>
  )
}
