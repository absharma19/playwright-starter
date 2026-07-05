import { Page } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * ExamplePage — replace this with your first real page object.
 *
 * CODEGEN WORKFLOW:
 *   1. Run: npm run codegen -- <your-app-url>
 *   2. Perform the happy path in the browser window.
 *   3. Copy the generated locators into this class as private properties.
 *   4. Wrap generated action sequences into named methods below.
 *   5. Delete the raw generated spec and write a clean test using these methods.
 */
export class ExamplePage extends BasePage {
  // ── Locators ──────────────────────────────────────────────────────────────
  // Paste codegen output here, then convert to Locator properties:
  //
  // private readonly heading: Locator;
  // private readonly submitButton: Locator;
  // private readonly emailInput: Locator;

  constructor(page: Page) {
    super(page);
    // Initialise locators here:
    // this.heading = page.getByRole('heading', { level: 1 });
    // this.submitButton = page.getByRole('button', { name: 'Submit' });
    // this.emailInput = page.getByLabel('Email');
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async navigateTo(): Promise<void> {
    await this.navigate('/');
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  // Convert codegen sequences into named, reusable methods:
  //
  // async fillEmail(email: string): Promise<void> {
  //   await this.emailInput.fill(email);
  // }
  //
  // async submit(): Promise<void> {
  //   await this.submitButton.click();
  //   await this.waitForLoad();
  // }

  // ── Getters (for assertions) ───────────────────────────────────────────────
  //
  // async getHeadingText(): Promise<string> {
  //   return (await this.heading.textContent()) ?? '';
  // }
}
