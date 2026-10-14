import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 5000,
  globalTeardown: './tests/integration/globalTeardown.js',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 800, height: 600 } },
      // Mocked frontend tests only; integration tests have their own project below.
      testIgnore: '**/integration/**',
    },
    {
      // Real jwt-pizza-service + throwaway pizza_test database (see tests/integration/).
      name: 'integration',
      testDir: './tests/integration',
      timeout: 15000,
      use: { ...devices['Desktop Chrome'], viewport: { width: 800, height: 600 }, baseURL: 'http://localhost:5174' },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    // Integration tests always start their own service (port 3100, pizza_test database) and
    // their own frontend pointed at it, and never reuse a server that is already running.
    {
      command: 'node tests/integration/startService.js',
      url: 'http://localhost:3100',
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command: 'npm run dev -- --port 5174 --strictPort',
      url: 'http://localhost:5174',
      reuseExistingServer: false,
      timeout: 30000,
      env: { VITE_PIZZA_SERVICE_URL: 'http://localhost:3100' },
    },
  ],
});