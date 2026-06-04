# Frontend Implementation Plan

This document details the screens, components, architecture, and integration steps for the **Frontend Developers**.

## 1. Project Setup
*   **Framework:** Vite + React + Vanilla CSS.
*   **Design Language:** Pure light mode with DreamSpace theme (Purple & Orange).

## 2. Dev 1: Authentication, Onboarding, Admin Dashboard & App Shell
*   **Login Page & Authentication Flow:**
    *   **UI Components:** Build a sleek login page featuring:
        1. A primary "Sign in with Google" button.
        2. A divider followed by a form with "Username / Email" and "Password" input fields, and a "Login" button.
    *   **Authentication Logic:**
        *   **Google OAuth Path:** Upon successful sign-in, check if the email ends with `@dreamspace.academy`. If invalid, sign out immediately and display a domain-error alert. If valid, check if a profile exists:
            *   *Existing User:* Route to Student Dashboard (if student & approved), Pending Screen (if staff & unapproved), Staff Dashboard (if staff & approved), or Admin Dashboard (if admin).
            *   *New User:* Show a **Role Selection Screen** to register as Student (`role = 'student'`, `role_approved = true`) or Staff (`role = 'staff'`, `role_approved = false`).
        *   **Credentials Path (Students & Admins):** Authenticate with Supabase Auth using the Username/Email and Password inputs. Fetch their profile:
            *   If the user is an **Admin** (`is_admin = true` or `role = 'admin'`): bypass domain check and route directly to the **Admin Dashboard**.
            *   If the user is an admin-created Student (`is_admin_created = true`): bypass domain check and route directly to the **Student Dashboard**.
*   **Admin Dashboard:**
    *   Visible only if user profile has `is_admin = true` or `role = 'admin'`.
    *   Toggle setting for `results_released`.
    *   Display direct metrics (total voters, total uploaded portfolios).
    *   **Role Management Panel:** Render a table listing all pending staff members (`role = 'staff'` and `role_approved = false`). Provide an "Approve Staff" button for each row.
    *   **Student Credentials Provisioning Panel:** Build a form for admins to create credentials for students who do not have `@dreamspace.academy` emails. Fields: Full Name, Email/Username, Password. On submit, this triggers a backend action (e.g., Supabase Auth Admin API) to create a user with `role = 'student'`, `role_approved = true`, and `is_admin_created = true` in the database.
*   **App Shell:**
    *   Consistent header with DreamSpace Logo and user profile card.
    *   Clean layout margins and navigation tabs.
    *   Hide/show links dynamically depending on user role and approval status.
    *   **Mobile Responsiveness:** Implement a sliding side navigation bar (hamburger menu transition) for screen widths under `768px`.

## 3. Dev 2: Portfolio Gallery, Forms, Voting UI & Staff Monitoring
*   **Upload/Edit Form (Students Only):**
    *   Fields: Title, URL, Description.
    *   Validate inputs (must be a valid URL starting with `https://`).
    *   Automatic link preview card mockups.
    *   Only rendered for users with `role = 'student'` and `role_approved = true`.
*   **Portfolio Gallery:**
    *   **Responsive Grid:** Gallery uses a CSS Grid auto-fit layout (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`) to adapt seamlessly across mobile, tablet, and desktop viewports.
    *   Support search/filter by candidate name or project title.
    *   **Micro-Animations:** Implement smooth `:hover` state lifts, card scale changes, and shadow increases as specified in the Design System.
*   **Voting System UI (Students Only):**
    *   Interactive ranks selector for each card (Rank 1st, 2nd, 3rd).
    *   A sticky "My Ballot Drawer" at the bottom showing the currently selected candidates for:
        *   1st Choice (5 pts)
        *   2nd Choice (3 pts)
        *   3rd Choice (2 pts)
    *   **Ballot Drawer Animation:** Implement CSS-based slide-up and slide-down animations when candidates are added/removed from the ballot, using `cubic-bezier(0.4, 0, 0.2, 1)`.
    *   "Submit Votes" action updating the `votes` table in Supabase.
    *   Only rendered/accessible for users with `role = 'student'` and `role_approved = true`.
*   **Scoreboard / Leaderboard (Released Results — All Users):**
    *   Only displayed when `results_released = true`.
    *   Queries `public.results_view` from Supabase.
    *   Renders a ranked list ordered **highest to lowest total points**. Each row shows: **Portfolio Title** and **Total Points** only.
    *   **Strictly no voter names, no ballot choices, and no individual vote data are shown** to anyone.
    *   Animated entry for each rank (staggered card slide-in) to create a premium reveal effect.
*   **Staff Activity Monitoring Dashboard (Approved Staff Only):**
    *   Accessible only for approved Staff (`role = 'staff'` and `role_approved = true`).
    *   Shows a read-only gallery of uploaded portfolios (no upload form).
    *   Displays aggregate monitoring stats from `public.voting_stats`: total students registered, total votes cast, and voter turnout percentage.
    *   **Strictly no individual ballot data is visible** — staff cannot see who voted for whom under any circumstance.

