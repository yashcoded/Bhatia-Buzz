# API Keys & Setup — How to Get Each Key

This doc explains **how to get every API key and config value** used by Bhatia Buzz. Add them to your **local** `.env` (see `.env.example` in the project root).

> **Important:** Never commit `.env` or any file containing real keys. `.env` is gitignored. For EAS/CI builds, use EAS Secrets or CI env vars — see [SECURITY_AND_KEYS.md](SECURITY_AND_KEYS.md).

---

## 1. Firebase (required)

**Used for:** Auth, Firestore, Storage.

**How to get:**

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create or select a project.
3. Enable **Authentication** (Email/Password; optionally Google, Phone), **Firestore**, **Storage**.
4. Project Settings (gear) → **Your apps** → Add app (Web `</>`) → copy the config.

**Add to `.env`:**

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Full steps: [SETUP.md — Firebase Setup](SETUP.md#2-firebase-setup).

---

## 2. Google Sign-In (optional)

**Used for:** “Sign in with Google” on the Auth screen.

**How to get:**

1. [Google Cloud Console](https://console.cloud.google.com/) → select or create a project.
2. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
3. Application type: **Web application** (for Expo/React Native use the Web client ID).
4. Add **Authorized redirect URIs** (Expo will use a redirect like `https://auth.expo.io/...` or your custom scheme; run the app once and check the redirect URI in logs or use `expo-auth-session.makeRedirectUri()`).
5. Copy the **Client ID** (not the secret).

**Add to `.env`:**

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

Detailed steps and native client IDs: [GOOGLE_SIGNIN_SETUP.md](GOOGLE_SIGNIN_SETUP.md).

---

## 3. Hugging Face (required for matrimonial face verification)

**Used for:** Verifying that matrimonial profile photos contain a single visible face.

**How to get:**

1. Sign up at [Hugging Face](https://huggingface.co/).
2. **Profile** → **Settings** → **Access Tokens** → **New Token**.
3. Name it (e.g. `Bhatia-Buzz-Face-Verification`), type **Read**, create and copy the token.

**Add to `.env`:**

```env
EXPO_PUBLIC_HUGGING_FACE_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Full guide: [HUGGING_FACE_SETUP.md](HUGGING_FACE_SETUP.md).

---

## 4. Instagram (optional)

**Used for:** Showing Instagram posts in the app feed (optional; feed works without it).

**How to get:**

1. [Facebook Developers](https://developers.facebook.com/) → create or select an app.
2. Add product **Instagram Graph API**.
3. Configure and get a **User access token** for the Instagram Business/Creator account.

**Add to `.env`:**

```env
EXPO_PUBLIC_INSTAGRAM_ACCESS_TOKEN=...
```

Details: [INSTAGRAM_SETUP.md](INSTAGRAM_SETUP.md).

---

## 5. Optional contact emails

Defaults are used if not set. Override in `.env` if needed:

```env
EXPO_PUBLIC_PRIVACY_EMAIL=privacy@yourdomain.com
EXPO_PUBLIC_LEGAL_EMAIL=legal@yourdomain.com
EXPO_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com
```

---

## Summary table

| Key / config              | Required? | Env variable                          |
|---------------------------|-----------|----------------------------------------|
| Firebase                  | Yes       | `EXPO_PUBLIC_FIREBASE_*` (6 vars)     |
| Hugging Face              | For matrimonial photos | `EXPO_PUBLIC_HUGGING_FACE_TOKEN` |
| Google (Sign in with Google) | No    | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`    |
| Instagram                 | No        | `EXPO_PUBLIC_INSTAGRAM_ACCESS_TOKEN`  |
| Contact emails            | No        | `EXPO_PUBLIC_PRIVACY_EMAIL` etc.      |

Never commit real keys to version control; use `.env` and keep it in `.gitignore`.
