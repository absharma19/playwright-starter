import { Locator, Page } from '@playwright/test';
import { BasePage } from './basePage';

export class ContactsPage extends BasePage {
  private readonly createButton: Locator;
  private readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.createButton = page.getByRole('button', { name: 'Create' });
    this.searchInput = page.getByPlaceholder('Search Contacts');
  }

  async navigateTo(): Promise<void> {
    await this.navigate('/');
  }

  async openCreateContactForm(): Promise<void> {
    await this.createButton.click();
    await this.waitForLoad();
  }

  async searchFor(contactName: string): Promise<void> {
    await this.searchInput.fill(contactName);
    await this.page.keyboard.press('Enter');
    await this.waitForLoad();
  }

  getContactCardByName(contactName: string): Locator {
    return this.page.getByText(contactName, { exact: true });
  }

  async contactExists(contactName: string): Promise<boolean> {
    return await this.getContactCardByName(contactName).isVisible();
  }
}
