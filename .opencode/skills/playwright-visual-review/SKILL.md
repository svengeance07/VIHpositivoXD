---
name: playwright-visual-review
description: Automated visual review, layout inspection, and screenshot testing using Playwright. Use when evaluating UI design, auditing Obsidian Dark Mode, inspecting layouts, catching visual regressions, verifying responsive breakpoints, or taking screenshots of views for design reviews.
---

# Playwright Visual Review & Screenshot Testing

This skill provides an automated, deterministic visual testing and screenshot capture pipeline using **Playwright**. It bridges the gap between code changes and pixel reality, allowing the agent to visually inspect views, audit contrast and layout, and catch visual regressions before shipping.

---

## 1. When to Use

- **Auditing UI Redesigns**: Verify Obsidian Dark Mode surfaces (`#000000`/`#09090b`), hairlines (`1px solid #27272a`), and contrast across all roles (`/master`, `/SRS`, `/PS`, `/login`, `/consulta`).
- **Responsive Inspection**: Capture desktop (`1440x900`), tablet (`768x1024`), and mobile (`375x667`) viewports to ensure grids stack correctly without horizontal overflow.
- **Visual Evidence & Regression Checks**: Take before-and-after screenshots when adjusting layouts, spacing, or typography.
- **Direct Image Review**: Inspect generated captures using `read_file` to evaluate visual hierarchy, alignment, and typography directly with the model's vision capabilities.

---

## 2. CLI Tooling & Quick Execution

The project includes a built-in zero-dependency capture runner powered by Playwright Chromium:

```bash
# Capture full suite (all key routes across Desktop and Mobile viewports)
pnpm visual:capture
# or
node scripts/visual-capture.mjs

# Capture a single route
node scripts/visual-capture.mjs --route=/login
node scripts/visual-capture.mjs --route=/master/vacunas

# Capture a specific viewport (desktop, tablet, mobile)
node scripts/visual-capture.mjs --viewport=mobile
node scripts/visual-capture.mjs --route=/PS --viewport=desktop
```

### Output Artifacts

- **Captures Directory**: `.visual-review/captures/`
- **Interactive Gallery**: `.visual-review/captures/index.html` (opens a dark-mode visual catalog of all rendered routes).

---

## 3. Deterministic Capture Standards

To avoid flaky screenshots, false visual diffs, and timing issues:

1. **HiDPI / Retina Resolution**: Context uses `deviceScaleFactor: 2` and explicit viewports (`1440x900` desktop, `375x667` mobile).
2. **Animation Freeze**: The runner injects a global kill-switch style:
   ```css
   *,
   *::before,
   *::after {
     animation-duration: 0s !important;
     animation-delay: 0s !important;
     transition-duration: 0s !important;
     transition-delay: 0s !important;
     caret-color: transparent !important;
   }
   ```
3. **Fonts & Network Settlement**: Waits for `networkidle` and evaluates `document.fonts.ready` prior to capturing.
4. **Color Scheme**: Context is pinned to `colorScheme: 'dark'` to guarantee Obsidian Dark Mode styling.

---

## 4. Visual Inspection Checklist

When reading or reviewing captured screenshots:

- [ ] **Background & Surfaces**: Deep `#000000` canvas, `#09090b` cards, `#050507` subtle zones. No inadvertent white/light grey containers or flashes.
- [ ] **Hairlines & Borders**: Crisp `1px solid #27272a` borders dividing bento strips. No missing borders or double-thick 2px collisions.
- [ ] **Typography & Contrast**: Stark white `#fafafa` headings, zinc `#a1a1aa` secondary labels, monospace numbers with `tabular-nums`.
- [ ] **Navigation & Redundancy**: Top bar contains horizontal tabs only. No action buttons competing with tabs in row 1. Docked sidebar provides telemetry, alerts, and shortcuts.
- [ ] **Mobile Stacking**: Desktop grids cleanly collapse into single-column cards on mobile (`375px`), sidebar converts into a modal drawer, and top bar collapses gracefully.
