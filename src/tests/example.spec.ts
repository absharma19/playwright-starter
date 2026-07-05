import { test, expect } from '../fixtures';

/**
 * Example test suite — demonstrates fixture usage and the page-object pattern.
 *
 * Replace this file (or add alongside it) once you've run codegen and
 * cleaned up the output into proper page objects.
 *
 * Run:   npx playwright test
 * Debug: npx playwright test --debug
 * UI:    npx playwright test --ui
 */
test.describe('Example', () => {
  test('page loads and URL is reachable', async ({ page, examplePage }) => {
    await examplePage.navigateTo();

    // Assert the page navigated successfully (URL is not empty/about:blank)
    const url = page.url();
    expect(url).toBeTruthy();
    expect(url).not.toBe('about:blank');
  });

  // ── Template: add tests below after running codegen ──────────────────────

  // test('user can submit the login form', async ({ examplePage }) => {
  //   await examplePage.navigateTo();
  //   await examplePage.fillEmail('user@example.com');
  //   await examplePage.submit();
  //   await expect(page).toHaveURL(/dashboard/);
  // });
});
