import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { generateName, generateNumeric } from '../utils/testData';

const createContactData = () => {
  const { firstName, lastName } = generateName();
  return {
    name: `${firstName} ${lastName}`,
    gender: 'Other' as const,
    phone: generateNumeric(10),
    street: '123 Playwright Way',
    city: 'Melbourne',
  };
};

test.describe('Contacts', () => {
  test('creates a new contact and verifies it appears in the list', async ({ contactsPage, contactCreatePage }) => {
    const contact = createContactData();

    await contactsPage.navigateTo();
    await contactsPage.openCreateContactForm();

    await contactCreatePage.createContact(contact);

    await expect(contactsPage.getContactCardByName(contact.name)).toBeVisible();
  });
});
