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

  /** Waits for the network to be idle — useful after form submissions. */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
