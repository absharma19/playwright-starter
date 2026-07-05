import { Given, expect } from '../fixtures';
import { config } from '../../config/config';

/**
 * Reusable generic steps shared across features. Keep app-agnostic steps here so
 * feature authors can compose scenarios without writing new step code.
 */

Given('I navigate to path {string}', async ({ page }, path: string) => {
  await page.goto(`${config.AppSettings.baseUrl}${path}`);
});

Given('I should see text {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
});
