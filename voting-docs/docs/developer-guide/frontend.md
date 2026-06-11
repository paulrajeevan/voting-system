---
sidebar_position: 4
title: Frontend
description: Component architecture, screen inventory, and developer assignments for the Votable React application.
---

# Frontend

The frontend is a **React single-page application** built with **Vite** and styled with **Vanilla CSS Custom Properties**. It connects to Supabase via the official `@supabase/supabase-js` client.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Vite | Build tool and dev server |
| React | UI component library |
| Vanilla CSS | Styling (no CSS frameworks) |
| Supabase JS Client | Auth, database queries, realtime |
| ESLint | Code linting |

---

## Developer Assignments

The frontend is split between two developers:

| Area | Developer |
|------|-----------|
| Auth, Onboarding, Admin Dashboard, App Shell | **Dev 1** |
| Portfolio Gallery, Upload Form, Voting UI, Staff Dashboard | **Dev 2** |

---

## Screen Inventory

### Dev 1 Screens

#### Login Page (`/`)
- "Sign in with Google" button (primary)
- Divider
- Username / Email + Password form + "Login" button
- Domain error alert (shown if non-`@dreamspace.academy` Google account used)

#### Role Selection Screen (`/onboarding`)
- Shown to first-time Google OAuth users
- Two options: **Student** or **Staff**
- On submit: creates profile in `public.profiles`
  - Student: `role = 'student'`, `role_approved = true`
  - Staff: `role = 'staff'`, `role_approved = false`

#### Pending Approval Screen (`/pending`)
- Shown to staff members awaiting admin approval
- Displays a holding message; no data access

#### Admin Dashboard (`/admin`)
- Visible only if `is_admin = true` or `role = 'admin'`
- **System Stats Panel:** total voters, portfolios, votes cast
- **Results Release Toggle:** toggles `results_released` in `system_settings`
- **Staff Approval Panel:** lists pending staff with an "Approve" button per row
- **Student Credentials Provisioning Panel:** form with Full Name, Email/Username, Password fields; creates Supabase Auth user + profile record on submit

#### App Shell (all authenticated routes)
- Persistent header with DreamSpace logo and user profile card
- Navigation tabs that show/hide based on role and approval status
- **Mobile:** hamburger menu triggering a sliding side navigation (< 768px)

---

### Dev 2 Screens

#### Portfolio Gallery (`/student`, `/staff`)
- CSS Grid: `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`
- Search/filter bar (by name or title)
- Hover animation: `transform: translateY(-4px)` + shadow increase
- Each card links to the portfolio URL

#### Portfolio Upload / Edit Form (Student only)
- Fields: Title, URL (must begin with `https://`), Description
- Validates all fields before submission
- Upserts into `public.portfolios`
- Only rendered for: `role = 'student'` AND `role_approved = true`

#### Voting Interface (Student only)
- Rank selector buttons on each portfolio card: **Rank 1st / 2nd / 3rd**
- **My Ballot Drawer** — sticky bottom panel showing:
  - 1st Choice (5 pts)
  - 2nd Choice (3 pts)
  - 3rd Choice (2 pts)
- Slide-up/down animation on drawer open/close (`cubic-bezier(0.4, 0, 0.2, 1)`)
- "Submit Votes" button — inserts 3 rows into `public.votes`
- Only rendered for: `role = 'student'` AND `role_approved = true`

#### Scoreboard / Leaderboard (All roles, when released)
- Only displayed when `results_released = true` (queried from `system_settings`)
- Queries `public.results_view` from Supabase
- Renders ordered list: **Portfolio Title** + **Total Points** only
- Staggered card slide-in animation on mount
- **Strictly no voter names, ballot choices, or individual vote data**

#### Staff Monitoring Dashboard (`/staff`)
- Accessible for: `role = 'staff'` AND `role_approved = true`
- Read-only portfolio gallery (no upload or voting controls)
- Aggregate stats from `public.voting_stats`:
  - Total students registered
  - Total votes cast
  - Voter turnout percentage

---

## Authentication Logic

### Google OAuth Path

```js
// After successful OAuth callback
const { data: { user } } = await supabase.auth.getUser();

// 1. Domain check
if (!user.email.endsWith('@dreamspace.academy')) {
  await supabase.auth.signOut();
  showDomainError();
  return;
}

// 2. Profile check
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

if (!profile) {
  // New user — show Role Selection Screen
  navigate('/onboarding');
} else {
  // Route by role
  routeByRole(profile);
}
```

### Credentials Path

```js
const { error } = await supabase.auth.signInWithPassword({
  email: formEmail,
  password: formPassword,
});

if (error) { showLoginError(error.message); return; }

const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', (await supabase.auth.getUser()).data.user.id)
  .single();

routeByRole(profile); // bypasses domain check
```

### `routeByRole` Helper

```js
function routeByRole(profile) {
  if (profile.is_admin || profile.role === 'admin') {
    navigate('/admin');
  } else if (profile.role === 'student' && profile.role_approved) {
    navigate('/student');
  } else if (profile.role === 'staff' && profile.role_approved) {
    navigate('/staff');
  } else {
    navigate('/pending');
  }
}
```

---

## CSS Architecture

All styles use **CSS Custom Properties** defined in `src/index.css`. Key tokens:

```css
:root {
  --color-primary: #7B1FA2;
  --color-accent:  #FF6F00;
  --color-primary-light: #F3E5F5;
  --color-accent-light:  #FFF3E0;
  --color-canvas:  #FDFBFD;
  --color-card:    #FFFFFF;
  --color-text:    #212121;
  --color-muted:   #666666;
  --color-border:  #E0E0E0;

  --transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.18);
  --radius:    8px;
}
```

See the [Design System](./design-system) page for the full token reference and animation specs.

---

## Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| < 768px (Mobile) | 1-column gallery, hamburger nav, sticky bottom ballot drawer |
| 768px – 1024px (Tablet) | 2-column gallery, toggleable overlay sidebars |
| > 1024px (Desktop) | 3–4 column gallery, side-by-side voting workspace |
