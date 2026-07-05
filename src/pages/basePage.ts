import { Page } from '@playwright/test';
import { config } from '../../config/config';

/**
 * BasePage provides navigation and shared utilities for all page objects.
 * All page classes should extend this.
 */
export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to a path relative to the configured BASE_URL.
   * @param path - e.g. '/dashboard' or '/users/123'
   */
  async navigate(path = ''): Promise<void> {
    await this.page.goto(`${config.AppSettings.baseUrl}${path}`);
  }

  /**
   * Opt-in wait for legacy multi-page apps. Prefer web-first assertions
   * (e.g. `await expect(locator).toBeVisible()`) which auto-wait — they are more
   * reliable than `networkidle`, which is flaky on modern SPAs and discouraged by
   * the Playwright team. Defaults to the DOM 'load' event, not 'networkidle'.
   */
  async waitForLoad(state: 'load' | 'domcontentloaded' | 'networkidle' = 'load'): Promise<void> {
    await this.page.waitForLoadState(state);
  }
}
