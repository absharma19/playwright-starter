import * as dotenv from 'dotenv';
dotenv.config({ quiet: true }); // Load .env early so PLAYWRIGHT_BROWSERS_PATH is set before browser init

import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';
import { config } from './config/config';

/**
 * Generates Playwright test files from Gherkin features + step definitions.
 * Output lands in `.features-gen/` (gitignored). The fixtures file is listed in
 * `steps` because it provides the BDD step factories via createBdd(test).
 */
const testDir = defineBddConfig({
  features: 'src/features/**/*.feature',
  steps: ['src/steps/**/*.ts', 'src/fixtures/index.ts'],
});

// Saved logged-in session — the `setup` project writes it, browser projects reuse it.
const STORAGE_STATE = 'playwright/.auth/user.json';

export default defineConfig({
  testDir,
  timeout: 60000,
  expect: {
    timeout: config.TimeOuts.short,
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [['list'], cucumberReporter('html', { outputFile: 'cucumber-report/index.html' }), ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: config.AppSettings.baseUrl,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    // Logs in once and saves the session; other projects depend on it.
    // Its own testDir, since the top-level testDir points at generated BDD tests.
    { name: 'setup', testDir: 'src/auth', testMatch: /.*\.setup\.ts/ },

    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
  ],
});
