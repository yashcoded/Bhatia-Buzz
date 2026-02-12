# Running Bhatia Buzz Globally

This document summarizes what is in place for the app to run in multiple regions and how to configure it for global deployment.

## What’s in place

### 1. **Language (i18n)**
- **Supported locales:** English (en), Spanish (es), Portuguese (pt), French (fr), Hindi (hi), Arabic (ar).
- **Auth screen** (sign in / sign up, age, consent) is fully translated; language follows device locale with fallback to English.
- **Privacy Policy and Terms** use `react-i18next`; full content exists in English and Arabic; other locales fall back as configured.
- **App entry:** `App.tsx` imports `./src/i18n/config` so i18n is initialized on launch.

### 2. **Region-based age rules**
- **EU/EEA/UK:** 16+ (GDPR-style).
- **Brazil:** 18+.
- **India:** 18+.
- **Rest of world:** 13+ (e.g. COPPA-style).
- Region is determined by **GPS** (with permission) or **device locale**; the correct minimum age and localized message are shown and enforced on signup.

### 3. **Locale-aware formatting**
- **Dates:** Feed, Requests, Request detail, Settings “Member since”, and Profile “Member since” use `formatDate` / `formatDateShort` from `src/utils/locale.ts` (device locale).
- **Phone:** Country-aware validation/formatting is in place where used.

### 4. **Configurable legal contact**
- **Privacy / Legal / Support emails** are read from config, with env fallbacks:
  - `src/constants/config.ts` → `contactInfo.privacyEmail`, `legalEmail`, `supportEmail`.
  - Env: `EXPO_PUBLIC_PRIVACY_EMAIL`, `EXPO_PUBLIC_LEGAL_EMAIL`, `EXPO_PUBLIC_SUPPORT_EMAIL`.
- Set these (e.g. in `.env` or app.config `extra`) before release so Privacy Policy and Terms show real contacts.

### 5. **Email validation and verification**
- **Disposable emails blocked:** Signup rejects known temporary/disposable email domains (see `src/utils/emailValidation.ts`). Reduces spam and improves deliverability.
- **Email verification:** After signup, Firebase sends a verification email; the user verifies by clicking the link (no in-app code entry). `User.emailVerified` is set from Firebase Auth and shown in Settings; unverified users see a “Resend verification email” option.
- **Global compliance:** Verifying email for account security is a legitimate interest and is common practice; no extra consent is required. The verification email is transactional (necessary for the service), not marketing.
- **No custom verification code:** Using Firebase’s built-in link-based verification avoids running your own code-delivery pipeline and keeps the app globally deployable without region-specific SMS/email providers.

## Environment / config for global deployment

1. **Contact emails (recommended)**  
   In `.env` or Expo `extra`:
   - `EXPO_PUBLIC_PRIVACY_EMAIL` – e.g. `privacy@yourdomain.com`
   - `EXPO_PUBLIC_LEGAL_EMAIL` – e.g. `legal@yourdomain.com`
   - `EXPO_PUBLIC_SUPPORT_EMAIL` – e.g. `support@yourdomain.com`

2. **Firebase**  
   Already configured via `app.config.ts` / `EXPO_PUBLIC_FIREBASE_*`; ensure project and rules are set for your target regions.

3. **Location (optional)**  
   For region-based age, the app can use device location; `expo-location` is in `package.json`. iOS/Android permission strings are set in `app.config.ts`. If you don’t install or allow location, region falls back to device locale.

4. **Build / store**  
   - Run `pnpm install` (or `npm install`) so dependencies (including `expo-location` if you use it) are installed.
   - Use the same codebase for all regions; locale and region are determined at runtime from device settings and optional location.

## Summary

- **i18n:** Auth and key flows localized; 6 languages with English fallback.
- **Age:** Region-based (EU 16+, Brazil/India 18+, rest 13+) using GPS or locale.
- **Dates:** Formatted by device locale.
- **Legal contacts:** Set via env/config so the app can run globally with correct contact details.

For full compliance checklist and remaining items (legal review, store forms, more translations), see `docs/GLOBAL_COMPLIANCE_ASSESSMENT.md` and `docs/COMPLIANCE_IMPLEMENTATION.md`.
