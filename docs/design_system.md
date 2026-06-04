# Design System & UI Specifications

This document outlines the light-theme design values, colors, typography, and premium elements of the **DreamSpace Portfolio Voting System**.

## 1. Style Guide (Light Mode Only)

### Brand Color Palette
*   **Primary Purple:** `#7B1FA2`
    *   *Usage:* Navbar backgrounds, primary buttons, card headers, active state highlights.
*   **Accent Orange:** `#FF6F00`
    *   *Usage:* Hover states, warning boxes, notifications, ranking badges.
*   **Primary Light:** `#F3E5F5` (Very soft light purple)
    *   *Usage:* Card accents, secondary background frames, active tab backgrounds.
*   **Accent Light:** `#FFF3E0` (Very soft light orange)
    *   *Usage:* Selection focus highlights, status message backdrops.

### Neutrals
*   **Base Canvas:** `#FDFBFD` (Off-white canvas)
*   **Card Background:** `#FFFFFF` (Pure white cards)
*   **Text Primary:** `#212121` (Charcoal)
*   **Text Secondary:** `#666666` (Medium Gray)
*   **Borders:** `#E0E0E0` (Soft gray line separations)

### Typography
*   **Font Family:** `Outfit` (Primary headers), `Inter` (Body content)
*   **Main Header:** `1.8rem` semibold
*   **Subheaders:** `1.2rem` medium
*   **Body Text:** `1rem` regular

## 2. Responsive Layout Guidelines
*   **Viewport Adaptation:**
    *   **Mobile (< 768px):** The portfolio gallery must collapse to a 1-column layout. The top navigation bar must toggle into a slide-out hamburger menu. The voting panel must become a sticky bottom bar or slide-up sheet.
    *   **Tablet (768px - 1024px):** Portfolio gallery display adapts to 2-columns. Sticky sidebars become toggleable overlays.
    *   **Desktop (> 1024px):** Full 3-column or 4-column portfolio grid. Side-by-side splits for voting workspace and candidate lists.
*   **Interactive Components:**
    *   Ensure all buttons and touch targets are a minimum size of `44px x 44px` on mobile displays to satisfy tactile usability standard.
    *   Input forms must use percentage widths (`width: 100%`) inside flexible container margins to avoid horizontal clipping.

## 3. Micro-Animations & Transitions
*   **Transitions:**
    *   Any state changes (hover, active focus, button clicks) must transition smoothly over `200ms` using `cubic-bezier(0.4, 0, 0.2, 1)`.
*   **Hover Effects:**
    *   **Portfolio Cards:** On hover, cards should translate upwards slightly (`transform: translateY(-4px)`) and increase their shadow weight (`box-shadow: var(--shadow-md)` to `var(--shadow-lg)`) to feel interactive.
    *   **Buttons:** Standard primary buttons expand background overlays slightly, while secondary borders change color.
*   **Voting Interactions:**
    *   When dragging or selecting a portfolio card for a ballot slot, use custom CSS keyframe animations (fade-in, scale-up) to animate the confirmation badge (`transform: scale(1)` to `1.1` and back to `1.0`).
    *   Include a smooth height/sliding transition for the ballot summary drawer when items are selected or updated.

## 4. Design Change Protocol
*   When a developer updates a CSS property, variable, or introduces a new accent color:
    1.  Create a copy of this file or append a new entry section under **Design Updates**.
    2.  Highlight the changed token values.
    3.  Notify the QA tester to verify the update matches the accessibility color contrast requirements.

