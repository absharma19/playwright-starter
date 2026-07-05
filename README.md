# playwright-starter

A scalable, BDD-first Playwright automation framework. Author scenarios in **Gherkin
feature files**, implement **step definitions** in TypeScript, and reuse **page objects** and
**fixtures** — all running on the Playwright test runner via
[`playwright-bdd`](https://vitalets.github.io/playwright-bdd/).

## Why this framework

| Concern            | How it's handled                                                             |
| ------------------ | ---------------------------------------------------------------------------- |
| Readable specs     | Gherkin `.feature` files in `src/features`                                   |
| Reusable logic     | Playwright-style step defs (`src/steps`) + page objects (`src/pages`)        |
| Fast, stable setup | Auth `storageState` reuse + API request layer (no per-test login/UI seeding) |
| Cross-browser      | chromium, firefox, webkit projects                                           |
| Reporting          | Playwright HTML report **and** Cucumber HTML report                          |
| Quality gates      | ESLint + `tsc` typecheck + Prettier                                          |
| CI                 | GitHub Actions (`.github/workflows/ci.yml`)                                  |

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Install browsers
npx playwright install

# 3. Configure the target
cp .env.example .env
# Edit .env: set BASE_URL (and API_BASE_URL / APP_USERNAME / APP_PASSWORD if the app needs login)
```

---

## Running Tests

`npm test` always regenerates the BDD tests (`bddgen`) before running Playwright.

```bash
npm test                          # all features, all browsers, headless
npm test -- --project=chromium    # single browser
npm run test:headed               # watch the browser
npm run test:ui                   # interactive UI mode
npm test -- --grep @smoke         # run only @smoke-tagged scenarios
npm run report                    # open the Playwright HTML report
# open cucumber-report/index.html # the Cucumber HTML report
```

---

## Authoring a scenario (the day-to-day workflow)

### 1. Write the feature — `src/features/<name>.feature`

```gherkin
Feature: Contacts

  @contacts @regression
  Scenario: Create a new contact and verify it appears in the list
    Given I am on the contacts page
    When I open the create contact form
    And I create a contact with a random name
    Then the contact should appear in the contacts list
```

### 2. Implement the steps — `src/steps/<name>.steps.ts`

Import the BDD factories from `../fixtures` so every step receives the typed page
objects / fixtures as its first argument:

```typescript
import { Given, When, Then, expect } from '../fixtures';

Given('I am on the contacts page', async ({ contactsPage }) => {
  await contactsPage.navigateTo();
});

When('I create a contact with a random name', async ({ contactCreatePage, scenarioData }) => {
  const contact = buildContact();
  scenarioData.contact = contact; // share state between steps — no globals
  await contactCreatePage.createContact(contact);
});

Then('the contact should appear in the contacts list', async ({ contactsPage, scenarioData }) => {
  await expect(contactsPage.getContactCardByName(scenarioData.contact!.name)).toBeVisible();
});
```

- **Share data between steps** via the `scenarioData` fixture (fresh per scenario) — not module-level variables.
- **Reusable/generic steps** live in `src/steps/common.steps.ts`.
- Run `npx bddgen` after adding steps; it fails fast on undefined steps before any browser launches.

### 3. Add a page object (when you need new UI interactions)

1. Create `src/pages/myPage.ts` extending `BasePage`.
2. Define `private readonly` locators in the constructor (prefer `getByRole`/`getByLabel`/`getByText`).
3. Add action + getter methods.
4. Register a fixture in `src/fixtures/index.ts` (`AppFixtures` type + `test.extend` entry).
5. Use it in any step: `When('...', async ({ myPage }) => { ... })`.

---

## Authentication & data setup

- **`src/auth/auth.setup.ts`** runs once (the `setup` project), logs in, and saves the session to
  `playwright/.auth/user.json`. All browser projects load it via `storageState`, so scenarios never
  log in. If the app needs no login it saves an anonymous session — fill in the real login flow in the
  `if (username && password)` block when you need it.
- **`src/api/apiClient.ts`** (the `api` fixture) is a thin wrapper over Playwright's `request` context
  for seeding/cleaning data via API in `Before`/`After` hooks — far faster and less flaky than the UI.

---

## Quality gates

```bash
npm run lint        # ESLint (flat config + eslint-plugin-playwright)
npm run typecheck   # tsc --noEmit
npm run format      # Prettier
```

---

## CI

`.github/workflows/ci.yml` runs on push/PR to `main`: install → browsers → lint → typecheck →
`npm test` → uploads the Playwright and Cucumber reports as artifacts. Provide `BASE_URL`
(and credentials, if needed) as repository secrets.

---

## Project Structure

```
playwright-starter/
├── config/config.ts             ← Typed config (BASE_URL, API_BASE_URL, Credentials, timeouts)
├── src/
│   ├── features/                ← Gherkin .feature files  ← author scenarios here
│   ├── steps/                   ← Step definitions        ← implement steps here
│   │   ├── contacts.steps.ts
│   │   ├── example.steps.ts
│   │   └── common.steps.ts      ← reusable generic steps
│   ├── fixtures/index.ts        ← BDD base: createBdd(test) + page/api/scenarioData fixtures
│   ├── pages/                   ← Page objects (basePage + feature pages)
│   ├── api/apiClient.ts         ← API request layer for setup/teardown
│   ├── auth/auth.setup.ts       ← Logs in once → playwright/.auth/user.json
│   └── utils/                   ← testData + dateHelper generators
├── .features-gen/               ← Generated Playwright tests (gitignored, from bddgen)
├── playwright.config.ts         ← defineBddConfig + projects + reporters
├── eslint.config.mjs
├── .github/workflows/ci.yml
├── .env.example
└── package.json
```
