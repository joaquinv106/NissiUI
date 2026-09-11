# NissiUI Production Ready v1

Date: 2026-09-10

Document role: capability-by-capability readiness analysis (MUST/HIGH-VALUE/POST-LAUNCH/EXPERIMENTAL classification) that supports the gate decision. For the formal, concise release act — gate closure, external consumer evidence, versioning and freeze decisions — see [`.nissi/releases/NISSIUI-PRODUCTION-READY-V1.md`](releases/NISSIUI-PRODUCTION-READY-V1.md).

## Decision frame

The target is a first sellable enterprise SaaS, initially oriented toward treasury/financial-control workflows. NissiUI supplies presentation and client navigation; authentication, authorization enforcement, persistence, financial rules, audit retention and data protection remain responsibilities of the product and its backend.

Readiness is measured with 12 equal, binary criteria in `PRODUCTION-READY-GATE.md`. All twelve criteria are evidenced: 12 / 12 = 100%. The gate is **READY** because every MUST criterion passes.

## MUST HAVE BEFORE FIRST CUSTOMER

| Capability | Product need | Experience enabled | Without it | Exists now | Evidence | Risk | Effort remaining |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Login and account-recovery surfaces | Every authenticated SaaS | Professional entry, recovery, reset, OTP and verification UI | Customer cannot reliably enter or recover access | YES | `src/components/auth/`, `docs/auth.md`, `auth.test.tsx` | Product backend must enforce identity/session controls | SMALL (product integration only) |
| Application shell and navigation | Treasury operations | Stable header, sidebar, breadcrumbs and workspace layout | Fragmented navigation and poor operational usability | YES | `Nlayout`, `NAppShell`, `NSidebar`, `NHeader`; component tests/docs | Incorrect product information architecture | SMALL |
| Core SPA routing | Multi-screen SaaS | No full-page reload, deep links, history/hash/memory strategies | Slow/broken navigation | YES | `Nroutes`, `NLink`, History API tests | Navigation regressions | SMALL |
| Nested routes, params and search | Tenant/module/detail/filter screens | `/tenant/treasury/invoices/:id?status=open` style flows | Product routes cannot represent real workflows cleanly | YES | `NOutlet`, typed params, search codecs; route/search tests | Incorrect dependency declarations can return stale data | SMALL |
| Protected routes and guards | Roles and financial modules | UI-level access routing and pre-loader denial | Unauthorized screens may be presented | YES at UI layer | `NPermissionsProvider`, route permissions, `beforeEnter`; tests verify guards finish before sensitive loaders | Backend authorization is still mandatory | MEDIUM (product backend integration) |
| Loading, error, forbidden and 404 states | All remote business screens | Recoverable and understandable failure states | Blank/broken screens | YES | `pendingFallback`, nearest error boundary, forbidden/not-found fallbacks; route tests | Product-specific copy/recovery actions | SMALL |
| Business UI primitives | Dashboards, tables, filters, forms and dialogs | Treasury lists, detail/edit flows and operational actions | Product requires ad-hoc UI foundation work | YES | dashboard, table, form, data-patterns, page, panel and notification components/tests | Domain rules must remain outside NissiUI | SMALL |
| Responsive and theme support | Desktop and mobile users | Usable light/dark responsive interface | Poor adoption and accessibility | YES | semantic theme tokens, `NThemeProvider`, responsive component contracts | Product composition can still misuse primitives | SMALL |
| Accessibility-critical behavior | Keyboard and assistive-technology users | Focus, semantic regions, labels and reduced-motion behavior | Exclusion and support risk | YES at library test/documentation level | accessibility docs; focus, labels and reduced-motion coverage in components/router | A product-level audit is still required | MEDIUM (product validation) |
| Package and runtime compatibility | Product build/deployment | ESM/CommonJS, NodeNext/Bundler, SSR-safe imports and tree shaking | Consumer build can fail | YES | `npm run build`, `check:package`, SSR and tree-shaking scripts, `npm pack --dry-run` | Current package check links the repo rather than installing the produced tarball | SMALL |
| Deterministic quality baseline | Safe iteration | Repeatable types/tests/build/package gates | Regressions reach product work | YES | Typecheck PASS; 333/333 tests PASS; build/package checks PASS | No separate lint script exists | SMALL |
| Production-like packaged consumer smoke | First real Nissi product | Proves installation and one complete auth → protected shell → business screen flow from the packed artifact | Integration failures may be found during product development | YES | `Nissi-Consumer-Lab` installs the generated tarball without links/source imports and passes the complete synthetic critical flow | Backend behavior remains product-owned and was synthetic/intercepted | COMPLETE |

## HIGH VALUE BUT NOT BLOCKING

| Capability | Product need | Experience enabled | Without it | Exists now | Evidence | Risk | Effort |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Phase 14 shallow/selective navigation | Query-driven treasury screens | Avoids unrelated loader work on query-only navigation | Filters still work; some navigation may reload more data | NO; selective search dependencies exist | Phase 06 tests and Phase 14 roadmap | Premature optimization can introduce stale data | MEDIUM |
| Phase 15 prioritized prefetch | Frequently visited modules | Better perceived latency under repeated navigation | Existing lazy/prefetch remains usable but less scheduled | NO; base lazy/cache/prefetch exists | Phases 02–04 and Phase 15 roadmap | Speculative work can waste network/CPU | LARGE |
| Phase 18 structured events | Support and diagnostics | Explains transitions and loader/cache behavior | Product telemetry/logging must diagnose at a higher layer | NO | Phase 18 roadmap | Events could leak sensitive route data if poorly designed | MEDIUM |

## POST LAUNCH

| Capability | Product need | Experience enabled | Without it | Exists now | Evidence | Risk | Effort |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Phase 08 enriched navigation intent | Advanced transition coordination | More expressive navigation lifecycle | Core navigation remains functional | NO | Phase 08 roadmap | Vague contract may expand scope | MEDIUM |
| Phases 09–10 actions and optimistic rollback | Mutation-heavy workflows | Router-owned mutation lifecycle | Product can use forms/services/query state instead | NO | Phases 09–10 roadmap | Concurrency and rollback correctness | LARGE |
| Phases 11–12 parallel/modal routes | Complex multi-surface navigation | URL-addressable auxiliary/modal surfaces | Dialogs/panels and ordinary routes remain available | NO | Phases 11–12 roadmap | History/URL complexity | LARGE |
| Phases 13 and 16 state/layout preservation | Long-lived workspaces | Retains selected UI state and nested layouts | Product can lift state or reload screens | NO | Phases 13 and 16 roadmap | Memory growth and stale state | LARGE |
| Phase 20 manifest/inspection | Internal tooling and module discovery | Programmatic route introspection | Static route definitions remain usable | NO | Phase 20 roadmap | Exposing unstable internals | MEDIUM |
| Phase 21 controlled enterprise modules | Large dynamic platform | Runtime-style module registration | First product can register modules statically | NO | Phase 21 roadmap | Id conflicts and governance | LARGE |
| Phase 22 full closure | Public router-program completion | Complete docs/benchmarks and later publication | Internal first product can proceed before full parity | NO | Phase 22 Definition of Done | Premature public claims | LARGE |

## EXPERIMENTAL / NOT REQUIRED

| Capability | Product need | Experience enabled | Without it | Exists now | Evidence | Risk | Effort |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Phase 17 View Transitions | Optional visual polish | Enhanced route animation where supported | Standard accessible transitions remain | NO | Phase 17 roadmap | Browser variance and reduced-motion concerns | MEDIUM |
| Phase 19 Router DevTools | Internal developer convenience | Specialized runtime inspection UI | Tests/logging remain available | NO | Phase 19 roadmap | Product bundle contamination if mispackaged | LARGE |

## Pareto conclusion

No pending Router phase is required to start the first product. If commercial learning later demonstrates Router-specific friction, the smallest high-value subset is Phase 14 plus Phase 18; Phase 15 joins only when measured navigation latency justifies it. This is a deferred optimization set, not Horizon 1.

## STOP PLATFORM DEVELOPMENT WHEN

Stop NissiUI work and move to the first product when all 12 production-ready gate criteria pass, especially the packaged consumer smoke flow, and no P0 defect prevents login, protected navigation, business-screen rendering, responsive use, build or packaging. Do not continue phases classified C or D automatically.

## Final gate closure

Decision: **READY** (12 PASS, 0 FAIL, 0 INSUFFICIENT).

The packaged consumer evidence closes the sole previous gap. NissiUI 0.3.0 is the frozen Production Ready V1 baseline. Backend correctness and product-level accessibility/security validation remain outside this library gate.
