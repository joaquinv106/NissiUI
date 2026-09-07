# Instrucciones para agentes

Lee [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) completo antes de explorar o modificar este proyecto. Es la fuente canónica de objetivo, arquitectura, convenciones, rutas y validación.

- Empieza por los archivos que el contexto identifica; evita búsquedas generales y navegación web innecesaria.
- Mantén Chakra UI v3, TypeScript estricto, tokens semánticos, accesibilidad e i18n mediante `labels`.
- Actualiza conjuntamente implementación, tipos públicos, pruebas y `docs/`.
- No edites `dist/` manualmente ni expongas módulos `internal/` sin una decisión explícita.
- Valida con `npm run typecheck`, `npm test`, `npm run build` y `npm run check:package`.
