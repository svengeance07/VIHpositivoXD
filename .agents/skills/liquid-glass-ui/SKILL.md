---
name: liquid-glass-ui
description: Use when building, restyling, or reviewing Angular views that use Caustica Design (caustica-design) and the liquid-glass visual language.
---

# Liquid Glass UI

## Setup already in place

- `src/styles.css` starts with `@import 'caustica-design/css';`.
- `provideCaustica()` is called in `src/main.ts` before bootstrap.
- Components that use `<ca-*>` need `CUSTOM_ELEMENTS_SCHEMA`; `App` already has it.

## Rules

- Build views from the registered Caustica elements first: `<ca-button>`, `<ca-icon>`, `<ca-modal>`, `<ca-tabs>`, `<ca-collapse>` (and their trigger/close children). Do not re-create primitives the library already provides.
- Create a custom standalone component only when no Caustica element fits. Compose it from Caustica elements and tokens instead of raw HTML plus ad-hoc CSS.
- Use only `caustica-design/angular` and `caustica-design/css` in this app; do not add its React or Vue entries.
- Keep the glass treatment consistent: reuse `--ca-blur-glass`, `--ca-glass-fill`, `--ca-glass-edge`, `--ca-hue`, and `--ca-chroma`. Do not hard-code duplicate blur, border, or shadow values.
- Avoid nesting many blurred surfaces; lower frost or fill for dense screens.
- Preserve legibility and accessibility over translucent surfaces: sufficient text contrast, visible focus states, and reduced-transparency/reduced-motion fallbacks.
- Verify the result in the browser via `pnpm start`, not only by compiling.

## When unsure

Ask before adding a second UI library, a CSS framework, or hand-written glass effects.
