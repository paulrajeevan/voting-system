---
sidebar_position: 2
title: Architecture
description: High-level system architecture, technology stack, and data flow of the Votable system.
---

# Architecture

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React (Vite) |
| **Styling** | Vanilla CSS Custom Properties |
| **Auth** | Supabase Auth (Google OAuth + Email/Password) |
| **Database** | Supabase (PostgreSQL with RLS) |
| **Hosting** | Vercel (static bundle) |

---

## System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      Client Browser                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │              React SPA (Vite bundle)              │  │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐ │  │
│  │  │ Auth UI  │  │ Gallery  │  │  Voting/Admin   │ │  │
│  │  └────┬─────┘  └────┬─────┘  └────────┬────────┘ │  │
│  └───────┼─────────────┼─────────────────┼──────────┘  │
└──────────┼─────────────┼─────────────────┼─────────────┘
           │  HTTPS/REST │                 │
┌──────────▼─────────────▼─────────────────▼─────────────┐
│                  Supabase Cloud Backend                  │
│  ┌────────────────────┐  ┌──────────────────────────┐   │
│  │   Supabase Auth    │  │   PostgreSQL Database    │   │
│  │  Google OAuth 2.0  │  │  + Row Level Security    │   │
│  │  Email/Password    │  │  + Aggregate Views       │   │
│  └────────────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
User visits /login
     │
     ├─── Google OAuth ──────────────────────────────────┐
     │         │                                         │
     │    Domain check (@dreamspace.academy)             │
     │         │                                         │
     │    ✅ Pass → profile exists?                       │
     │         ├── Yes → route by role                   │
     │         └── No  → Role Selection Screen           │
     │                        │                          │
     │              Student / Staff selection            │
     │                        │                          │
     │              Create profile in DB                 │
     │                                                   │
     └─── Credentials Login ─────────────────────────────┘
               │
          Supabase Auth
               │
          Fetch profile
               │
          is_admin? ──── Yes ──→ Admin Dashboard
               │
     is_admin_created? ─ Yes ──→ Student Dashboard
               │
          domain check bypass for admin-created accounts
```

---

## Role-Based Routing

| Condition | Route |
|-----------|-------|
| No profile found (new user) | `/onboarding` (Role Selection) |
| `role = 'student'` and `role_approved = true` | `/student` |
| `role = 'staff'` and `role_approved = false` | `/pending` |
| `role = 'staff'` and `role_approved = true` | `/staff` |
| `is_admin = true` or `role = 'admin'` | `/admin` |

---

## Data Access Model

The data access model is enforced at the **PostgreSQL RLS layer**, not the application layer. This means it cannot be bypassed even if the frontend code is modified.

### What each role can read/write

| Resource | Student | Staff (approved) | Admin |
|----------|---------|-----------------|-------|
| Own profile | R/W | R | R |
| All profiles | R | R | R/W |
| Own portfolio | R/W | — | — |
| All portfolios | R | R | R |
| Own votes | R/W | — | — |
| Others' votes | ❌ | ❌ | ❌ |
| `voting_stats` view | — | R | R |
| `results_view` | R (if released) | R (if released) | R |
| `system_settings` | R | R | R/W |

_R = Read, W = Write, — = No access, ❌ = Explicitly blocked by RLS_

---

## Anonymity Architecture

Vote anonymity is enforced through three layers:

1. **RLS on `votes` table:** Only `auth.uid() = voter_id` rows are visible. All other rows return empty. This blocks staff and admins from querying the raw table.

2. **`public.voting_stats` view:** Returns aggregate counts only (`total_voters`, `total_votes_cast`). No voter IDs or portfolio choices are exposed.

3. **`public.results_view` view:** Returns `portfolio_id`, `title`, and `total_points`. No voter identity, rank choice, or individual ballot data is included.

The scoreboard UI is also strictly limited to only rendering these two fields from `results_view`.

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Vanilla CSS only (no Tailwind) | Team constraint — consistent with project brief |
| Light theme only | DreamSpace brand identity requirement |
| Supabase RLS for anonymity | Enforces anonymity at the infrastructure level, not just the UI |
| Aggregate views for monitoring | Prevents accidental ballot exposure through API queries |
| Vercel + static bundle | Simple, zero-config CI/CD with Supabase as the sole backend |
