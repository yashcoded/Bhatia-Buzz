# Sindhi Community App

| [![GitHub repo](https://img.shields.io/badge/GitHub-bhatia--buzz-24292e?logo=github)](https://github.com/yashcoded/bhatia-buzz) | [![GitHub stars](https://img.shields.io/github/stars/yashcoded/bhatia-buzz)](https://github.com/yashcoded/bhatia-buzz/stargazers) | [![GitHub forks](https://img.shields.io/github/forks/yashcoded/bhatia-buzz)](https://github.com/yashcoded/bhatia-buzz/network/members) | [![GitHub issues](https://img.shields.io/github/issues/yashcoded/bhatia-buzz)](https://github.com/yashcoded/bhatia-buzz/issues) | [![License](https://img.shields.io/github/license/yashcoded/bhatia-buzz)](https://github.com/yashcoded/bhatia-buzz/blob/main/LICENSE) | [![Tests](https://github.com/yashcoded/bhatia-buzz/actions/workflows/tests.yml/badge.svg)](https://github.com/yashcoded/bhatia-buzz/actions/workflows/tests.yml) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **GitHub repo** | **Stars** | **Forks** | **Issues** | **License** | **Tests (CI)** |

> [github.com/yashcoded/bhatia-buzz](https://github.com/yashcoded/bhatia-buzz) — Create the repo with this **exact name** (`bhatia-buzz`) so badges and links work.

A mobile application built with Expo (React Native) and Firebase for the Sindhi community, featuring Instagram-like feed, request management, and matrimonial matching.

## Tech Stack

- **Frontend**: Expo (React Native) + TypeScript
- **Backend**: Firebase (Firestore, Auth, Storage, Functions, Cloud Messaging)
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Testing**: Playwright (E2E)
- **External API**: Instagram Graph API

## Features

### 1. Instagram Feed
- Display community posts
- Instagram Graph API integration
- Cached content for offline viewing
- Pull-to-refresh functionality
- Like and comment on posts

### 2. Request Page
- Condolence posts
- Celebration requests
- Form submissions
- Admin moderation system

### 3. Matrimonial
- Profile questionnaire
- Swipe interface for matching
- Intelligent matching algorithm
- Admin review system

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components
│   ├── feed/           # Feed-related components
│   ├── requests/       # Request-related components
│   └── matrimonial/    # Matrimonial-related components
├── screens/            # Screen components
├── navigation/         # Navigation configuration
├── store/              # Redux store and slices
├── services/          # Business logic and API services
│   ├── firebase/      # Firebase services
│   ├── instagram/     # Instagram API integration
│   └── matching/      # Matching algorithm
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
└── constants/          # App constants and configuration
```

## Documentation

All setup guides, API keys, compliance, and test status live in the **`docs/`** folder. See the full index: **[docs/README.md](docs/README.md)**.

| Link | Description |
|------|-------------|
| [docs/README.md](docs/README.md) | **Index of all documentation** |
| [docs/SETUP.md](docs/SETUP.md) | Full project setup (install, Firebase, deploy, run) |
| [docs/API_KEYS_AND_SETUP.md](docs/API_KEYS_AND_SETUP.md) | How to get every API key (Firebase, Google, Hugging Face, Instagram) |
| [docs/DOCKER_AND_ENV.md](docs/DOCKER_AND_ENV.md) | Docker and environment variables |
| [docs/SECURITY_AND_KEYS.md](docs/SECURITY_AND_KEYS.md) | Security and pre-push checklist |
| [docs/TEST_RESULTS.md](docs/TEST_RESULTS.md) | E2E test status (69 tests) |
| [docs/TEST_IMPLEMENTATION_SUMMARY.md](docs/TEST_IMPLEMENTATION_SUMMARY.md) | How tests are structured and run |

In the app: **Settings → About & Developer Docs** for an overview and doc list.

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password, Google, Phone)
3. Create a Firestore database
4. Set up Firebase Storage
5. Copy your Firebase configuration

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your Firebase configuration values:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

### 4. Configure Instagram API (Optional)

1. Get an Instagram Access Token from [Facebook Developers](https://developers.facebook.com/)
2. Add it to your `.env` file:
   ```
   EXPO_PUBLIC_INSTAGRAM_ACCESS_TOKEN=your-instagram-access-token
   ```

### 5. Deploy Firebase Security Rules

Deploy the security rules to your Firebase project:

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

Or manually copy the rules from `firestore.rules` and `storage.rules` to your Firebase Console.

### 6. Run the App

```bash
# Start the development server
pnpm start

# Run on Android
pnpm run android

# Run on iOS
pnpm run ios

# Run on Web
pnpm run web
```

## Architecture

### Presentation Layer
- Expo (React Native) UI components
- TypeScript for type safety
- React Navigation for routing
- Custom reusable components

### Business Logic Layer
- Redux Toolkit for state management
- Firebase Functions for server-side logic
- Instagram API integration
- Matching algorithm for matrimonial feature

### Data Layer
- Firebase Firestore for database
- Firebase Storage for media files
- Firebase Auth for authentication
- Real-time data synchronization

## Security

- Firestore security rules for data access control
- Storage security rules for file access
- Server-side validation via Firebase Functions
- TypeScript for compile-time type checking

## Testing

Playwright is configured for end-to-end testing. Test files are located in the `tests/` directory.

### Running Tests

1. **Start the web app** (or let Playwright start it automatically):
   ```bash
   pnpm run web
   ```

2. **Run all tests**:
   ```bash
   pnpm run test:e2e
   ```

3. **Run tests in UI mode** (interactive):
   ```bash
   pnpm run test:e2e:ui
   ```

4. **Run tests in debug mode**:
   ```bash
   pnpm run test:e2e:debug
   ```

5. **View test report**:
   ```bash
   pnpm run test:e2e:report
   ```

### Test Structure

- `tests/auth.spec.ts` - Authentication tests
- `tests/navigation.spec.ts` - Navigation tests
- `tests/feed.spec.ts` - Feed feature tests
- `tests/requests.spec.ts` - Requests feature tests
- `tests/matrimonial.spec.ts` - Matrimonial feature tests
- `tests/profile.spec.ts` - Profile feature tests
- `tests/helpers/` - Test helper functions
- `tests/fixtures/` - Test data fixtures

### Test Setup

Before running tests, ensure:

1. **Test users exist in Firebase**:
   - Regular user: `testuser@example.com` / `TestPassword123!`
   - Admin user: `admin@example.com` / `AdminPassword123!`

2. **Firebase is configured** with your test environment

3. **Test data is available** (optional, for full test coverage)

See `tests/README.md` for detailed testing documentation.

## Project status & stats

| Status | Details |
|--------|--------|
| **E2E tests** | 69 tests, all passing — see [docs/TEST_RESULTS.md](docs/TEST_RESULTS.md) |
| **License** | See [LICENSE](LICENSE) |
| **GitHub** | [yashcoded/bhatia-buzz](https://github.com/yashcoded/bhatia-buzz) — stars, forks, and issues badges at the top. |

To show live GitHub stats (stars, forks, issues) in the README, after pushing set the repo URL and use:

- `https://img.shields.io/github/stars/yashcoded/bhatia-buzz`
- `https://img.shields.io/github/forks/yashcoded/bhatia-buzz`
- `https://img.shields.io/github/issues/yashcoded/bhatia-buzz`

## Admin Features

Admins can:
- Moderate requests (approve/reject)
- Review matrimonial profiles
- Manage user content
- Access admin-only features

## Author

**[Yash Kamal Bhatia](https://github.com/yashcoded)** — [@yashcoded](https://github.com/yashcoded) on GitHub.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

See LICENSE file for details.

