# Database Specification & Schema Plan

This document details the database schema, constraints, security rules, and installation guidelines for the **Database Engineer**.

## 1. Schema Definition

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
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
  
  constraint dreamspace_email_check check (email like '%@dreamspace.academy' or is_admin_created = true)
);

-- 2. Portfolios Table
create table public.portfolios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  title text not null,
  description text not null,
  portfolio_url text not null,
  screenshot_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Votes Table
create table public.votes (
  id uuid default gen_random_uuid() primary key,
  voter_id uuid references public.profiles(id) on delete cascade not null,
  portfolio_id uuid references public.portfolios(id) on delete cascade not null,
  rank integer not null check (rank in (1, 2, 3)),
  points integer not null check (points in (5, 3, 2)),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint unique_voter_rank unique (voter_id, rank),
  constraint unique_voter_portfolio unique (voter_id, portfolio_id),
  constraint rank_points_match check (
    (rank = 1 and points = 5) or
    (rank = 2 and points = 3) or
    (rank = 3 and points = 2)
  )
);

-- 4. System Settings Table
create table public.system_settings (
  key text primary key,
  value jsonb not null
);

-- Seed values
insert into public.system_settings (key, value) 
values ('results_released', 'false'::jsonb)
on conflict (key) do nothing;
```

## 2. Row Level Security (RLS) Policies

Enable RLS on all tables and configure:

### Profiles
*   **Select:** Authenticated users (where `role_approved = true` or `is_admin = true` or `id = auth.uid()`) can view all profiles. Unapproved users can only view their own profile.
*   **Insert:** Authenticated users can insert their own profile on signup (`auth.uid() = id`).
*   **Update:** 
    *   Authenticated users can modify only their own profile's fields (`auth.uid() = id`) excluding `role`, `role_approved`, and `is_admin`.
    *   Administrators (`is_admin = true` or `role = 'admin'`) can update any profile (e.g. to set `role_approved = true`).

### Portfolios
*   **Select:** Authenticated users with approved status (`role_approved = true` or `is_admin = true`) can view all portfolios.
*   **Insert/Update/Delete:** Only approved Students (`role = 'student'` and `role_approved = true`) can create, edit, or delete their own portfolio (`auth.uid() = user_id`).

### Votes
*   **Select (Strict Anonymity):**
    *   Each student can only view their **own** votes (`auth.uid() = voter_id`).
    *   **No other user — including staff and administrators — has `SELECT` access to the `votes` table directly.**
    *   Activity monitoring metrics (e.g. total votes cast, turnout count) must be served through a **dedicated aggregate database view** (`public.voting_stats`) that returns only counts and totals — never individual ballot rows.
    *   The leaderboard scoreboard is served through a separate **`public.results_view`** that returns only `portfolio_id`, `title`, and aggregated `total_points`, ordered by `total_points DESC`. Individual voter identities are never exposed.
*   **Insert/Update/Delete:** Only approved Students (`role = 'student'` and `role_approved = true`) can cast or modify their votes, and ONLY if `results_released` in `system_settings` is `false`.

### Aggregate Views (Anonymity Enforcement)
```sql
-- Aggregate stats for staff/admin monitoring (no individual ballots revealed)
create view public.voting_stats as
  select
    count(distinct voter_id) as total_voters,
    count(*) as total_votes_cast
  from public.votes;

-- Scoreboard view: only total points per portfolio, ordered by score
create view public.results_view as
  select
    p.id as portfolio_id,
    p.title,
    p.portfolio_url,
    coalesce(sum(v.points), 0) as total_points
  from public.portfolios p
  left join public.votes v on v.portfolio_id = p.id
  group by p.id, p.title, p.portfolio_url
  order by total_points desc;
```

### System Settings
*   **Select:** Anyone can read settings.
*   **Update:** Only admins (`is_admin = true` or `role = 'admin'` on `profiles`) can modify settings.
