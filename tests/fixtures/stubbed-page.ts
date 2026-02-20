import { test as base } from '@playwright/test';
import {
  FIREBASE_AUTH_STUB,
  FIREBASE_AUTH_TOKEN_STUB,
  FIRESTORE_STUB,
  FIRESTORE_BATCH_STUB,
  FIREBASE_STORAGE_STUB,
  HUGGING_FACE_FACE_STUB,
  INSTAGRAM_STUB,
} from './api-stubs';

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

/**
 * Apply route stubs so E2E tests do not hit live APIs (no cost, no flakiness).
 * Stubs: Firebase Auth, Firestore, Hugging Face, Instagram, Storage.
 * For unit tests with axios, use moxios with the same payloads from api-stubs.
 */
async function addApiStubs(page: import('@playwright/test').Page) {
  await page.route('**/identitytoolkit.googleapis.com/**', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill(json(FIREBASE_AUTH_STUB));
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
    if (route.request().method() !== 'POST') return route.continue();
    const isCommit = route.request().url().includes(':commit');
    const stub = isCommit ? FIRESTORE_BATCH_STUB() : FIRESTORE_STUB();
    return route.fulfill(json(stub));
  });
  await page.route('**/api-inference.huggingface.co/**', (route) => {
    return route.fulfill(json(HUGGING_FACE_FACE_STUB()));
  });
  await page.route('**/graph.instagram.com/**', (route) => {
    return route.fulfill(json(INSTAGRAM_STUB()));
  });
  await page.route('**/firebasestorage.googleapis.com/**', (route) => {
    return route.fulfill(json(FIREBASE_STORAGE_STUB()));
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
