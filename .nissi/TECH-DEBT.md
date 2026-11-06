# Technical debt

Record owner, impact, and intended resolution for each item.

No Router technical-debt item was added beyond the evidence-backed risks and gaps in `.nissi/workstreams/advanced-router/`. Owners and resolution dates are UNKNOWN.

## Consumer feedback backlog — Shevaj Food (Horizon 2), 2026-09-11

NissiUI feature development is frozen per `PROJECT_CONTEXT.md`'s Production Ready V1 baseline freeze; these items are captured now, from real consumer usage, and queued for whenever the freeze lifts. Nothing below has been fixed yet. Ordered most urgent first.

### 1. `NStepFlow.renderActions` silently ignores `null` — duplicate action bars (HIGH — silent correctness bug)

- Owner: unassigned.
- Status: OPEN.
- Impact: the internal implementation resolves actions as `renderActions?.(context) ?? <default action bar>`. Because `??` only treats `null`/`undefined` as "absent," a consumer step that wants to suppress the default Previous/Next/Complete bar and returns `null` from `renderActions` gets **both** the default bar and their own custom actions rendered at once — silently, with no TypeScript error and no runtime warning. This is a real trap: `null` is the conventional React idiom for "render nothing," so the failure mode is surprising and easy to ship unnoticed (found only by inspecting the built `dist/components/step-flow/NStepFlow.js` output directly, not from any type signature or doc).
- Evidence: `NissiPlatform/src/onboarding/OnboardingPage.tsx` had to return `<></>` (empty fragment) instead of `null` for its "organizacion" step specifically to work around this, with a code comment explaining why.
- Resolution: either treat `renderActions` returning `null` as "render nothing" (i.e. use `"renderActions" in props ? renderActions(context) : <default>` or an explicit sentinel), or document the `null`-vs-empty-fragment distinction prominently wherever `renderActions` is typed/documented, plus a dev-mode warning if practical.

### 2. `NloginPage`/`NauthLayout` default to nissi-ui's own brand identity (HIGH — white-label correctness risk)

- Owner: unassigned.
- Status: OPEN.
- Impact: when a consumer doesn't explicitly pass `logo` and `brandName`, `NloginPage` falls back to nissi-ui's own bundled mark (`docs/assets/nissi-mark.png`) and the literal string `"Nissi UI"` as `brandName` (see `defaultNloginPageLabels` in the built component). For a white-label/multi-tenant host like NissiPlatform (whose actual end-user-facing product is "Shevaj," with "Nissi" meant to stay a purely internal/technical concept), forgetting either prop means the library's own branding leaks onto a real customer-facing login/registration screen. This happened for real in this session — NissiPlatform's `LoginPage`/`RegisterPage` shipped with `brandName="NISSI PLATFORM"` and the default mark visible to end users until caught and fixed.
- Resolution: consider making `brandName` (and ideally `logo`) required props with no default, or emit a dev-mode console warning when the defaults are used, so a consumer notices before shipping rather than after a real user sees it.

### 3. `NKanban` has no rich/custom card-body slot (MEDIUM — forces full opt-out for operational boards)

- Owner: unassigned.
- Status: OPEN.
- Impact: `NKanban` cards only accept plain-string `title`/`description`/`meta`, plus a `renderCardActions(card, column)` slot for action buttons — there is no `renderCard`/full-body override. Any consumer needing structured card content (a line-item list, per-line notes, images, multiple badges — not just a caption and one meta line) cannot use `NKanban` at all for that case and must hand-roll the whole board from primitives.
- Evidence: NissiPlatform's Shevaj Food kitchen board (order tickets: items, quantities, selected options, urgency badges, claim state) needed exactly this and ended up as a fully custom component (`src/food/kitchen/KitchenBoardView.tsx` + `KitchenTicketCard.tsx`) instead of using `NKanban`.
- Resolution: add an optional `renderCard(card, column)` full-body override, analogous to the existing `renderCardActions`, so richer domains can still reuse `NKanban`'s column/board scaffolding.

### 4. `NKanban`'s only mobile layout is horizontal-scrolling fixed-width columns (MEDIUM — wrong metaphor for phone-first single-operator boards)

- Owner: unassigned.
- Status: OPEN.
- Impact: on narrow viewports `NKanban` still renders one `17rem`-minimum-width column per stage with horizontal scroll between them (confirmed in the built component's styles). That's a reasonable default for a manager glancing at an overview, but it's the wrong interaction model for a single person operating a board from their own phone one task at a time (e.g. a kitchen line cook) — you want a single filterable vertical list, not horizontal swiping between columns while your hands are busy.
- Evidence: same Shevaj Food kitchen board as item 3 — the custom replacement specifically implements a vertical filterable list below the `lg` breakpoint and a column grid above it, because `NKanban` itself doesn't offer that.
- Resolution: consider an opt-in `mobileLayout: "columns" | "list"` prop, or at minimum document that `NKanban` targets manager/overview use cases and point single-operator/mobile-first consumers elsewhere.

### 5. `NHeader` nav items are `onClick`-only, no `href` semantics (LOW-MEDIUM — easy trap, wastes time until known)

- Owner: unassigned.
- Status: OPEN.
- Impact: `NHeaderNavItem`/`NHeaderAction` render without calling `preventDefault()`, so a consumer who instinctively reaches for `href`-based navigation (or wraps a raw `<a href>`) gets full page reloads instead of SPA navigation, with no error to signal the mistake — just a working-looking but wrong result until someone notices the reload.
- Evidence: NissiPlatform's `MarketingLayout.tsx` shipped this exact bug initially; fixed by switching every nav item to `onClick: () => navigate(...)` with no `href`.
- Resolution: add an explicit callout in the header docs ("use `onClick`, not `href` — this component does not call `preventDefault()`") right next to the prop signature, with a visible example of SPA-router integration.

### 6. Nothing nudges a new consumer project toward `AGENTS.md`/`PROJECT_CONTEXT.md` before writing code (LOW — process/ecosystem gap)

- Owner: unassigned.
- Status: OPEN.
- Impact: the onboarding docs (`AGENTS.md`, `PROJECT_CONTEXT.md`, `AI_CONTEXT.md`, `llms.txt`) are thorough once found, but nothing on the *consuming* project's side surfaces them proactively — an agent working in a fresh consumer repo (e.g. NissiPlatform) can easily start writing raw Chakra UI instead of the documented `N*` components simply because it never discovered these files existed inside `node_modules/nissi-ui`. This happened for a meaningful stretch of NissiPlatform's Shevaj Food build before being caught and corrected.
- Resolution: not obviously fixable from inside `nissi-ui` alone (a `postinstall` console message is the closest lever, with real tradeoffs — noisy installs, easy to miss in CI logs). Worth a deliberate decision rather than a silent non-fix; flagged here so it isn't lost.
