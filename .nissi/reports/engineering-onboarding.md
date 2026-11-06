# Nissi Engineering onboarding

Date: 2026-09-10

Package: `@nissi/engineering-department@0.1.0` with v0.1.1 dogfood-foundation changes.

Installation method: a locally built tarball is stored at `.nissi/vendor/nissi-engineering-department-0.1.0.tgz` and referenced as a devDependency with `file:.nissi/vendor/nissi-engineering-department-0.1.0.tgz`.

This was chosen over a live directory link so NissiUI consumes exactly the files that npm packaging would deliver, while remaining offline, reproducible and unpublished. It avoids coupling NissiUI execution to the sibling repository's current `dist` contents.

The first `init` preserved the existing `AGENTS.md`; the second preserved all project-owned seed documents and only refreshed four marked managed resources. Both doctor runs reported HEALTHY.
