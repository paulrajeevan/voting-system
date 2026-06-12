# Staff User Guide

Staff members of DreamSpace Academy act as monitors of the portfolio voting process. This is a read-only role designed to oversee activity without interfering with candidate uploads or ballot submissions.

---

## 🔒 Step 1: Registration & Admin Approval
To sign up as a monitor:

1. **Sign In:** On the login screen, click **"Sign in with Google"** and authenticate using your `@dreamspace.academy` account.
2. **Select Staff Role:** If this is your first sign-in, the system will present the **Role Onboarding** screen. Select **"Staff"**.
3. **Wait for Approval:**
   - Newly registered staff profiles default to `role_approved = false`.
   - You will see a **Pending Approval** notice. You will remain on this screen until an Administrator reviews and approves your account.
   - Once approved, reloading the application will grant you immediate access to the **Staff Activity Monitoring Dashboard**.

---

## 📊 Step 2: Activity Monitoring Dashboard
Once approved, you will have access to the monitoring workspace to track system engagement in real-time.

### Live System Metrics
At the top of your dashboard, you will find key engagement stats pulled from the system's aggregate analytics:
- **Total Voters:** The count of registered student users.
- **Total Portfolios:** The count of submitted candidate sites.
- **Turnout Percentage:** The percentage of students who have successfully submitted their votes.

### Submission Gallery (Read-Only)
Below the metrics panel, you can view a directory of all candidate portfolios:
- Cards display project titles, candidate names, and descriptions.
- Click the live links to review the student portfolio websites.
- *Note: Unlike students, staff accounts do not have portfolio upload forms and cannot submit site links.*

---

## 🔐 Step 3: Anonymity Safeguards
DreamSpace Academy enforces a strict voter privacy standard. As a staff monitor, it is important to understand how these protections are structured:

- **No Ballot Auditing:** There is no interface or database route that reveals which student voted for which portfolio.
- **Database Row Level Security (RLS):** Supabase restricts direct reads on the raw `votes` table. Only the student who cast a vote can read their own row.
- **Aggregate Views:** The dashboard details you access are served by a pre-compiled database view (`public.voting_stats`) that only exposes sums and totals, stripping out voter IDs and individual ballot choices.
