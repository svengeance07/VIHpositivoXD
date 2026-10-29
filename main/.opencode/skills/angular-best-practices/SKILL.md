---
name: angular-best-practices
description: Use when writing, refactoring, or reviewing Angular and TypeScript code in this project.
---

# Angular Best Practices

Baseline: Angular 22, standalone components, zoneless, Vitest, 2025 file naming (`app.ts`, `app.html`, `app.spec.ts`).

- Use standalone components by default; NgModules only for third-party libraries that require them.
- Prefer signals (`signal`, `computed`, `effect` sparingly) and `input()` / `output()` / `model()` over decorator-based inputs and outputs. Rely on signals for state: without zone.js, mutations that bypass signals will not trigger a render.
- Use `inject()` for dependencies instead of constructor parameter lists.
- Set `ChangeDetectionStrategy.OnPush` on components and keep templates free of expensive calls.
- Use built-in control flow (`@if`, `@for` with `track`, `@switch`) instead of `*ngIf` / `*ngFor` in new code.
- Lazy-load feature routes; keep the root component thin and let routed components own their data.
- Keep TypeScript strict: no `any`, explicit return types on public APIs, no non-null assertions used to silence errors.
- Reuse the shared types and folders already defined by the app; do not create parallel structures.
- Follow the configured Prettier setup (`pnpm format`); do not introduce another formatter or a linter ad hoc.
- Put specs next to the source as `*.spec.ts` and use TestBed with the Vitest runner.
