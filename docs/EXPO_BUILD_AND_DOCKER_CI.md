# Expo Build & Docker on GitHub

## Docker workflow

- **Trigger:** Push or PR to `main`
- **Job:** Builds the Docker image and runs a short smoke test (container starts, curl localhost:8081)
- **No secrets required** for Docker (uses dummy env in smoke test)

## Expo Build workflow (IPA + AAB)

- **Trigger:** Push to `main` (including when a PR is merged to `main`)
- **Job:** Submits **EAS Build** for both **iOS (IPA)** and **Android (AAB)** using the `production` profile in `eas.json`
- Builds run on Expo’s servers. When they finish, download the **IPA** and **AAB** from [expo.dev](https://expo.dev) → your project → Builds

### One-time setup

1. **Link the app to EAS** (once per project, on your machine):
   ```bash
   npx eas-cli login
   npx eas build:configure
   ```
   Commit the generated `eas.json` if you changed it.

2. **Create an Expo access token** for CI:
   - Go to [expo.dev](https://expo.dev) → Account → Access tokens
   - Create a token with “Read and write” (or at least build permissions)

3. **Add GitHub Secrets:**
   - **`EXPO_TOKEN`** (required): the Expo access token from step 2
   - The same Firebase (and other) secrets used by the Tests workflow, so EAS Build can inject them into the app

4. **iOS:** Ensure your Expo account has Apple credentials configured (EAS can manage them, or use your own).  
   **Android:** EAS can generate a keystore, or use your own in the project.

### Build profiles (`eas.json`)

- **production:** Used by CI. Android → AAB, iOS → IPA, with `autoIncrement` for version bumps.
- **preview:** Internal distribution (e.g. APK for testing).
- **development:** Development client builds.

### Getting the built IPA and AAB

After a push to `main`, open the “Expo Build” workflow run in the Actions tab. The job only **submits** the builds (`--no-wait`). To get the files:

1. Go to [expo.dev](https://expo.dev) → your account → project **Bhatia-Buzz** (or the linked app name)
2. Open **Builds**
3. Download the latest **iOS (IPA)** and **Android (AAB)** builds

To have the workflow **wait** for builds and e.g. upload artifacts, you can change the job to run `eas build --platform all --profile production --non-interactive` (remove `--no-wait`) and add steps to download from EAS and upload to GitHub Artifacts.
