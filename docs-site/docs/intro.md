# System Overview

Welcome to the **DreamSpace Academy Portfolio Voting System** user documentation!

This platform is a premium, device-responsive web application designed for students and staff of DreamSpace Academy. It allows students to submit their portfolio websites and participate in a 3-tier ranked-choice voting process to select their favorite designs, while staff and administrators oversee the activity and final score tallies.

---

## 🎨 System Roles & Privileges

The system is structured around three key user classes, each with distinct features:

| Role | Onboarding / Login Path | Portfolio Upload | Casting Votes | Accessing Metrics | Admin Control |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Student** | Google OAuth (`@dreamspace.academy`) OR Admin-provisioned credentials | **Yes** (1 max) | **Yes** (3 choices) | No | No |
| **Staff** | Google OAuth (`@dreamspace.academy`) - Requires Admin Approval | No | No | **Yes** (Aggregate only) | No |
| **Admin** | Admin-provisioned Credentials | No | No | **Yes** (Full aggregate) | **Yes** (Release results, approve staff) |

---

## 🗳️ Core Logic & Rules

### 1. Two-Path Authentication
To maintain a secure and verified environment, the platform uses two distinct authentication methods:
- **Domain-Gated Google OAuth:** Users with a `@dreamspace.academy` email can sign up instantly. Upon first sign-in, they select their role (Student or Staff).
- **Admin-Provisioned Credentials:** Students who do not possess a `@dreamspace.academy` email can be manually provisioned by an Administrator and log in securely with their email and a temporary password.

### 2. Three-Tier Ranked Voting
Students assign points to their top three portfolio selections:
- **1st Choice:** 5 points
- **2nd Choice:** 3 points
- **3rd Choice:** 2 points

*Note: Students are allowed to vote for their own portfolio, but they cannot vote for the same candidate multiple times.*

### 3. Absolute Voter Anonymity
To ensure a fair and bias-free competition:
- Individual ballot records are strictly protected. No user—including Staff and Administrators—can query or view who voted for whom.
- Databases enforce this at the table level using PostgreSQL Row Level Security (RLS).
- Live metrics and results are served exclusively through aggregate, anonymized views.

### 4. Controlled Results Release
Final standings and score totals are hidden from the general student body until an Administrator manually releases the results. Once released, the scoreboard is revealed to all users, displaying portfolios ranked by total accumulated points.
