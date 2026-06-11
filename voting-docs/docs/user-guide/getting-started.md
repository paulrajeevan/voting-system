---
sidebar_position: 1
title: Getting Started
description: Welcome to the DreamSpace Portfolio Voting System — what it is, how to access it, and what to expect.
---

# Getting Started

Welcome to **Votable** — the DreamSpace Academy Portfolio Voting System. This guide will help you understand what the system does, who can use it, and how to log in for the first time.

## What is Votable?

Votable is a web application that lets DreamSpace Academy students **showcase their portfolio websites** and **vote for their favourites** using a ranked-choice point system. At the end of the voting period, an admin releases a leaderboard showing the total points each portfolio earned — no individual ballot data is ever revealed.

## Who Can Use It?

There are three roles in the system:

| Role | What they can do |
|------|-----------------|
| <span class="badge--student">Student</span> | Upload a portfolio · Cast ranked votes · View the scoreboard |
| <span class="badge--staff">Staff</span> | View aggregate activity stats · Browse portfolios (read-only) |
| <span class="badge--admin">Admin</span> | Approve staff · Provision student accounts · Release results |

## How to Access the App

The app is hosted on Vercel:

> 🌐 **[https://voting-system-ivtksriq3-paul-rajeevans-projects.vercel.app/](https://voting-system-ivtksriq3-paul-rajeevans-projects.vercel.app/)**

Open the link in any modern browser (Chrome, Edge, Safari, or Firefox).

---

## Logging In

The login page presents **two ways to authenticate**:

### Option 1 — Sign in with Google

1. Click the **"Sign in with Google"** button.
2. Choose or enter your **`@dreamspace.academy`** Google account.
3. If you sign in with any other domain (e.g. `@gmail.com`), you will be **blocked** and shown a domain-error message.

:::info First-time Google login?
If this is your first time signing in, you will be shown a **Role Selection Screen** asking whether you are a **Student** or **Staff** member. Pick the appropriate role to complete your registration.
:::

### Option 2 — Username & Password

Used by **Administrators** and students who do not have a `@dreamspace.academy` email. Your credentials must be provisioned by an Administrator before you can log in this way.

1. Enter your **Username / Email** in the first field.
2. Enter your **Password** in the second field.
3. Click **"Login"**.

---

## What Happens After Login?

You are automatically routed to the workspace that matches your role:

| Who you are | Where you land |
|-------------|----------------|
| New Google user | Role Selection Screen |
| Student (approved) | Student Dashboard |
| Staff (pending admin approval) | Pending Approval Screen |
| Staff (approved) | Staff Monitoring Dashboard |
| Admin | Admin Dashboard |

---

## Next Steps

- **Students** → [Student Guide](./students)
- **Staff** → [Staff Guide](./staff)
- **Admins** → [Admin Guide](./admins)
