# Git & Issue Management Workflow

This document outlines the workflows for repository setup, issues, branching, and pull requests managed by the **Git Issue Manager**.

## 1. GitHub Repository Setup
*   **Branches:**
    *   `main`: Stable production branch. Automatically deploys to Vercel production.
    *   `dev`: Integration branch for frontend, database scripts, and test updates.
    *   `feature/*`: Topic branches created by individual team members (e.g., `feature/auth-oauth`, `feature/voting-ui`).

## 2. Issue Management (Task Tracking)
*   Create distinct GitHub Issues with tags for:
    *   `database` (Assign to DB Engineer)
    *   `frontend:auth` (Assign to Frontend Dev 1)
    *   `frontend:gallery` (Assign to Frontend Dev 2)
    *   `qa:testing` (Assign to QA/Tester)
*   Ensure all Pull Requests reference the Issue number they fix (e.g. `fixes #12`).

## 3. Pull Request Review Guidelines
*   At least one frontend review is required for frontend changes.
*   All tests must pass in CI/CD pipeline before merging to `dev`.
*   A deployment preview check on Vercel must be reviewed for layout bugs on light theme.
