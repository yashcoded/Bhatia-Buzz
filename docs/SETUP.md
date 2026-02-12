# Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- pnpm (install with `npm install -g pnpm` or see [pnpm installation guide](https://pnpm.io/installation))
- Expo CLI (installed globally or via pnpm)
- Firebase account
- (Optional) Instagram Business Account with Graph API access

## Step-by-Step Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable the following services:
   - **Authentication**: 
     - Email/Password
     - Google (optional)
     - Phone (optional)
   - **Firestore Database**: Create in production mode
   - **Storage**: Enable
   - **Cloud Messaging**: Enable (for push notifications)

4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps"
   - Click on the web icon (</>) to add a web app
   - Copy the configuration values

### 3. Environment Variables

1. Create a `.env` file in the root directory (copy from `.env.example`)
2. Add your Firebase configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 4. Deploy Firebase Security Rules

#### Option A: Using Firebase CLI

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select Firestore and Storage
   - Use existing project
   - Use default file names

4. Deploy rules:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only storage
   ```

#### Option B: Manual Setup

1. Go to Firebase Console > Firestore Database > Rules
2. Copy the content from `firestore.rules` and paste it
3. Click "Publish"

4. Go to Firebase Console > Storage > Rules
5. Copy the content from `storage.rules` and paste it
6. Click "Publish"

### 5. Instagram API Setup (Optional)

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add Instagram Graph API product
4. Get an access token
5. Add to `.env`:
   ```env
   EXPO_PUBLIC_INSTAGRAM_ACCESS_TOKEN=your-access-token
   ```

### 6. Google Sign-In Setup (Optional)

For Google Sign-In to work, you need to:

1. Enable Google Sign-In in Firebase Console > Authentication > Sign-in method
2. Get your OAuth client IDs from [Google Cloud Console](https://console.cloud.google.com/)
3. Install required packages:
   ```bash
   expo install expo-auth-session expo-crypto
   ```
4. Update `src/utils/googleSignIn.ts` with your implementation
5. Update `src/services/firebase/auth.ts` to use the Google ID token

### 7. Run the App

```bash
# Start Expo development server
pnpm start

# Run on Android
pnpm run android

# Run on iOS (requires macOS)
pnpm run ios

# Run on Web
pnpm run web
```

## Testing

### Create Test Users

1. Use Firebase Console > Authentication to create test users
2. Or use the app's sign-up flow

### Test Admin Features

1. Create a user in Firestore with `role: 'admin'`:
   ```javascript
   // In Firestore Console
   {
     id: "user-id",
     email: "admin@example.com",
     displayName: "Admin User",
     role: "admin",
     createdAt: Timestamp.now()
   }
   ```

## Troubleshooting

### Firebase Connection Issues

- Check that your `.env` file has correct values
- Verify Firebase project is active
- Check internet connection

### Authentication Errors

- Ensure Authentication is enabled in Firebase Console
- Check that the sign-in method is enabled
- Verify security rules allow user creation

### Firestore Permission Errors

- Deploy security rules (see step 4)
- Check that rules match your use case
- Verify user is authenticated

### Instagram API Errors

- Verify access token is valid
- Check token expiration
- Ensure Instagram Business Account is connected

## Next Steps

- Customize the UI to match your design
- Add more features as needed
- Set up push notifications
- Configure analytics
- Set up CI/CD pipeline

