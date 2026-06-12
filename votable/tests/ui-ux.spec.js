import { test, expect } from '@playwright/test';

test.describe('Votable Portal UI/UX Test Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the local Vite server
    await page.goto('/');
  });

  test('should display key UI branding, typography, and headers on Desktop', async ({ page }) => {
    // Check main title is visible
    const title = page.locator('h2', { hasText: 'Votable Gateway' });
    await expect(title).toBeVisible();

    // Check subtitle
    const subtitle = page.locator('p', { hasText: 'Electoral Verification Infrastructure' });
    await expect(subtitle).toBeVisible();

    // Verify presence of branding header text
    await expect(page.locator('header')).toContainText('VOTABLE PORTAL');
  });

  test('should satisfy the 44px x 44px minimum touch target standard for key buttons', async ({ page }) => {
    // Find key buttons on the login page
    const googleLoginBtn = page.locator('button:has-text("Sign in with Google Account")');
    const authBtn = page.locator('button:has-text("Authenticate Identity")');

    // Verify they are visible
    await expect(googleLoginBtn).toBeVisible();
    await expect(authBtn).toBeVisible();

    // Check dimensions of Google Login Button
    const googleBox = await googleLoginBtn.boundingBox();
    expect(googleBox).not.toBeNull();
    if (googleBox) {
      expect(googleBox.width).toBeGreaterThanOrEqual(44);
      expect(googleBox.height).toBeGreaterThanOrEqual(44);
    }

    // Check dimensions of Authenticate Identity Button
    const authBox = await authBtn.boundingBox();
    expect(authBox).not.toBeNull();
    if (authBox) {
      expect(authBox.width).toBeGreaterThanOrEqual(44);
      expect(authBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should allow user to interact with the credentials form', async ({ page }) => {
    const emailInput = page.locator('input[placeholder="Username or Domain Email"]');
    const passwordInput = page.locator('input[placeholder="Access Password"]');
    
    // Check initial state
    await expect(emailInput).toBeEmpty();
    await expect(passwordInput).toBeEmpty();

    // Type credentials
    await emailInput.fill('student@dreamspace.academy');
    await passwordInput.fill('SecurePassword123');

    // Assert inputs contain the correct values
    await expect(emailInput).toHaveValue('student@dreamspace.academy');
    await expect(passwordInput).toHaveValue('SecurePassword123');
  });

  test('should adjust container margins and layout on mobile viewports (< 768px)', async ({ page }) => {
    // Set viewport to mobile size (iPhone 12 portrait: 390x844)
    await page.setViewportSize({ width: 390, height: 844 });

    const container = page.locator('.glass-container');
    await expect(container).toBeVisible();

    // Verify container bounding box fits within mobile screen
    const box = await container.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(390);
    }
  });
});
