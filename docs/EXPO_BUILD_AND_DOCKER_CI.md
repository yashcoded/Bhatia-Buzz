# Expo Build & Docker on GitHub

## Pipeline (sequential on push to main)

One workflow runs in order on every **push to `main`** (including when a PR is merged):

1. **Tests** — E2E tests must pass.
2. **Docker** — Builds the image and runs a smoke test (only if tests passed).
3. **Expo Build** — Submits EAS Build for **iOS (IPA)** and **Android (AAB)** (only if Docker passed).

Workflow file: `.github/workflows/pipeline.yml`. If any step fails, the following steps are skipped.

**Pull requests** run only the **Tests** workflow (no Docker or Expo Build) for fast feedback.

### One-time setup (required before CI can run EAS Build)

1. **Link the app to EAS** (once per project, on your machine). This creates the project on Expo and writes `projectId` into your config so CI can run in non-interactive mode:
   ```bash
   npx eas-cli login
   npx eas init
   ```
   When prompted, create a new project or link an existing one. `eas init` will add `expo.extra.eas.projectId` to your `app.json` (or update `app.config`). **Commit and push that change** so the Pipeline workflow can run `eas build` without “EAS project not configured”.

2. **Create an Expo access token** for CI:
   - Go to [expo.dev](https://expo.dev) → Account → Access tokens
   - Create a token with “Read and write” (or at least build permissions)

3. **Add GitHub Secrets:**
   - **`EXPO_TOKEN`** (required): the Expo access token from step 2
   - The same Firebase (and other) secrets used by the Tests workflow, so EAS Build can inject them into the app

4. **iOS:** Ensure your Expo account has Apple credentials configured (EAS can manage them, or use your own).  
   **Android:** EAS can generate a keystore, or use your own in the project.

5. **iOS credentials for CI (fix “Credentials are not set up”)**  
   The pipeline runs `eas build --non-interactive`. iOS builds will fail with *“Credentials are not set up. Run this command again in interactive mode”* until credentials exist on EAS. **On your machine** (with `EXPO_TOKEN` or after `eas login`), run once:
   ```bash
   eas credentials:configure-build --platform ios --profile production
   ```
   Follow the prompts to let EAS create (or upload) a **Distribution Certificate** and **Provisioning Profile**. After that, CI can use those stored credentials and `--non-interactive` will succeed. See [Expo: iOS credentials](https://docs.expo.dev/app-signing/managed-credentials/#ios).

### Apple (App Store) and Google Play setup (before store submission)

You’ll need to set these up before you can submit the built IPA/AAB to the stores:

**Apple (for IPA / App Store)**  
- **Apple Developer account:** [developer.apple.com](https://developer.apple.com) (paid).  
- **App name / App ID (display):** Use **Bhatia Buzz** or **BhatiaBuzz** (alphanumeric and spaces only)—do *not* put `com.bhatiabuzz.app` in the app name field.  
- **Bundle ID:** Use **com.bhatiabuzz.app** only in [Apple Developer → Identifiers](https://developer.apple.com/account/resources/identifiers/list) for the bundle identifier (signing and submission).  
- **EAS and Apple:** Run `eas credentials` or let EAS Build create/manage the distribution certificate and provisioning profile when you build; you can also upload your own. See [Expo: iOS credentials](https://docs.expo.dev/app-signing/managed-credentials/#ios).

**Google Play (for AAB)**  
- **Google Play Developer account:** [play.google.com/console](https://play.google.com/console) (one-time fee).  
- **App name (display):** Use **Bhatia Buzz** or **BhatiaBuzz** (alphanumeric and spaces only)—do *not* use `com.bhatiabuzz.app` for the app name.  
- **Application ID / package name:** Use **com.bhatiabuzz.app** when creating the app in the Play Console (must match `app.config.ts`).  
- **Signing:** EAS can generate and store a keystore for you, or you can use your own. See [Expo: Android credentials](https://docs.expo.dev/app-signing/managed-credentials/#android).

Until the bundle ID and Play app exist, EAS Build can still produce the IPA and AAB; you’ll need the Apple/Play setup when you’re ready to submit to the stores.

**Privacy policy URL:** App Store and Google Play require a **privacy policy URL** when you submit the app. A full policy document is in [docs/PRIVACY_POLICY.md](PRIVACY_POLICY.md). You can use the GitHub URL (e.g. `https://github.com/your-org/Bhatia-Buzz/blob/main/docs/PRIVACY_POLICY.md` — ensure the repo is public for store review) or host the same content on your own website. Set `EXPO_PUBLIC_PRIVACY_POLICY_URL` in your `.env` (and in GitHub Secrets if you use CI). The same URL is used for the in-app “View privacy policy online” link. See `.env.example` for `EXPO_PUBLIC_TERMS_OF_SERVICE_URL` if you also host terms online.

### Build profiles (`eas.json`)

- **production:** Used by CI. Android → AAB, iOS → IPA, with `autoIncrement` for version bumps.
- **preview:** Internal distribution (e.g. APK for testing).
- **development:** Development client builds.

### Getting the built IPA and AAB

After a push to `main`, open the **Pipeline** workflow run in the Actions tab. The Expo Build job only **submits** the builds (`--no-wait`). To get the files:

1. Go to [expo.dev](https://expo.dev) → your account → project **Bhatia-Buzz** (or the linked app name)
2. Open **Builds**
3. Download the latest **iOS (IPA)** and **Android (AAB)** builds

To have the workflow **wait** for builds and e.g. upload artifacts, you can change the job to run `eas build --platform all --profile production --non-interactive` (remove `--no-wait`) and add steps to download from EAS and upload to GitHub Artifacts.
