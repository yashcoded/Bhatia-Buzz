# Playwright E2E Tests

This directory contains end-to-end tests for the Sindhi Community App using Playwright.

## Test Structure

```
tests/
├── helpers/           # Test helper functions
│   ├── auth.ts        # Authentication helpers
│   └── navigation.ts  # Navigation helpers
├── fixtures/          # Test data and API stubs
│   ├── test-data.ts   # Test data constants
│   ├── api-stubs.ts   # Stub response bodies (Firebase, HF, Instagram)
│   └── stubbed-page.ts # Playwright fixture that stubs live APIs
├── auth.spec.ts      # Authentication tests
├── navigation.spec.ts # Navigation tests
├── feed.spec.ts      # Feed feature tests
├── requests.spec.ts  # Requests feature tests
├── matrimonial.spec.ts # Matrimonial feature tests
├── profile.spec.ts   # Profile feature tests
└── example.spec.ts   # Example test template
```

## API stubbing (no live calls)

E2E tests use **Playwright route interception** so they do not hit live APIs (no cost, no rate limits):

- **Firebase Auth** – stubbed so the app shows the login screen (no real auth).
- **Firestore** – stubbed with empty results.
- **Firebase Storage** – stubbed with empty list.
- **Hugging Face** (face detection) – stubbed with a single face result.
- **Instagram Graph API** – stubbed with empty feed.

All specs import `test` and `expect` from `./fixtures/stubbed-page`, which applies these stubs to every test. To hit real APIs, use the base `@playwright/test` in a separate spec.

**Moxios:** The project includes `moxios` for stubbing axios in unit tests (e.g. with Jest). The same response shapes in `fixtures/api-stubs.ts` can be used with moxios to stub axios requests so unit tests pass without hitting live APIs.

## Running Tests

### Prerequisites

1. Make sure the app is running on web:
   ```bash
   pnpm run web
   ```

2. Or let Playwright start it automatically (configured in `playwright.config.ts`)

### Run All Tests

```bash
npx playwright test
```

### Run Specific Test File

```bash
npx playwright test tests/auth.spec.ts
```

### Run Tests in UI Mode

```bash
npx playwright test --ui
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

### Run Tests in Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Configuration

Tests are configured in `playwright.config.ts`. Key settings:

- **Base URL**: `http://localhost:8081` (Expo web default)
- **Web Server**: Automatically starts `pnpm run web` before tests
- **Browsers**: Chromium, Firefox, WebKit
- **Retries**: 2 retries on CI, 0 locally
- **Screenshots**: On failure only
- **Videos**: Retained on failure

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await expect(page.locator('text=Expected Text')).toBeVisible();
  });
});
```

### Using Helpers

```typescript
import { AuthHelper } from './helpers/auth';

test('example', async ({ page }) => {
  const authHelper = new AuthHelper(page);
  await authHelper.signIn('email@example.com', 'password');
});
```

### Using Test Data

```typescript
import { testUsers } from './fixtures/test-data';

test('example', async ({ page }) => {
  // Use test data
  const user = testUsers.regular;
});
```

## Test Data Setup

Before running tests, you need to:

1. **Create test users in Firebase**:
   - Regular user: `testuser@example.com` / `TestPassword123!`
   - Admin user: `admin@example.com` / `AdminPassword123!`

2. **Update test data** in `tests/fixtures/test-data.ts` if needed

3. **Ensure Firebase is configured** with test environment

## Important Notes

⚠️ **Many tests are currently placeholders** because they require:
- Authenticated users in Firebase
- Test data (posts, requests, profiles) in Firestore
- Proper test IDs (`data-testid`) in components

### To Enable Full Testing:

1. **Add test IDs to components**:
   ```tsx
   <View data-testid="post-card">
     {/* component content */}
   </View>
   ```

2. **Create test users** in Firebase Authentication

3. **Seed test data** in Firestore:
   - Posts
   - Requests
   - Matrimonial profiles

4. **Uncomment test code** in test files

## CI/CD Integration

To run tests in CI:

```yaml
# Example GitHub Actions
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run tests
  run: npx playwright test
```

## Debugging Tests

1. **Use Playwright Inspector**:
   ```bash
   npx playwright test --debug
   ```

2. **View test traces**:
   ```bash
   npx playwright show-trace trace.zip
   ```

3. **View HTML report**:
   ```bash
   npx playwright show-report
   ```

## Best Practices

1. **Use test IDs** instead of text selectors when possible
2. **Wait for elements** before interacting
3. **Use helper functions** for common operations
4. **Keep tests independent** - each test should be able to run alone
5. **Clean up test data** after tests if needed
6. **Use fixtures** for test data
7. **Add meaningful test descriptions**

## Troubleshooting

### Tests fail to connect to app

- Ensure `npm run web` is running
- Check that Expo is running on port 8081
- Verify `baseURL` in `playwright.config.ts`

### Tests timeout

- Increase timeout in test: `test.setTimeout(60000)`
- Check if app is loading correctly
- Verify Firebase connection

### Selectors not found

- Add `data-testid` attributes to components
- Use more specific selectors
- Check if element is visible/loaded before interaction

