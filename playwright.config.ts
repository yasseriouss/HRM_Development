import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    locale: 'en-US',
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
  },
  webServer: [
    {
      command: 'pnpm run dev:server',
      url: 'http://localhost:8080/healthz',
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: 'pnpm vite preview --port 8081 --strictPort',
      url: 'http://localhost:8081',
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
});
