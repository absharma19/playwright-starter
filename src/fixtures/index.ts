import { test as base, createBdd } from 'playwright-bdd';
import { ContactsPage } from '../pages/contactsPage';
import { ContactCreatePage } from '../pages/contactCreatePage';
import { ExamplePage } from '../pages/examplePage';
import { ApiClient } from '../api/apiClient';
import type { ContactCreateData } from '../pages/contactCreatePage';

/**
 * Scenario-scoped scratch space — lets steps share state (e.g. the contact
 * created in a When step, asserted in a Then step) without module-level globals.
 * Extend this type as scenarios need to hand data between steps.
 */
export type ScenarioData = {
  contact?: ContactCreateData;
};

/**
 * AppFixtures — extend this interface as you add page objects.
 *
 * ADDING A NEW PAGE:
 *   1. Import the page class here.
 *   2. Add a property to AppFixtures.
 *   3. Add a fixture entry in the test.extend() call below.
 *   4. Use it in any step: When('...', async ({ myNewPage }) => { ... })
 */
export type AppFixtures = {
  examplePage: ExamplePage;
  contactsPage: ContactsPage;
  contactCreatePage: ContactCreatePage;
  api: ApiClient;
  scenarioData: ScenarioData;
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

  // API request layer for fast data setup/teardown (see src/api/apiClient.ts).
  api: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  // Fresh, empty scratch object per scenario.
  scenarioData: async ({}, use) => {
    await use({});
  },

  // myNewPage: async ({ page }, use) => {
  //   await use(new MyNewPage(page));
  // },
});

/**
 * BDD step factories bound to AppFixtures. Import these in every step file so
 * steps receive the typed page objects / fixtures as their first argument:
 *
 *   import { Given, When, Then } from '../fixtures';
 *   When('I create a contact', async ({ contactCreatePage, scenarioData }) => { ... });
 */
export const { Given, When, Then, Before, After, BeforeAll, AfterAll } = createBdd(test);

export { expect } from '@playwright/test';
