# Phase 06 — Search codecs

Status: COMPLETED

Goal: Añadir codecs opcionales y dependencias selectivas.

Evidence: Implementación, tipos, pruebas y guía dedicada.

Implemented behavior: Parse/serialize de search tipado y recarga sólo por claves declaradas.

Relevant files: `src/components/routes/search.ts`; `docs/nroutes-search.md`; `src/components/routes/matcher.ts`.

Relevant tests: `src/components/routes/search.test.tsx`.

Related commits: `2289a28` (2026-09-09).

Dependencies: Phases 01 and 05.

Acceptance criteria: Codecs y dependencias selectivas probados.

Known gaps: Shallow navigation completa pertenece a Phase 14.

Risks: Recarga por query irrelevante o datos obsoletos.

Recommended capabilities: Architect, Developer, QA, Reviewer.

Notes: Dependencia directa verificada para Phase 14.

Confidence: HIGH
