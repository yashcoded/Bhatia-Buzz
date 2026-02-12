# Docker and env: run locally without sharing secrets

This project can run in a **Docker** dev environment so every machine uses the same Node/pnpm/Expo setup. **Environment variables (e.g. API keys) stay on each machine** — you use a local `.env` file that is **never** committed or shared.

## Principles

- **Same setup everywhere:** Docker image and `docker-compose` are in the repo; everyone runs the same stack.
- **Env stays local:** Each system has its own `.env` file (copied from `.env.example` and filled with that machine’s keys). `.env` is in `.gitignore` and is **not** in the Docker image.
- **No secrets in the image:** The Dockerfile does not copy `.env`. Compose injects env at runtime with `env_file: .env`, which points to the file on the **host** (your machine).

## One-time setup (per machine)

1. **Clone the repo** (if you haven’t already):
   ```bash
   git clone <repo-url>
   cd Bhatia-Buzz
   ```

2. **Create your local env file** (do this on every machine where you run the app):
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and set **your** values (Firebase, optional: Google, Instagram, Hugging Face, etc.).  
   **Do not commit `.env` or send it to others.**

3. **Ensure Docker is installed:**
   - [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Mac/Windows) or Docker Engine (Linux).

## Run with Docker (local)

From the project root (where `docker-compose.yml` and `.env` live):

```bash
# Build and start the Expo dev server (reads .env from this folder)
docker-compose up --build
```

- First run will build the image and install dependencies; later runs are faster.
- The app runs inside the container; env vars come from the **host’s** `.env` via `env_file: .env`.
- To stop: `Ctrl+C`, then optionally:
  ```bash
  docker-compose down
  ```

## QR code and connecting to the dev server

**Will I see the QR code when using Docker?**  
Yes. When you run `docker-compose up`, Expo’s output (including the QR code) is printed in your terminal, same as when you run `pnpm start` locally.

**Will scanning the QR code work from my phone?**  
It depends. The QR may point at the **container’s** IP (e.g. `exp://172.18.0.x:8081`), which your phone cannot reach. So the QR appears, but the connection from your phone might fail.

- **Reliable for phone (recommended with Docker):** Use **tunnel mode** so the QR uses a public URL that works from anywhere:
  ```bash
  docker-compose run --rm app pnpm start -- --tunnel
  ```
  Scan the QR shown; Expo Go will connect via the tunnel.

- **Same machine (Expo Go / simulator):** Use `localhost` or the URL printed by Expo (e.g. `exp://localhost:8081`).
- **Phone on same Wi‑Fi (no Docker):** When running on the host, the LAN URL (e.g. `exp://192.168.1.10:8081`) often works. With Docker, prefer tunnel mode for phone.

## Run on another system (same repo, different env)

On a **different** computer or CI:

1. Clone the same repo.
2. Create **that machine’s** `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in the keys/values you want to use **on that system** (they can differ from other machines).
3. Run:
   ```bash
   docker-compose up --build
   ```

No need to share `.env` between systems; each has its own.

## Run without Docker (local only)

If you prefer to run on the host without Docker:

1. **Node 18+** and **pnpm** installed.
2. Copy and fill env:
   ```bash
   cp .env.example .env
   ```
3. Install and start:
   ```bash
   pnpm install
   pnpm start
   ```

The app still reads from `.env` via `dotenv` in `app.config.ts`; the same `.env.example` applies.

## Env file reference

See **`.env.example`** in the repo root for the list of variables. Summary:

| Variable | Required | Purpose |
|----------|----------|--------|
| `EXPO_PUBLIC_FIREBASE_*` | Yes | Firebase (auth, Firestore, storage) |
| `EXPO_PUBLIC_HUGGING_FACE_TOKEN` | For matrimonial face check | Hugging Face API |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Optional | Google Sign-In |
| `EXPO_PUBLIC_INSTAGRAM_ACCESS_TOKEN` | Optional | Instagram feed |
| `EXPO_PUBLIC_*_EMAIL` | Optional | Contact emails (privacy, legal, support) |
| `EXPO_PUBLIC_DOCS_BASE_URL` | Optional | “View docs online” link |

## Security reminders

- **Never commit `.env`** — it’s in `.gitignore` for a reason.
- **Don’t put real keys in `.env.example`** — only variable names and optional placeholders.
- **Each system** (your laptop, teammate’s laptop, CI, etc.) should have its own `.env` with the right keys for that environment.

## Troubleshooting

- **“Cannot find module” or broken deps in container:** Rebuild and ensure lockfile is in the image:
  ```bash
  docker-compose build --no-cache
  docker-compose up
  ```
- **Env vars not picked up:** Ensure `.env` exists in the **same directory** as `docker-compose.yml` and that you didn’t rename it. Compose reads `env_file: .env` from the project root.
- **Port already in use:** Change the port mapping in `docker-compose.yml` (e.g. `"8082:8081"`) or stop whatever is using 8081/19000/19001.
