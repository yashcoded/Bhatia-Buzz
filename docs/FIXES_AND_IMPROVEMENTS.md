# Fixes and improvements (summary)

This document summarizes important fixes and improvements applied to the app, for maintenance and onboarding.

---

## Project layout and dependencies

- **Single package:** The app uses one `package.json` at the **repository root**. The app entry is `index.ts`. All app code (src, assets, tests, app.config.ts, eas.json) is at the root.
- **One `node_modules`:** Run `pnpm install` only from the repo root.
- **Clean install:** If you ever see two `node_modules` folders, remove the extra one and run `pnpm install` from the root. Two `node_modules` can cause **Expo build issues** (Metro resolution, duplicate React, native build confusion).

---

## Navigation

- **“View your requests” / “📝 Requests” from Profile:** Requests is a **stack** screen, not a tab. From the Profile **tab**, navigation now uses the root stack (`navigation.getParent()`) to open the Requests screen with `openMyRequests: true`, so the “Your requests” filter is selected. Previously, tapping “Requests” from Profile could do nothing or crash because the tab navigator had no Requests route.
- **Settings → “Go to Requests”:** Same stack navigation; now passes `openMyRequests: true` so users land on “Your requests.”
- **Profile → Settings:** Opening Settings from the Profile tab now uses the root stack so the Settings screen opens correctly.

---

## UI and theme

- **Settings screen text/CSS:** All text and borders on the Settings screen now use **theme-aware** styles (`makeStyles(colors)` with `useMemo`). Section titles, descriptions, danger text, info rows, and verification banner respect light/dark mode instead of hardcoded light-theme colors.
- **Glass effect (navbar and headers):** A `GlassSurface` component uses `expo-glass-effect` (iOS) and `expo-blur` (Android with `experimentalBlurMethod: 'dimezisBlurView'`). The **bottom tab bar** and **stack screen headers** (e.g. Settings, Requests, Request Detail) use this for a consistent glass/blur look. Package versions: `expo-glass-effect@~0.1.9`, `expo-blur@~15.0.8` (Expo SDK 54).

---

## Legal and launch

- **Privacy Policy and Terms of Service:** Content is suitable for global launch (App Store, Google Play, GDPR/CCPA). In-app “Last updated” uses a fixed revision date from config (`contactInfo.legalDocumentsLastUpdated` or `EXPO_PUBLIC_LEGAL_DOCS_LAST_UPDATED`), not “today.”
- **No domain needed:** Privacy and Terms can be hosted on GitHub. See [LAUNCH_LEGAL_CHECKLIST.md](LAUNCH_LEGAL_CHECKLIST.md) for using `docs/PRIVACY_POLICY.md` and `docs/TERMS_OF_SERVICE.md` as the live URLs. Example: `https://github.com/yashcoded/Bhatia-Buzz/blob/main/docs/PRIVACY_POLICY.md`.
- **Env:** Set `EXPO_PUBLIC_PRIVACY_POLICY_URL` and `EXPO_PUBLIC_TERMS_OF_SERVICE_URL` in `.env` (and in App Store Connect / Play Console) to these URLs.

---

## CI (GitHub Actions)

- **Pipeline** (`.github/workflows/pipeline.yml`) runs on **push to `main`**: Tests → Docker → EAS Build. All steps run from repo root.
- **Tests** (`.github/workflows/tests.yml`) runs on **pull requests** to `main` (tests only).
- Tests use `pnpm exec playwright test` from repo root. Ensure GitHub Secrets (Firebase, `EXPO_TOKEN`, etc.) are set. See [EXPO_BUILD_AND_DOCKER_CI.md](EXPO_BUILD_AND_DOCKER_CI.md).

---

## Related docs

| Topic | Document |
|--------|----------|
| Legal checklist and GitHub URLs | [LAUNCH_LEGAL_CHECKLIST.md](LAUNCH_LEGAL_CHECKLIST.md) |
| Setup and install | [SETUP.md](SETUP.md) |
| API keys and env | [API_KEYS_AND_SETUP.md](API_KEYS_AND_SETUP.md) |
| Tests | [TEST_RESULTS.md](TEST_RESULTS.md), [TEST_IMPLEMENTATION_SUMMARY.md](TEST_IMPLEMENTATION_SUMMARY.md) |
