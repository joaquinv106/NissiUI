# Nauth y NloginPage

`Nauth` es la capa visual de autenticación de Nissi UI. `NloginPage` la compone con el isotipo oficial, identidad de producto, un `NThemeProvider` autónomo, tema oscuro inicial y el selector `NTheme` dentro de la propia pantalla.

La familia no autentica, no persiste credenciales ni tokens y no depende de Firebase, Auth0, Supabase u otro proveedor. La aplicación consumidora conserva infraestructura, sesión, autorización y validación definitiva.

## Inicio inmediato

```tsx
import { NloginPage } from "nissi-ui/auth"

export function LoginRoute() {
  return (
    <NloginPage
      loginProps={{
        allowRememberMe: true,
        allowForgotPassword: true,
        socialProviders: ["google", "microsoft"],
        onSubmit: async (credentials) => authApi.login(credentials),
        onForgotPassword: () => navigate("/recuperar"),
        onSocialProviderClick: (provider) => authApi.continueWith(provider),
      }}
    />
  )
}
```

Sin configuración adicional, la página usa `dark` como tema inicial. La preferencia que el usuario elija mediante `NTheme` se persiste con el comportamiento normal de `NThemeProvider`.

## Provider y composición

`NloginPage` monta su propio provider por defecto para poder funcionar como ruta autónoma. Si la aplicación ya está envuelta una sola vez, evita providers anidados:

```tsx
<NThemeProvider defaultTheme="dark">
  <NloginPage provideTheme={false} />
</NThemeProvider>
```

`themeProviderProps` configura tema controlado, clave de almacenamiento o temas del sistema. `themeProps` configura la presentación, las opciones y labels del selector integrado.

Para un layout completamente propio, usa las primitivas directamente:

```tsx
import { NauthLayout, NauthLogin } from "nissi-ui/auth"

<NauthLayout
  variant="split"
  brandName="Nissi Platform"
  title="Administra tu negocio desde un solo lugar"
  subtitle="Ventas, inventario, compras y tesorería."
  illustration="/auth-business.svg"
  illustrationAlt="Paneles operativos de Nissi"
>
  <NauthLogin onSubmit={(credentials) => authApi.login(credentials)} />
</NauthLayout>
```

`NauthLayout` ofrece `centered`, `split`, `glass`, `minimal` y `branded`. Las variantes divididas pasan a una columna en móvil. `embedded` cambia la región raíz de `main` a `section` y `minHeight` permite documentar o incrustar la composición sin perder la experiencia de pantalla completa predeterminada.

## Componentes

- `NloginPage`: pantalla responsive lista para una ruta pública, con tema oscuro inicial, selector de tema, marca, beneficios y `NauthLogin`.
- `NauthLogin`: estrategias `email`, `username`, `emailOrUsername` y `phone`; validación básica o adaptador asíncrono, recordar, recuperación, registro, proveedores sociales y bloqueo de doble envío.
- `NauthRegister`: campos declarativos y personalizados, términos, confirmación y fuerza de contraseña.
- `NauthForgotPassword`, `NauthResetPassword` y `NauthVerifyEmail`: recuperación, reemplazo y confirmación mediante callbacks.
- `NauthOtpVerification`: 4, 6 u 8 dígitos, pegado completo, flechas, Backspace, autofoco, finalización y reenvío temporizado.
- `NauthPasswordField` y `NauthPasswordStrength`: visibilidad accesible, autocomplete y evaluación informativa configurable.
- `NauthSocialButtons`: sólo UI y eventos; nunca ejecuta OAuth.
- `NauthHeader`, `NauthFooter`, `NauthDivider` y `NauthAlert`: primitivas para composición avanzada.

Los nombres anteriores `NAuthLayout`, `NLogin`, `NRegister`, `NOtpVerification` y demás aliases originales continúan exportados para no romper consumidores existentes. En código nuevo se recomienda el namespace coherente `Nauth*`.

## Responsive y accesibilidad

`NloginPage` usa una columna en móvil y separa marca y acceso desde `md`. El isotipo reduce su tamaño y los beneficios secundarios se ocultan en pantallas angostas para priorizar el formulario. El control de tema permanece visible, las superficies se ajustan al ancho disponible y los proveedores sociales se apilan cuando no caben en una fila.

El isotipo predeterminado usa la variante ligera de `docs/assets/nissi-mark.png`, que el build incorpora a `dist` para que también funcione desde el paquete npm. `logo` permite sustituirlo; cuando se inyecta una imagen propia, el consumidor debe proporcionar su texto alternativo en el propio elemento.

La página conserva un único `main` en uso autónomo. Los campos usan etiquetas asociadas, `aria-invalid`, autocomplete estándar y botones nativos. OTP admite teclado y pegado; errores y éxitos se anuncian mediante `alert` o `status`. El selector `NTheme` conserva nombre accesible y navegación de menú.

## i18n y personalización

Los textos de la página viven en `defaultNloginPageLabels` y pueden sustituirse parcialmente mediante `labels`. Los textos de formularios viven en `defaultNauthLabels`; se personalizan desde `loginProps.labels` o la prop equivalente del subcomponente.

`NloginPage` expone los slots `root`, `themeControl`, `brandMark`, `featureList`, `feature` y `loginSurface`. Las primitivas `Nauth` conservan sus propios slots `unstyled`, `classNames` y `styles`. Todos los estilos predeterminados usan tokens semánticos compatibles con claro, oscuro, azul marino y Nissi Dark.

## Seguridad

Nauth nunca almacena contraseñas, tokens o sesiones; no escribe en `localStorage`, no llama endpoints y no incluye OAuth. `NThemeProvider` sólo persiste la preferencia visual. El servidor debe validar credenciales, tenant, rate limits, sesión y autorización. El medidor de fuerza de contraseña es informativo y no sustituye una política de backend.

## Rendimiento y empaquetado

La subruta `nissi-ui/auth` es una entrada independiente. El paquete conserva módulos ES, `sideEffects: false` y React/Chakra como peers para facilitar tree shaking y evitar duplicados.
