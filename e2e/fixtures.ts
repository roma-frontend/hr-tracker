import { test as base, expect, type Page } from '@playwright/test';

// Test credentials from env
const TEST_EMAIL = process.env.E2E_USER_EMAIL || 'test@hroffice.io';
const TEST_PASSWORD = process.env.E2E_USER_PASSWORD || 'Test123!@#';

/**
 * Login helper — fills email/password form and submits
 */
export async function login(page: Page, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Fill email (SmartEmailInput renders an input inside)
  const emailInput = page
    .locator('#email-login-form input[type="email"], #email-login-form input[type="text"]')
    .first();
  await emailInput.waitFor({ state: 'visible', timeout: 10_000 });
  await emailInput.fill(email);

  // Fill password
  const passwordInput = page.locator('#email-login-form input[type="password"]').first();
  await passwordInput.fill(password);

  // Submit
  const submitBtn = page.locator('#email-login-form button[type="submit"]').first();
  await submitBtn.click();
}

/**
 * Extended test fixture with authenticated page
 */

export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, run) => {
    await login(page);
    // Wait for redirect to dashboard
    await page.waitForURL(/dashboard|leaves|tasks/, { timeout: 15_000 });
    await run(page);
  },
});

export { expect };
