import { Page } from '@playwright/test';

/**
 * Helper functions for authentication testing
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    // Wait for auth screen to load
    await this.page.waitForSelector('text=Sindhi Community App', { timeout: 10000 });
    
    // Fill in email
    await this.page.fill('input[placeholder="Email"]', email);
    
    // Fill in password
    await this.page.fill('input[placeholder="Password"]', password);
    
    // Click sign in button
    await this.page.click('button:has-text("Sign In")');
    
    // Wait for navigation to main app
    await this.page.waitForSelector('text=Feed', { timeout: 10000 });
  }

  /**
   * Sign up with email, password, and display name
   */
  async signUp(email: string, password: string, displayName: string) {
    // Wait for auth screen to load
    await this.page.waitForSelector('text=Sindhi Community App', { timeout: 10000 });
    
    // Click sign up link if not already on sign up
    const signUpLink = this.page.locator('text=Don\'t have an account? Sign Up');
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
    }
    
    // Fill in display name
    await this.page.fill('input[placeholder="Display Name"]', displayName);
    
    // Fill in email
    await this.page.fill('input[placeholder="Email"]', email);
    
    // Fill in password
    await this.page.fill('input[placeholder="Password"]', password);
    
    // Click sign up button
    await this.page.click('button:has-text("Sign Up")');
    
    // Wait for navigation to main app
    await this.page.waitForSelector('text=Feed', { timeout: 10000 });
  }

  /**
   * Sign out
   */
  async signOut() {
    // Navigate to profile
    await this.page.click('text=Profile');
    
    // Click sign out button
    await this.page.click('button:has-text("Sign Out")');
    
    // Wait for auth screen
    await this.page.waitForSelector('text=Sindhi Community App', { timeout: 10000 });
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.page.waitForSelector('text=Feed', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

