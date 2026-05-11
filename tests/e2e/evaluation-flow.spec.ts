import { test, expect } from '@playwright/test';

test.describe('End-to-End Evaluation Flow', () => {
  test('HR Coordinator login and navigation', async ({ page }) => {
    // Navigate and Login
    await page.goto('/login');
    
    // Fill credentials
    await page.fill('input[type="email"]', 'hr@hrm-dev.com');
    await page.fill('input[type="password"]', 'hr123');
    
    // The button text is "Sign in" (from dash_login_sign_in_btn)
    await page.click('button:has-text("Sign in")');
    
    // Verify Dashboard load - Title should be "Analytics Dashboard" (from dash_login_title)
    // or fallback to "HRM UNIFIED"
    await expect(page.locator('h1')).toContainText('Analytics Dashboard');

    // Navigate to Skill Matrix Hub
    await page.goto('/skill-matrix');
    // Hub header might have "COMMAND CENTER" or similar labels
    // Wait for content to load
    await expect(page.locator('body')).toContainText('HRM');
  });

  test('Department Head login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'dept_head@hrm-dev.com');
    await page.fill('input[type="password"]', 'head123');
    await page.click('button:has-text("Sign in")');

    await expect(page.locator('h1')).toContainText('Analytics Dashboard');
  });

  test('Employee login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'employee@hrm-dev.com');
    await page.fill('input[type="password"]', 'emp123');
    await page.click('button:has-text("Sign in")');

    await expect(page.locator('h1')).toContainText('Analytics Dashboard');
  });
});
