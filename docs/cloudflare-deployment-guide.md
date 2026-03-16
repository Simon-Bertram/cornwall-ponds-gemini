# Cloudflare Deployment Guide

This guide walks you through deploying **cornwall-ponds-gemini** to Cloudflare using [Alchemy](https://alchemy.run). Alchemy provisions and deploys your D1 database, Astro frontend (Pages), and Hono API (Worker) from a single TypeScript config.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deploy Readiness](#deploy-readiness)
3. [Environment Variables and Secrets](#environment-variables-and-secrets)
4. [First-Time Setup](#first-time-setup)
5. [Deploy to Cloudflare](#deploy-to-cloudflare)
6. [Post-Deploy: URLs and Auth](#post-deploy-urls-and-auth)
7. [Teardown](#teardown)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Cloudflare account** – [Sign up](https://dash.cloudflare.com/sign-up) if you don’t have one.
- **Bun** – The project uses Bun for scripts and package management. Install from [bun.sh](https://bun.sh).
- **Wrangler CLI** – Used by Alchemy under the hood. Install globally or run via `bunx`:
  ```bash
  bunx wrangler --version
  ```
- **Repository cloned and dependencies installed**:
  ```bash
  git clone <your-repo-url>
  cd cornwall-ponds-gemini
  bun install
  ```

---

## Deploy Readiness

Before running `bun run deploy`, ensure all required environment variables are set and available to Alchemy/Wrangler. See also [Deploying to Cloudflare with Alchemy](https://www.better-t-stack.dev/docs/guides/cloudflare-alchemy) for the full pattern.

### Required variables for Cloudflare/Alchemy

| Variable | Used by | Secret? | Description |
|----------|---------|---------|-------------|
| `CLOUDFLARE_ACCOUNT_ID` | Wrangler (Alchemy) | No | Your Cloudflare account ID. Required for API token auth (CI/headless). |
| `CLOUDFLARE_API_TOKEN` | Wrangler (Alchemy) | **Yes** | API token with **D1 Edit**, **Workers Scripts Edit**, **Account Settings Read**. Use when `wrangler login` is not possible (e.g. CI, Dev Container). |
| `ALCHEMY_PASSWORD` | Alchemy | **Yes** | Used to encrypt/decrypt secrets in state. Generate with `openssl rand -base64 32`. Without it, operations involving secrets fail. |
| `PUBLIC_SERVER_URL` | Web (Astro) | No | Public URL of your API (e.g. `https://server.<subdomain>.workers.dev`). |
| `CORS_ORIGIN` | Server (Hono) | No | Allowed origin for CORS (e.g. your frontend Pages URL). |
| `BETTER_AUTH_URL` | Server (Better Auth) | No | Base URL of the auth API (same as server URL in production). |
| `BETTER_AUTH_SECRET` | Server (Better Auth) | **Yes** | Long random string for signing sessions. Generate with `openssl rand -base64 32`. |

### Deploy readiness checklist

- [ ] **Cloudflare auth:** Either `bunx wrangler login` completed (interactive) **or** `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` set in `packages/infra/.env` (or exported in shell).
- [ ] **Alchemy secrets:** `ALCHEMY_PASSWORD` set in `packages/infra/.env` (required for `alchemy.secret.env` bindings).
- [ ] **App env:** `PUBLIC_SERVER_URL`, `CORS_ORIGIN`, `BETTER_AUTH_URL` set (use placeholder URLs for first deploy; update after deploy with printed URLs).
- [ ] **Auth secret:** `BETTER_AUTH_SECRET` set in one of the loaded `.env` files.
- [ ] **Env loading:** `packages/infra/alchemy.run.ts` loads `.env` via paths relative to the script directory (so `packages/infra/.env` is loaded regardless of cwd).

---

## Environment Variables and Secrets

Alchemy reads environment variables from `.env` files and passes them to your Worker and Astro app. The infra loads (in order):

- `packages/infra/.env`
- `apps/web/.env`
- `apps/server/.env`

### Required variables

| Variable | Used by | Description |
|----------|---------|-------------|
| `PUBLIC_SERVER_URL` | Web (Astro) | Public URL of your API (e.g. `https://server.<your-subdomain>.workers.dev` or your custom domain). |
| `CORS_ORIGIN` | Server (Hono) | Allowed origin for CORS (e.g. `https://<your-pages-url>` or your custom frontend domain). |
| `BETTER_AUTH_URL` | Server (Better Auth) | Base URL of the auth API (same as your server URL in production). |
| `BETTER_AUTH_SECRET` | Server (Better Auth) | **Secret.** A long, random string for signing sessions. Generate with `openssl rand -base64 32`. |

### Where to set them

- **Non-secret vars** (`PUBLIC_SERVER_URL`, `CORS_ORIGIN`, `BETTER_AUTH_URL`):  
  Set in `packages/infra/.env` or in the same files you use for local dev (`apps/server/.env`, `apps/web/.env`). Use **production** URLs when deploying.

- **Secret** (`BETTER_AUTH_SECRET`):  
  Set in one of the `.env` files above for `alchemy deploy` to pick up. Alchemy uses `alchemy.secret.env` in `alchemy.run.ts`, so this value is passed to the Worker as a secret (e.g. encrypted at rest by Cloudflare). Do not commit real secrets to git; use `.env` only in local or CI secrets, and keep `.env` in `.gitignore`.

### Example `packages/infra/.env` (production)

See also `packages/infra/.env.example` for a template. All variables in the [Deploy Readiness](#deploy-readiness) table must be present (or use `wrangler login` instead of API token).

```env
# Cloudflare API (required for deploy when not using wrangler login)
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token

# Alchemy (required for secret encryption; generate: openssl rand -base64 32)
ALCHEMY_PASSWORD=your-alchemy-password

# Replace with your actual Cloudflare URLs after first deploy (see Post-Deploy)
PUBLIC_SERVER_URL=https://server.<your-subdomain>.workers.dev
CORS_ORIGIN=https://web.<your-subdomain>.pages.dev
BETTER_AUTH_URL=https://server.<your-subdomain>.workers.dev
BETTER_AUTH_SECRET=your-generated-secret-from-openssl-rand-base64-32
```

You can also keep dev-only values in `apps/server/.env` and `apps/web/.env` and override with production values in `packages/infra/.env` when deploying.

---

## First-Time Setup

### 1. Log in to Cloudflare

From the project root:

```bash
bunx wrangler login
```

This opens a browser to authenticate with your Cloudflare account. Complete the flow so Wrangler (and thus Alchemy) can deploy to your account.

### 2. Set production environment variables

Create or edit `packages/infra/.env` (and optionally `apps/server/.env` / `apps/web/.env`) with the variables listed above. For the **first** deploy you can use placeholder URLs; after the first deploy, Alchemy will print the live URLs (e.g. `Web -> https://...`, `Server -> https://...`). Then update your `.env` with those URLs and redeploy so the frontend and auth use the correct origins.

### 3. Generate and set `BETTER_AUTH_SECRET`

```bash
openssl rand -base64 32
```

Put the output into `BETTER_AUTH_SECRET` in your `.env`. Do not commit this value.

---

## Deploy to Cloudflare

### Running in a dev container (or CI)

In a dev container or other headless environment you **cannot** use `bunx wrangler login` (no browser). You must use an **API token** and set `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` in `packages/infra/.env`. The deploy script uses `run-deploy.mjs` to load that `.env` before starting Alchemy so those variables are available. The 401 errors you saw were from Cloudflare credentials not being loaded (path/cwd issues), not from the dev container itself; the wrapper fixes that. If you still get 401, create a new API token with **D1 Edit** and **Workers Scripts Edit** and update `packages/infra/.env`.

### Drizzle: what to run before deploy

This project uses **Drizzle** with migrations in `packages/db/src/migrations`. Alchemy applies those migrations to D1 **during** `bun run deploy`; you do not run migrations yourself against production.

- **Before deploy:** If you changed the schema in `packages/db`, generate a new migration and commit it:
  ```bash
  bun run db:generate
  git add packages/db/src/migrations
  git commit -m "chore: add Drizzle migration"
  ```
- **Deploy:** Alchemy will apply all migrations in `packages/db/src/migrations` to the D1 database when you run `bun run deploy`.
- **`db:push`** is for syncing schema to a **local** database (e.g. dev); it is not used for production D1.

---

From the **project root**:

```bash
bun run deploy
```

This runs `turbo -F @cornwall-ponds-gemini/infra deploy`, which executes the deploy script in `packages/infra`. Alchemy will:

1. Apply D1 migrations from `packages/db/src/migrations`.
2. Build and deploy the Astro app (Cloudflare Pages).
3. Build and deploy the Hono server (Cloudflare Worker) with D1 and env bindings.

After a successful deploy, the terminal will show something like:

```
Web    -> https://web.<project>.pages.dev
Server -> https://server.<project>.workers.dev
```

Update your `.env` with these URLs (and set `PUBLIC_SERVER_URL`, `CORS_ORIGIN`, and `BETTER_AUTH_URL` to match), then run `bun run deploy` again so the app and auth use the correct endpoints.

### Deploying from `packages/infra`

If you prefer to run Alchemy from the infra package:

```bash
cd packages/infra
bun run deploy
```

---

## Post-Deploy: URLs and Auth

### Custom domains

To use your own domains instead of `*.pages.dev` and `*.workers.dev`:

1. In the [Cloudflare dashboard](https://dash.cloudflare.com), open **Workers & Pages**.
2. Select your Worker and your Pages project.
3. Add custom domains in each resource’s **Settings** (or **Domains**) section.

Then set in your `.env`:

- `PUBLIC_SERVER_URL` = your API domain (e.g. `https://api.example.com`).
- `CORS_ORIGIN` = your frontend domain (e.g. `https://www.example.com`).
- `BETTER_AUTH_URL` = same as `PUBLIC_SERVER_URL`.

Redeploy after changing these.

### Auth cookies on `*.workers.dev` / `*.pages.dev`

If you use the default `*.workers.dev` and `*.pages.dev` hostnames, the frontend and API are on different subdomains. For auth cookies to work across them, you can enable cross-subdomain cookies in Better Auth.

In `packages/auth/src/index.ts`, uncomment and adjust the `crossSubDomainCookies` block (and optionally `cookieCache`):

```ts
// session: {
//   cookieCache: { enabled: true, maxAge: 60 },
// },
advanced: {
  defaultCookieAttributes: { sameSite: "none", secure: true, httpOnly: true },
  crossSubDomainCookies: {
    enabled: true,
    domain: ".workers.dev",  // or your shared parent domain, e.g. ".example.com"
  },
},
```

Replace the `domain` with your actual shared parent domain (e.g. `.workers.dev` for default Workers, or `.example.com` if both app and API use `*.example.com`). Then redeploy.

---

## Teardown

To remove all resources created by Alchemy for this project (D1 database, Pages project, Worker):

```bash
bun run destroy
```

Or from the infra package:

```bash
cd packages/infra
bun run destroy
```

This runs `alchemy destroy`. Use it when you want to delete the stack from your Cloudflare account.

---

## Troubleshooting

### "Running Alchemy in a CI environment with the default local state store"

You see this when `CI` is set (e.g. in GitHub Actions or Cursor) and no persistent state store is configured. For **local dev** in a CI-like environment, the infra dev script already sets `ALCHEMY_CI_STATE_STORE_CHECK=false`. For **production deploys** from CI, configure a [persistent state store](https://alchemy.run/concepts/state/) (e.g. CloudflareStateStore or S3StateStore) or set `ALCHEMY_CI_STATE_STORE_CHECK=false` only if you understand the implications.

### 401 Unauthorized / "Authentication error" when creating D1 (or other resources)

Alchemy uses Wrangler under the hood. A **401** means Cloudflare is rejecting the request because credentials are missing, expired, or invalid.

**If you are on a machine with a browser (local dev):**

1. Log in (or log in again — tokens can expire):
   ```bash
   bunx wrangler login
   ```
2. Complete the browser flow to authorize Wrangler with your Cloudflare account.
3. Run deploy again:
   ```bash
   bun run deploy
   ```

**If you are in CI or a headless environment (e.g. GitHub Actions, Cursor/Dev Container):**

- `wrangler login` is interactive and not suitable. Use an **API token** instead:
  1. In [Cloudflare Dashboard](https://dash.cloudflare.com) go to **My Profile** → **API Tokens** → **Create Token**.
  2. Use a template such as **“Edit Cloudflare Workers”** or create a custom token with at least: **Account** → D1 Edit, Workers Scripts Edit, Workers KV Storage Edit, Account Settings Read; **Zone** if you use custom domains (e.g. DNS Edit).
  3. Set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in one of the places below, then run `bun run deploy`.

**Where to set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`:**

| Where | Use case |
|-------|----------|
| **`packages/infra/.env`** | Local or VM deploy. The infra app loads this file on deploy, and Wrangler reads these vars from the environment. Add two lines: `CLOUDFLARE_API_TOKEN=your_token` and `CLOUDFLARE_ACCOUNT_ID=your_account_id`. Do not commit this file (it is in `.gitignore`). |
| **Shell (current session)** | One-off deploy: `export CLOUDFLARE_API_TOKEN=...` and `export CLOUDFLARE_ACCOUNT_ID=...` in the same terminal before `bun run deploy`. |
| **CI secrets** | GitHub Actions: repo **Settings** → **Secrets and variables** → **Actions** → **New repository secret** for each. Other CI: use that system’s secret/env config so both vars are set before the step that runs `bun run deploy`. |

**If you already ran `wrangler login` and still get 401:**

- Your OAuth token may have expired. Run `bunx wrangler login` again and retry deploy.
- If you use an API token, ensure `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set and the token has not been revoked or restricted.

**If deploy shows "injecting env (0) from .env" for infra:**

- The deploy script uses `packages/infra/run-deploy.mjs`, which loads `packages/infra/.env` (and the other `.env` files) into the process **before** starting Alchemy, so `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` are always available when running `bun run deploy` from the repo root. If you still see (0) and get 401, ensure `packages/infra/.env` exists and contains those variables, then try exporting them in the shell before deploy: `export CLOUDFLARE_ACCOUNT_ID=...` and `export CLOUDFLARE_API_TOKEN=...`, then `bun run deploy`.

### "You must be logged in" / other Wrangler auth errors

Run:

```bash
bunx wrangler login
```

and complete the browser flow, then run `bun run deploy` again.

### Missing or wrong env vars after deploy

- Ensure `packages/infra/.env` (and any other `.env` files Alchemy loads) contain the correct **production** values for `PUBLIC_SERVER_URL`, `CORS_ORIGIN`, `BETTER_AUTH_URL`, and `BETTER_AUTH_SECRET`.
- After changing `.env`, run `bun run deploy` again so the new values are applied to the Worker and build.

### Auth or CORS errors in production

- Confirm `BETTER_AUTH_URL` and `PUBLIC_SERVER_URL` match your real API URL (no trailing slash).
- Confirm `CORS_ORIGIN` matches your frontend URL (scheme + host + port if non-default).
- If using separate subdomains, enable and configure `crossSubDomainCookies` in `packages/auth` as in [Post-Deploy: URLs and Auth](#auth-cookies-on-workersdev--pagesdev).

### D1 / migrations

Migrations are applied automatically during `alchemy deploy` from `packages/db/src/migrations`. If you change schema or add migrations, run `bun run db:generate` (and commit migrations) as needed, then deploy again.

---

## Related Docs

- [Alchemy Infrastructure Guide](./alchemy-guide.md) – Architecture and Alchemy commands.
- [Alchemy](https://alchemy.run) – Official Alchemy docs and concepts.
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) and [Pages](https://developers.cloudflare.com/pages/) – Platform docs.
