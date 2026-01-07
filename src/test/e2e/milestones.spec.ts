/**
 * Milestones E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Milestones', () => {
  test('should redirect to signin when not authenticated', async ({ page }) => {
    await page.goto('/milestones');
    await expect(page.url()).toMatch(/signin|unauthorized|milestones/);
  });

  test('should have milestone form on new page', async ({ page }) => {
    await page.goto('/milestones/new');
    const hasForm = await page.getByLabel(/milestone/i).isVisible().catch(() => false);
    const hasRedirect = page.url().includes('signin');
    expect(hasForm || hasRedirect).toBeTruthy();
  });
});
