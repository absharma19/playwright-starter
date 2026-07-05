import { Given, When, Then, expect } from '../fixtures';
import { generateName, generateNumeric } from '../utils/testData';
import type { ContactCreateData } from '../pages/contactCreatePage';

function buildContact(): ContactCreateData {
  const { firstName, lastName } = generateName();
  return {
    name: `${firstName} ${lastName}`,
    gender: 'Other',
    phone: generateNumeric(10),
    street: '123 Playwright Way',
    city: 'Melbourne',
  };
}

Given('I am on the contacts page', async ({ contactsPage }) => {
  await contactsPage.navigateTo();
});

When('I open the create contact form', async ({ contactsPage }) => {
  await contactsPage.openCreateContactForm();
});

When('I create a contact with a random name', async ({ contactCreatePage, scenarioData }) => {
  const contact = buildContact();
  scenarioData.contact = contact;
  await contactCreatePage.createContact(contact);
});

Then('the contact should appear in the contacts list', async ({ contactsPage, scenarioData }) => {
  const contact = scenarioData.contact;
  expect(contact, 'a contact must be created earlier in the scenario').toBeDefined();
  await expect(contactsPage.getContactCardByName(contact!.name)).toBeVisible();
});
