# Phase 01 — Branch diff y revalidación

Status: COMPLETED

Goal: Modelar retained/entering/leaving y políticas de revalidación.

Evidence: Código, pruebas unitarias y pruebas de integración.

Implemented behavior: Branch diff, retención de loader data y selección de trabajo de transición.

Relevant files: `src/components/routes/core/transition.ts`; `src/components/routes/Nroutes.tsx`.

Relevant tests: `src/components/routes/core/transition.test.ts`; `src/components/routes/Nroutes.test.tsx`.

Related commits: `87cf14b`.

Dependencies: Phase 00.

Acceptance criteria: Diff y revalidación cubiertos por pruebas.

Known gaps: No sustituye las fases posteriores de preservación/shallow navigation.

Risks: Reprocesar padres retenidos.

Recommended capabilities: Architect, Developer, QA, Reviewer.

Notes: Base explícita de Phase 14.

Confidence: HIGH
