---
sidebar_position: 3
title: Staff Guide
description: How to request staff access, monitor voting activity, and understand what data is visible to approved staff members.
---

# Staff Guide

<span class="badge--staff">Staff</span>

Staff members have **read-only monitoring access** to the voting system. You can view aggregate activity statistics and browse the portfolio gallery, but you cannot upload portfolios or cast votes.

---

## Registering as Staff

1. Open the app and click **"Sign in with Google"**.
2. Use your `@dreamspace.academy` Google account.
3. On the **Role Selection Screen** (first-time login only), select **Staff**.
4. Your account is created with `role_approved = false` — meaning you are **pending administrator approval**.

:::warning Waiting for Approval
After selecting "Staff", you will land on a **Pending Approval Screen**. You will not have access to the monitoring dashboard until an Administrator approves your account.
:::

Notify your Administrator that you have registered so they can approve your account.

---

## After Approval

Once an Administrator approves your account, you can log in and access the **Staff Monitoring Dashboard**.

---

## What Staff Can See

### Portfolio Gallery (Read-Only)

A full grid of all submitted portfolios — identical to what students see, but without any upload or voting controls.

### Aggregate Activity Stats

The monitoring dashboard shows live stats sourced from anonymised database views:

| Metric | Description |
|--------|-------------|
| **Total Students Registered** | Number of student profiles in the system |
| **Total Votes Cast** | Aggregate count of all votes submitted |
| **Voter Turnout** | Percentage of eligible students who have voted |

:::danger Anonymity is enforced at the database level
Staff **cannot** see:
- Which student voted for which portfolio
- Individual ballot choices or rankings
- Any raw data from the `votes` table

Attempting to query vote data directly returns zero rows or a permission error — this is by design and cannot be bypassed.
:::

---

## What Staff Cannot Do

| Action | Status |
|--------|--------|
| Upload a portfolio | ❌ Blocked |
| Edit a portfolio | ❌ Blocked |
| Cast a vote | ❌ Blocked |
| View individual ballots | ❌ Blocked (RLS enforced) |
| Approve other staff | ❌ Admin only |
| Release results | ❌ Admin only |

---

## Viewing the Scoreboard

The scoreboard becomes visible to staff **after the Administrator releases results**. It shows:

- Portfolio Title
- Total Points (ordered highest to lowest)

No voter identities or ballot choices are included.

---

## Frequently Asked Questions

**My account is stuck on the Pending Approval Screen — what do I do?**
Contact your Administrator and let them know you've registered. They need to approve your account in the Admin Dashboard.

**Can I see how individual students voted?**
No. The system enforces strict anonymity via Row Level Security policies. No one — including admins — can see individual ballot data.

**Can I switch from Staff to Student?**
No. Role changes require Administrator intervention. Contact your admin if you selected the wrong role.
