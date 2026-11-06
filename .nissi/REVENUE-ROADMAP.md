# Revenue roadmap

Date: 2026-09-10

## HORIZON 1 — NissiUI Production Ready v1 — COMPLETED

Only work that blocks Horizon 2:

1. Create a minimal external-style consumer fixture that installs the generated NissiUI tarball, not the repository source.
2. Exercise one production-like path: login surface → protected nested layout → dashboard/table/filter/form screen → direct deep link → loading/error/404.
3. Run the objective production-ready gate. Fix only defects that make a MUST criterion fail.
4. When the gate reports READY, freeze NissiUI feature work.

No pending Router phase is on this critical path.

Recommended capabilities: Developer, QA, Reviewer. Add UX only if the smoke flow exposes a usability/accessibility defect; add Security only if authorization/guard behavior changes.

Reasoning class: standard for the smoke fixture; advanced only for a confirmed routing architecture defect.

Expected context scope: package exports/scripts, auth, layout, permissions, routes public APIs, and the smoke fixture. Do not load the complete component catalog or Git history.

## HORIZON 2 — FIRST COMMERCIAL SHEVAJ PRODUCT

Run Shevaj commercial product discovery and a Top-5 market analysis before selecting the first paid problem. Define the smallest validated workflow only after that comparison, then build it using frozen NissiUI primitives. No product—including Tesorería—is selected by this roadmap update. Product-owned backend authorization, data model, auditability and domain correctness belong here, not in NissiUI.

## HORIZON 3 — Online Acquisition / Sales Funnel

After the sellable workflow is credible: landing page, positioning, pricing hypothesis, lead capture and direct sales outreach. Do not wait for Router feature parity.

## HORIZON 4 — Automated Onboarding / Support

Automate tenant/user onboarding, guided setup and support only after repeated customer steps are observed. Avoid automating an unvalidated process.

## HORIZON 5 — Post-Revenue Platform Improvements

Reopen NissiUI/Router phases only when customer usage, product defects, support cost or measured performance supplies evidence. Commercial classification can then be recalculated.

## Commercial classification of pending Router phases

| Phase | Technical priority | Commercial priority | What it enables | Real product scenario | Required for first product? | Can first customer use Nissi without it? | Dependencies | Risk of postponing | Effort | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 08 | P1 | C — POST_LAUNCH | Enriched navigation intent | Advanced transition coordination | NO | YES | Unknown explicitly | Low; core navigation works | MEDIUM | DEFER |
| 09 | P1 | C — POST_LAUNCH | Route actions and automatic invalidation | Submit payment workflow and refresh route data | NO | YES | Phase 03 inferred | Product owns mutation plumbing initially | LARGE | DEFER |
| 10 | P1 | C — POST_LAUNCH | Optimistic state and rollback | Immediate UI after a mutation | NO | YES | Phase 09 inferred | Slightly slower feedback; correctness can remain explicit | LARGE | DEFER |
| 11 | P2 | C — POST_LAUNCH | Named/parallel outlets | Side-by-side route surfaces | NO | YES | Phases 01, 02, 03 | Use ordinary nested routes/panels | LARGE | DEFER |
| 12 | P2 | C — POST_LAUNCH | URL-addressable modal/intercepted routes | Open invoice detail as a modal deep link | NO | YES | Phase 11 inferred | Use a normal route or controlled dialog | LARGE | DEFER |
| 13 | P1 | C — POST_LAUNCH | `statePolicy`, keep-alive and LRU | Preserve complex filters/drafts across navigation | NO | YES | Phases 01, 03 inferred | Product may lift state or reload | LARGE | DEFER |
| 14 | P0 | B — HIGH_VALUE_BEFORE_SALES | Shallow/selective query navigation | Change table filters without unrelated loader work | NO | YES | Phases 01, 06 complete | Possible extra requests/remounts, not loss of capability | MEDIUM | BUILD_IF_TIME |
| 15 | P1 | B — HIGH_VALUE_BEFORE_SALES | Prioritized/cancelable prefetch | Faster movement among common treasury screens | NO | YES | Phases 02–04 inferred | Perceived latency may be higher | LARGE | BUILD_IF_TIME |
| 16 | P1 | C — POST_LAUNCH | Persistent layouts with mount tests | Retain nested workspace UI | NO | YES | Phases 01, 13 inferred | Product can manage state explicitly | LARGE | DEFER |
| 17 | P2 | D — EXPERIMENTAL / MAYBE_NEVER | View Transition enhancement | Animated screen changes | NO | YES | Phase 01 | Negligible commercial risk | MEDIUM | MAYBE_NEVER |
| 18 | P1 | B — HIGH_VALUE_BEFORE_SALES | Structured runtime events | Diagnose failed/stale navigation in support | NO | YES | Phase 01 | Harder Router-level diagnostics; product logging still works | MEDIUM | BUILD_IF_TIME |
| 19 | P1 | D — EXPERIMENTAL / MAYBE_NEVER | Optional Router DevTools | Specialized visual debugging | NO | YES | Phase 18 | Developer convenience only | LARGE | MAYBE_NEVER |
| 20 | P1 | C — POST_LAUNCH | Manifest and route inspection | Dynamic menus/tooling inspect routes | NO | YES | Phase 05 inferred | Static configuration remains sufficient | MEDIUM | DEFER |
| 21 | P2 | C — POST_LAUNCH | Controlled enterprise module registry | Add modules dynamically to a large platform | NO | YES | Phases 04, 20 inferred | First product can register statically | LARGE | DEFER |
| 22 | Closure | C — POST_LAUNCH | Complete public docs, benchmarks and release closure | Publish the full Router program | NO | YES | Phases 08–21 | Full Router program remains unfinished internally | LARGE | DEFER |

### Pre-sales cost governance

| Phase | Recommended capabilities | Reasoning class | Expected context scope |
| --- | --- | --- | --- |
| 14 | Architect, Developer, QA, Reviewer | advanced | transition diff, search codecs, route runtime and their focused tests/docs |
| 15 | Architect, Developer, QA, Reviewer | advanced | scheduler, cache, lazy modules, prefetch path and focused tests/docs |
| 18 | Architect, Developer, QA, Reviewer | advanced | route runtime lifecycle, proposed event contract and focused tests/docs |

These B phases are not on the critical path and remain deferred unless spare capacity or product evidence justifies them.

## Phase 14 revenue decision

**DEFER.** It is the correct next technical phase but not the best next Time-to-Revenue task. The product already has typed search and selective loader dependencies. Phase 14 improves efficiency; it does not unlock a missing first-customer workflow. A packaged consumer smoke test removes more commercial risk with less scope.

## STOP PLATFORM DEVELOPMENT WHEN

Stop when `PRODUCTION-READY-GATE.md` reports READY and no confirmed P0 platform defect blocks the production-like consumer flow. Move resources immediately to Product, customer validation, landing, pricing, onboarding and sales. Reopen NissiUI only for a production blocker, material security issue, essential maintainability issue or measured acceleration of product delivery.

Horizon 1 closure status: **COMPLETED** on 2026-09-10 with a 12/12 READY gate and successful external packaged-consumer validation.
