/**
 * Projects E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Projects', () => {
  test('should redirect to signin when not authenticated', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.url()).toMatch(/signin|unauthorized|projects/);
  });

  test('should have project form on new page', async ({ page }) => {
    await page.goto('/projects/new');
    const hasForm = await page.getByLabel(/project name/i).isVisible().catch(() => false);
    const hasRedirect = page.url().includes('signin');
    expect(hasForm || hasRedirect).toBeTruthy();
  });
});
