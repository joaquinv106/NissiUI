# Advanced Router dependency map

## Verified and declared path

| Phase | Dependency | Downstream phases | Basis |
| --- | --- | --- | --- |
| 00 | none | 01 | Audit precedes implementation. |
| 01 | 00 | 02, 05, 06, 07, 11, 13, 14, 16, 17, 18 | Branch diff is the transition foundation. Some downstream links are architectural inferences. |
| 02 | 01 | 03, 11, 15 | Scheduler foundation. |
| 03 | 02 | 04, 09, 11, 13, 15 | Cache and invalidation foundation. |
| 04 | 03 | 15, 21 | Lazy module foundation. |
| 05 | 01 | 06, 20 | Typed ids/search/inspection foundation. |
| 06 | 01, 05 | 14 | Phase 14 dependency on branch diff and search dependencies is explicit in the roadmap. |
| 07 | 01 | none currently declared | Blocker phase is complete. |
| 08 | unknown | 22 | Detailed dependencies are not explicit. |
| 09 | 03 (inferred) | 10, 22 | Actions drive invalidation and optimistic state. |
| 10 | 09 (inferred) | 22 | Optimistic state follows actions. |
| 11 | 01, 02, 03 | 12, 22 | Plan says named outlets reuse matcher, scheduler, cache and boundaries. |
| 12 | 11 (inferred) | 22 | Modal/intercepted presentation likely builds on parallel outlets. |
| 13 | 01, 03 (inferred) | 16, 22 | State preservation and LRU reuse identity/cache concepts. |
| 14 | 01, 06 | 22 | Explicit P0 candidate. |
| 15 | 02, 03, 04 (inferred) | 22 | Prefetch priorities reuse scheduler, cache and lazy code. |
| 16 | 01, 13 (inferred) | 22 | Persistent layouts need state policy. |
| 17 | 01 | 22 | Transition enhancement follows transition identity. |
| 18 | 01 | 19, 22 | DevTools consumes structured runtime events. |
| 19 | 18 | 22 | Explicit design relationship. |
| 20 | 05 (inferred) | 21, 22 | Manifest inspection relies on stable route ids. |
| 21 | 04, 20 (inferred) | 22 | Controlled registration uses modules and manifest. |
| 22 | 08–21 | none | Closure requires all functional deliveries and final gates. |

## Integrity findings

- No cycles are present in the recorded graph.
- No declared dependency id is missing.
- Phase 14 appears numerically out of order but not architecturally out of order: the plan explicitly moves it into P0.
- Unknown or inferred relationships are labelled; they are not presented as recovered facts.
