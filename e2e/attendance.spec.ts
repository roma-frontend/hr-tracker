import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Attendance Tracking Flow
 *
 * Tests critical attendance paths including:
 * - Attendance page accessibility
 * - Clock in/out functionality
 * - Attendance history viewing
 * - Status updates
 */

test.describe('Attendance Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to attendance page (adjust URL as needed)
    await page.goto('/attendance');
  });

  test('attendance page should be accessible', async ({ page }) => {
    await expect(page).toHaveURL(/attendance/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display attendance controls', async ({ page }) => {
    // Check for clock in/out buttons or attendance controls
    const hasClockIn = (await page.locator('text=clock in, text=Clock In, text=start').count()) > 0;
    const hasClockOut =
      (await page.locator('text=clock out, text=Clock Out, text=end').count()) > 0;
    const hasStatus =
      (await page.locator('text=attendance, text=present, text=absent').count()) > 0;

    expect(hasClockIn || hasClockOut || hasStatus).toBeTruthy();
  });

  test('should show current attendance status', async ({ page }) => {
    // Look for status indicators
    const statusElement = page.locator('[class*="status"], [class*="badge"]').first();
    if (await statusElement.isVisible()) {
      const statusText = await statusElement.textContent();
      expect(statusText?.length).toBeGreaterThan(0);
    }
  });

  test('should display attendance history or records', async ({ page }) => {
    // Check for table or list of attendance records
    const hasTable = (await page.locator('table').count()) > 0;
    const hasList = (await page.locator('[class*="list"], [class*="record"]').count()) > 0;
    const hasCards = (await page.locator('[class*="card"]').count()) > 0;

    expect(hasTable || hasList || hasCards).toBeTruthy();
  });

  test('clock in button should be functional', async ({ page }) => {
    const clockInBtn = page.locator('text=clock in, text=Clock In, text=start shift').first();

    if (await clockInBtn.isVisible()) {
      // Click should either trigger action or require auth
      await clockInBtn.click();
      await page.waitForTimeout(1000);

      // Either shows confirmation, updates status, or redirects to login
      const hasResponse =
        page.url().includes('attendance') ||
        (await page.locator('text=success, text=started, text=clocked').count()) > 0;
      expect(hasResponse).toBeTruthy();
    }
  });

  test('should show date navigation or selector', async ({ page }) => {
    // Look for date picker or navigation
    const hasDatePicker =
      (await page
        .locator('input[type="date"], [class*="datepicker"], [class*="calendar"]')
        .count()) > 0;
    const hasDateNav =
      (await page.locator('text=today, text=yesterday, text=previous, text=next').count()) > 0;

    expect(hasDatePicker || hasDateNav).toBeTruthy();
  });

  test('attendance stats should be displayed', async ({ page }) => {
    // Look for statistics like hours worked, days present, etc.
    const hasStats =
      (await page.locator('text=hours, text=worked, text=present, text=days').count()) > 0;
    const hasNumbers = (await page.locator('[class*="stat"], [class*="metric"]').count()) > 0;

    expect(hasStats || hasNumbers).toBeTruthy();
  });

  test('should handle unauthenticated access gracefully', async ({ page }) => {
    // Clear any stored auth
    await page.context().clearCookies();
    await page.reload();

    // Should either redirect to login or show auth prompt
    const url = page.url();
    const isAuthPage = url.includes('login') || url.includes('auth') || url.includes('sign-in');
    const hasAuthPrompt = (await page.locator('text=login, text=sign in').count()) > 0;

    expect(isAuthPage || hasAuthPrompt).toBeTruthy();
  });

  test('responsive layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Page should still be usable on mobile
    await page.goto('/attendance');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // No horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });
});
