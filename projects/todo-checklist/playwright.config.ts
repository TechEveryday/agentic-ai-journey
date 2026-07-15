import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Resolved relative to this file, so this config must stay at the project
  // root. When it lived in tests/e2e/ this path resolved to tests/e2e/tests/e2e
  // and `playwright test` (run from the root) never found the config at all,
  // falling back to scanning the whole project and trying to run the Vitest
  // suites as Playwright tests.
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    // Never reuse a server we did not start: another project on this port
    // would silently serve a different app to these tests.
    // See lessons/parallel-agents-and-shared-ports.md
    reuseExistingServer: false,
    url: 'http://localhost:5173',
    timeout: 120000,
  },
});
