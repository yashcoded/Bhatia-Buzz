# Google Sign-In Setup

The app uses **expo-auth-session** with Google OAuth 2.0 (PKCE) to get an ID token, then signs in to Firebase with that token.

---

## How to Get Your Google OAuth Client ID

### 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Open **APIs & Services** → **Credentials**.

### 2. Configure OAuth consent screen (if not done)

1. Click **OAuth consent screen** in the sidebar.
2. Choose **External** (or Internal for workspace-only).
3. Fill in App name, User support email, Developer contact.
4. Add scopes if needed (Expo/Google provider usually requests `openid`, `profile`, `email`).
5. Save.

### 3. Create OAuth client ID

1. Go to **Credentials** → **Create Credentials** → **OAuth client ID**.
2. Application type: **Web application** (works for Expo web and redirect flows).
3. Name: e.g. `Bhatia Buzz Web`.
4. **Authorized redirect URIs** — add the redirect URI your app uses:
   - For **Expo Go / dev**: often `https://auth.expo.io/@your-username/your-app-slug` or a custom scheme.
   - To see what the app uses, run the app and check the console for the redirect URI, or call `expo-auth-session.makeRedirectUri()` and log the result.
   - For **production**, add the exact redirect URI (e.g. your custom scheme `com.yourapp://` or Expo auth proxy URL).
5. Create and copy the **Client ID** (the long string ending in `.apps.googleusercontent.com`).

### 4. Enable Google Sign-In in Firebase

1. [Firebase Console](https://console.firebase.google.com/) → your project.
2. **Authentication** → **Sign-in method** → enable **Google**.
3. You can use the same Web client ID from step 3 in the Firebase Google provider settings if prompted.

---

## Add to Your Project

### Environment variable

In the project root `.env`:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-xxxxxx.apps.googleusercontent.com
```

Replace with your actual Client ID. Restart the Expo dev server after changing `.env`.

### Optional: app.config / extra

You can also pass the client ID via `app.config.ts` so it’s in `expo.extra`:

```ts
extra: {
  google: {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  },
},
```

The app reads `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` first; the extra config can be a fallback.

---

## Testing

1. Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `.env`.
2. Restart: `pnpm start`.
3. Open the app → Auth screen → tap **Sign in with Google**.
4. Complete the Google sign-in; you should be signed in to the app.

---

## Troubleshooting

- **“Google Web Client ID is not set”**  
  Ensure `.env` has `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` and you’ve restarted the dev server.

- **Redirect URI mismatch**  
  The redirect URI in the Google Cloud OAuth client must exactly match what the app uses (check logs or `makeRedirectUri()`).

- **“Google Sign-In was cancelled”**  
  User closed the browser/popup; try again.

- **“Failed to complete Google Sign-In”**  
  Check token exchange (e.g. network, redirect URI, client ID). Ensure the OAuth client is “Web application” and the redirect URI is correct.

---

## Native (iOS/Android) optional

For native builds you can create separate OAuth client IDs (iOS, Android) and pass them via env or config; the current implementation uses the Web client ID for all platforms. See [Expo Google auth docs](https://docs.expo.dev/guides/authentication/#google) if you want to add native client IDs later.
