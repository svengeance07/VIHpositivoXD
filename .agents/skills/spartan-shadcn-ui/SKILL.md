---
name: spartan-shadcn-ui
description: Use when building, redesigning, or reviewing Angular views following the spartan-ng (https://github.com/spartan-ng/spartan) Brain + Helm architecture and the shadcn/ui + Vercel Geist Obsidian Dark Mode visual philosophy.
---

# Spartan / shadcn-ui & Vercel Design System for Angular (Obsidian Dark Mode)

This skill defines the architecture, layout patterns, and visual standards for building Angular 22 (standalone, zoneless, signals) interfaces modeled after **[spartan-ng/spartan](https://github.com/spartan-ng/spartan)** (`@spartan-ng/brain` + `@spartan-ng/helm`), **shadcn/ui**, and **Vercel Geist (Obsidian Dark Mode)**.

---

## 1. Core Architecture: The Two-Layer Spartan Model (`Brain` + `Helm`)

Spartan separates accessible headless behavior from owned, token-driven styling:

1. **Brain Layer (Headless Behavior & Accessibility):**
   - Handles focus management, keyboard navigation, ARIA states (`aria-selected`, `aria-expanded`, `aria-current`), and native HTML primitives (`<button class="btn ...">`, `<span class="ui-icon" data-icon="...">`, `<details class="ui-collapse">`, and `@if (...)` modal dialogs). Do **not** use `<ca-*>` custom elements from `caustica-design`.
   - Driven reactively by Angular Signals (`signal`, `computed`) in zoneless components (`ChangeDetectionStrategy.OnPush`).

2. **Helm Layer (`hlm` Owned Styling & Semantic Tokens):**
   - All visual styling is owned directly in project CSS (`src/styles.css` and component stylesheets) and bound to semantic **background / foreground** CSS custom properties.
   - Never lock styling behind opaque decorative wrappers; use semantic variables (`--background`, `--foreground`, `--card`, `--muted`, `--border`, `--primary`, `--primary-foreground`, `--secondary`, `--ring`) so every surface, table, badge, control, and shell shares one cohesive visual grammar.

---

## 2. Visual Philosophy: shadcn/ui + Vercel Geist (Obsidian Dark Mode)

All views (`/master`, `/SRS`, `/PS`, and public routes `/`, `/login`, `/consulta`) follow an **Operate-first, high-craft Obsidian Dark Mode shadcn / Vercel aesthetic**:

- **Predominant Black & Dark Zinc Surfaces:** Deep black canvas (`--background: #000000`, `--background-subtle: #050507`), dark zinc cards and panels (`--card: #09090b`, `--card-elevated: #121215`), and crisp `1px solid #27272a` (`--border`) architectural hairlines.
- **High-Contrast White & Gray Typography:** Pure white primary text (`--foreground: #fafafa`) and readable zinc-gray secondary text (`--muted-foreground: #a1a1aa`, `--faint: #71717a`). Never place dark text (`#09090b`, `#0f172a`, `#047857`) on dark backgrounds, and never place white text (`#ffffff`) on `--primary` (`#fafafa`) without using `--primary-foreground` (`#09090b`).
- **No Frosted Glass or Decorative Gradients:** Never use `backdrop-filter: blur()`, `linear-gradient()`, or `radial-gradient()` on cards, panels, avatars, or buttons.
- **Flush 1px Hairline Bento Grids:** KPI strips (`.metricas`, `.master-resumen`, `.srs-metricas`, `.ps-metricas`) and bento feature grids use `gap: 1px; background-color: var(--border); border: 1px solid var(--border); overflow: hidden;` with `background-color: var(--card)` cells.
- **Stark White Primary Actions & Dark Zinc Secondary Controls:**
  - Primary actions (`.btn-primary`) use stark white (`--primary: #fafafa`, `--primary-foreground: #09090b`, `font-weight: 600`).
  - Secondary controls (`.btn-secondary`, `.btn`) use dark zinc (`--secondary: #18181b`, `--secondary-foreground: #fafafa`, `border: 1px solid var(--border)`).
  - Semantic status tokens use luminous high-contrast hues on dark tinted surfaces: Emerald (`--ok: #4ade80`), Amber (`--warn: #fbbf24`), Red (`--danger: #f87171`), and Zinc (`--info: #e4e4e7`).
- **Typography & Tabular Data Discipline:**
  - Workhorse UI sans (`'Inter'`, `'Geist'`, `system-ui`) across headings, labels, controls, and tables.
  - Heading scale uses tight tracking (`-0.03em`), clear weight contrast (`600`), and no uppercase eyebrow kickers (`text-transform: uppercase`) above headings.
  - **Mandatory `font-variant-numeric: tabular-nums`** on all metrics, KPI values, cedulas, dates, and table cells.

---

## 3. Canonical Design Tokens (`src/styles.css`)

```css
:root,
html,
html[data-theme='dark'],
body {
  color-scheme: dark;

  --background: #000000;
  --background-subtle: #050507;
  --foreground: #fafafa;

  --card: #09090b;
  --card-elevated: #121215;
  --card-foreground: #fafafa;

  --primary: #fafafa;
  --primary-foreground: #09090b;
  --primary-hover: #e4e4e7;

  --secondary: #18181b;
  --secondary-foreground: #fafafa;
  --secondary-hover: #27272a;

  --muted: #141417;
  --muted-foreground: #a1a1aa;

  --border: #27272a;
  --border-strong: #3f3f46;
  --input: #27272a;
  --ring: #fafafa;

  --ok: #4ade80;
  --warn: #fbbf24;
  --danger: #f87171;
  --info: #e4e4e7;

  --radius-sm: 0.375rem; /* 6px - inputs, buttons, badges */
  --radius-md: 0.5rem; /* 8px - cards, tables, panels */
  --radius-lg: 0.625rem; /* 10px - modals, shells */
}
```

---

## 4. Layout & Component Recipes (`hlm` Equivalents)

### 4.1 Role App Shells (`/master`, `/SRS`, `/PS`)

- **Two-Tier Vercel Top Command Header (`.barra-superior`):**
  - Row 1 (`.barra-superior__top`): Institutional slash breadcrumbs (`V / Rol / Contexto`) on the left; contextual quick-action buttons + user identity pill + `Salir` button on the right.
  - Row 2 (`.barra-superior__tabs`): Horizontal Vercel navigation tab bar with active white bottom border indicator (`border-bottom: 2px solid var(--foreground)`).
- **Collapsible Dark Left Rail (`.barra`):** Sticky left rail (`background: #050507`, `border-right: 1px solid var(--border)`). Width `15.5rem` expanded, `3.75rem` collapsed (`min-width: 0; overflow: hidden` so collapsed active items never clip).
- **Framed Command Page Headers (`app-master-encabezado`, `app-srs-encabezado`, `app-ps-encabezado`):** Dark `#09090b` header frame with `1px solid var(--border)` and a grouped action button bar on the right.

### 4.2 Public Views (`/`, `/login`, `/consulta`)

- Sticky top command bar (`height: 3.5rem`, `background: rgba(0, 0, 0, 0.88)`, `border-bottom: 1px solid var(--border)`).
- Architectural grid frames with centered hero stages, horizontal CTA button bars, and flush `1px` hairline 3-column bento grids.

---

## 5. Verification Checklist

Before completing any UI task:

1. Run `.agents\skills\impeccable\scripts\impeccable.cmd detect src/ --json` to ensure zero design-system anti-patterns (`[]`).
2. Run `pnpm build` and `pnpm test --watch=false` to verify all components compile and unit tests pass.
3. Update `docs/` if routes, layouts, or documented visual patterns changed.
