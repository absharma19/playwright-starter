import { test as base } from '@playwright/test';
import { ContactsPage } from '../pages/contactsPage';
import { ContactCreatePage } from '../pages/contactCreatePage';
import { ExamplePage } from '../pages/examplePage';

/**
 * AppFixtures — extend this interface as you add page objects.
 *
 * ADDING A NEW PAGE:
 *   1. Import the page class here.
 *   2. Add a property to AppFixtures.
 *   3. Add a fixture entry in the test.extend() call below.
 *   4. Use it in any test: test('...', async ({ myNewPage }) => { ... })
 */
export type AppFixtures = {
  examplePage: ExamplePage;
  contactsPage: ContactsPage;
  contactCreatePage: ContactCreatePage;
  // myNewPage: MyNewPage;
};

export const test = base.extend<AppFixtures>({
  examplePage: async ({ page }, use) => {
    await use(new ExamplePage(page));
  },

  contactsPage: async ({ page }, use) => {
    await use(new ContactsPage(page));
  },

  contactCreatePage: async ({ page }, use) => {
    await use(new ContactCreatePage(page));
  },

  // myNewPage: async ({ page }, use) => {
  //   await use(new MyNewPage(page));
  // },
});

export { expect } from '@playwright/test';
