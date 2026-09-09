# Nissi Auth

`Nissi Auth` es la capa visual de autenticación de Nissi UI. No autentica, no persiste credenciales ni tokens y no depende de Firebase, Auth0, Supabase u otro proveedor: la aplicación consumidora conserva infraestructura, sesión, autorización y validación definitiva.

## Importación

```tsx
import { NAuthLayout, NLogin } from "nissi-ui/auth"
```

Todos los componentes también están disponibles desde `nissi-ui`.

## Pantalla completa

```tsx
<NAuthLayout
  variant="split"
  brandName="Nissi Platform"
  title="Administra tu negocio desde un solo lugar"
  subtitle="Ventas, inventario, compras y tesorería."
  illustration="/auth-business.svg"
  illustrationAlt="Paneles operativos de Nissi"
>
  <NLogin
    allowRememberMe
    allowForgotPassword
    socialProviders={["google", "microsoft"]}
    onSubmit={async (credentials) => authApi.login(credentials)}
    onSocialProviderClick={(provider) => authApi.continueWith(provider)}
  />
</NAuthLayout>
```

`NAuthLayout` ofrece `centered`, `split`, `glass`, `minimal` y `branded`. Las variantes divididas pasan a una columna en móvil; `minimal` retira panel, borde y sombra. Logo, texto, ilustración, fondo, orden, ancho y props Chakra de las superficies se inyectan desde el consumidor.

## Componentes

- `NLogin`: estrategias `email`, `username`, `emailOrUsername` y `phone`; validación básica o adaptador asíncrono, recordar, recuperación, registro, proveedores sociales y bloqueo de doble envío.
- `NRegister`: campos declarativos y personalizados, términos, confirmación y fuerza de contraseña.
- `NForgotPassword`, `NResetPassword` y `NVerifyEmail`: recuperación, reemplazo y confirmación mediante callbacks.
- `NOtpVerification`: 4, 6 u 8 dígitos, pegado completo, flechas, Backspace, autofoco, `onComplete`, envío y reenvío temporizado.
- `NPasswordField` y `NPasswordStrength`: visibilidad accesible, autocomplete y evaluación informativa configurable.
- `NAuthSocialButtons`: sólo UI y eventos; nunca ejecuta OAuth.
- `NAuthHeader`, `NAuthFooter`, `NAuthDivider` y `NAuthAlert`: primitives para composición avanzada.

## Estados, i18n y personalización

Los formularios aceptan `loading`, `disabled`, `error` y `success`. `NLogin.validation.validate` permite adaptar Zod, React Hook Form o validación propia sin convertirlos en dependencias. Los textos predeterminados viven en `defaultNAuthLabels`; `labels` permite sustituciones parciales. Los componentes visuales exponen slots estables mediante `unstyled`, `classNames` y `styles` y usan tokens semánticos compatibles con los temas de `NThemeProvider`.

## Accesibilidad y seguridad

Los campos usan etiquetas asociadas, errores de Chakra `Field`, `aria-invalid`, botones con `type`, nombres para controles de icono y autocomplete estándar. OTP admite teclado y pegado; error y éxito se anuncian con `alert`/`status`.

Nissi Auth nunca almacena contraseñas, tokens o sesiones; no escribe en `localStorage`, no llama endpoints y no incluye OAuth. El servidor debe volver a validar todos los datos y el medidor de fuerza no sustituye una política de seguridad.

## Rendimiento y empaquetado

La subruta `nissi-ui/auth` es una entrada independiente. El paquete conserva módulos ES, `sideEffects: false` y React/Chakra como peers para facilitar tree shaking y evitar duplicados.
