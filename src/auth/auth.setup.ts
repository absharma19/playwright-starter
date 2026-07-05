import { test as setup } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { config } from '../../config/config';

const STORAGE_STATE = 'playwright/.auth/user.json';

/**
 * Auth setup — runs once before the browser projects and saves a reusable
 * session to `playwright/.auth/user.json` (gitignored). Browser projects load
 * it via `storageState`, so individual scenarios never log in.
 *
 * The target app in this starter does not require authentication, so by default
 * this saves the anonymous session (a valid, empty storage state). When your app
 * needs login, fill in the real flow in the `if (username && password)` block.
 */
setup('authenticate', async ({ page }) => {
  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });

  await page.goto(config.AppSettings.baseUrl);

  const { username, password } = config.Credentials;
  if (username && password) {
    // ── Real login flow — replace selectors with your app's ──────────────────
    // await page.getByLabel('Email').fill(username);
    // await page.getByLabel('Password').fill(password);
    // await page.getByRole('button', { name: 'Sign in' }).click();
    // await page.waitForURL('**/dashboard');
  }

  await page.context().storageState({ path: STORAGE_STATE });
});
