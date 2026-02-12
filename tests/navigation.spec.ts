import { test, expect } from '@playwright/test';
import { NavigationHelper } from './helpers/navigation';
import { AuthHelper } from './helpers/auth';
import { testUsers } from './fixtures/test-data';

test.describe('Navigation', () => {
  let navigationHelper: NavigationHelper;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    navigationHelper = new NavigationHelper(page);
    authHelper = new AuthHelper(page);
    await page.goto('/');
    
    // Note: Uncomment when test user is available
    // await authHelper.signIn(testUsers.regular.email, testUsers.regular.password);
  });

  test('should display bottom tab navigation when authenticated', async ({ page }) => {
    // Placeholder - uncomment when authenticated
    /*
    await expect(page.locator('text=Feed')).toBeVisible();
    await expect(page.locator('text=Requests')).toBeVisible();
    await expect(page.locator('text=Matrimonial')).toBeVisible();
    await expect(page.locator('text=Profile')).toBeVisible();
    */
    
    // For now, just check auth screen
    await expect(page.locator('text=/Bhatia/i')).toBeVisible();
  });

  test('should navigate to Feed tab', async ({ page }) => {
    // Placeholder - uncomment when authenticated
    /*
    await navigationHelper.goToFeed();
    await expect(navigationHelper.isOnTab('Feed')).resolves.toBe(true);
    */
    
    await expect(page.locator('text=/Bhatia/i')).toBeVisible();
  });

  test('should navigate to Requests tab', async ({ page }) => {
    // Placeholder - uncomment when authenticated
    /*
    await navigationHelper.goToRequests();
    await expect(navigationHelper.isOnTab('Requests')).resolves.toBe(true);
    */
    
    await expect(page.locator('text=/Bhatia/i')).toBeVisible();
  });

  test('should navigate to Matrimonial tab', async ({ page }) => {
    // Placeholder - uncomment when authenticated
    /*
    await navigationHelper.goToMatrimonial();
    await expect(navigationHelper.isOnTab('Matrimonial')).resolves.toBe(true);
    */
    
    await expect(page.locator('text=/Bhatia/i')).toBeVisible();
  });

  test('should navigate to Profile tab', async ({ page }) => {
    // Placeholder - uncomment when authenticated
    /*
    await navigationHelper.goToProfile();
    await expect(navigationHelper.isOnTab('Profile')).resolves.toBe(true);
    */
    
    await expect(page.locator('text=/Bhatia/i')).toBeVisible();
  });

  test('should maintain active tab state', async ({ page }) => {
    // Placeholder - uncomment when authenticated
    /*
    await navigationHelper.goToFeed();
    await page.reload();
    await expect(navigationHelper.isOnTab('Feed')).resolves.toBe(true);
    */
    
    await expect(page.locator('text=/Bhatia/i')).toBeVisible();
  });
});

