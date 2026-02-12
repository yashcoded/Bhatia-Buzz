# Phone Authentication Setup

Phone sign-in is **not implemented** in the app yet. This doc describes how you could add it.

---

## Current status

- `signInWithPhone()` in `src/services/firebase/auth.ts` throws a clear error and points here.
- No UI for entering phone number or verification code yet.

---

## How to implement

### Web

Firebase Phone Auth on web uses **reCAPTCHA**:

1. Add a container element (e.g. `<div id="recaptcha-container">`) in your auth screen.
2. Create `RecaptchaVerifier` from `firebase/auth`:  
   `new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible', callback: ... })`
3. Call `signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)` to send the SMS.
4. On success you get a `ConfirmationResult`; call `confirmationResult.confirm(verificationCode)` when the user enters the code.

### React Native / Expo

- Use Firebase’s native phone auth flow (requires native config, e.g. SafetyNet/Play Integrity on Android, and possibly a backend to send the SMS or verify).
- Or use a provider like **Expo’s auth session** with a phone provider if available; or **Firebase Phone Auth** with `@react-native-firebase/auth` and application verifier for native.

---

## Firebase Console

1. Enable **Phone** in Authentication → Sign-in method.
2. For production, add your app’s allowed domains/URLs and ensure quotas and billing are set if needed.

---

## Summary

- **Web:** Implement with `RecaptchaVerifier` + `signInWithPhoneNumber` + `ConfirmationResult.confirm(code)`.
- **Native:** Use Firebase native phone auth or a compatible Expo/Firebase library and wire it into `signInWithPhone()` and your auth UI.
