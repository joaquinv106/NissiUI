# Nissi Engineering dogfood findings

Date: 2026-09-10

## ED-P0

None found.

## ED-P1

- CostGovernor keyword matching is substring-based: `ci` falsely activates optional DevSecOps for Spanish `navegación`.
- Free-text `plan "Implementar nested routing"` under-selects architecture work (Developer + QA only). Phase-declared capabilities work through `decidePhase`, but the `plan` CLI does not yet accept a workstream phase.

## ED-P2

- Workstream persistence accepts JSON-compatible YAML only; general YAML syntax is intentionally unsupported in the minimal foundation.
- `doctor` validates installation/managed resources but does not proactively enumerate every workstream; workstream commands validate files when loaded.
- The Engineering working tree already contained a self-referencing devDependency before this work. It did not enter runtime dependencies or break packaging, but should be reviewed separately.

## ED-P3

- CLI usage still prints package version 0.1.0 while the branch represents the unversioned v0.1.1 dogfood foundation; version was deliberately not bumped for local testing.
- `resume` is compact and relevant, but future consumers may benefit from an explicit project-level decision registry rather than deriving prior decisions from phase evidence/notes.

## Capability assessment

Project detection, init, doctor, profiles, RiskEngine, package installation, npm packaging, AGENTS preservation and project memory worked. Workstreams, phases, dependency validation, status/resume/next and phase-aware CostGovernor were added because they did not exist. No secondary findings above were automatically fixed.
