# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: evaluation-flow.spec.ts >> End-to-End Evaluation Flow >> Department Head login
- Location: tests\e2e\evaluation-flow.spec.ts:26:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Analytics Dashboard"
Received string:    "HRM UNIFIED"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')
    8 × locator resolved to <h1 class="text-4xl font-headline font-bold text-foreground tracking-tight uppercase mb-2">HRM UNIFIED</h1>
      - unexpected value "HRM UNIFIED"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - button [ref=e5]:
        - img
      - button "AR" [ref=e6]:
        - img
        - text: AR
    - generic [ref=e7]:
      - generic [ref=e8]:
        - img [ref=e10]
        - heading "HRM UNIFIED" [level=1] [ref=e14]
        - paragraph [ref=e15]: Analytics Dashboard
      - generic [ref=e16]:
        - generic [ref=e21]:
          - img [ref=e22]
          - heading "Sign in" [level=2] [ref=e25]
        - generic [ref=e26]:
          - generic [ref=e27]:
            - generic [ref=e28]: Email
            - textbox "email@example.com" [ref=e29]: super_admin@hrm-dev.com
          - generic [ref=e30]:
            - generic [ref=e31]: Password
            - textbox "••••••••" [ref=e32]: admin123
          - button "Sign in" [ref=e33]
        - generic [ref=e34]:
          - generic [ref=e35]:
            - img [ref=e36]
            - paragraph [ref=e38]: "Demo credentials:"
          - generic [ref=e39]:
            - paragraph [ref=e40]: "SYS_ADMIN: super_admin@hrm-dev.com / admin123"
            - paragraph [ref=e41]: "HR_COORD: hr@hrm-dev.com / hr123"
      - paragraph [ref=e43]: Created by yasserious.com
  - region "Notifications (F8)":
    - list
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('End-to-End Evaluation Flow', () => {
  4  |   test('HR Coordinator login and navigation', async ({ page }) => {
  5  |     // Navigate and Login
  6  |     await page.goto('/login');
  7  |     
  8  |     // Fill credentials
  9  |     await page.fill('input[type="email"]', 'hr@hrm-dev.com');
  10 |     await page.fill('input[type="password"]', 'hr123');
  11 |     
  12 |     // The button text is "Sign in" (from dash_login_sign_in_btn)
  13 |     await page.click('button:has-text("Sign in")');
  14 |     
  15 |     // Verify Dashboard load - Title should be "Analytics Dashboard" (from dash_login_title)
  16 |     // or fallback to "HRM UNIFIED"
  17 |     await expect(page.locator('h1')).toContainText('Analytics Dashboard');
  18 | 
  19 |     // Navigate to Skill Matrix Hub
  20 |     await page.goto('/skill-matrix');
  21 |     // Hub header might have "COMMAND CENTER" or similar labels
  22 |     // Wait for content to load
  23 |     await expect(page.locator('body')).toContainText('HRM');
  24 |   });
  25 | 
  26 |   test('Department Head login', async ({ page }) => {
  27 |     await page.goto('/login');
  28 |     await page.fill('input[type="email"]', 'dept_head@hrm-dev.com');
  29 |     await page.fill('input[type="password"]', 'head123');
  30 |     await page.click('button:has-text("Sign in")');
  31 | 
> 32 |     await expect(page.locator('h1')).toContainText('Analytics Dashboard');
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  33 |   });
  34 | 
  35 |   test('Employee login', async ({ page }) => {
  36 |     await page.goto('/login');
  37 |     await page.fill('input[type="email"]', 'employee@hrm-dev.com');
  38 |     await page.fill('input[type="password"]', 'emp123');
  39 |     await page.click('button:has-text("Sign in")');
  40 | 
  41 |     await expect(page.locator('h1')).toContainText('Analytics Dashboard');
  42 |   });
  43 | });
  44 | 
```