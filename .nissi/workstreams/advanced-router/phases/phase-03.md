# Phase 03 — Route cache

Status: COMPLETED

Goal: Añadir cache, SWR, GC e invalidación.

Evidence: Implementación dedicada, pruebas y guía.

Implemented behavior: Cache por loader de ruta, políticas, invalidación y retención.

Relevant files: `src/components/routes/data/cache.ts`; `src/components/routes/Nroutes.tsx`; `docs/nroutes-cache.md`.

Relevant tests: `src/components/routes/data/cache.test.ts`; `src/components/routes/Nroutes.test.tsx`.

Related commits: `87cf14b`.

Dependencies: Phase 02.

Acceptance criteria: Cache, SWR, GC e invalidación probados.

Known gaps: Actions con invalidación automática pertenecen a Phase 09.

Risks: Convertir el cache en query client o aceptar commits stale.

Recommended capabilities: Architect, Developer, QA, Reviewer.

Notes: Scope limitado a datos de loaders.

Confidence: HIGH
