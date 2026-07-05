import { Given, Then, expect } from '../fixtures';

Given('I open the home page', async ({ examplePage }) => {
  await examplePage.navigateTo();
});

Then('the page URL should be reachable', async ({ page }) => {
  const url = page.url();
  expect(url).toBeTruthy();
  expect(url).not.toBe('about:blank');
});
