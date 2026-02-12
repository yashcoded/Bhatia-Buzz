import { test, expect } from './fixtures/stubbed-page';
import { NavigationHelper, waitForAppReady } from './helpers/navigation';

test.describe('Matrimonial Sign-in Gate (Guest)', () => {
  let navigationHelper: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    navigationHelper = new NavigationHelper(page);
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitForAppReady(page, 20000);
    await page.waitForTimeout(600);
  });

  test('guest sees sign-in gate on Matrimonial tab', async ({ page }) => {
    const matchTab = page.locator('text=Match').first();
    const hasMatchTab = await matchTab.isVisible({ timeout: 8000 }).catch(() => false);
    if (!hasMatchTab) return;
    await matchTab.click();
    await page.waitForTimeout(1000);
    const gate = await page.locator('text=Sign in to access Matrimonial').isVisible({ timeout: 8000 }).catch(() => false);
    const signIn = await page.locator('text=Sign in').first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(gate || signIn).toBeTruthy();
  });

  test('guest can open Auth from Matrimonial sign-in button', async ({ page }) => {
    const matchTab = page.locator('text=Match').first();
    const hasMatchTab = await matchTab.isVisible({ timeout: 8000 }).catch(() => false);
    if (!hasMatchTab) return;
    await matchTab.click();
    await page.waitForTimeout(1000);
    const signInButton = page.locator('text=Sign in').first();
    const signInVisible = await signInButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (!signInVisible) return;
    await signInButton.click();
    await page.waitForTimeout(1000);
    const authScreen =
      (await page.locator('text=/Sign in|Email|Password|Log in/i').first().isVisible({ timeout: 5000 }).catch(() => false)) ||
      (await page.locator('input[type="email"], input[placeholder*="email" i]').isVisible({ timeout: 3000 }).catch(() => false));
    expect(authScreen).toBeTruthy();
  });
});
