# Phase 07 — Navigation blockers

Status: COMPLETED

Goal: Añadir blockers componibles y `beforeunload`.

Evidence: Registro, hooks, integración y pruebas.

Implemented behavior: Navegación programática, enlaces, traversal y unload comparten bloqueo.

Relevant files: `src/components/routes/navigation/blockers.ts`; `src/components/routes/Nroutes.tsx`; `docs/nroutes-blockers.md`.

Relevant tests: `src/components/routes/navigation/blockers.test.ts`; `src/components/routes/blockers.test.tsx`.

Related commits: `4a0f377` (2026-09-09).

Dependencies: Phase 01.

Acceptance criteria: Pipeline común y estados proceed/reset probados.

Known gaps: No implementa navigation intent enriquecido de Phase 08.

Risks: Navegación atrapada o confirmación no componible.

Recommended capabilities: Architect, Developer, QA, Reviewer.

Notes: Última fase realmente verificable.

Confidence: HIGH
