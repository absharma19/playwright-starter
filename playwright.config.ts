import * as dotenv from 'dotenv';
dotenv.config(); // Load .env early so PLAYWRIGHT_BROWSERS_PATH is set before browser init

import { defineConfig, devices } from '@playwright/test';
import { config } from './config/config';

export default defineConfig({
  testDir: './src/tests',
  timeout: 300000,
  expect: {
    timeout: config.TimeOuts.short,
  },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: 'never',
      },
    ],
  ],
  use: {
    baseURL: config.AppSettings.baseUrl,
    headless: false,
    launchOptions: { slowMo: 1000 },

    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
