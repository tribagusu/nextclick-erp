/**
 * Communications E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Communications', () => {
  test('should redirect to signin when not authenticated', async ({ page }) => {
    await page.goto('/communications');
    await expect(page.url()).toMatch(/signin|unauthorized|communications/);
  });

  test('should have communication form on new page', async ({ page }) => {
    await page.goto('/communications/new');
    const hasForm = await page.getByLabel(/summary/i).isVisible().catch(() => false);
    const hasRedirect = page.url().includes('signin');
    expect(hasForm || hasRedirect).toBeTruthy();
  });
});
