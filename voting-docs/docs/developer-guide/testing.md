---
sidebar_position: 7
title: Testing
description: Automated test cases and manual verification checklists for the QA tester.
---

# Testing

This page guides the **QA Test & Git Issue Manager** in validating all features of the Votable application before merging to `main`.

---

## 1. Automated Test Cases

### Authentication, Domains & Onboarding

| # | Test | Expected Result |
|---|------|----------------|
| 1.1 | Sign in with a standard `@gmail.com` Google account | Blocked with domain-error alert |
| 1.2 | First login with a new `@dreamspace.academy` account | Role Selection Screen appears; no profile created yet |
| 1.3 | Select "Student" on Role Selection Screen | Profile created: `role = 'student'`, `role_approved = true` |
| 1.4 | Select "Staff" on Role Selection Screen | Profile created: `role = 'staff'`, `role_approved = false` |
| 1.5 | Log in with credentials (username + password) | Supabase Auth authenticates successfully |
| 1.6 | Admin logs in with email/password | Routed directly to Admin Dashboard (no onboarding screen) |
| 1.7 | Log in with admin-created credentials (`is_admin_created = true`) | Domain check bypassed; routed to Student Dashboard |
| 1.8 | Credentials login without `is_admin_created` or admin status | Blocked at authentication |

---

### Role Access Restrictions

| # | Test | Expected Result |
|---|------|----------------|
| 2.1 | Student (`role = 'student'`) attempts portfolio upload | Succeeds |
| 2.2 | Student attempts to cast a vote | Succeeds |
| 2.3 | Staff user attempts to INSERT into `portfolios` | RLS blocks — permission denied |
| 2.4 | Staff user attempts to INSERT into `votes` | RLS blocks — permission denied |
| 2.5 | Unapproved staff reads any `profiles`, `portfolios`, or `votes` | Blocked (only own profile visible) |
| 2.6 | Approved staff queries `public.voting_stats` | Returns aggregate counts only |
| 2.7 | Approved staff queries raw `votes` table | Returns zero rows |

---

### Voting Anonymity (Critical)

:::danger These tests are highest priority
Any failure in anonymity tests is a **critical security bug** and must be resolved before deployment.
:::

| # | Test | Expected Result |
|---|------|----------------|
| 3.1 | `SELECT * FROM public.votes` as an **approved Staff** user | Returns zero rows or permission error |
| 3.2 | `SELECT * FROM public.votes` as an **Admin** user | Returns zero rows or permission error |
| 3.3 | `SELECT * FROM public.votes` as a **Student** | Returns only that student's own vote rows |
| 3.4 | Query `public.voting_stats` | Returns aggregate counts (`total_voters`, `total_votes_cast`) only — no voter IDs, no portfolio choices |
| 3.5 | Query `public.results_view` | Returns only `portfolio title` and `total_points` per portfolio — no voter or ballot data |

---

### Scoreboard & Results

| # | Test | Expected Result |
|---|------|----------------|
| 4.1 | Query `public.results_view` | Results ordered by `total_points DESC` |
| 4.2 | Load scoreboard UI when `results_released = false` | Scoreboard is hidden for all users |
| 4.3 | Admin sets `results_released = true`, then load scoreboard | Scoreboard visible; portfolios ordered highest-to-lowest points |
| 4.4 | Inspect scoreboard UI elements | No voter name, rank choice, or individual ballot data visible anywhere |

---

### Admin Approval & Provisioning

| # | Test | Expected Result |
|---|------|----------------|
| 5.1 | Non-admin user attempts to toggle `role_approved = true` | RLS blocks — permission denied |
| 5.2 | Admin approves a pending staff member | `role_approved` flips to `true`; staff can now access monitoring dashboard |
| 5.3 | Non-admin attempts to create student credentials | Blocked |
| 5.4 | Admin creates student credentials | Account created with `role = 'student'`, `role_approved = true`, `is_admin_created = true` |

---

### Voting Schema Constraints

| # | Test | Expected Result |
|---|------|----------------|
| 6.1 | Insert a second vote for the same rank (same voter, same rank) | Constraint error — `unique_voter_rank` |
| 6.2 | Vote for the same candidate across two different ranks | Constraint error — `unique_voter_portfolio` |
| 6.3 | Vote for own portfolio | Succeeds (self-voting is allowed) |
| 6.4 | Attempt to insert a vote when `results_released = true` | RLS blocks insert |
| 6.5 | Non-approved student attempts to vote | RLS blocks insert |

---

### Admin Release Rules

| # | Test | Expected Result |
|---|------|----------------|
| 7.1 | Regular student attempts to UPDATE `system_settings` | RLS blocks — permission denied |
| 7.2 | Vote insert when `results_released = true` | Blocked by RLS policy |

---

## 2. Manual Verification Checklist

Run through these checks after deploying to the Vercel preview environment.

### Login & Auth
- [ ] **Dual Login Interface:** Login page shows both "Sign in with Google" button and Username/Password form, correctly styled.
- [ ] **Admin Login:** Enter admin email + password → routes directly to Admin Dashboard, no role selection shown.
- [ ] **Google OAuth — Student Onboarding:** Sign in with a new `@dreamspace.academy` account → Role Selection Screen appears → select "Student" → redirected to Student Dashboard.
- [ ] **Google OAuth — Staff Onboarding:** Sign in with a new account, select "Staff" → redirected to Pending Approval Screen; all student routes blocked.

### Portfolio
- [ ] Upload a portfolio (title, description, URL). Confirm it appears in the gallery.
- [ ] Edit the portfolio and confirm changes are saved.
- [ ] Verify a staff user cannot see an upload form.

### Voting
- [ ] Vote for Candidate A as 1st, Candidate B as 2nd, Candidate C as 3rd. Confirm point values are 5, 3, 2 in the ballot drawer.
- [ ] Submit votes and confirm they are saved.
- [ ] Ballot drawer slides up/down with smooth animation.

### Anonymity Checks (Manual)
- [ ] **Admin check:** Log in as admin → open Supabase Table Editor → attempt to read `votes` table → confirm zero rows returned.
- [ ] **Staff check:** Log in as approved staff → monitoring dashboard shows only aggregate stats — no individual ballots, no voter-to-portfolio associations.

### Admin Operations
- [ ] Approve the pending staff member from the Staff Approval Panel. Log out, log in as that staff member — confirm access to monitoring dashboard.
- [ ] Provision credentials for `external_student@example.com` with a temporary password. Log out, log in with those credentials — confirm domain check bypassed and Student Dashboard accessible.

### Scoreboard
- [ ] Admin toggles "Release Results". Navigate to scoreboard.
  - [ ] Portfolios ordered highest points first.
  - [ ] Only Portfolio Title and Total Points shown per row.
  - [ ] No voter names, rank labels per voter, or ballot details visible.

### UI & Accessibility
- [ ] Validate light-mode design consistency: correct fonts (Outfit/Inter), correct colours (purple `#7B1FA2`, orange `#FF6F00`).
- [ ] Check WCAG AA contrast ratios (minimum 4.5:1) on all text elements.
- [ ] **Mobile Responsiveness:** Shrink viewport below 768px → 1-column gallery, hamburger menu, bottom-sheet ballot drawer.
- [ ] **Animations:** Card hover lifts, ballot drawer slide animations, staggered scoreboard reveal all work smoothly.
