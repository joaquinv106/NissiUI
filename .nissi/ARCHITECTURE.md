# Architecture

## Context

Publishable React component library (`nissi-ui`) using Chakra UI v3, strict TypeScript and Vite.

## Components

The Router workstream lives in `src/components/routes/`; `Nlayout` integrates it with the application shell. Full component boundaries remain canonical in `PROJECT_CONTEXT.md`.

## Boundaries

Nroutes is a client SPA router. External frameworks retain URL ownership through `NRouterAdapter`. It is not an SSR/RSC framework.

## Constraints

Preserve flat-route compatibility, public typing, accessibility, i18n labels, SSR safety, package exports and tree shaking. Deployment topology outside the package is UNKNOWN.
