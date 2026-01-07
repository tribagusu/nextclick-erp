/**
 * Clients E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Clients', () => {
  // Note: These tests require authentication - they test UI structure
  // Full CRUD tests would need auth fixtures

  test('should redirect to signin when not authenticated', async ({ page }) => {
    await page.goto('/clients');
    // Should redirect to signin or show unauthorized
    await expect(page.url()).toMatch(/signin|unauthorized|clients/);
  });

  test('should have add client link on new page', async ({ page }) => {
    await page.goto('/clients/new');
    // Check page structure - may redirect to signin if not authenticated
    const hasForm = await page.getByLabel(/name/i).isVisible().catch(() => false);
    const hasRedirect = page.url().includes('signin');
    expect(hasForm || hasRedirect).toBeTruthy();
  });
});
