# Frontend Implementation Plan

This document details the screens, components, architecture, and integration steps for the **Frontend Developers**.

## 1. Project Setup
*   **Framework:** Vite + React + Vanilla CSS.
*   **Design Language:** Pure light mode with DreamSpace theme (Purple & Orange).

## 2. Dev 1: Authentication, Admin Dashboard & App Shell
*   **Authentication Flow:**
    *   Integrate Supabase Google OAuth provider.
    *   Upon successful sign-in, check if `profile.email` ends with `@dreamspace.academy`.
    *   If invalid, sign out immediately, display a clean alert/error state, and block further actions.
*   **Admin Dashboard:**
    *   Visible only if user profile has `is_admin = true`.
    *   Toggle setting for `results_released`.
    *   Display direct metrics (total voters, total uploaded portfolios).
*   **App Shell:**
    *   Consistent header with DreamSpace Logo and user profile card.
    *   Clean layout margins and navigation tabs.
    *   **Mobile Responsiveness:** Implement a sliding side navigation bar (hamburger menu transition) for screen widths under `768px`.

## 3. Dev 2: Portfolio Gallery, Forms & Voting UI
*   **Upload/Edit Form:**
    *   Fields: Title, URL, Description.
    *   Validate inputs (must be a valid URL starting with `https://`).
    *   Automatic link preview card mockups.
*   **Portfolio Gallery:**
    *   **Responsive Grid:** Gallery uses a CSS Grid auto-fit layout (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`) to adapt seamlessly across mobile, tablet, and desktop viewports.
    *   Support search/filter by candidate name or project title.
    *   **Micro-Animations:** Implement smooth `:hover` state lifts, card scale changes, and shadow increases as specified in the Design System.
*   **Voting System UI:**
    *   Interactive ranks selector for each card (Rank 1st, 2nd, 3rd).
    *   A sticky "My Ballot Drawer" at the bottom showing the currently selected candidates for:
        *   1st Choice (5 pts)
        *   2nd Choice (3 pts)
        *   3rd Choice (2 pts)
    *   **Ballot Drawer Animation:** Implement CSS-based slide-up and slide-down animations when candidates are added/removed from the ballot, using `cubic-bezier(0.4, 0, 0.2, 1)`.
    *   "Submit Votes" action updating the `votes` table in Supabase.

