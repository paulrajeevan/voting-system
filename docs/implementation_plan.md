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

*   **Target Audience:** DreamSpace Academy students/staff.
*   **Authentication:** Strictly Google OAuth restricted to emails ending with `@dreamspace.academy`.
*   **Portfolio Management:** Users can upload their portfolio site (Title, URL, Description, and preview screenshot/metadata).
*   **Voting System:**
    *   Each user has exactly 3 votes.
    *   Rank 1 (1st Choice) = **5 points**
    *   Rank 2 (2nd Choice) = **3 points**
    *   Rank 3 (3rd Choice) = **2 points**
    *   Users **are allowed** to vote for their own portfolio.
    *   A user cannot vote for the same portfolio multiple times.
*   **Results:** Aggregated and shown on the home screen *only* after an administrator releases them.
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Database constraint to enforce domain on DB level
  constraint dreamspace_email_check check (email like '%@dreamspace.academy')
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
    *   Read: All authenticated users can read all profiles.
    *   Write: Users can only write/update their own profile.
2.  **Portfolios:**
    *   Read: All authenticated users can view portfolios.
    *   Write: Authenticated users can insert/update their own portfolio.
3.  **Votes:**
    *   Read: Authenticated users can read their own votes. Admin can read all votes.
    *   Write: Authenticated users can insert/update/delete their own votes *unless* the results have been finalized/released.
4.  **System Settings:**
    *   Read: Anyone (even anonymous or authenticated users) can read the status of `results_released`.
    *   Write: Only administrators (`is_admin = true` in profiles) can update settings.

---

## 6. Team Roles & Division of Labor

To develop this project collaboratively, the work is divided into four defined roles across database, frontend development, testing, and project management.

### Role A: Database Engineer (1 Person)
**Responsibilities:**
*   **Database Schema & Provisioning:** Execute table setup (`profiles`, `portfolios`, `votes`, `system_settings`) in Supabase.
*   **Security & RLS Policies:** Implement Row Level Security (RLS) policies to protect votes, restrict edits, and allow public views where needed.
*   **Triggers & DB Constraints:** Enforce constraints such as the `@dreamspace.academy` email domain check on the database level, and strict rank-points matching.
*   **Collaboration:** Provide connection credentials/API routes and guide Frontend developers on database structure and column names.

### Role B: Frontend Team (2 Persons)
**Responsibilities:**
*   **Developer 1 (Auth, Shell & Admin Features):**
    *   Initialize the Vite + React codebase.
    *   Implement Google OAuth flow and block sign-in/profile creation for non-DreamSpace domains.
    *   Build the Admin Dashboard page where results can be toggled (released/unreleased).
*   **Developer 2 (Gallery, Portfolios & Voting UX):**
    *   Create the main dashboard/gallery where users see portfolio cards.
    *   Implement the portfolio upload/editing form.
    *   Build the interactive "My Ballot" voting system (allowing drag-and-drop or rank selection: 1st, 2nd, 3rd choices).
*   **Shared Frontend Tasks:**
    *   Build custom Vanilla CSS classes inside `index.css` following the premium DreamSpace light-theme design variables.

### Role C: QA Test & Git Issue Manager (1 Person)
**Responsibilities:**
*   **Version Control & Issue Management:**
    *   Set up the GitHub Repository.
    *   Create GitHub Issues for each deliverable task listed above, tagging the respective assignees.
    *   Set up pull request templates and manage branching strategy (e.g. `main` <- `dev` <- feature branches).
*   **Testing Checklist:**
    *   Write integration/unit tests for validation checks.
    *   Verify edge cases (e.g. attempting to vote twice for the same portfolio, voting for a 4th portfolio, uploading without domain email).
    *   Conduct manual UI testing on light mode layout across multiple screen widths.
    *   Report bugs as Git Issues and verify bug fixes before code is merged into `main`.

---


