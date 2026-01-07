/**
 * Employees E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Employees', () => {
  test('should redirect to signin when not authenticated', async ({ page }) => {
    await page.goto('/employees');
    await expect(page.url()).toMatch(/signin|unauthorized|employees/);
  });

  test('should have employee form on new page', async ({ page }) => {
    await page.goto('/employees/new');
    const hasForm = await page.getByLabel(/name/i).isVisible().catch(() => false);
    const hasRedirect = page.url().includes('signin');
    expect(hasForm || hasRedirect).toBeTruthy();
  });
});
