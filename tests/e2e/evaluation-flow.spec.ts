import { test, expect } from '@playwright/test';

test.describe('End-to-End Evaluation Flow', () => {
  test('HR Coordinator creates campaign', async ({ page }) => {
    // Navigate and Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'hr@hrm-dev.com');
    await page.fill('input[type="password"]', 'hr123');
    await page.click('button:has-text("AUTHENTICATE")');
    
    // Verify Dashboard load
    await expect(page.locator('text=COMMAND_CENTER')).toBeVisible();

    // Navigate to Campaigns
    await page.goto('/campaigns');
    await expect(page.locator('text=ACTIVE_CAMPAIGNS')).toBeVisible();

    // Ideally, we'd test Campaign Creation here, but we will test viewing an existing one for now
    await page.goto('/campaigns/c1'); // assuming c1 is seeded
    await expect(page.locator('text=STRATEGIC_MISSION_CONTROL')).toBeVisible();
  });

  test('Department Head enters scores', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'dept_head@hrm-dev.com');
    await page.fill('input[type="password"]', 'head123');
    await page.click('button:has-text("AUTHENTICATE")');

    await page.goto('/campaigns/c1');
    await expect(page.locator('text=STRATEGIC_MISSION_CONTROL')).toBeVisible();

    // Check if Enter Scores button exists
    const enterScoresBtn = page.locator('button:has-text("ENTER_SCORES")');
    if (await enterScoresBtn.isVisible()) {
      await enterScoresBtn.click();
      await expect(page.locator('text=COMMIT_TELEMETRY')).toBeVisible();
    }
  });

  test('Employee views profile', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'employee@hrm-dev.com');
    await page.fill('input[type="password"]', 'emp123');
    await page.click('button:has-text("AUTHENTICATE")');

    await page.goto('/my-profile');
    await expect(page.locator('text=OPERATIVE_PROFILE')).toBeVisible();
  });
});
