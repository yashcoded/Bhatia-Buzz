import { test as base } from '@playwright/test';
import {
  FIREBASE_AUTH_STUB,
  FIREBASE_AUTH_TOKEN_STUB,
  FIRESTORE_STUB,
  FIREBASE_STORAGE_STUB,
  HUGGING_FACE_FACE_STUB,
  INSTAGRAM_STUB,
} from './api-stubs';

/**
 * Apply route stubs so E2E tests do not hit live APIs (no cost, no flakiness).
 * Stubs: Firebase Auth, Firestore, Hugging Face, Instagram.
 */
async function addApiStubs(page: import('@playwright/test').Page) {
  await page.route('**/identitytoolkit.googleapis.com/**', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FIREBASE_AUTH_STUB) });
    }
    return route.continue();
  });
  await page.route('**/securetoken.googleapis.com/**', (route) => {
    return route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify(FIREBASE_AUTH_TOKEN_STUB()),
    });
  });
  await page.route('**/firestore.googleapis.com/**', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FIRESTORE_STUB()) });
    }
    return route.continue();
  });
  await page.route('**/api-inference.huggingface.co/**', (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(HUGGING_FACE_FACE_STUB()),
    });
  });
  await page.route('**/graph.instagram.com/**', (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(INSTAGRAM_STUB()),
    });
  });
  await page.route('**/firebasestorage.googleapis.com/**', (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(FIREBASE_STORAGE_STUB()),
    });
  });
}

/**
 * Extended test that provides a page with API routes stubbed (no live Firebase/HF/Instagram calls).
 */
export const test = base.extend<{ page: import('@playwright/test').Page }>({
  page: async ({ page }, use) => {
    await addApiStubs(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
