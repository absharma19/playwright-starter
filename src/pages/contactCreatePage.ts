import { Locator, Page } from '@playwright/test';
import { BasePage } from './basePage';

export type ContactCreateData = {
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  street: string;
  city: string;
};

export class ContactCreatePage extends BasePage {
  private readonly nameInput: Locator;
  private readonly genderSelect: Locator;
  private readonly phoneInput: Locator;
  private readonly streetInput: Locator;
  private readonly cityInput: Locator;
  private readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('input[name="name"]');
    this.genderSelect = page.locator('select[name="gender"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.streetInput = page.locator('input[name="street"]');
    this.cityInput = page.locator('input[name="city"]');
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async navigateTo(): Promise<void> {
    await this.navigate('/tasks/create');
  }

  async fillContact(contact: ContactCreateData): Promise<void> {
    await this.nameInput.fill(contact.name);
    await this.genderSelect.selectOption({ label: contact.gender });
    await this.phoneInput.fill(contact.phone);
    await this.streetInput.fill(contact.street);
    await this.cityInput.fill(contact.city);
  }

  async save(): Promise<void> {
    await this.saveButton.click();
    await this.waitForLoad();
  }

  async createContact(contact: ContactCreateData): Promise<void> {
    await this.fillContact(contact);
    await this.save();
  }
}
