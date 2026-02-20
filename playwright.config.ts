import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing
 *
 * Note: These tests run against the web version of the Expo app
 * Make sure to run `pnpm run web` before running tests
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only (Expo can be slow to render) */
  retries: process.env.CI ? 2 : 0,
  /* 1 worker in CI for stability (shared Expo server); default locally */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter: list in CI for logs; html for report artifact */
  reporter: process.env.CI ? [['list'], ['html']] : 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:8081',
    /* Stable viewport in CI */
    viewport: process.env.CI ? { width: 1280, height: 720 } : undefined,
    /* In CI skip trace to speed up retries; keep screenshot/video for debugging */
    trace: process.env.CI ? 'off' : 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    /* Increase timeout for navigation */
    navigationTimeout: process.env.CI ? 90_000 : 60_000,
  },

  /* Global test timeout (longer in CI where Expo can be slow) */
  timeout: process.env.CI ? 90_000 : 60_000,

  /* Expect timeout */
  expect: {
    timeout: process.env.CI ? 15_000 : 5_000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Firefox and WebKit disabled by default (install with: pnpm exec playwright install firefox webkit)
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm run web',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 300 * 1000 : 180 * 1000, // 5 min in CI, 3 min locally
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
