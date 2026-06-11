---
sidebar_position: 1
title: Project Setup
description: How to clone, configure, and run the DreamSpace Portfolio Voting System locally.
---

# Project Setup

This guide walks through setting up the **full development environment** for Votable — both the Supabase backend and the Vite + React frontend.

## Prerequisites

Ensure you have the following installed:

| Tool | Version |
|------|---------|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| Git | ≥ 2.x |
| A Supabase account | [supabase.com](https://supabase.com) |

---

## Step 1 — Supabase Backend Setup

### 1.1 Create a Supabase Project

1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **"New Project"**, fill in a name, select a region, and set a database password.
3. Wait for the project to provision (~1 minute).

### 1.2 Enable Google OAuth

1. In your Supabase project, go to **Authentication → Providers**.
2. Enable the **Google** provider.
3. Enter your **Google OAuth Client ID** and **Client Secret** (from [Google Cloud Console](https://console.cloud.google.com/)).
4. Add your app's redirect URL to the Google OAuth consent screen's authorised redirect URIs:
   ```
   https://<your-supabase-project>.supabase.co/auth/v1/callback
   ```

### 1.3 Apply the Database Schema

1. In your Supabase project, go to **SQL Editor**.
2. Paste and execute the full schema from [Database — Schema Definition](./database#1-schema-definition).
3. Then execute the RLS policies from [Database — Row Level Security](./database#2-row-level-security-rls-policies).
4. Execute the aggregate views from [Database — Aggregate Views](./database#3-aggregate-views-anonymity-enforcement).

### 1.4 Create the Admin Account

Administrators are provisioned directly via Supabase Auth (not through the app UI):

1. In Supabase → **Authentication → Users**, click **"Add User"**.
2. Enter the admin's email and a secure password.
3. In the **SQL Editor**, insert a matching profile record:

```sql
INSERT INTO public.profiles (id, email, full_name, is_admin, role, role_approved, is_admin_created)
VALUES (
  '<user-uuid-from-auth-users>',
  'admin@example.com',
  'Administrator',
  true,
  'admin',
  true,
  true
);
```

---

## Step 2 — Frontend Setup

### 2.1 Clone the Repository

```bash
git clone <repository-url>
cd Voting/votable
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Configure Environment Variables

Create a `.env` file in the `votable/` directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase project values:

```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```

You can find these values in your Supabase project under **Settings → API**.

:::caution Never commit your .env file
The `.gitignore` already excludes `.env`. Do not remove this exclusion or commit credentials to the repository.
:::

### 2.4 Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

---

## Step 3 — Verify the Setup

Run through this checklist to confirm everything works:

- [ ] Login page loads with both Google and credentials forms
- [ ] Google OAuth redirects to `@dreamspace.academy` domain-check flow
- [ ] Admin credentials log in and route directly to Admin Dashboard
- [ ] Portfolio gallery loads after student login
- [ ] Voting interface renders for approved students

---

## Deployment (Vercel)

The project is pre-configured for Vercel deployment:

1. Push to the `main` branch to trigger an automatic production deployment.
2. In your Vercel project settings, add the environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Add your Vercel production URL to Supabase Auth → **URL Configuration → Redirect URLs**.

---

## Useful Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server (hot reload) |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on the source code |
