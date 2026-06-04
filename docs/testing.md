# QA Testing & Verification Plan

This document guides the **QA Test & Git Issue Manager** in validating the application features.

## 1. Automated Test Cases
*   **Authentication & Domains:**
    *   Test standard Google accounts that do not end in `@dreamspace.academy`. Check if they are successfully blocked from creating a profile or viewing candidates.
*   **Voting Schema Constraints:**
    *   Verify that inserting a second vote for the same rank errors out.
    *   Verify that voting for the same candidate across multiple ranks (e.g. 1st and 2nd choice for candidate X) fails.
    *   Verify that self-voting is successful.
*   **Admin Release Rule:**
    *   Verify regular users cannot write to the `system_settings` table.
    *   Verify candidates cannot be voted on once `results_released` is set to `true`.

## 2. Manual Verification Checklist
- [ ] Login using authorized Google Account.
- [ ] Upload portfolio with title, description, and link. Check responsive grid layout.
- [ ] Vote for candidate A as 1st, candidate B as 2nd, candidate C as 3rd. Confirm point values are 5, 3, 2.
- [ ] Change vote selections in the active ballot. Confirm database sync.
- [ ] Log in as Admin, toggle "Release Results". Check if the Homepage dynamically switches to show the final scoreboard.
- [ ] Validate light-mode design consistency (fonts, accessibility contrast).
- [ ] Verify Mobile Responsiveness: Shrink viewport below `768px` and confirm layout switches to 1-column, hamburger menu triggers correctly, and the voting panel transforms into a bottom-sheet.
- [ ] Verify Animations: Ensure cards elevate smoothly on hover, and the ballot drawer slides up/down when items are modified.

