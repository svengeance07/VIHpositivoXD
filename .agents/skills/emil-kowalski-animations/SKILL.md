---
name: emil-kowalski-animations
description: Use when authoring, refining, or reviewing animations, transitions, and micro-interactions following Emil Kowalski's motion design principles (Animations on the Web, Sonner, Vaul). Covers physics-based easings, tactile press feedback, scale transitions, and performance.
---

# Emil Kowalski Animation & Micro-Interaction Principles

This skill defines the motion design, physical feedback, and transition standards modeled after **Emil Kowalski's** work (_Animations on the Web_, _Sonner_, _Vaul_, and modern Vercel/Linear interaction design).

---

## 1. Core Philosophy: Purposeful Motion

1. **Explain, Don't Decorate:**
   - Motion is not visual ornament; it exists to explain state transitions, spatial relationships, and cause-and-effect.
   - If an animation does not communicate feedback or preserve continuity, remove it.

2. **Zero Animation Debt (Never Make Users Wait):**
   - In productivity, admin, and clinical tools (Operate mode), the user's focus is task completion.
   - Routines must feel instantaneous. Do not delay actions behind gratuitous staggered sequences.

3. **Physics Over Geometry:**
   - Real-world objects have momentum and inertia. Interfaces should reflect natural deceleration rather than generic linear or elastic curves.

---

## 2. The Canonical Timing & Easing Budget

Always scale duration to distance and consequence:

| Interaction Type              | Duration        | Easing Curve                                 | Purpose                              |
| :---------------------------- | :-------------- | :------------------------------------------- | :----------------------------------- |
| **Tactile Press (`:active`)** | `60ms – 100ms`  | `cubic-bezier(0.16, 1, 0.3, 1)`              | Physical feedback on click/press.    |
| **Hover & Color States**      | `120ms – 150ms` | `cubic-bezier(0.16, 1, 0.3, 1)`              | Responsive surface transition.       |
| **State / Tab Switch**        | `150ms – 200ms` | `cubic-bezier(0.16, 1, 0.3, 1)`              | Layout indicator or tab change.      |
| **Modal / Dialog Entrance**   | `180ms – 240ms` | `cubic-bezier(0.16, 1, 0.3, 1)`              | Natural deceleration into view.      |
| **Exit / Dismissal**          | `100ms – 150ms` | `ease-in` or `cubic-bezier(0.7, 0, 0.84, 0)` | Exits must be faster than entrances. |

### The Universal Deceleration Curve

```css
/* Emil Kowalski's natural ease-out-expo curve */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
```

---

## 3. Signature Micro-Interactions

### 3.1 Physical Button Press (`:active`)

Buttons and clickable interactive controls compress subtly on press and spring back instantly upon release:

```css
.btn:active:not(:disabled),
.interactive-control:active {
  transform: scale(0.975);
  transition: transform 60ms var(--ease-out);
}
```

### 3.2 Modal & Dialog Reveal (Fade + Scale + Lift)

Modals should never just flash onto the screen or slide wildly from top to bottom. They emerge with subtle scale and slight elevation:

```css
@keyframes modalBackdropFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalContentEnter {
  from {
    opacity: 0;
    transform: scale(0.98) translateY(6px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.ui-modal-backdrop {
  animation: modalBackdropFadeIn 150ms var(--ease-out) forwards;
}

.ui-modal-container {
  animation: modalContentEnter 200ms var(--ease-out) forwards;
}
```

### 3.3 Collapsible / Drawer Expansion

Smooth height and content reveal without clipping or jitter:

```css
.ui-collapse__panel {
  animation: panelSlideDown 180ms var(--ease-out) forwards;
}

@keyframes panelSlideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 3.4 Live Telemetry Pulse (Smooth Glow)

For live status indicators (e.g. green status dot), use a soft expansion rather than an aggressive blinking:

```css
@keyframes livePulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.6);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(74, 222, 128, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
  }
}
```

---

## 4. Performance & Composite Properties

1. **Only Animate Composited Properties:**
   - Stick to `transform` and `opacity`.
   - Never casually animate `width`, `height`, `top`, `left`, `margin`, or `padding` unless using FLIP or CSS grid interpolation (`grid-template-rows: 0fr -> 1fr`).
2. **Layer Isolation:**
   - Use `will-change: transform, opacity;` strictly during active animations, or rely on hardware acceleration via `transform: translateZ(0);`.

---

## 5. Accessibility (`prefers-reduced-motion`)

Always respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
    transform: none !important;
  }
}
```

_(Preserve opacity and color transitions where necessary so confirmation states remain visible)._
