# Test Automation Best Practices

A portable guide to the conventions used in this Playwright + BDD framework, written so you can
lift the same structure into an unstructured repo. Every practice below is followed by **why** it
matters and **how** to apply it.

---

## 1. Layered architecture — separate "what" from "how"

The single most important idea: each layer knows only about the layer directly below it. A change
to a selector never touches a test; a change to a test never touches a selector.

```
Feature files (.feature)        WHAT the user does — plain English (Gherkin)
        │
Step definitions (steps/)       Glue — translates a sentence into page-object calls
        │
Page objects (pages/)           HOW a screen works — locators + actions, no assertions logic
        │
Base page / fixtures / utils    Shared plumbing — navigation, DI, data generators
        │
Config + API client             Environment, endpoints, fast data setup
```

**Why:** UIs and requirements change constantly. When each concern lives in one place, a change
has exactly one edit site. This is what makes a suite survive past 50 tests instead of collapsing
under its own maintenance cost.

**How to apply:** Create these folders and never let responsibilities leak between them:

```
src/
  features/     *.feature      — Gherkin scenarios
  steps/        *.steps.ts     — bind sentences to page-object calls
  pages/        *Page.ts       — one class per screen/component
  fixtures/     index.ts       — dependency injection wiring
  api/          apiClient.ts   — HTTP layer for setup/teardown
  utils/        *.ts           — pure, reusable helpers (data, dates)
  auth/         *.setup.ts     — one-time login/session capture
config/         config.ts      — typed, centralised configuration
```

---

## 2. Page Object Model — one class per screen

Every screen is a class. Locators are **private, readonly fields declared once in the
constructor**. Actions are named methods that read like user intent.

```ts
export class ContactCreatePage extends BasePage {
  private readonly nameInput: Locator;
  private readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('input[name="name"]');
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async createContact(contact: ContactCreateData): Promise<void> {
    await this.fillContact(contact);
    await this.save();
  }
}
```

**Why:** Selectors are the most brittle part of any UI suite. Centralising them in one field per
element means a redesigned button is a one-line fix — not a find-and-replace across dozens of tests.
Methods named after intent (`createContact`) keep tests readable and hide the click-by-click detail.

**How to apply:**
- One class per page/component; file named `somethingPage.ts`.
- Declare **all** locators as `private readonly` in the constructor. Never inline a raw selector
  in a test or step.
- Expose **actions** (`save()`, `searchFor()`) and **getters** (`getContactCardByName()`), not
  raw locators — except where a test genuinely needs a locator to assert on.
- Keep assertions out of page objects; they belong in steps/tests. (Small `exists()`-style
  boolean helpers are fine.)

---

## 3. A shared BasePage for common behaviour

All page objects extend a `BasePage` that owns the `page` reference and cross-cutting helpers like
navigation.

```ts
export class BasePage {
  protected readonly page: Page;
  constructor(page: Page) { this.page = page; }

  async navigate(path = ''): Promise<void> {
    await this.page.goto(`${config.AppSettings.baseUrl}${path}`);
  }
}
```

**Why:** Avoids copy-pasting navigation/wait logic into every page. One place to change how the
whole suite navigates or waits.

**How to apply:** Put truly shared behaviour here and nothing screen-specific. Keep it thin.

---

## 4. Prefer resilient, user-facing locators

Order of preference: `getByRole` → `getByLabel` → `getByPlaceholder` → `getByText` → CSS/attribute
selectors as a last resort.

```ts
page.getByRole('button', { name: 'Create' });     // ✅ best — matches how users/AT see it
page.getByPlaceholder('Search Contacts');          // ✅ good
page.locator('input[name="name"]');                // ⚠️ acceptable when no better handle exists
page.locator('.btn-primary.MuiButton-root');       // ❌ brittle — breaks on restyle
```

**Why:** Role/label locators mirror how a real user perceives the page, so they survive CSS
refactors and class-name churn. They also double as a light accessibility check.

**How to apply:** Reach for `getByRole` first. Drop to `name=`/attribute selectors only when the
markup gives you nothing better, and never chain fragile CSS classes.

---

## 5. Web-first assertions — never manual sleeps

Use auto-retrying assertions. Avoid `waitForTimeout`, and avoid `networkidle` on modern SPAs.

```ts
await expect(contactsPage.getContactCardByName(name)).toBeVisible();  // ✅ auto-waits & retries
// await page.waitForTimeout(3000);                                   // ❌ flaky and slow
```

**Why:** `expect(...).toBeVisible()` polls until the condition is met or times out, which is both
faster (no fixed wait) and far more reliable than guessing a duration. `networkidle` is explicitly
discouraged by the Playwright team because SPAs keep connections open.

**How to apply:** Assert on the end state you actually care about. Keep an opt-in `waitForLoad()`
helper (defaulting to the `load` event, not `networkidle`) only for legacy multi-page apps.

---

## 6. Dependency injection via fixtures

Page objects are wired once in a central `fixtures/index.ts`. Steps receive fully-constructed page
objects as typed arguments — they never call `new SomePage(page)`.

```ts
export const test = base.extend<AppFixtures>({
  contactsPage: async ({ page }, use) => { await use(new ContactsPage(page)); },
  api:          async ({ request }, use) => { await use(new ApiClient(request)); },
  scenarioData: async ({}, use) => { await use({}); },   // fresh scratch per scenario
});
```

Then in a step:

```ts
When('I open the create contact form', async ({ contactsPage }) => {
  await contactsPage.openCreateContactForm();
});
```

**Why:** Instantiation lives in exactly one place. Adding a constructor argument to a page object
is a one-line change, not a sweep across every test. Fixtures are also lazily created — a test only
pays for the page objects it names.

**How to apply:** Register every page object and shared service as a fixture. Add a page in four
steps: import the class → add it to the fixtures type → add the `extend` entry → use it by name.

---

## 7. Share state between steps with a scenario-scoped object — not globals

A `scenarioData` fixture gives each scenario a fresh scratch object to hand data from one step to
the next.

```ts
When('I create a contact with a random name', async ({ contactCreatePage, scenarioData }) => {
  const contact = buildContact();
  scenarioData.contact = contact;          // produced here
  await contactCreatePage.createContact(contact);
});

Then('the contact should appear in the contacts list', async ({ contactsPage, scenarioData }) => {
  await expect(contactsPage.getContactCardByName(scenarioData.contact!.name)).toBeVisible();
});
```

**Why:** Module-level `let` variables leak between parallel workers and across scenarios, producing
maddening flakiness. A per-scenario fixture is isolated by construction.

**How to apply:** Never store cross-step state in module scope. Put it on `scenarioData` and extend
its type as scenarios need to pass more data around.

---

## 8. Keep tests independent and parallel-safe

`fullyParallel: true`, plus unique generated data, means any test can run in any order on any worker.

```ts
// utils/testData.ts
export function generateName(): { firstName: string; lastName: string } { /* random */ }
export function generateEmail(length = 8, domain = 'example.com'): string { /* auto_x@... */ }
```

**Why:** Order-dependent tests are the #1 cause of "passes locally, fails in CI." Random,
unique-per-run data means two parallel tests never collide on the same record.

**How to apply:**
- Turn on `fullyParallel`.
- Generate unique data (names, emails, phone numbers) per test rather than reusing fixtures that
  mutate shared records.
- Each test sets up and tears down its own data — assume nothing about what ran before.

---

## 9. Authenticate once, reuse the session (`storageState`)

A dedicated `setup` project logs in a single time and saves the session. Browser projects load it,
so no scenario ever performs a login.

```ts
// playwright.config.ts
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  { name: 'chromium', use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
    dependencies: ['setup'] },
]
```

**Why:** Logging in through the UI before every test is slow and is itself a common flake source.
Doing it once cuts minutes off a suite and removes login as a per-test failure mode.

**How to apply:** Add a `setup` project that captures `storageState` to a gitignored file, and make
every browser project `dependsOn` it and consume that state.

---

## 10. Use an API layer for setup/teardown — not the UI

A thin `ApiClient` seeds and cleans data over HTTP.

```ts
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}
  async post(path: string, data?: unknown): Promise<APIResponse> { /* ... */ }
}
```

**Why:** Creating a prerequisite record through 8 clicks is slow and can fail for reasons unrelated
to what you're testing. One API call is faster and more reliable. Drive the UI only for the
behaviour actually under test; set up the *preconditions* via API.

**How to apply:** Wrap your app's API in a small client, expose it as a fixture, and use it in
`Before`/`After` hooks or setup steps to arrange and clean up state.

---

## 11. Centralised, typed, environment-driven configuration

All settings funnel through one typed object backed by environment variables with sane defaults.

```ts
export const config = {
  AppSettings: { baseUrl: process.env.BASE_URL ?? 'https://example.com' },
  Credentials: { username: process.env.APP_USERNAME ?? '', password: process.env.APP_PASSWORD ?? '' },
  TimeOuts:    { long: 60000, medium: 30000, short: 5000 },
} as const;
```

**Why:** No hard-coded URLs or magic-number timeouts scattered through the code. Point the suite at
dev/staging/prod by changing environment variables, not code. `as const` gives autocomplete and
compile-time safety.

**How to apply:**
- One `config.ts`; read everything from `process.env` with fallbacks.
- Provide a committed `.env.example` documenting every variable; **gitignore the real `.env`.**
- Never commit secrets — inject them via CI secrets.

---

## 12. Readable Gherkin — declarative, not imperative

Feature files describe intent at the business level; the mechanics live in step definitions.

```gherkin
Scenario: Create a new contact and verify it appears in the list
  Given I am on the contacts page
  When I open the create contact form
  And I create a contact with a random name
  Then the contact should appear in the contacts list
```

**Why:** Anyone — QA, PM, developer — can read and review a scenario. Steps read as user intent
("create a contact"), not UI mechanics ("fill field #name, click button.btn"). Tags (`@regression`,
`@smoke`) let you slice which suite to run.

**How to apply:** Keep steps declarative. Write generic, reusable steps (`I navigate to path
{string}`) in a shared `common.steps.ts` so authors can compose scenarios without new glue code.
Assert preconditions explicitly with helpful messages: `expect(contact, 'a contact must be created
earlier').toBeDefined()`.

---

## 13. Static typing everywhere

TypeScript in `strict` mode, shared data shapes as exported types, and path aliases.

```ts
export type ContactCreateData = {
  name: string;
  gender: 'Male' | 'Female' | 'Other';   // union types catch typos at compile time
  phone: string;
};
```

**Why:** A misspelled field or wrong gender value fails at compile time instead of mid-test-run.
Types are also living documentation of what each function expects.

**How to apply:** Enable `strict: true`. Model domain data as exported types and pass those objects
around (page methods take a `ContactCreateData`, not five loose strings). Configure path aliases
(`@pages/*`, `@config`) to avoid `../../../` import chains.

---

## 14. Quality gates: lint, typecheck, format

Three independent gates, each a one-line script, all run in CI.

```jsonc
"lint": "eslint .",
"typecheck": "tsc --noEmit",
"format:check": "prettier --check ."
```

**Why:** Consistent style and catching errors before runtime keeps the codebase reviewable and
reduces "works on my machine." ESLint with the Playwright plugin catches test-specific footguns
(e.g. a forgotten `await` on an assertion).

**How to apply:** Add ESLint (with `eslint-plugin-playwright` for test files), Prettier, and a
`tsc --noEmit` typecheck. Wire all three as npm scripts and run them in CI before the tests.

---

## 15. CI that fails fast and always publishes reports

```yaml
- run: npm run lint
- run: npm run typecheck
- run: npm test
- uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}          # upload the report even when tests fail
  with: { name: playwright-report, path: playwright-report/ }
```

Plus, in the config:

```ts
retries: process.env.CI ? 2 : 0,          // retry only in CI, to absorb infra blips
workers: process.env.CI ? 4 : undefined,
trace: 'retain-on-failure',                // full trace to debug the exact failure
screenshot: 'only-on-failure',
```

**Why:** Cheap gates (lint/typecheck) run before the expensive test job, so obvious mistakes fail in
seconds. Uploading the report on failure (`if: !cancelled()`) is what lets you actually debug a red
CI run. `trace: retain-on-failure` captures a time-travel debugger for exactly the tests that broke,
with zero overhead on passing ones.

**How to apply:** Order CI steps cheap→expensive. Always upload the HTML report and traces as
artifacts. Enable retries and `retain-on-failure` traces/screenshots **only** in CI.

---

## 16. Disciplined `.gitignore` — commit sources, ignore artifacts

```
node_modules/         .env                 # secrets — never commit
/test-results/        /playwright-report/  # regenerated every run
/.features-gen/       /cucumber-report/    # generated BDD specs & reports
/playwright/.auth/                          # saved sessions (may contain tokens)
```

**Why:** Generated files and secrets don't belong in version control. `.auth/` in particular can
hold live session tokens. Committing artifacts creates noisy diffs and merge conflicts.

**How to apply:** Ignore everything generated (`node_modules`, reports, generated specs, auth
state) and every secret. Commit a `.env.example` instead of `.env`.

---

## Quick checklist to apply to an unstructured repo

1. [ ] Split code into `features / steps / pages / fixtures / api / utils / config` layers.
2. [ ] One page-object class per screen; locators `private readonly` in the constructor.
3. [ ] Prefer `getByRole`/`getByLabel` over CSS selectors.
4. [ ] Replace every `waitForTimeout` with a web-first `expect(...)` assertion.
5. [ ] Wire page objects through fixtures (DI); no `new Page()` in tests.
6. [ ] Move cross-step state to a per-scenario fixture; delete module-level globals.
7. [ ] Make tests independent + parallel; generate unique data per run.
8. [ ] Log in once via a `setup` project + `storageState`.
9. [ ] Seed/clean data through an API client, not the UI.
10. [ ] Funnel all settings through one typed `config.ts` reading `process.env`.
11. [ ] Enable TypeScript `strict`; model data as exported types.
12. [ ] Add lint + typecheck + format scripts and run them in CI before tests.
13. [ ] CI: cheap gates first, always upload reports/traces, retries only in CI.
14. [ ] `.gitignore` all generated artifacts and secrets; commit `.env.example`.
