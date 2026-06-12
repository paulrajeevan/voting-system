# Contributor Testing Guide: Multi-Tool Strategy

To build, verify, and secure the **DreamSpace Portfolio Voting System**, different contributors (Database Engineers, Frontend Developers, QA Managers) can and should use different tools tailored to their specific workflows. 

While **Playwright** is our primary End-to-End (E2E) testing framework, this document outlines other useful testing tools, their purposes, and how contributors can leverage them.

---

## 1. Multi-Tool Testing Architecture

Different layers of our system (Vite + React frontend, Supabase database, CSS variable-based design system) require different testing granularities:

| Target Layer | Contributor Role | Recommended Tool | Core Value |
| :--- | :--- | :--- | :--- |
| **Complete System (E2E)** | All / QA | **Playwright** | Runs real cross-browser tests on multiple viewports to ensure all parts connect properly. |
| **React Components** | Frontend Developers | **Storybook** | Tests UI components (like the ballot summary drawer) in isolation without database dependencies. |
| **Logic & Helper Functions**| Frontend Developers | **Vitest / Jest** | Rapid unit testing of Javascript algorithms, URL formatters, and form validation utilities. |
| **Database & Security** | Database Engineers | **Supabase CLI / pgTAP**| Directly validates RLS policies and SQL constraints without spinning up a browser. |
| **Performance & Accessibility**| QA / Project Managers | **Lighthouse & Axe** | Quick audit of color contrast ratios, SEO, and touch target sizes. |

---

## 2. Tools Overview & Integration Instructions

### 2.1. Frontend Unit Testing (Vitest / Jest)
*   **Why it's useful:** Vitest runs purely in node, making it extremely fast. Instead of launching a browser to test basic functions, frontend developers can test code modules instantly.
*   **Target Code example:**
    *   Verifying that [validateUrl](file:///c:/Users/Paul-Rajeevan/Desktop/Voting/votable/src/App.jsx#L25-L40) blocks URLs missing protocol prefixes.
    *   Verifying that [formatUrlHref](file:///c:/Users/Paul-Rajeevan/Desktop/Voting/votable/src/App.jsx#L7-L14) appends `https://`.
*   **How to run (when installed):**
    ```bash
    npm run test:unit
    ```

### 2.2. Isolated UI Component Testing (Storybook)
*   **Why it's useful:** Building a voting interface requires fine-tuning layout changes (hamburger menu toggles, draggable ballot lists, CSS transitions). Storybook runs isolated stories for these components.
*   **How to run (when installed):**
    ```bash
    npm run storybook
    ```
*   **Best Practice:** Use `@storybook/addon-a11y` to check if your styling variables in `index.css` conform to standard contrast guidelines (e.g., Purple `#7B1FA2` on white canvas).

### 2.3. Database Row-Level Security (RLS) & Triggers (pgTAP)
*   **Why it's useful:** Since we enforce strict anonymity guidelines (no admins or staff can query the `votes` table directly), Database Engineers must ensure these rules are bulletproof.
*   **Testing Scope:**
    *   Verify `SELECT` on `votes` table fails for a user with `role = 'admin'`.
    *   Verify `SELECT` on `results_view` successfully returns total points.
*   **How to run:**
    Use the **Supabase CLI** locally to run testing suites against a local database instance:
    ```bash
    supabase test db
    ```

### 2.4. Accessibility & SEO Auditing (Lighthouse)
*   **Why it's useful:** Ideal for non-technical QA members or designers who need to verify performance scores and accessibility standards without coding scripts.
*   **How to run:**
    1. Open the project in Google Chrome.
    2. Open Chrome Developer Tools (`F12`).
    3. Navigate to the **Lighthouse** tab.
    4. Select "Navigation", choose Device ("Mobile" or "Desktop"), check "Accessibility" / "Performance", and click **Generate report**.

---

## 3. Best Practices for Team Coordination

1.  **Single Source of Truth (E2E Guard):** Although contributors can use diverse tools locally, the main codebase repository should require all **Playwright E2E tests (`npm run test:ui`)** to pass before any Pull Request is merged.
2.  **Standardized Scripts:** All testing frameworks used by the team must be defined clearly under the `scripts` section in [package.json](file:///c:/Users/Paul-Rajeevan/Desktop/Voting/votable/package.json) so any developer can run them using standard commands.
