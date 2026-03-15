# Cloudflare Deployment Guide

This guide walks you through deploying **cornwall-ponds-gemini** to Cloudflare using [Alchemy](https://alchemy.run). Alchemy provisions and deploys your D1 database, Astro frontend (Pages), and Hono API (Worker) from a single TypeScript config.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables and Secrets](#environment-variables-and-secrets)
3. [First-Time Setup](#first-time-setup)
4. [Deploy to Cloudflare](#deploy-to-cloudflare)
5. [Post-Deploy: URLs and Auth](#post-deploy-urls-and-auth)
6. [Teardown](#teardown)
7. [Troubleshooting](#troubleshooting)

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

```env
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

From the **project root**:

```bash
bun run deploy
```

This runs `turbo -F @cornwall-ponds-gemini/infra deploy`, which executes `alchemy deploy` in `packages/infra`. Alchemy will:

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

### "You must be logged in" / Wrangler auth errors

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
