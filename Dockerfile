# Bhatia Buzz – dev environment (Node + pnpm + Expo)
# Env vars are injected at runtime via docker-compose env_file; do not bake .env into the image.
FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm --version

WORKDIR /app

# Copy package files for install
COPY package.json pnpm-lock.yaml .npmrc* ./

# Install dependencies (no dev deps pruning so Expo tooling works)
RUN pnpm install --frozen-lockfile

# Copy app (excluding paths in .dockerignore)
COPY . .

# Metro / Expo ports
EXPOSE 8081 19000 19001

# Default: start Expo dev server (env from env_file in compose)
CMD ["pnpm", "start"]
