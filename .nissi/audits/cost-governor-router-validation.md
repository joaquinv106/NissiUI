# CostGovernor Router validation

Date: 2026-09-10

## Visual navigation change

`nissi-engineering plan "Modificar comportamiento visual de navegación"` selected Developer, UX and QA as essential with economy reasoning. It did not select Legal, Accounting, Finance, Privacy, Marketing, Growth or Sales. It did select DevSecOps as optional because the short keyword `ci` matches inside normalized `navegacion`; this is a false positive and an ED-P1 finding.

## Architectural change

`nissi-engineering plan "Implementar nested routing"` selected Developer and QA with standard reasoning, but did not infer Architect or Reviewer. This generic-task inference is insufficient for the real Router case. The new Phase contract corrects the declarative path: Phase 14 recommends architecture, implementation, testing and independent-review, and `CostGovernor.decidePhase` resolves those to Architect, Developer, QA and Reviewer in tests.

## Security change

`nissi-engineering plan "Cambiar un guard para validar autorización antes de ejecutar un loader sensible"` selected Developer, QA, AppSec, Identity & Access and Reviewer with advanced reasoning. Security activation is justified here by explicit authorization impact; unrelated business departments remained absent.

## Conclusion

Workstream-driven cost decisions meet the intended minimum. Free-text `plan` still has one false positive and one architectural under-selection; both are recorded for later correction rather than expanded in this dogfood task.
