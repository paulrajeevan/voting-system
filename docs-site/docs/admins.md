# Administrator User Guide

Administrators are responsible for managing the platform settings, approving staff roles, provisioning accounts, and controlling when final voting results are made public.

---

## 🔑 Step 1: Logging In
Administrative accounts bypass Google OAuth domain gating and use pre-configured logins.

1. **Locate the Credentials Form:** Use the Username and Password fields beneath the Google button on the Login page.
2. **Authenticate:** Enter your administrator email and password.
3. **Redirect:** On submission, you bypass all domain locks and land directly on the **Admin Dashboard**.

---

## ⚙️ Step 2: Key Dashboard Features

### 1. Results Release Toggle
The home page scoreboard is hidden by default. To control its visibility:
- Find the **Results Released** toggle switch in the control bar.
- **Toggle ON (`true`):** Reveals the points-only Leaderboard tab to all students, staff, and visitors.
- **Toggle OFF (`false`):** Hides the Leaderboard tab. This is the default setting during the active voting window.

### 2. Staff Approval Panel
When new staff members sign in via Google OAuth, they select the "Staff" role and enter a pending status. To grant them access:
- Scroll to the **Pending Staff Approvals** table.
- You will see a list of users showing their Full Name, Email, and Request Date.
- Click **"Approve Staff"** next to their record.
- This updates their profile status (`role_approved = true`), allowing them to bypass the Pending screen and enter the Staff Monitoring Dashboard.

### 3. Student Credentials Provisioning
Some students may not have access to a `@dreamspace.academy` Google account but still need to participate as candidates or voters.
- Navigate to the **Credentials Provisioning Form**.
- Enter the student's **Full Name**, **Email/Username**, and a temporary **Password**.
- Click **"Create Student Account"**.
- This registers the user in the database with the student role pre-approved (`role_approved = true`) and sets `is_admin_created = true`. 
- The student can immediately log in using the credentials form and access the Student Dashboard without domain-restriction errors.

### 4. Direct Metrics Panel
The dashboard highlights immediate counts to give you an operational view of system activity:
- **Total Voters:** Number of registered users.
- **Total Portfolios:** Number of uploaded sites.
- These numbers provide quick insight into general participation levels.
