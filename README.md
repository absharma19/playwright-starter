# playwright-starter

A lean Playwright automation skeleton built for speed — no AI-generated guesses, just real browser behaviour captured with the CLI, cleaned into page objects, and executed fast.

## Philosophy

| Step | Tool | Purpose |
|------|------|---------|
| Capture | `playwright codegen` | Record the real happy path in a live browser |
| Clean | Copilot | Refactor generated code into page objects & fixtures |
| Inspect | MCP | Let Copilot inspect the live app when needed |
| Execute | Playwright CLI | Run, debug, trace, and CI |

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Install Chromium browser
npx playwright install chromium

# 3. Configure the target URL
cp .env.example .env
# Edit .env and set BASE_URL=https://your-app-url.com
```

---

## Running Tests

```bash
# Run all tests (headless)
npm test

# Run headed (watch the browser)
npm run test:headed

# Run a specific file
npx playwright test src/tests/example.spec.ts

# Filter by test name
npx playwright test --grep "page loads"

# Run with UI mode (interactive, great for debugging)
npx playwright test --ui

# Debug a failing test step by step
npx playwright test --debug
```

---

## Codegen Workflow

### 1. Record the happy path

```bash
npm run codegen -- https://your-app-url.com
# or with a specific starting path:
npm run codegen -- https://your-app-url.com/login
```

Playwright opens a browser. Perform the user journey. The generated code appears in the Playwright Inspector.

### 2. Clean the output into a page object

Copy the generated locators and actions, then:

1. Create `src/pages/myFeaturePage.ts` extending `BasePage`
2. Move locators into `private readonly` class properties
3. Wrap action sequences into named methods (e.g. `fillLoginForm()`, `submit()`)
4. Add getter methods for assertion values (e.g. `getHeadingText()`)

```typescript
// src/pages/loginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class LoginPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
  }

  async navigateTo(): Promise<void> {
    await this.navigate('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.waitForLoad();
  }
}
```

### 3. Wire the fixture

Add to `src/fixtures/index.ts`:

```typescript
import { LoginPage } from '../pages/loginPage';

export type AppFixtures = {
  examplePage: ExamplePage;
  loginPage: LoginPage;    // ← add this
};

export const test = base.extend<AppFixtures>({
  examplePage: async ({ page }, use) => { await use(new ExamplePage(page)); },
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },  // ← add this
});
```

### 4. Write the test

```typescript
// src/tests/login.spec.ts
import { test, expect } from '../fixtures';

test('user can log in', async ({ page, loginPage }) => {
  await loginPage.navigateTo();
  await loginPage.login('user@example.com', 'password');
  await expect(page).toHaveURL(/dashboard/);
});
```

---

## Viewing Reports & Traces

```bash
# Open the HTML report after a test run
npm run report

# View a specific trace file
npx playwright show-trace test-results/path/to/trace.zip

# List all trace files from the last run
find test-results -name "trace.zip"
```

---

## Adding a New Page Object

1. Create `src/pages/myPage.ts` extending `BasePage`
2. Define `private readonly` locators in the constructor
3. Add action methods and getter methods
4. Add fixture entry in `src/fixtures/index.ts`
5. Import `{ test, expect }` from `'../fixtures'` in your spec

---

## CI Configuration

Set these environment variables in your CI environment:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BASE_URL` | Yes | `https://example.com` | Target application URL |
| `TIMEOUT_LONG` | No | `60000` | Long operation timeout (ms) |
| `TIMEOUT_MEDIUM` | No | `30000` | Medium operation timeout (ms) |
| `TIMEOUT_SHORT` | No | `5000` | Short assertion timeout (ms) |
| `CI` | Set by CI | — | Enables 2 retries and 4 workers |

```yaml
# Example GitHub Actions step
- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Run tests
  run: npm test
  env:
    BASE_URL: ${{ secrets.APP_URL }}
```

---

## Project Structure

```
playwright-starter/
├── config/config.ts          ← Typed config, reads .env
├── src/
│   ├── fixtures/index.ts     ← test.extend() — add page fixtures here
│   ├── pages/
│   │   ├── basePage.ts       ← Base class: navigate(), waitForLoad()
│   │   └── examplePage.ts    ← Template — replace with real pages
│   ├── utils/
│   │   ├── dateHelper.ts     ← Date operations and relative date parsing
│   │   └── testData.ts       ← Random email, string, numeric generators
│   └── tests/
│       └── example.spec.ts   ← Sample test — delete or adapt
├── playwright.config.ts
├── tsconfig.json
├── .prettierrc.json
├── .env.example              ← Copy to .env, set BASE_URL
└── package.json
```
