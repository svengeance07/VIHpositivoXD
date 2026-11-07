# AGENTS.md

## Mandatory pre-flight check (Read `docs/` first)

- Before modifying any component, route, model, or service in `src/`, you MUST read the relevant documentation in `docs/`:
  - `docs/arquitectura.md` — architecture, roles, state persistence, and pending decisions.
  - `docs/diseno/vistas.md` — routes, screens, and UI behavior per role (`/master`, `/PS`, `/SRS`, `/consulta`).
  - `docs/diseno/modelo-datos.md` — database schema mapping, business rules, and entity relationships.
  - `docs/diseno/credenciales-demo.md` — when touching `/login`, `SesionService`, or account/profile creation flows.
- Never contradict the domain rules or data model documented in `docs/diseno/modelo-datos.md`.
- After completing structural, routing, or functional changes, update the corresponding `.md` files in `docs/` to keep documentation in sync.

## Stack and layout

- Angular 22 + TypeScript 6, standalone components, zoneless (no `zone.js` dependency; drive state with signals so renders trigger).
- Files follow the 2025 style guide: `src/app/app.ts`, `app.html`, `app.spec.ts` — no `.component` suffix.
- App lives at the repo root: `src/` (source), `public/` (static), `angular.json`, `package.json`. Tests run with Vitest through `@angular/build:unit-test`.
- pnpm only. `pnpm-workspace.yaml` holds the lockfile/build-script allowlist.

## Project structure and stage

- Current stage: views and navigation only. Landing, login, `/consulta`, the master role, `/PS` and `/SRS` are implemented with mock data. Public certificate email delivery is simulated; no real email or verification code. No backend, no real auth, no guards or permission enforcement yet.
- The database schema is **design only**: `docs/referencias/db_schema.sql` is the working schema (16 received tables plus proposed extensions) and `docs/diseno/modelo-datos.md` explains it. The received copy is frozen in `docs/referencias/db_schema_original_2026-10-25.sql`. Do not create migrations, ORM models, connections, or seeders yet.
- Each role owns its folder under `src/app/roles/`: `master` (`/master`), `personal-salud` (`/PS`), `subregion-salud` (`/SRS`), each with `shell/` and `paginas/`.
- Shared code lives in `src/app/nucleo` (models, mock data, services) and `src/app/compartido` (reusable UI); `src/app/publico` holds landing, login and consulta.
- `/login` simulates direct authentication in two steps (choose role 1/2/3 → enter email and password) against `nucleo/datos/cuentas-acceso.ts` through `SesionService`. Neither Subregión de Salud (`SRS`, role 3) nor Centro de Salud (`PS`, role 2) has sub-users assigned; each entity consists solely of its single Jefe / Encargado user (`centros_salud.encargado_id`), who logs in directly via `personal` (`tipo_cuenta = 2` or `3`). See `docs/diseno/credenciales-demo.md`.
- Hardcoded data belongs in `nucleo/datos`, exposed through signal-based services in `nucleo/servicios`. Components never import mock arrays directly.
- `app.routes.ts` is composition only, using lazy `loadChildren` per role.
- Details and pending decisions: `docs/arquitectura.md`.

## Data model (reference, not implemented)

- Source of truth: `docs/referencias/db_schema.sql` (working schema: 16 received tables plus proposed extensions). Reading, flows and gaps: `docs/diseno/modelo-datos.md`. The old `docs/diseno/modelo-datos-preliminar.md` is historical.
- `usuarios` = citizens, not accounts. Internal accounts are `personal` (roles 2/3, corresponding to the single Jefe of each center or subregion) and `master` (role 1).
- A subregion is a `centros_salud` row with `tipo` (2 = centro, 3 = subregion; one per state), not a separate table. Its Jefe is a `personal` row with `tipo_cuenta = 3`. The establishment type (hospital, ambulatory, CDI) is expressed in the name, not in a column.
- Single user per entity: there are no subordinate worker sub-accounts in `PS` or `SRS`; each center or subregion has one Jefe (`centros_salud.encargado_id`). `usuarios.sexo`, `usuarios.creado_en`, `usuarios.activo` and `centros_salud.tipo` are agreed additions.
- `certificados_salud`, `notificaciones_srs` and `certificado_envios` are proposed. The SRS inbox only gets requests whose requirements are complete; no expiry/ESAVI/system notifications. Certificate email is simulated and has no verification code.
- Still missing: lotes/stock, movimientos, búsquedas históricas and incidencias. Do not design their final columns or implement them yet.
- Keep `db_schema_original_2026-10-25.sql` untouched. Add reviewed changes to `db_schema.sql` and document them in `docs/diseno/modelo-datos.md`.

## Commands (verified)

- Install: `pnpm install`. If a dependency has build scripts, add it to `allowBuilds` in `pnpm-workspace.yaml` (or set it to `false` when the script is unnecessary); otherwise install fails with `ERR_PNPM_IGNORED_BUILDS`.
- Dev server: `pnpm start` → http://localhost:4200.
- Build/typecheck: `pnpm build` (production config; budgets are 500 kB warning / 1 MB error, current bundle ~473 kB).
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
- Skills load from `.opencode/skills/<id>/SKILL.md` and `.agents/skills/<id>/SKILL.md`; the ID is the directory name. Current: `liquid-glass-ui`, `angular-best-practices`, `impeccable`.
- Custom agents, if added, go in `.opencode/agents/<name>.md`; `.opencode/agents.md` is ignored.
- V2 loads `AGENTS.md` only — it does not fall back to `CLAUDE.md`.
