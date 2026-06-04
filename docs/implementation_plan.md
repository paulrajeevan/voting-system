# Master Implementation Plan: Portfolio Voting System

This document outlines the high-level system architecture, database schema, design system, and team structure for the **DreamSpace Portfolio Voting System**.

### 📄 Role-Specific Documentation Index
To coordinate the team's efforts, individual detailed documentation files have been created:
*   **SRS Document:** [docs/srs.md](file:///c:/Users/Paul-Rajeevan/Desktop/Voting/docs/srs.md) — *Detailed Software Requirements Specification.*
*   **Database Specifications:** [docs/database.md](file:///c:/Users/Paul-Rajeevan/Desktop/Voting/docs/database.md) — *Detailed schema, seeds, triggers, and Row Level Security rules.*
*   **Frontend Specifications:** [docs/frontend.md](file:///c:/Users/Paul-Rajeevan/Desktop/Voting/docs/frontend.md) — *Vite + React pages setup, authentication guards, and voting UI features.*
*   **QA & Testing Specifications:** [docs/testing.md](file:///c:/Users/Paul-Rajeevan/Desktop/Voting/docs/testing.md) — *Automated test scenarios, validation checks, and manual testing checklists.*
*   **Git & Issue Workflows:** [docs/git_management.md](file:///c:/Users/Paul-Rajeevan/Desktop/Voting/docs/git_management.md) — *Branching policies, issue tags, and PR review instructions.*
*   **Design System Specs:** [docs/design_system.md](file:///c:/Users/Paul-Rajeevan/Desktop/Voting/docs/design_system.md) — *Color variables, layout guidelines, and design update protocols.*

---

## 1. Project Overview & Requirements

*   **Target Audience:** DreamSpace Academy students and staff.
*   **Authentication & Onboarding:**
    *   Google OAuth login restricted strictly to `@dreamspace.academy` domain emails.
    *   Credentials-based Login (Username/Email & Password) for students manually provisioned by an Administrator.
    *   **Onboarding Flow:** For Google OAuth logins, on first sign-in, users select whether they are a **Student** or **Staff** member. Credentials-based logins bypass onboarding since they are pre-configured as Student.
*   **Role Definitions & Permissions:**
    *   **Student:**
        *   Approved upon selection during onboarding or when manually provisioned by Admin (`role_approved = true`).
        *   Has rights to add/edit their own single portfolio site details.
        *   Has voting rights (3-tier ranked choice).
    *   **Staff:**
        *   Initially set to pending status (`role_approved = false`) on onboarding.
        *   No portfolio uploading rights and no voting rights.
        *   Only after an administrator manually approves/accepts their role, they are granted rights to access the system and monitor activities.
    *   **Administrator:**
        *   Pre-configured role (`is_admin = true` or `role = 'admin'`).
        *   Has rights to release results, approve pending Staff roles, and **provision custom Student credentials** (Username & Password) for students without a `@dreamspace.academy` email.
*   **Voting System (Students Only):**
    *   Each student has exactly 3 votes.
    *   Rank 1 (1st Choice) = **5 points**
    *   Rank 2 (2nd Choice) = **3 points**
    *   Rank 3 (3rd Choice) = **2 points**
    *   Students **are allowed** to vote for their own portfolio.
    *   A student cannot vote for the same portfolio multiple times.
*   **Staff Activity Monitoring:** Approved staff members can view overall submissions, voter turnout, and voting statistics.
*   **Results:** Aggregated and shown on the home screen to general users *only* after an administrator releases them.
*   **Aesthetics:** Sleek, modern Light-Only Theme utilizing the DreamSpace Academy branding palette:
    *   **Primary Purple:** `#7B1FA2` (Indigo/Purple)
    *   **Accent Orange:** `#FF6F00` (Vibrant Orange)
    *   **Backgrounds:** Clean, premium off-white (`#FDFBFD`) and light neutral tones.

---

## 2. Technical Stack

*   **Frontend:** React 18+ (Vite)
*   **Styling:** Vanilla CSS (using global CSS custom properties for theme styling)
*   **Backend & DB:** Supabase (PostgreSQL)
    *   Supabase Auth (Google Provider)
    *   Supabase Database (PostgreSQL with Row Level Security)
*   **Hosting:** Vercel

---

## 3. Database Schema Design (Supabase PostgreSQL)

Below is the database structure that will be provisioned in Supabase.

### 3.1. Tables

#### `profiles`
Holds the user profiles synced with Supabase Auth.
```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  full_name text,
  avatar_url text,
  is_admin boolean default false,
  role text check (role in ('student', 'staff', 'admin')),
  role_approved boolean default false,
  is_admin_created boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Database constraint to enforce domain on DB level (bypass if admin-created)
  constraint dreamspace_email_check check (email like '%@dreamspace.academy' or is_admin_created = true)
);
```

#### `portfolios`
Holds the portfolio details uploaded by users. One user can only upload one portfolio.
```sql
create table public.portfolios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  title text not null,
  description text not null,
  portfolio_url text not null,
  screenshot_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### `votes`
Tracks ranked votes.
```sql
create table public.votes (
  id uuid default gen_random_uuid() primary key,
  voter_id uuid references public.profiles(id) on delete cascade not null,
  portfolio_id uuid references public.portfolios(id) on delete cascade not null,
  rank integer not null check (rank in (1, 2, 3)),
  points integer not null check (points in (5, 3, 2)),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Constraints:
  -- 1. One user can only cast one vote per rank (one 1st, one 2nd, one 3rd choice)
  constraint unique_voter_rank unique (voter_id, rank),
  
  -- 2. One user cannot vote for the same portfolio twice
  constraint unique_voter_portfolio unique (voter_id, portfolio_id),
  
  -- 3. Match rank to correct points
  constraint rank_points_match check (
    (rank = 1 and points = 5) or
    (rank = 2 and points = 3) or
    (rank = 3 and points = 2)
  )
);
```

#### `system_settings`
Global configuration settings (e.g., toggling results release).
```sql
create table public.system_settings (
  key text primary key,
  value jsonb not null
);

-- Seed initial setting
insert into public.system_settings (key, value) 
values ('results_released', 'false'::jsonb)
on conflict (key) do nothing;
```

---

## 4. UI/UX Design System (Vanilla CSS Variables)

A high-fidelity Light Theme using custom properties in `src/index.css`:

```css
:root {
  /* Brand Palette */
  --color-primary: #7B1FA2;       /* Deep Purple */
  --color-primary-light: #F3E5F5; /* Very Light Violet */
  --color-accent: #FF6F00;        /* Vibrant Orange */
  --color-accent-light: #FFF3E0;  /* Very Light Orange */
  
  /* Neutral Palette (Light Theme Only) */
  --color-bg-base: #FDFBFD;       /* Premium off-white background */
  --color-bg-card: #FFFFFF;       /* Pure white card backgrounds */
  --color-text-main: #212121;     /* Charcoal for readability */
  --color-text-muted: #666666;    /* Dark gray for secondary labels */
  --color-border: #E0E0E0;        /* Soft gray borders */
  
  /* Status/Feedback Colors */
  --color-success: #00C853;       /* Green */
  --color-error: #D50000;         /* Red */
  
  /* Typography & Spacing */
  --font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --shadow-sm: 0 2px 8px rgba(123, 31, 162, 0.05);
  --shadow-md: 0 8px 24px rgba(123, 31, 162, 0.08);
  --shadow-lg: 0 16px 40px rgba(123, 31, 162, 0.12);
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 5. Security Policies (Row Level Security)

1.  **Profiles:**
    *   Read: All authenticated users with approved roles (or admins, or self) can view profiles. Unapproved users can only view their own profile.
    *   Write: Users can only insert their own profile on signup. Updates to own profile allowed, excluding `role`, `role_approved`, `is_admin`, and `is_admin_created`. Admins can update any profile to change approval status.
2.  **Portfolios:**
    *   Read: All approved users (students, staff, or admins) can view portfolios. Unapproved staff cannot.
    *   Write: Only approved Students (`role = 'student'` and `role_approved = true`) can create, edit, or delete their own portfolio. Staff and Admins cannot upload portfolios.
3.  **Votes — Strict Anonymity:**
    *   Read: Each student can only read their **own** ballot rows (`auth.uid() = voter_id`). **No other role — including staff and admins — has direct SELECT access to the `votes` table.** Monitoring stats are served via `public.voting_stats` aggregate view; the scoreboard via `public.results_view` (total points per portfolio only).
    *   Write: Only approved Students can cast or modify votes, and only while `results_released = false`. Staff and Admins cannot vote.
4.  **Scoreboard / Results:**
    *   When `results_released = true`, ALL authenticated users may query `public.results_view`.
    *   `results_view` returns: **Portfolio Title, Total Points** — ordered by `total_points DESC`. Individual voter identities and ballot choices are never included.
5.  **System Settings:**
    *   Read: Anyone (including anonymous users) can read `results_released`.
    *   Write: Only administrators (`is_admin = true` or `role = 'admin'`) can update settings.
6.  **Admin Authentication:**
    *   Admins log in via Username (email) and Password using Supabase Auth. Their accounts bypass the `@dreamspace.academy` domain restriction at the auth layer.

---

## 6. Team Roles & Division of Labor

To develop this project collaboratively, the work is divided into four defined roles across database, frontend development, testing, and project management.

### Role A: Database Engineer (1 Person)
**Responsibilities:**
*   **Database Schema & Provisioning:** Execute table setup including `profiles` table updates with `role`, `role_approved`, and `is_admin_created` columns.
*   **Security & RLS Policies:** Implement RLS so that the `votes` table can only be read by the voter themselves (`auth.uid() = voter_id`). No staff or admin has direct `SELECT` access to `votes`.
*   **Aggregate Views:** Create `public.voting_stats` (total voter count, total votes cast) and `public.results_view` (portfolio title + total points, ordered by `total_points DESC`) to serve monitoring and scoreboard data without exposing individual ballots.
*   **Admin Auth Setup:** Pre-configure Admin accounts in Supabase Auth with email/password credentials and set `is_admin = true` in their profile record.
*   **Triggers & DB Constraints:** Enforce domain constraint checks (`email like '%@dreamspace.academy' or is_admin_created = true`) and role check constraints on the database level.

### Role B: Frontend Team (2 Persons)
**Responsibilities:**
*   **Developer 1 (Auth, Onboarding, Shell & Admin Features):**
    *   Initialize the Vite + React codebase.
    *   Build the Login Page with dual inputs: "Sign in with Google" button AND Username/Password form fields.
    *   Implement Google OAuth path (domain check, role onboarding) and Credentials path (bypasses domain check for `is_admin_created` or admin accounts).
    *   Ensure Admin credentials login routes directly to the Admin Dashboard.
    *   Build the Onboarding Role Selection screen (Student vs Staff) and the Pending Approval screen for staff.
    *   Build the Admin Dashboard: toggle `results_released`, Staff Approval Panel, and Student Credentials Provisioning Panel.
*   **Developer 2 (Gallery, Portfolios, Voting UX, Scoreboard & Staff Monitoring):**
    *   Create the main gallery where users see portfolio cards.
    *   Implement the student-only portfolio upload/editing form.
    *   Build the student-only interactive "My Ballot" voting system.
    *   Build the **Points-Only Scoreboard / Leaderboard:** queries `public.results_view` and renders a ranked list showing only Portfolio Title and Total Points, ordered highest to lowest. Scoreboard is only shown when `results_released = true`.
    *   Build the Staff Activity Monitoring view using `public.voting_stats` (aggregate counts only — no individual ballot data).
*   **Shared Frontend Tasks:**
    *   Build custom Vanilla CSS classes inside `index.css` following the premium DreamSpace light-theme design variables.

### Role C: QA Test & Git Issue Manager (1 Person)
**Responsibilities:**
*   **Version Control & Issue Management:**
    *   Set up the GitHub Repository and create issues for role onboarding, pending views, approval flows, credentials provisioning, and anonymity enforcement.
*   **Testing Checklist:**
    *   Verify role selection behavior on first signup (Google OAuth path).
    *   Verify Admin can log in using Username and Password and is routed to the Admin Dashboard.
    *   Verify that credentials-login students bypass the domain check and land on the Student Dashboard.
    *   Verify that staff cannot upload portfolios or vote.
    *   Verify that staff cannot access raw vote data — only aggregate stats.
    *   Verify that no user (including admins) can query other users' vote records directly.
    *   Verify that `public.results_view` only returns Title + Total Points, with no voter details.
    *   Verify that the scoreboard renders ordered by highest points and is hidden until `results_released = true`.
    *   Verify that admins can approve staff roles, and approved staff can immediately access aggregate monitoring.
