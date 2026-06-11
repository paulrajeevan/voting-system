---
sidebar_position: 5
title: Design System
description: CSS custom properties, typography, colour palette, responsive guidelines, and animation specs for the Votable UI.
---

# Design System

Votable uses a **light-mode-first** design language built around the DreamSpace Academy brand palette. All styling is implemented using **Vanilla CSS Custom Properties** — no CSS frameworks.

---

## Brand Colour Palette

### Primary Colours

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#7B1FA2` | Navbar, primary buttons, card headers, active highlights |
| `--color-accent` | `#FF6F00` | Hover states, warning boxes, notifications, ranking badges |
| `--color-primary-light` | `#F3E5F5` | Card accents, secondary backgrounds, active tab backgrounds |
| `--color-accent-light` | `#FFF3E0` | Selection focus highlights, status message backdrops |

### Neutrals

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-canvas` | `#FDFBFD` | Page background |
| `--color-card` | `#FFFFFF` | Card backgrounds |
| `--color-text` | `#212121` | Primary body text |
| `--color-muted` | `#666666` | Secondary / supporting text |
| `--color-border` | `#E0E0E0` | Dividers and card borders |

---

## Typography

| Token | Value | Usage |
|-------|-------|-------|
| Primary font | `Outfit` | Headers (`h1`–`h3`), titles, labels |
| Body font | `Inter` | Body paragraphs, form fields, metadata |
| `--text-xl` | `1.8rem` | Main page headers |
| `--text-lg` | `1.2rem` | Section subheaders |
| `--text-base` | `1rem` | Standard body text |

Import via Google Fonts in the HTML head:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

---

## Spacing & Radius

| Token | Value |
|-------|-------|
| `--radius` | `8px` |
| `--radius-lg` | `12px` |
| `--radius-pill` | `999px` |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 4px rgba(0,0,0,0.08)` | Subtle card resting state |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.1)` | Default card shadow |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.18)` | Hover state, elevated panels |

---

## Transitions & Animations

### Global Transition

All interactive state changes (hover, focus, active) must use:

```css
transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

Store as a token:

```css
--transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Portfolio Card Hover

```css
.portfolio-card {
  transition: transform var(--transition), box-shadow var(--transition);
}

.portfolio-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

### Ballot Drawer Slide Animation

```css
.ballot-drawer {
  transform: translateY(100%);
  transition: transform var(--transition);
}

.ballot-drawer.open {
  transform: translateY(0);
}
```

### Vote Confirmation Badge

```css
@keyframes badge-pop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.rank-badge {
  animation: badge-pop 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Scoreboard Staggered Reveal

```css
@keyframes slide-in {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.scoreboard-row:nth-child(n) {
  animation: slide-in 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: calc(var(--index) * 60ms);
}
```

---

## Responsive Layout

### Breakpoints

| Name | Width | Layout |
|------|-------|--------|
| Mobile | < 768px | 1-column gallery; hamburger nav; sticky bottom ballot |
| Tablet | 768px – 1024px | 2-column gallery; toggleable overlay sidebar |
| Desktop | > 1024px | 3–4 column gallery; side-by-side voting layout |

### Portfolio Grid

```css
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

### Touch Target Minimum

All clickable and tappable elements must be at minimum **44px × 44px**:

```css
.btn, .rank-btn, .nav-link {
  min-height: 44px;
  min-width: 44px;
}
```

---

## Design Change Protocol

When updating any design token or introducing a new colour:

1. Update the CSS custom property in `src/index.css`.
2. Note the changed token value with a comment explaining why.
3. Notify the QA tester to verify the update meets **WCAG AA** colour contrast requirements (minimum 4.5:1 ratio for normal text).
4. Update this page with the new token value.

:::caution Light mode only
The app enforces light mode. Do **not** add `prefers-color-scheme: dark` media queries or dark-mode CSS overrides. Override browser defaults with:

```css
:root { color-scheme: light only; }
```
:::
