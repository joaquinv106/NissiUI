# Current baseline

Date: 2026-09-10

| Command | Status | Warnings/errors | Observations |
| --- | --- | --- | --- |
| `npm install` | PASS | None | Existing dependency tree was up to date before integration. |
| `npm run typecheck` | PASS | None | Strict TypeScript completed. |
| `npm run lint` | NOT DEFINED | No script exists | No equivalent lint command was invented. |
| `npm test` | PASS | jsdom printed three expected “Not implemented: navigation” notices | 53 files, 333 tests passed. |
| `npm run build` | PASS | First sandboxed attempts hit EPERM while cleaning `dist`; unrestricted retry passed | Vite built ESM/CJS and declarations. |
| `npm run check:package` | PASS | None | ESM, CommonJS, NodeNext/Bundler, SSR/client directives and tree shaking passed. |

Inspected scope: `package.json`, `tsconfig.json`, Vite configs, `src/`, `docs/`, benchmarks and route/layout/navigation architecture. No Router code was modified to obtain PASS.
