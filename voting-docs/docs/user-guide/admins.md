---
sidebar_position: 4
title: Admin Guide
description: How to log in as an admin, approve staff accounts, provision student credentials, and control result release.
---

# Admin Guide

<span class="badge--admin">Admin</span>

Administrators are the system operators of Votable. You manage the full lifecycle of a voting event: approving participants, controlling access, and releasing results when voting is complete.

:::caution Admin accounts are pre-configured
Admin accounts are **not** created through the app's self-signup flow. Your email and password credentials are set up directly in Supabase by the system owner before you can log in.
:::

---

## Logging In

Administrators always log in using the **Username & Password** form — never Google OAuth.

1. On the login page, enter your **Admin Email** in the Username/Email field.
2. Enter your **Password**.
3. Click **"Login"**.
4. You will be routed directly to the **Admin Dashboard**.

The `@dreamspace.academy` domain restriction is automatically bypassed for admin accounts.

---

## The Admin Dashboard

The Admin Dashboard is your control centre. It contains three main panels:

### 1. System Stats Panel

A live overview of system activity:

| Metric | Description |
|--------|-------------|
| Total Students | Number of registered student profiles |
| Total Portfolios | Number of submitted portfolios |
| Total Votes Cast | Aggregate votes across all students |
| Voter Turnout | Percentage of eligible students who voted |

---

### 2. Staff Approval Panel

New staff members who signed up via Google OAuth appear here as **pending**. Their access is blocked until you approve them.

**To approve a staff member:**

1. Locate the pending staff member in the **Staff Approval Panel**.
2. Review their name and email.
3. Click **"Approve Staff"** on their row.
4. Their `role_approved` flag is set to `true` — they can now access the monitoring dashboard.

:::tip You can approve multiple staff at once
Each pending staff row has its own Approve button. Work through the list as needed.
:::

---

### 3. Student Credentials Provisioning Panel

Some students may not have a `@dreamspace.academy` Google account. You can create login credentials for them directly.

**To provision a student account:**

1. Locate the **Student Credentials Provisioning** panel in the Admin Dashboard.
2. Fill in the form:

   | Field | Description |
   |-------|-------------|
   | **Full Name** | The student's display name |
   | **Email / Username** | Their login identifier (can be any email format) |
   | **Password** | A temporary password to share with them |

3. Click **"Create Student"**.
4. The account is created in Supabase Auth with:
   - `role = 'student'`
   - `role_approved = true`
   - `is_admin_created = true` (bypasses domain restriction)

Share the credentials with the student via a secure channel. They can log in using the **Username & Password** form.

---

### 4. Results Release Toggle

Control when the scoreboard becomes visible to all users.

| Setting | Effect |
|---------|--------|
| **Results Released = false** | Scoreboard is hidden from all users. Voting is open. |
| **Results Released = true** | Scoreboard is revealed. Voting is locked (no new votes accepted). |

**To release results:**

1. Confirm voting has concluded and all ballots are submitted.
2. Click the **"Release Results"** toggle in the Admin Dashboard.
3. The setting is saved to the database. The scoreboard immediately becomes visible to all logged-in users.

**To un-release results:**

Click the toggle again. This hides the scoreboard and re-opens voting.

:::warning Releasing results locks voting
When `results_released = true`, the database blocks any new vote inserts. Students will see the scoreboard instead of the voting interface.
:::

---

## Scoreboard Format

When results are released, the leaderboard displays:

- **Portfolio Title**
- **Total Points** (ordered highest to lowest)

The scoring formula is:

```
Score = (Number of 1st-place votes × 5) + (Number of 2nd-place votes × 3) + (Number of 3rd-place votes × 2)
```

No voter names, ballot choices, or individual vote data are ever shown in the scoreboard — this is enforced at the database view level.

---

## Anonymity Guarantees

Even as an administrator, you **cannot** access individual ballot data.

- Attempting to query the raw `votes` table returns **zero rows** (Row Level Security blocks it).
- Activity metrics and the scoreboard are served through anonymised aggregate database views.
- This is a deliberate design decision and cannot be overridden from within the app.

---

## Frequently Asked Questions

**How do I create the initial admin account?**
Admin accounts are created directly in Supabase Auth by the project owner (outside the app). See the [Developer Setup Guide](../developer-guide/setup) for instructions.

**Can I delete a portfolio or remove a vote?**
Currently, portfolio and vote management is handled via the Supabase Dashboard. The app does not expose a delete interface for administrators.

**Can I change a student back to pending (unapprove them)?**
Role management beyond approval is handled via the Supabase Dashboard. Contact the system owner if you need to revoke access.

**What if I release results accidentally?**
Toggle the release setting back to `false`. The scoreboard will be hidden and voting will re-open until you release again.
