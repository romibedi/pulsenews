import { defineConfig } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'https://pulsenewstoday.com';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  retries: 2,
  workers: 1,
  reporter: [['html', { open: 'on-failure' }], ['list']],
  use: {
    baseURL: BASE_URL,
    navigationTimeout: 45000,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
