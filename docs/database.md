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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint dreamspace_email_check check (email like '%@dreamspace.academy')
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
*   **Select:** Authenticated users can view all profiles.
*   **Insert/Update:** Authenticated users can write only their own profile (`auth.uid() = id`).

### Portfolios
*   **Select:** Authenticated users can view all portfolios.
*   **Insert/Update/Delete:** Authenticated users can modify only their own portfolio (`auth.uid() = user_id`).

### Votes
*   **Select:** Authenticated users can view their own votes.
*   **Insert/Update/Delete:** Authenticated users can cast/change their votes ONLY if `results_released` in `system_settings` is `false`.

### System Settings
*   **Select:** Anyone can read settings.
*   **Update:** Only admins (`is_admin = true` on `profiles`) can modify settings.
