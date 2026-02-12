import { test, expect } from './fixtures/stubbed-page';

/**
 * Example test file - can be used as a template for new tests
 * 
 * This file demonstrates the basic structure of a Playwright test
 */
test.describe('Example Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('example test', async ({ page }) => {
    // Your test code here
    await expect(page.locator('text=/Bhatia/i')).toBeVisible();
  });
});

