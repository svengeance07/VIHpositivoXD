# AGENTS.md

## Stack and layout

- Angular 22 + TypeScript 6, standalone components, zoneless (no `zone.js` dependency; drive state with signals so renders trigger).
- Files follow the 2025 style guide: `src/app/app.ts`, `app.html`, `app.spec.ts` — no `.component` suffix.
- App lives at the repo root: `src/` (source), `public/` (static), `angular.json`, `package.json`. Tests run with Vitest through `@angular/build:unit-test`.
- pnpm only. `pnpm-workspace.yaml` holds the lockfile/build-script allowlist.

## Project structure and stage

- Current stage: views and navigation only. Landing, login, the master role and `/PS` are implemented with mock data; `/SRS` and `/consulta` are placeholders. No backend, no real auth, no guards or permission enforcement yet.
- The database schema is **reference only and partial**: `docs/referencias/db_schema.sql` (received 2026-10-25) and `docs/diseno/modelo-datos.md`. Do not create migrations, ORM models, connections, or seeders yet.
- Each role owns its folder under `src/app/roles/`: `master` (`/master`), `personal-salud` (`/PS`), `subregion-salud` (`/SRS`), each with `shell/` and `paginas/`.
- Shared code lives in `src/app/nucleo` (models, mock data, services) and `src/app/compartido` (reusable UI); `src/app/publico` holds landing, login and consulta.
- `/login` simulates authentication against `nucleo/datos/cuentas-acceso.ts` through `SesionService`. Roles 2 and 3 validate the entity account and then the jefe/trabajador profile. There is no backend and credentials are fake; see `docs/diseno/credenciales-demo.md`. The two-level flow is kept: `cuentas_entidad` (a proposed table, not in the received script) would hold entity credentials and `jefe_id`, while profiles remain rows of `personal` with `tipo_cuenta` (2/3).
- Hardcoded data belongs in `nucleo/datos`, exposed through signal-based services in `nucleo/servicios`. Components never import mock arrays directly.
- `app.routes.ts` is composition only, using lazy `loadChildren` per role.
- Details and pending decisions: `docs/arquitectura.md`.

## Data model (reference, not implemented)

- Source of truth: `docs/referencias/db_schema.sql` (partial, 16 tables). Reading and gaps: `docs/diseno/modelo-datos.md`. The old `docs/diseno/modelo-datos-preliminar.md` is historical.
- `usuarios` = citizens, not accounts. Internal accounts are `personal` (roles 2/3) and `master` (role 1). A `cuentas_entidad` table is proposed for the entity-level login; it is not in the received script.
- A subregion is a `centros_salud` row with a future `tipo` column (2 = centro, 3 = subregion; one per state), not a separate table. Its staff are `personal` with `tipo_cuenta = 3`. The establishment type (hospital, ambulatory, CDI) is expressed in the name, not in a column.
- Jefe/trabajador is not a column: there is one jefe per center, derived from `centros_salud.encargado_id` (jefe = encargado). `usuarios.sexo`, `usuarios.creado_en` and `centros_salud.tipo` are agreed additions.
- Missing from this delivery: lotes/stock, certificados, movimientos, búsquedas and incidencias. Do not design their final columns or implement them yet.
- Do not edit the SQL reference by hand. Record schema changes and open questions in `docs/diseno/modelo-datos.md`.

## Commands (verified)

- Install: `pnpm install`. If a dependency has build scripts, add it to `allowBuilds` in `pnpm-workspace.yaml` (or set it to `false` when the script is unnecessary); otherwise install fails with `ERR_PNPM_IGNORED_BUILDS`.
- Dev server: `pnpm start` → http://localhost:4200.
- Build/typecheck: `pnpm build` (production config; budgets are 500 kB warning / 1 MB error, current bundle ~403 kB).
- All tests: `pnpm test --watch=false`. `--watch` defaults to true only in a TTY.
- Single test file: `pnpm test --watch=false --include app/app.spec.ts` (path is relative to `src/`). Filter by suite/test name with `--filter "^App"`.
- Format: `pnpm format`; verify with `pnpm format:check`. No linter is configured, so `pnpm build` is the typecheck gate.

## Caustica Design integration (verified)

- `caustica-design` ships light-DOM custom elements for Angular, not Angular components. Use only `caustica-design/css` and `caustica-design/angular`; ignore its React/Vue entries.
- CSS is imported once at the top of `src/styles.css` via `@import 'caustica-design/css';`. `angular.json` lists only `src/styles.css` — package specifiers are rejected in the `styles` array.
- `provideCaustica()` runs in `src/main.ts` before `bootstrapApplication`; it registers the elements at runtime.
- `CUSTOM_ELEMENTS_SCHEMA` is set on `App`. Add it to any other component whose template uses `<ca-*>` elements.
- `src/index.html` sets `data-theme="light"` on `<html>` and wraps the app in `.ca-root`.
- Registered tags: `<ca-button>`, `<ca-icon>`, `<ca-modal>`/`<ca-modal-close>`, `<ca-tabs>`/`<ca-tabs-trigger>`/`<ca-tabs-content>`, `<ca-collapse>`/`<ca-collapse-trigger>`/`<ca-collapse-panel>`.
- Glass knobs: `--ca-blur-glass`, `--ca-glass-fill`, `--ca-glass-edge`; recolor with `--ca-hue`, `--ca-chroma`. Avoid nesting many blurred surfaces.
- `<ca-icon>` loads SVGs from `/icons/*.svg`; the 30 icons are already copied from `caustica-design/dist/icons` into `public/icons/`.
- `caustica-design` 1.0 no incluye `layouts` ni `eyedropper` en `ICON_NAMES` aunque sus clases y SVG sí existen. Para esos dos, añade `class="ui-icon ui-icon--<nombre>"` al `<ca-icon>` (o una clase dinámica equivalente) para que se rendericen.

## UI rules

- Reuse `<ca-*>` elements; create a standalone component only when no caustica element fits, and build it from caustica elements and tokens.
- Keep the liquid-glass look consistent: reuse tokens instead of hard-coding blur, tint, border, or shadow values. See the `liquid-glass-ui` skill.

## OpenCode setup

- Project config is `.opencode/opencode.json` (JSON/JSONC); `.opencode/config.json` is not recognized.
- Skills load from `.opencode/skills/<id>/SKILL.md`; the ID is the directory name. Current: `liquid-glass-ui`, `angular-best-practices`.
- Custom agents, if added, go in `.opencode/agents/<name>.md`; `.opencode/agents.md` is ignored.
- V2 loads `AGENTS.md` only — it does not fall back to `CLAUDE.md`.
