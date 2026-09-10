# Phase 02 — Scheduler paralelo

Status: COMPLETED

Goal: Ejecutar loaders independientes en paralelo y respetar `dependsOn`.

Evidence: Scheduler dedicado y pruebas del grafo.

Implemented behavior: Guards mantienen orden; loaders listos se programan según dependencias.

Relevant files: `src/components/routes/data/scheduler.ts`; `src/components/routes/Nroutes.tsx`.

Relevant tests: `src/components/routes/data/scheduler.test.ts`.

Related commits: `87cf14b`.

Dependencies: Phase 01.

Acceptance criteria: Paralelismo, dependencias, ciclos y errores probados.

Known gaps: Prefetch prioritario pertenece a Phase 15.

Risks: Carreras o ejecución sensible antes de autorización.

Recommended capabilities: Architect, Developer, QA, Reviewer.

Notes: No hay evidencia de regresión en el baseline actual.

Confidence: HIGH
