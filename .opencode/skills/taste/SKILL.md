---
name: taste
description: Use when auditing, crafting, or polishing user interfaces to ensure world-class software taste, restraint, visual hierarchy, hairline alignment, and browser default curation (Linear, Vercel, Raycast, Stripe standards).
---

# Software Design Taste: Principles of Restraint & Craft

This skill defines the visual taste, restraint, and obsessive craft standards modeled after the industry's most respected product teams (Linear, Vercel, Raycast, Stripe).

---

## 1. Core Law: Restraint Over Decoration

> _"Good taste is knowing what not to add. Great software design is the subtraction of 99 distractions so the 1 meaningful action feels effortless."_

1. **No Gratuitous Surface Effects:**
   - Never use `backdrop-filter: blur()` (glassmorphism) as mere decoration.
   - Never use text gradients (`background-clip: text`) on headings; authority comes from weight, scale, and negative tracking.
   - Never use multi-colored glowing box-shadows or floating neon borders.
2. **One Elevation System:**
   - Declare elevation once: either an architectural `1px solid var(--border)` hairline or a soft, diffused shadow. Never a border under a heavy black box-shadow.
3. **No Decorative Placeholders:**
   - Avoid empty emojis, meaningless sparklines, or cards inside cards (nested cards).
   - If a card contains only one line of text, remove the card container and let the typography breathe.

---

## 2. Curating Browser Defaults (The Craft Signals)

Amateur interfaces leave the browser's default rendering engine untouched. World-class taste meticulously styles the invisible surfaces:

### 2.1 Tabular Numbers (Never Let Data Jitter)

Every metric, counter, date, ID, or table cell must use tabular figures so layout never oscillates as numbers tick:

```css
table,
td,
th,
.stat-value,
.metric,
.badge,
input[type='number'] {
  font-variant-numeric: tabular-nums;
}
```

### 2.2 Text Selection & Caret Color

Theme selection directly from the palette:

```css
::selection {
  background-color: #fafafa;
  color: #09090b;
}

input,
textarea {
  caret-color: #fafafa;
}
```

### 2.3 Focus Ring Hierarchy

Never leave browser-blue outlines. Use an offset hairline ring:

```css
:focus-visible {
  outline: 2px solid var(--ring, #fafafa);
  outline-offset: 2px;
}
```

### 2.4 Custom Dark Scrollbars

Avoid chunky grey scrollbars breaking obsidian dark canvases:

```css
* {
  scrollbar-width: thin;
  scrollbar-color: #27272a #050507;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #050507;
}
::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #3f3f46;
}
```

---

## 3. Typographic Discipline & Tracking

1. **Tight Tracking on Headings:**
   - Display headings (`h1`, `h2`): `letter-spacing: -0.03em;` (never exceed `-0.04em`).
   - Body copy: normal tracking (`letter-spacing: normal;` or `-0.01em`).
   - Caps / Mono tags: slightly spaced (`letter-spacing: 0.04em; font-family: var(--font-mono);`).
2. **Monospace Discipline:**
   - Monospace is not a costume for "cool tech"; it belongs strictly to code, cryptographic hashes, lot IDs, cedulas, keyboard shortcuts (`<kbd>`), and timestamps.

---

## 4. Architectural Hairlines & Bento Strips

1. **Bento Hairline Grids:**
   - Metrics and feature strips should not float as disconnected bubbles.
   - Use `gap: 1px; background-color: var(--border); border: 1px solid var(--border); overflow: hidden;` with `background-color: var(--card)` cells for continuous architectural stability.
2. **Single Icon Weight:**
   - All icons in the system must share identical stroke weight (typically 1.5px or 2px) and viewBox proportions. Never mix filled and line icons arbitrarily in the same navigation bar.

---

## 5. Non-Redundant Navigation

1. **One Source of Truth for Routing:**
   - The top bar tabs are for section navigation; the lateral rail is for live operational tools and telemetry.
   - Never duplicate navigation buttons across multiple bars in the same viewport.
