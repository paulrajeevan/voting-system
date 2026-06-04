# DreamSpace Academy Portfolio Voting System

A premium, device-responsive web application designed for students and staff of DreamSpace Academy to upload their portfolio sites and vote for their favorites using a 3-tier ranked choice point system. 

Built with a modern, animated light theme based on the DreamSpace Academy Purple and Orange visual identity.

---

## 🚀 Key Features

*   **Google OAuth Authentication:** Secure domain-gated login restricted strictly to `@dreamspace.academy` accounts.
*   **Portfolio Submission:** Upload and update personal portfolio site details (Title, URL, and Description).
*   **Ranked Voting System:** Users assign their top 3 portfolio choices:
    *   **1st Choice:** 5 points
    *   **2nd Choice:** 3 points
    *   **3rd Choice:** 2 points
    *   *Self-voting is allowed.*
*   **Admin Dashboard:** Exclusive toggle to release/hide live results.
*   **Dynamic Leaderboard:** Interactive results scoreboard shown on the Home Screen after admin release.
*   **Responsive & Animated Design:** Clean light-mode layouts optimized across mobile, tablet, and desktop devices, styled with smooth micro-animations.

---

## 📄 Documentation Directory

The project design and planning are split into individual modules in the `docs/` folder:

*   **Master Implementation Plan:** [docs/implementation_plan.md](file:///c:/Users/Paul-Rajeevan/Desktop/Voting/docs/implementation_plan.md) — *High-level coordinator checklist and team tasks.*
*   **IEEE SRS Document:** [docs/srs.md](file:///c:/Users/Paul-Rajeevan/Desktop/Voting/docs/srs.md) — *Detailed Software Requirements Specification in IEEE Std 830 format.*
*   **Database Specifications:** [docs/database.md](file:///c:/Users/Paul-Rajeevan/Desktop/Voting/docs/database.md) — *PostgreSQL table structures, seeds, and Row Level Security (RLS) policies.*
*   **Frontend Specifications:** [docs/frontend.md](file:///c:/Users/Paul-Rajeevan/Desktop/Voting/docs/frontend.md) — *Vite + React component architecture and developer assignments.*
*   **Design System Specs:** [docs/design_system.md](file:///c:/Users/Paul-Rajeevan/Desktop/Voting/docs/design_system.md) — *CSS custom properties, responsiveness guidelines, and motion styles.*
*   **QA & Testing Specifications:** [docs/testing.md](file:///c:/Users/Paul-Rajeevan/Desktop/Voting/docs/testing.md) — *Validation test scenarios and manual UI testing checklists.*
*   **Git & Issue Workflows:** [docs/git_management.md](file:///c:/Users/Paul-Rajeevan/Desktop/Voting/docs/git_management.md) — *Branching policies, issue templates, and pull request reviews.*

---

## 🛠️ Technology Stack

*   **Frontend:** React (Vite)
*   **Styling:** Vanilla CSS Custom Variables (light-mode layout)
*   **Backend Database:** Supabase (PostgreSQL with RLS Enabled)
*   **Hosting Platform:** Vercel

---

## ⚙️ Project Setup & Installation

### Backend Setup (Supabase)
1. Initialize a new project on the [Supabase Dashboard](https://supabase.com).
2. Configure **Google OAuth Provider** in the Auth Settings.
3. Open the Supabase SQL Editor and execute the schema scripts provided in [docs/database.md](file:///c:/Users/Paul-Rajeevan/Desktop/Voting/docs/database.md).

### Frontend Setup
1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd Voting
   ```
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Add a `.env` configuration file in the project root:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anonymous_key
   ```
4. Spin up the local development server:
   ```bash
   npm run dev
   ```

---

## 👥 How to Contribute (Step-by-Step)

To maintain clean code and avoid merge conflicts, all team members should follow this step-by-step Git contribution workflow:

### Step 1: Assign & Track Tasks
1. Go to the GitHub repository **Issues** tab.
2. Find the issue assigned to your role (Database, Frontend Dev 1, Frontend Dev 2, or QA).
3. Change the status of the issue to **"In Progress"**.

### Step 2: Set Up Your Branch
1. Open your terminal in the project directory.
2. Fetch the latest updates and switch to the development integration branch (`dev`):
   ```bash
   git checkout dev
   git pull origin dev
   ```
3. Create and switch to a new branch for your specific task:
   ```bash
   # Branch naming: feature/issue-[id]-[short-description]
   git checkout -b feature/issue-12-google-oauth
   ```

### Step 3: Develop & Commit
1. Write code locally. Ensure your changes follow the [Design System Specs](file:///c:/Users/Paul-Rajeevan/Desktop/Voting/docs/design_system.md) (e.g. Light mode only, variables, animations).
2. Save progress by staging and committing changes with descriptive commit messages:
   ```bash
   git add .
   git commit -m "feat(auth): add email domain restriction trigger check"
   ```

### Step 4: Keep Branch Updated
Before pushing, verify that your branch contains all updates from `dev`:
```bash
git checkout dev
git pull origin dev
git checkout feature/issue-12-google-oauth
git merge dev
```
Resolve any merge conflicts locally, test your build, and verify that the application compiles correctly.

### Step 5: Push & Open a Pull Request
1. Push your branch to the remote repository:
   ```bash
   git push origin feature/issue-12-google-oauth
   ```
2. Go to the repository page on GitHub. You will see a prompt to **"Compare & pull request"**.
3. Create the Pull Request (PR) targeting the **`dev`** branch (do not target `main`).
4. Link the PR to the issue by adding `Closes #12` or `Fixes #12` in the PR description.

### Step 6: Review & Merge
1. Notify your team members in the group chat for review.
2. Once the PR passes automated build checks on Vercel and is approved by at least one reviewer, the Git Manager will merge the branch into `dev`.
3. Switch back to your local `dev` branch to start your next task:
   ```bash
   git checkout dev
   git pull origin dev
   ```

