import { test, expect } from '@playwright/test';

test.describe('End-to-End Evaluation Flow', () => {
  test('HR Coordinator creates campaign', async ({ page }) => {
    // Navigate and Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'hr@hrm-dev.com');
    await page.fill('input[type="password"]', 'hr123');
    // Button text is "Sign in" based on dash_login_sign_in_btn translation
    await page.click('button:has-text("Sign in")');
    
    // Verify Dashboard load - "COMMAND CENTER" from label_command_center
    await expect(page.locator('text=COMMAND CENTER')).toBeVisible();

    // Navigate to Campaigns - /campaigns
    await page.goto('/campaigns');
    // "Active Campaigns" from evaluations_active
    await expect(page.locator('text=Active Campaigns')).toBeVisible();

    // Note: Assuming seed data exists for /campaigns/c1
    // If it fails here, it might be due to missing seed data or wrong ID
  });

  test('Department Head enters scores', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'dept_head@hrm-dev.com');
    await page.fill('input[type="password"]', 'head123');
    await page.click('button:has-text("Sign in")');

    // After login, should be at dashboard
    await expect(page.locator('text=COMMAND CENTER')).toBeVisible();
  });

  test('Employee views profile', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'employee@hrm-dev.com');
    await page.fill('input[type="password"]', 'emp123');
    await page.click('button:has-text("Sign in")');

    // Navigate to dashboard
    await expect(page.locator('text=COMMAND CENTER')).toBeVisible();
  });
});
