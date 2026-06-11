---
sidebar_position: 3
title: Database
description: PostgreSQL schema, Row Level Security policies, and aggregate views for the Votable system.
---

# Database

Votable's backend is **Supabase (PostgreSQL)** with Row Level Security (RLS) enabled on all tables. This page documents the full schema, constraints, security policies, and monitoring views.

---

## 1. Schema Definition

Run the following SQL in the **Supabase SQL Editor** to create all tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. Profiles Table ─────────────────────────────────────────────
CREATE TABLE public.profiles (
  id              uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email           text NOT NULL UNIQUE,
  full_name       text,
  avatar_url      text,
  is_admin        boolean DEFAULT false,
  role            text CHECK (role IN ('student', 'staff', 'admin')),
  role_approved   boolean DEFAULT false,
  is_admin_created boolean DEFAULT false,
  created_at      timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Enforce domain OR admin-created flag
  CONSTRAINT dreamspace_email_check
    CHECK (email LIKE '%@dreamspace.academy' OR is_admin_created = true)
);

-- ─── 2. Portfolios Table ────────────────────────────────────────────
CREATE TABLE public.portfolios (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  title           text NOT NULL,
  description     text NOT NULL,
  portfolio_url   text NOT NULL,
  screenshot_url  text,
  created_at      timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 3. Votes Table ─────────────────────────────────────────────────
CREATE TABLE public.votes (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_id        uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  portfolio_id    uuid REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  rank            integer NOT NULL CHECK (rank IN (1, 2, 3)),
  points          integer NOT NULL CHECK (points IN (5, 3, 2)),
  created_at      timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Uniqueness constraints
  CONSTRAINT unique_voter_rank       UNIQUE (voter_id, rank),
  CONSTRAINT unique_voter_portfolio  UNIQUE (voter_id, portfolio_id),

  -- Rank ↔ points must match
  CONSTRAINT rank_points_match CHECK (
    (rank = 1 AND points = 5) OR
    (rank = 2 AND points = 3) OR
    (rank = 3 AND points = 2)
  )
);

-- ─── 4. System Settings Table ───────────────────────────────────────
CREATE TABLE public.system_settings (
  key   text PRIMARY KEY,
  value jsonb NOT NULL
);

-- Seed the results_released flag (starts as false)
INSERT INTO public.system_settings (key, value)
VALUES ('results_released', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;
```

---

## 2. Table Reference

### `profiles`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Matches `auth.users.id` |
| `email` | `text` | User's email address |
| `full_name` | `text` | Display name |
| `avatar_url` | `text` | Google profile photo URL |
| `is_admin` | `boolean` | True for administrator accounts |
| `role` | `text` | `'student'`, `'staff'`, or `'admin'` |
| `role_approved` | `boolean` | Staff must be approved; students are auto-approved |
| `is_admin_created` | `boolean` | True for accounts provisioned by admin (bypasses domain check) |
| `created_at` | `timestamptz` | Account creation timestamp |

### `portfolios`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Portfolio identifier |
| `user_id` | `uuid` | References `profiles.id` (one portfolio per user) |
| `title` | `text` | Project title |
| `description` | `text` | Short project summary |
| `portfolio_url` | `text` | URL to the portfolio site |
| `screenshot_url` | `text` | Optional preview image URL |
| `created_at` | `timestamptz` | Submission timestamp |

### `votes`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Vote record identifier |
| `voter_id` | `uuid` | References `profiles.id` |
| `portfolio_id` | `uuid` | References `portfolios.id` |
| `rank` | `integer` | 1, 2, or 3 |
| `points` | `integer` | 5, 3, or 2 (must match rank) |
| `created_at` | `timestamptz` | Ballot submission timestamp |

### `system_settings`

| Column | Type | Description |
|--------|------|-------------|
| `key` | `text` | Setting name (e.g. `results_released`) |
| `value` | `jsonb` | Setting value (e.g. `true` / `false`) |

---

## 2. Row Level Security (RLS) Policies

Enable RLS on all tables first:

```sql
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
```

### Profiles Policies

```sql
-- SELECT: approved users see all profiles; others see only their own
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (
    role_approved = true OR is_admin = true OR id = auth.uid()
  );

-- INSERT: users can create their own profile on signup
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE (self): users can update their own non-sensitive fields
CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- UPDATE (admin): admins can update any profile (e.g. approve staff)
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
    )
  );
```

### Portfolios Policies

```sql
-- SELECT: approved users and admins can view all portfolios
CREATE POLICY "portfolios_select" ON public.portfolios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.role_approved = true OR p.is_admin = true)
    )
  );

-- INSERT/UPDATE/DELETE: only approved students, own portfolio only
CREATE POLICY "portfolios_write" ON public.portfolios
  FOR ALL USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'student' AND p.role_approved = true
    )
  );
```

### Votes Policies

```sql
-- SELECT: each student sees only their own votes; nobody else has access
CREATE POLICY "votes_select_own" ON public.votes
  FOR SELECT USING (auth.uid() = voter_id);

-- INSERT: only approved students can vote, and only while results are not released
CREATE POLICY "votes_insert" ON public.votes
  FOR INSERT WITH CHECK (
    auth.uid() = voter_id AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'student' AND p.role_approved = true
    ) AND
    (SELECT (value::boolean) FROM public.system_settings WHERE key = 'results_released') = false
  );
```

### System Settings Policies

```sql
-- SELECT: anyone authenticated can read settings
CREATE POLICY "settings_select" ON public.system_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- UPDATE: only admins can modify settings
CREATE POLICY "settings_update_admin" ON public.system_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
    )
  );
```

---

## 3. Aggregate Views (Anonymity Enforcement)

These views are the **only** way staff and admins can access voting-related data. They never expose individual ballot rows.

```sql
-- ─── Aggregate stats for staff/admin monitoring ──────────────────────
CREATE VIEW public.voting_stats AS
  SELECT
    COUNT(DISTINCT voter_id) AS total_voters,
    COUNT(*)                 AS total_votes_cast
  FROM public.votes;

-- ─── Scoreboard: only total points per portfolio, ordered by score ───
CREATE VIEW public.results_view AS
  SELECT
    p.id              AS portfolio_id,
    p.title,
    p.portfolio_url,
    COALESCE(SUM(v.points), 0) AS total_points
  FROM public.portfolios p
  LEFT JOIN public.votes v ON v.portfolio_id = p.id
  GROUP BY p.id, p.title, p.portfolio_url
  ORDER BY total_points DESC;
```

---

## Scoring Formula

```
Score = (1st-place votes × 5) + (2nd-place votes × 3) + (3rd-place votes × 2)
```

The `results_view` computes this automatically using `SUM(v.points)` since the `points` column already stores the weighted value per ballot row.
