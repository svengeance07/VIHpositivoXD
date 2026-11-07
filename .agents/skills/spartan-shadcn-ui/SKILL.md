---
name: spartan-shadcn-ui
description: Use when building, redesigning, or reviewing Angular views following the spartan-ng (https://github.com/spartan-ng/spartan) Brain + Helm architecture and the shadcn/ui + Vercel Geist visual philosophy.
---

# Spartan / shadcn-ui & Vercel Design System for Angular

This skill defines the architecture and visual standards for building Angular 22 (standalone, zoneless, signals) interfaces modeled after **[spartan-ng/spartan](https://github.com/spartan-ng/spartan)** (`@spartan-ng/brain` + `@spartan-ng/helm`), **shadcn/ui**, and **Vercel Geist**.

---

## 1. Core Architecture: The Two-Layer Spartan Model (`Brain` + `Helm`)

Spartan separates accessible headless behavior from owned, token-driven styling:

1. **Brain Layer (Headless Behavior & Accessibility):**
   - Handles focus management, keyboard navigation, ARIA states (`aria-selected`, `aria-expanded`, `aria-current`), and native HTML primitives (`<button class="btn ...">`, `<span class="ui-icon" data-icon="...">`, `<details class="ui-collapse">`, and `@if (...)` modal dialogs). Do **not** use `<ca-*>` custom elements from `caustica-design`.
   - Driven reactively by Angular Signals (`signal`, `computed`) in zoneless components (`ChangeDetectionStrategy.OnPush`).

2. **Helm Layer (`hlm` Owned Styling & Semantic Tokens):**
   - All visual styling is owned directly in project CSS (`src/styles.css` and component stylesheets) and bound to semantic **background / foreground** CSS custom properties.
   - Never lock styling behind opaque decorative wrappers; use semantic variables (`--background`, `--foreground`, `--card`, `--muted`, `--border`, `--primary`, `--ring`) so every surface, table, badge, control, and shell shares one cohesive visual grammar.

---

## 2. Visual Philosophy: shadcn/ui + Vercel Geist (Zero Liquid Glass)

All views (`/master`, `/SRS`, `/PS`, and public routes `/`, `/login`, `/consulta`) follow an **Operate-first, high-craft shadcn / Vercel aesthetic**:

- **No Frosted Glass or Decorative Blur:** Never use `backdrop-filter: blur()` on cards, panels, tables, or sidebars. Avoid `feTurbulence` noise overlays, radial neon background glows, and translucent glass borders.
- **Hairline 1px Structural Grid:** Define structure through crisp `1px solid var(--border)` borders and intentional surface contrast (`--background` canvas vs. `--card` pure surface vs. `--muted` subtle well).
- **Single Elevation Declaration:** Declare elevation once. Data cards, panels, and tables use `1px solid var(--border)` with `box-shadow: none` (no ghost-card soft drop shadows under 1px borders, and no `translateY(-2px)` hover-lift on containers). Reserve elevation shadows (`--shadow-modal`) strictly for floating overlays (`<ca-modal>`, popovers, mobile drawers).
- **High-Contrast Monochrome Chrome + Semantic Status:**
  - Primary actions use crisp monochrome ink (`--primary: #09090b`, `--primary-foreground: #fafafa` in light mode).
  - Secondary and outline controls use neutral Zinc surfaces (`#ffffff` / `#f4f4f5`) with `1px solid var(--input)` and subtle hover states (`#f4f4f5`).
  - Color is semantic, never decorative: Emerald (`--ok`), Amber (`--warn`), Red (`--destructive` / `--danger`), and Blue (`--info`) indicate clinical statuses, certificate states, and ESAVI severities.
- **Typography & Tabular Data Discipline:**
  - Workhorse UI sans (`'Inter'`, `'Geist'`, `system-ui`) across headings, labels, controls, and tables. No decorative display serif or gradient text.
  - Heading scale uses tight tracking (`-0.025em` to `-0.03em`), clear weight contrast (`600`), and no uppercase eyebrow kickers above headings.
  - Monospace (`var(--font-mono)`) is reserved strictly for codes, batch numbers (`lote`), IDs, and clinical keys.
  - **Mandatory `font-variant-numeric: tabular-nums`** on all metrics, KPI values, cedulas, dates, and table cells.

---

## 3. Canonical Design Tokens (`src/styles.css`)

Define and consume these shadcn/Spartan Zinc tokens globally:

```css
:root,
html[data-theme='light'] {
  --background: #fafafa;
  --foreground: #09090b;

  --card: #ffffff;
  --card-foreground: #09090b;

  --popover: #ffffff;
  --popover-foreground: #09090b;

  --primary: #18181b;
  --primary-foreground: #fafafa;
  --primary-hover: #27272a;

  --secondary: #f4f4f5;
  --secondary-foreground: #18181b;
  --secondary-hover: #e4e4e7;

  --muted: #f4f4f5;
  --muted-foreground: #71717a;

  --accent: #f4f4f5;
  --accent-foreground: #09090b;

  --destructive: #dc2626;
  --destructive-foreground: #fafafa;

  --border: #e4e4e7;
  --border-strong: #d4d4d8;
  --input: #e4e4e7;
  --ring: #18181b;

  --radius-sm: 0.375rem; /* 6px - inputs, buttons, badges */
  --radius-md: 0.5rem; /* 8px - cards, tables, tabs */
  --radius-lg: 0.625rem; /* 10px - panels, modals */
}
```

---

## 4. Component Recipes (`hlm` Equivalents)

### 4.1 App Shell & Sidebar (`/master`, `/SRS`, `/PS`)

- **Sidebar:** Fixed/sticky left rail (`background: var(--card)` or `#fafafa`, `border-right: 1px solid var(--border)`). Width `15.5rem` expanded, `3.75rem` collapsed.
- **Nav Items:** `border-radius: var(--radius-sm)`, `padding: 0.5rem 0.65rem`, `font-size: 0.875rem`, `font-weight: 500`, `color: var(--muted-foreground)`.
  - Hover: `background: var(--accent)`, `color: var(--foreground)`.
  - Active (`routerLinkActive="is-active"`): `background: var(--secondary)`, `color: var(--foreground)`, `font-weight: 600`, with a crisp `1px solid var(--border)` or subtle inset indicator. Never allow hidden text in collapsed mode to stretch the active highlight box (`min-width: 0; overflow: hidden`).
- **Workspace Content:** Clean `--background` (`#fafafa`) canvas with structured max-width container, consistent `1.5rem` vertical rhythm, and a crisp page header separated by `1px solid var(--border)`.

### 4.2 Cards & Panels (`hlmCard` / `.panel` / `.card`)

- `background: var(--card)` (`#ffffff`), `color: var(--card-foreground)`, `border: 1px solid var(--border)`, `border-radius: var(--radius-md)`, `box-shadow: none`.
- Header uses a `1rem` (`16px`) `font-weight: 600` title and `0.875rem` `color: var(--muted-foreground)` description.
- Avoid nesting bordered cards inside bordered cards; use `1px solid var(--border)` horizontal dividers or `--muted` (`#f4f4f5`) wells for inner groupings.

### 4.3 Buttons (`hlmBtn` / `<button class="btn">`)

- **Height & Radius:** `height: 2.25rem` (`36px`, or `2rem` for compact), `padding: 0 0.875rem`, `border-radius: var(--radius-sm)` (`6px`), `font-size: 0.875rem`, `font-weight: 500`.
- **Variants:**
  - `primary` (`.btn-primary`): `background: var(--primary)`, `color: var(--primary-foreground)`, `border: 1px solid var(--primary)`. Hover: `var(--primary-hover)`.
  - `secondary` / `outline` (`.btn`, `.btn-secondary`): `background: var(--card)`, `color: var(--foreground)`, `border: 1px solid var(--input)`. Hover: `background: var(--accent)`.
  - `ghost` (`.btn-ghost`): `background: transparent`, `color: var(--muted-foreground)`, `border: 1px solid transparent`. Hover: `background: var(--accent)`, `color: var(--foreground)`.
  - `destructive` (`.btn-danger`): `background: var(--destructive)`, `color: var(--destructive-foreground)`.

### 4.4 Form Controls (`hlmInput` / `input` / `select` / `textarea`)

- `height: 2.25rem` (`36px`), `padding: 0.375rem 0.75rem`, `border-radius: var(--radius-sm)` (`6px`), `border: 1px solid var(--input)`, `background: var(--card)`, `color: var(--foreground)`, `font-size: 0.875rem`.
- Focus state: `outline: none; border-color: var(--ring); box-shadow: 0 0 0 2px color-mix(in oklab, var(--ring) 15%, transparent);`.
- Labels: `font-size: 0.8125rem`, `font-weight: 500`, `color: var(--foreground)`.

### 4.5 Data Tables (`hlmTable` / `.master-tabla` / `.srs-tabla` / `.ps-tabla` / `.ui-table`)

- Wrapped in a `1px solid var(--border)` container with `border-radius: var(--radius-md)` and `background: var(--card)`.
- `th`: `height: 2.5rem`, `padding: 0 0.875rem`, `font-size: 0.75rem`, `font-weight: 500`, `color: var(--muted-foreground)`, `background: var(--muted)`, `border-bottom: 1px solid var(--border)`, `text-transform: none` (or subtle tracking).
- `td`: `padding: 0.75rem 0.875rem`, `font-size: 0.875rem`, `border-bottom: 1px solid var(--border)`, `font-variant-numeric: tabular-nums`.
- `tbody tr:hover`: `background: color-mix(in oklab, var(--muted) 60%, transparent)`.

### 4.6 Badges (`hlmBadge` / `.badge` / `.master-badge` / `.srs-badge`)

- Compact inline pill/rounded-rect (`border-radius: var(--radius-sm)` or `9999px`, `padding: 0.125rem 0.5rem`, `font-size: 0.75rem`, `font-weight: 500`, `line-height: 1.25`).
- Semantic variants use `1px solid` tinted border + `8-10%` surface tint + high-contrast foreground (`--ok`, `--warn`, `--danger`, `--info`, or neutral `--secondary`).

### 4.7 Tabs & Collapsibles (`hlmTabs` / `<details class="ui-collapse">`)

- **Tabs List (`.ui-tabs__list`):** Segmented control in `--muted` (`#f4f4f5`) with `padding: 0.25rem`, `border-radius: var(--radius-md)`, `border: 1px solid var(--border)`. Active trigger has `background: var(--card)`, `color: var(--foreground)`, `border-radius: var(--radius-sm)`, and subtle `0 1px 2px rgb(0 0 0 / 0.06)` shadow.
- **Collapse (`.ui-collapse`):** Clean `1px solid var(--border)` accordion container with `--radius-md` and `background: var(--card)`.

---

## 5. Verification Checklist

Before completing any UI task:

1. Run `.agents\skills\impeccable\scripts\impeccable.cmd detect src/ --json` to ensure zero design-system anti-patterns (no eyebrow kickers, no thick side borders, no ghost-card shadow+border collisions).
2. Run `pnpm build` and `pnpm test --watch=false` to verify all components compile and unit tests pass.
3. Update `docs/` if routes, layouts, or documented visual patterns changed.
