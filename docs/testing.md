# QA Testing & Verification Plan

This document guides the **QA Test & Git Issue Manager** in validating the application features.

## 1. Automated Test Cases
*   **Authentication, Domains & Onboarding:**
    *   Test standard Google accounts that do not end in `@dreamspace.academy`. Check if they are blocked.
    *   Verify that on first login with a new `@dreamspace.academy` account, a profile is not created until a role is selected.
    *   Verify that selecting "Student" creates a profile with `role = 'student'` and `role_approved = true`.
    *   Verify that selecting "Staff" creates a profile with `role = 'staff'` and `role_approved = false`.
    *   Verify that username/password logins authenticate successfully using Supabase Auth.
    *   Verify that an **Admin** logging in with email/password is routed to the **Admin Dashboard** (not the student or onboarding screen).
    *   Verify that logging in with admin-created credentials (`is_admin_created = true`) bypasses the domain check and routes to the Student Dashboard.
    *   Verify that non-domain logins without `is_admin_created = true` or admin status are blocked.
*   **Role Access Restrictions:**
    *   Verify that a user with `role = 'student'` can upload portfolios and cast votes.
    *   Verify that a user with `role = 'staff'` is blocked by RLS from inserting or updating `portfolios` and `votes` (both before and after approval).
    *   Verify that an unapproved staff member (`role = 'staff'`, `role_approved = false`) is blocked from reading profiles, portfolios, and votes.
    *   Verify that an approved staff member can only access `public.voting_stats` — **not** raw `votes` table rows.
*   **Voting Anonymity (Critical):**
    *   Attempt to `SELECT * FROM public.votes` as a staff user — verify it returns zero rows or a permission denied error.
    *   Attempt to `SELECT * FROM public.votes` as an admin — verify it returns zero rows or a permission denied error (admins have no direct vote read access).
    *   Verify that a student can only read their own vote rows (other students' ballots are hidden).
    *   Verify that `public.voting_stats` returns only aggregate counts (no voter IDs, no portfolio choices).
    *   Verify that `public.results_view` returns only `portfolio title` and `total_points` — no voter or ballot data.
*   **Scoreboard / Results:**
    *   Verify that `public.results_view` is ordered by `total_points DESC`.
    *   Verify that the scoreboard UI is hidden for all users when `results_released = false`.
    *   Verify that once `results_released = true`, the scoreboard shows all portfolios ordered by highest to lowest points.
    *   Verify that no voter name, rank choice, or individual ballot is shown anywhere in the scoreboard UI.
*   **Admin Approval & Provisioning flow:**
    *   Verify that only users with `is_admin = true` or `role = 'admin'` can toggle `role_approved` to `true` for staff profiles.
    *   Verify that only admins can create new student credentials in the database.
*   **Voting Schema Constraints:**
    *   Verify that inserting a second vote for the same rank errors out.
    *   Verify that voting for the same candidate across multiple ranks fails.
    *   Verify that self-voting is successful.
*   **Admin Release Rule:**
    *   Verify regular users cannot write to the `system_settings` table.
    *   Verify candidates cannot be voted on once `results_released` is set to `true`.

## 2. Manual Verification Checklist
- [ ] **Dual Login Interface UI:** Open the login page and verify both the "Sign in with Google" button and the Username/Password form fields are styled correctly.
- [ ] **Admin Credentials Login:** Enter the admin email and password in the credentials form. Verify login routes directly to the **Admin Dashboard** (no role selection screen shown).
- [ ] **Google OAuth — Student Onboarding:** Sign in via Google with a new `@dreamspace.academy` account. Confirm the Role Selection Screen appears. Select "Student" and verify redirection to Student Dashboard.
- [ ] Upload a portfolio (title, description, link). Confirm it appears in the gallery.
- [ ] Vote for candidate A as 1st, candidate B as 2nd, candidate C as 3rd. Confirm point values are 5, 3, 2.
- [ ] **Voting Anonymity Check (Manual):** While logged in as an admin, open the Supabase table editor and attempt to read the `votes` table. Confirm it returns no rows (RLS blocks it).
- [ ] **Staff Monitoring — Anonymity:** Log in as an approved Staff member. Verify the monitoring dashboard shows only aggregate stats (total voters, total votes), and confirm there is no list of individual ballots or voter-to-portfolio associations visible anywhere.
- [ ] **Google OAuth — Staff Onboarding:** Sign in with a new `@dreamspace.academy` Google account, select "Staff". Confirm redirect to the "Pending Approval" screen and block on all student routes.
- [ ] **Admin Provisioning & Staff Approval:**
    - Log in as Admin.
    - Approve the pending staff member from the Staff Approval Panel.
    - Use the Student Credentials Panel to provision a login for `external_student@gmail.com` with a temporary password.
- [ ] **Credentials Login — Non-domain Student:** Log out and use the username/password form to log in as `external_student@gmail.com`. Verify login succeeds, domain check is bypassed, and Student Dashboard with full voting and portfolio rights is accessible.
- [ ] **Scoreboard Release & Format:** Log in as Admin and toggle "Release Results". Navigate to the Home / Scoreboard page. Verify:
    - Portfolios are ordered **highest points first**.
    - Only **Portfolio Title** and **Total Points** are displayed per row.
    - No voter names, rank labels per voter, or ballot details appear anywhere on the scoreboard.
- [ ] Validate light-mode design consistency (fonts, accessibility contrast ratios).
- [ ] **Mobile Responsiveness:** Shrink viewport below `768px`. Confirm 1-column layout, hamburger menu, and bottom-sheet voting panel.
- [ ] **Animations:** Verify card hover lifts, ballot drawer slide animations, and staggered scoreboard reveal work as specified.

