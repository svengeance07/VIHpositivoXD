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
- Build/typecheck: `pnpm build` (production config; budgets are 500 kB warning / 1 MB error, current bundle ~296 kB).
- All tests: `pnpm test --watch=false`. `--watch` defaults to true only in a TTY.
- Single test file: `pnpm test --watch=false --include app/app.spec.ts` (path is relative to `src/`). Filter by suite/test name with `--filter "^App"`.
- Visual review & screenshots: `pnpm visual:capture` (or `node scripts/visual-capture.mjs`). Captures all key views with Playwright across desktop and mobile, outputting to `.visual-review/captures/`.
- Format: `pnpm format`; verify with `pnpm format:check`. No linter is configured, so `pnpm build` is the typecheck gate.

## UI & Spartan / shadcn / Vercel (Obsidian Dark Mode) Design System (verified)

- Do **not** use `<ca-*>` custom elements from `caustica-design` (`<ca-button>`, `<ca-icon>`, `<ca-modal>`, `<ca-tabs>`, `<ca-collapse>`) or `@import 'caustica-design/css';`.
- All views use standard native HTML elements styled by `src/styles.css` and component stylesheets:
  - Buttons: `<button type="button" class="btn btn-primary | btn-secondary | btn-ghost | btn-danger">` (or `<a class="btn ...">`).
  - Icons: `<span class="ui-icon" data-icon="<name>" aria-hidden="true"></span>` (or `[attr.data-icon]="..."`), which loads SVGs via CSS `mask-image` from `/icons/*.svg` (`public/icons/`).
  - Modals: `@if (abierto()) { <div class="ui-modal-backdrop" (click)="cerrar()"><div class="ui-modal-container" (click)="$event.stopPropagation()">...</div></div> }`.
  - Collapsibles: `<details class="ui-collapse"><summary class="ui-collapse__trigger">...</summary><div class="ui-collapse__panel">...</div></details>`.
- Surface tokens: `src/styles.css` defines canonical **Spartan / shadcn / Vercel Obsidian Dark Mode** semantic tokens (`--background: #000000`, `--background-subtle: #050507`, `--foreground: #fafafa`, `--card: #09090b`, `--card-elevated: #121215`, `--muted: #141417`, `--muted-foreground: #a1a1aa`, `--border: #27272a`, `--border-strong: #3f3f46`, `--primary: #fafafa`, `--primary-foreground: #09090b`, `--secondary: #18181b`, `--radius-sm`, `--radius-md`, `--radius-lg`) so all views render with predominant black/dark-zinc surfaces, crisp white/gray text, and `1px solid #27272a` hairline borders.

## UI rules

- Follow the **Spartan / shadcn / Vercel (Obsidian Dark Mode)** design philosophy (`spartan-shadcn-ui`, `impeccable`, `taste`, `emil-kowalski-animations` skills): predominant `#000000` / `#09090b` dark surfaces, crisp `#fafafa` white and `#a1a1aa` zinc-gray typography, `1px solid #27272a` hairline borders, stark white `#fafafa` primary buttons (`color: #09090b`), dark zinc `#18181b` secondary buttons, flush `1px` bento metric strips, and zero decorative blur/glass or neon gradients.
- **Micro-interacciones y física (Emil Kowalski & Taste)**:
  - Curva de desaceleración unificada: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`.
  - Compresión táctil física: `.btn:active`, pestañas y disparadores de búsqueda comprimen sutilmente a `scale(0.975)` en 60ms.
  - Telemetría en vivo: pulso sutil `livePulseGlow` en `.punto-verde`.
  - Cuidado de valores por defecto del navegador: scrollbars oscuros finos, color de cursor `#fafafa`, `::selection` en alto contraste y respeto estricto de `@media (prefers-reduced-motion: reduce)`.
- **Evitar redundancia en botones y navegación**:
  - La **Barra Superior** (`.barra-superior`) es el **único canal de navegación entre módulos** (fila 2 de pestañas horizontales), además de albergar en fila 1 el contexto, telemetría en línea (`● En línea`), disparador de búsqueda rápida (`Ctrl+K`), identidad y botón único de salida (`Salir`). No colocar botones de acción en fila 1 que dupliquen las pestañas de abajo.
  - La **Barra Lateral** (`aside.barra`) es la **Consola Operativa y Telemetría en Vivo** (no repite enlaces de navegación ni botón de salida): proporciona telemetría en tiempo real, centro de alertas e incidencias críticas, acciones rápidas (exportación de auditoría/censo JSON, sincronización local) y atajos de teclado (`Ctrl+K`, `Esc`).
- Reuse semantic tokens from `src/styles.css` (`--background`, `--card`, `--border`, `--primary`, `--primary-foreground`, `--secondary`, `--muted-foreground`). See the `spartan-shadcn-ui` and `impeccable` skills.

## OpenCode setup

- Project config is `.opencode/opencode.json` (JSON/JSONC); `.opencode/config.json` is not recognized.
- Skills load from `.opencode/skills/<id>/SKILL.md` and `.agents/skills/<id>/SKILL.md`; the ID is the directory name. Current: `spartan-shadcn-ui`, `angular-best-practices`, `impeccable`, `emil-kowalski-animations`, `taste`, `playwright-visual-review`.
- Custom agents, if added, go in `.opencode/agents/<name>.md`; `.opencode/agents.md` is ignored.
- V2 loads `AGENTS.md` only — it does not fall back to `CLAUDE.md`.
