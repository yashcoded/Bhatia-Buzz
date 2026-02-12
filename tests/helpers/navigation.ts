import { Page } from '@playwright/test';

/**
 * Wait for the app to be visible (auth or main app). Use in beforeEach to avoid flaky "app not loaded" failures.
 * Uses longer timeout in CI where Expo/React can be slow to render.
 */
export async function waitForAppReady(page: Page, timeoutMs = 20_000): Promise<void> {
  const t = process.env.CI ? Math.max(timeoutMs, 90_000) : timeoutMs;
  await page.waitForSelector('text=/Bhatia|Buzz|Sign in|Create an account|Feed|Profile/i', { timeout: t }).catch(() => null);
}

/**
 * Helper functions for navigation testing
 */
export class NavigationHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to Feed tab
   */
  async goToFeed() {
    await this.page.click('text=Feed');
    await this.page.waitForSelector('text=Feed', { timeout: 5000 });
  }

  /**
   * Navigate to Requests tab (now in Settings)
   */
  async goToRequests() {
    // Navigate via Profile -> Settings -> Requests
    await this.goToProfile();
    await this.page.waitForTimeout(1000);
    
    // Click Settings button
    const settingsButton = this.page.locator('text=/Settings/i').first();
    if (await settingsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await settingsButton.click();
      await this.page.waitForTimeout(1000);
      
      // Click Requests button in Settings
      const requestsButton = this.page.locator('button:has-text("Requests")').or(
        this.page.locator('text=/Requests/i').filter({ hasNotText: /Settings/ })
      ).first();
      
      if (await requestsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await requestsButton.click();
        await this.page.waitForSelector('text=Requests', { timeout: 5000 });
      }
    }
  }

  /**
   * Navigate to Panja Khada tab
   */
  async goToPanjaKhada() {
    await this.page.click('text=/Panja Khada/i');
    await this.page.waitForSelector('text=/Panja Khada/i', { timeout: 5000 });
  }

  /**
   * Navigate to Matrimonial tab (tab bar label is "Match")
   */
  async goToMatrimonial() {
    const matchTab = this.page.locator('text=Match').first();
    await matchTab.waitFor({ state: 'visible', timeout: 15000 });
    await matchTab.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Navigate to Profile tab
   */
  async goToProfile() {
    await this.page.click('text=Profile');
    await this.page.waitForSelector('text=Profile', { timeout: 5000 });
  }

  /**
   * Check if on a specific tab
   */
  async isOnTab(tabName: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(`text=${tabName}`, { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }
}

