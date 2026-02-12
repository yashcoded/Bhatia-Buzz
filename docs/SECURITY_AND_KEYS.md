# Security and API Keys

This document describes how we keep API keys and secrets out of the repo and out of production builds.

## Never commit secrets

- **Do not commit** `.env`, `.env.local`, `.env.development`, `.env.production`, or any file containing API keys, tokens, or passwords.
- **Do not put** Firebase, Instagram, or any API keys in `app.json`. `app.config.ts` is the only place that sets `extra.firebase` and `extra.instagram`, and it reads from `process.env` only: locally from `.env`, on GitHub Actions from workflow env (GitHub Secrets). So `app.json` stays safe to commit; secrets stay in env.
- Env files are in `.gitignore`. Use `.env.example` (no real values) to document required variables.

## Local development

- Create a local `.env` from `.env.example` and fill in values only on your machine.
- `.env` is gitignored; it will not be pushed to GitHub.

## EAS / Expo builds

- For **EAS Build** (or any CI build), **do not** rely on a committed `.env` file.
- Inject secrets at build time using **EAS Secrets** (e.g. `eas secret:create`) or your CI’s environment variables.
- `app.config.ts` reads from `process.env`; EAS can populate these during the build so keys are only present in the build environment, not in the repo.

## What never goes in the repo or build logs

- Firebase API keys, project IDs, or auth config
- Google OAuth client secrets or tokens
- Hugging Face or other API tokens
- Any `EXPO_PUBLIC_*` or other env vars that contain secrets
- User PII (emails, IDs) in logs — we only log in development (`__DEV__`) and avoid logging sensitive data

## Summary

| Item              | In repo (GitHub) | In local build | In EAS/CI build      |
|------------------|------------------|----------------|----------------------|
| `.env`           | No               | Yes (local)    | No (use EAS Secrets) |
| Keys in code     | No               | No             | No                   |
| Keys in logs     | No               | No (dev only) | No                   |

See [API_KEYS_AND_SETUP.md](API_KEYS_AND_SETUP.md) for how to obtain each key and where to set them locally.

## Before you push to GitHub

- **`.env`** is in `.gitignore` (line 41) — Git will not track or push it. Confirm with: `git check-ignore -v .env` (should print the rule).
- **`.env.example`** has only variable names and empty or example values — safe to commit.
- **Code** uses `process.env.EXPO_PUBLIC_*` or `pick(...)`; no real keys are hardcoded. Fallbacks in `config.ts` are placeholders like `'your-api-key'`.
- **Docs and i18n** use placeholder emails (e.g. `privacy@bhatiabuzz.com`) or example values only — not API keys or tokens.
- **Docker** does not copy `.env` into the image (see `.dockerignore`); env is loaded at runtime via `env_file: .env` on the host.

If you use test accounts (e.g. `testuser@example.com`), use strong unique passwords and consider them disposable; rotate if the repo was ever public or shared.
