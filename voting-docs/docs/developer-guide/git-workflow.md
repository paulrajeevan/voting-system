---
sidebar_position: 6
title: Git Workflow
description: Branching strategy, issue management, commit conventions, and pull request process for the Votable project.
---

# Git Workflow

This page documents the branching strategy, issue tracking process, commit message conventions, and pull request review requirements used by the Votable development team.

---

## Branch Structure

```
main
 └── dev
      ├── feature/issue-12-google-oauth
      ├── feature/issue-15-voting-ui
      ├── feature/issue-18-database-rls
      └── fix/issue-22-ballot-drawer
```

| Branch | Purpose |
|--------|---------|
| `main` | Stable production. Auto-deploys to Vercel. **Never push directly.** |
| `dev` | Integration branch. All feature branches merge here first. |
| `feature/issue-[id]-[description]` | One branch per task / GitHub Issue. |
| `fix/issue-[id]-[description]` | Bug fix branches. |

---

## Issue Labels

Create GitHub Issues with the following labels to assign work:

| Label | Assignee |
|-------|---------|
| `database` | Database Engineer |
| `frontend:auth` | Frontend Dev 1 |
| `frontend:gallery` | Frontend Dev 2 |
| `qa:testing` | QA / Git Manager |

All pull requests must reference the issue they fix:
```
Closes #12
```

---

## Step-by-Step Contribution Workflow

### Step 1 — Claim Your Issue

1. Go to the GitHub repository **Issues** tab.
2. Find the issue assigned to your role.
3. Move its status to **"In Progress"**.

---

### Step 2 — Create Your Branch

Always branch from the latest `dev`:

```bash
git checkout dev
git pull origin dev
git checkout -b feature/issue-12-google-oauth
```

---

### Step 3 — Develop & Commit

Write your code following the [Design System](./design-system) and [Frontend](./frontend) specifications.

Commit with descriptive messages using [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
git add .
git commit -m "feat(auth): add email domain restriction on Google OAuth callback"
```

**Commit type prefixes:**

| Prefix | When to use |
|--------|------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change with no behaviour change |
| `style` | CSS-only changes |
| `docs` | Documentation updates |
| `test` | Adding or updating tests |
| `chore` | Build/config changes |

---

### Step 4 — Stay Synced with `dev`

Before pushing, merge the latest `dev` into your branch to catch any conflicts early:

```bash
git checkout dev
git pull origin dev
git checkout feature/issue-12-google-oauth
git merge dev
```

Resolve any conflicts locally, then verify the build compiles:

```bash
npm run build
```

---

### Step 5 — Push & Open a Pull Request

```bash
git push origin feature/issue-12-google-oauth
```

On GitHub:

1. Click **"Compare & pull request"**.
2. Set the base branch to **`dev`** (never `main`).
3. Add a description and include `Closes #12` (or `Fixes #12`) to auto-close the issue on merge.
4. Assign at least one reviewer.

---

### Step 6 — Review & Merge

**Before merging, the following must be satisfied:**

- [ ] At least **one peer review** approval
- [ ] All Vercel preview checks pass (no build errors)
- [ ] Deployment preview reviewed for layout issues (light theme, responsiveness)
- [ ] No merge conflicts with `dev`

The **Git Manager** performs the final merge into `dev`.

After merging, clean up your local environment:

```bash
git checkout dev
git pull origin dev
```

---

## Merging `dev` → `main` (Release)

Only the **Git Manager** merges `dev` into `main` after a full QA sign-off:

```bash
git checkout main
git pull origin main
git merge dev
git push origin main
```

Vercel will automatically deploy the updated `main` branch to production.

---

## PR Review Guidelines

| Type of change | Reviewer requirement |
|----------------|---------------------|
| Frontend UI changes | At least 1 other frontend developer |
| Database / RLS changes | Git Manager + QA review |
| Auth changes | Git Manager review |
| Docs only | No approval required (merge directly to `dev`) |
