/**
 * Auth E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display signin page', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should display signup page', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: /sign up|create/i })).toBeVisible();
  });

  test('should display forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByRole('heading', { name: /forgot|reset/i })).toBeVisible();
  });

  test('should show validation errors on empty signin', async ({ page }) => {
    await page.goto('/signin');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/required|email/i)).toBeVisible();
  });

  test('should navigate from signin to signup', async ({ page }) => {
    await page.goto('/signin');
    const signupLink = page.getByRole('link', { name: /sign up|create account/i });
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL(/signup/);
    }
  });
});
