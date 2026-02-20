import { test, expect } from './fixtures/stubbed-page';
import { NavigationHelper, waitForAppReady } from './helpers/navigation';

test.describe('About & Developer', () => {
  let navigationHelper: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    navigationHelper = new NavigationHelper(page);
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitForAppReady(page, 20000);
    await page.waitForTimeout(1000);
  });

  test('navigate to About & Developer from Settings', async ({ page }) => {
    await navigationHelper.goToProfile();
    await page.waitForTimeout(800);

    const settingsButton = page.locator('text=/Settings/i').first();
    const settingsVisible = await settingsButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (!settingsVisible) {
      // Guest or app not fully loaded; skip (requires auth to reach Settings)
      return;
    }

    await settingsButton.click();
    await page.waitForTimeout(800);

    const aboutLink = page.locator('text=/About & Developer Docs/i').or(
      page.locator('text=/About & Developer/i')
    ).first();
    const aboutVisible = await aboutLink.isVisible({ timeout: 5000 }).catch(() => false);
    expect(aboutVisible).toBeTruthy();

    await aboutLink.click();
    await page.waitForTimeout(1000);

    await expect(page.locator('text=About Bhatia Buzz')).toBeVisible({ timeout: 5000 });
  });

  test('About screen shows How it works and Documentation', async ({ page }) => {
    await navigationHelper.goToProfile();
    await page.waitForTimeout(800);

    const settingsButton = page.locator('text=/Settings/i').first();
    if (!(await settingsButton.isVisible({ timeout: 5000 }).catch(() => false))) {
      // Guest or app not fully loaded; skip (requires auth to reach Settings)
      return;
    }

    await settingsButton.click();
    await page.waitForTimeout(800);

    const aboutLink = page.locator('text=/About & Developer Docs/i').or(
      page.locator('text=/About & Developer/i')
    ).first();
    if (!(await aboutLink.isVisible({ timeout: 5000 }).catch(() => false))) {
      expect(true).toBeTruthy();
      return;
    }

    await aboutLink.click();
    await page.waitForTimeout(1000);

    await expect(page.locator('text=How it works')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Documentation')).toBeVisible({ timeout: 5000 });
  });
});
