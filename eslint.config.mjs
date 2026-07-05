import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  {
    ignores: ['node_modules/', 'dist/', '.features-gen/', 'playwright-report/', 'cucumber-report/', 'test-results/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'config/**/*.ts', 'playwright.config.ts'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Empty destructuring is the idiomatic Playwright signature for a fixture
      // that depends on nothing, e.g. `async ({}, use) => {}`.
      'no-empty-pattern': 'off',
    },
  },
  {
    // Playwright-specific lint rules for step definitions and auth setup.
    files: ['src/steps/**/*.ts', 'src/auth/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // BDD step functions and the storageState setup are not standard test()
      // blocks, so these Playwright-runner heuristics don't apply here.
      'playwright/no-standalone-expect': 'off',
      'playwright/expect-expect': 'off',
      'playwright/no-conditional-in-test': 'off',
    },
  },
);
