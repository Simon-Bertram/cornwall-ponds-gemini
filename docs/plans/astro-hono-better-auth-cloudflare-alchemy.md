## Deploying an Astro + Hono + Better Auth App to Cloudflare Workers with Alchemy

This guide shows how to deploy a Better-T-Stack–style project (Astro web, Hono API, Better Auth, Alchemy IaC) to Cloudflare Workers, assuming you develop in a dev container and authenticate using a **Cloudflare API token**.

Links for deeper reference:
- Alchemy Worker guide: [`alchemy.run/guides/cloudflare-worker`](https://alchemy.run/guides/cloudflare-worker)
- Cloudflare Workers docs: [`developers.cloudflare.com/workers`](https://developers.cloudflare.com/workers/)
- Astro on Workers: [`developers.cloudflare.com/workers/framework-guides/web-apps/astro/`](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
- Better-T-Stack + Cloudflare + Alchemy: [`better-t-stack.dev/docs/guides/cloudflare-alchemy`](https://www.better-t-stack.dev/docs/guides/cloudflare-alchemy)

---

## 1. Architecture Overview

- **Astro web app** (`apps/web`):
	- Renders UI, deployed as a Cloudflare Worker using Astro’s Cloudflare adapter (`@astrojs/cloudflare`) or static assets served via Workers Assets.
- **Hono server** (`apps/server`):
	- HTTP API and Better Auth routes, deployed as a Worker.
- **Better Auth** (`packages/auth`):
	- Handles auth flows (email/password, OAuth, etc.) running inside the Hono Worker.
- **Alchemy infra** (`packages/infra/alchemy.run.ts`):
	- TypeScript IaC that:
		- Creates and configures Cloudflare Workers (web + server).
		- Creates a D1 database (if used).
		- Wires all **bindings** (DB, env vars, secrets).
- **Env package** (`packages/env`):
	- Provides type-safe env access for:
		- **Server**: `export { env } from 'cloudflare:workers'`
		- **Web**: `createEnv` from `@t3-oss/env-core` for `VITE_*` vars.

---

## 2. Prerequisites

### 2.1 Accounts & Tools

- **Cloudflare account** with:
	- A **Workers** enabled account.
	- A **Cloudflare API token** with:
		- `Account.Workers Scripts` (Edit)
		- `Account.Workers KV Storage` (Edit) if using KV
		- `Account.D1` (Edit) if using D1
- **Dev container** running:
	- `node >= 18` (or Bun if your repo uses it)
	- `pnpm`/`npm`/`bun` (match your repo)
	- `wrangler` (installed via devDependencies or globally)
- **Better-T-Stack project** scaffolded with Cloudflare/Alchemy:
	- `packages/infra/alchemy.run.ts` exists
	- Root `package.json` has:
		- `"deploy": "turbo -F @my-app/infra deploy"`
		- `"destroy": "turbo -F @my-app/infra destroy"`

### 2.2 Environment Variables Checklist

Inside the dev container, set these (with `.env` files and/or container env):

- **Infra / Alchemy** (`packages/infra/.env` in dev container):
	- `ALCHEMY_PASSWORD` – strong random value (for encrypting secrets)
	- `ALCHEMY_STAGE` or `STAGE` – e.g. `dev`, `staging`, `prod`
- **Server / Better Auth** (`apps/server/.env`):
	- `BETTER_AUTH_SECRET` – strong base64 secret (`openssl rand -base64 32`)
	- `BETTER_AUTH_URL` – final server Worker URL per stage (update after first deploy)
	- `DATABASE_URL` – if using external DB (or D1 URL if desired)
	- `CORS_ORIGIN` – web Worker origin for that stage
- **Web** (`apps/web/.env`):
	- `VITE_SERVER_URL` – server Worker URL for that stage
- **Cloudflare API token** (for dev container & CI):
	- `CLOUDFLARE_API_TOKEN` – the token you created
	- Optionally:
		- `CLOUDFLARE_ACCOUNT_ID`
		- `CLOUDFLARE_EMAIL` (only for legacy key-based flows; token is preferred)

Wrangler will pick up `CLOUDFLARE_API_TOKEN` inside your dev container to authenticate all Cloudflare operations (including anything Alchemy does under the hood).

---

## 3. Project Structure & Env Loading

A typical layout:

```text
apps/
	web/          # Astro app
	server/       # Hono + Better Auth
packages/
	infra/        # alchemy.run.ts
	env/          # shared env types
	auth/         # Better Auth config (auth.ts)
.alchemy/       # Alchemy state (per stage)
```

In `packages/infra/alchemy.run.ts`, environment loading usually looks like:

```ts
import { config } from 'dotenv'

config({ path: './.env' })                   // packages/infra/.env
config({ path: '../../apps/web/.env' })      // apps/web/.env
config({ path: '../../apps/server/.env' })   // apps/server/.env
```

Order matters: later files can override earlier values. Ensure your dev container mounts these files and they are visible at these paths.

---

## 4. Configuring Better Auth for Cloudflare Workers

### 4.1 Core env vars

Better Auth needs at minimum:

- `BETTER_AUTH_SECRET` – encryption secret (32+ chars)
- `BETTER_AUTH_URL` – fully qualified URL of your **server Worker**:
	- Dev: `https://my-app-server-dev.your-subdomain.workers.dev`
	- Prod: `https://my-app-server.your-subdomain.workers.dev` or custom domain

You can either:

- Read these directly from `env` (Cloudflare Worker bindings), or
- Let Better Auth read them from `process.env` in dev + from bindings in prod via `packages/env/server`.

### 4.2 Hono + Better Auth on Workers

In your server app (simplified):

```ts
import { Hono } from 'hono'
import { env } from 'cloudflare:workers'
import { auth } from '@my-app/auth' // Better Auth instance

const app = new Hono<{ Bindings: Env }>()  // Env is from packages/env/env.d.ts

app.route('/api/auth', auth.handler) // or however Better Auth routes are wired

app.get('/ok', c => c.json({ status: 'ok' }))

export default {
	async fetch(request: Request, cfEnv: typeof env) {
		// cfEnv is type-safe if you use alchemy.run.ts types
		return app.fetch(request, cfEnv)
	},
}
```

Key Cloudflare-specific Better Auth options (in `auth.ts`):

- **Secure cookies & cross-subdomain cookies** (for web+server on same `workers.dev`):

```ts
export const auth = betterAuth({
	// ...
	advanced: {
		useSecureCookies: true,
		crossSubDomainCookies: {
			enabled: true,
			domain: '.your-subdomain.workers.dev',
		},
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
})
```

Match `domain` to your Workers subdomain or custom domain.

---

## 5. Alchemy Infrastructure Definition

### 5.1 Simplified `alchemy.run.ts`

Based on the Better-T-Stack guide:

```ts
// packages/infra/alchemy.run.ts
import alchemy from 'alchemy'
import { Worker, D1Database } from 'alchemy/cloudflare'
import { config } from 'dotenv'

// Load env from infra, web, server
config({ path: './.env' })
config({ path: '../../apps/web/.env' })
config({ path: '../../apps/server/.env' })

const app = await alchemy('my-app')

// Optional D1 database
const db = await D1Database('database', {
	migrationsDir: '../../packages/db/src/migrations',
})

// Web: Astro on Cloudflare Worker / Assets
export const web = await Worker('web', {
	cwd: '../../apps/web',
	entrypoint: 'dist/_worker.js/index.js', // or as generated by Astro adapter
	assets: './dist',                        // static assets
	bindings: {
		VITE_SERVER_URL: alchemy.env.VITE_SERVER_URL!,
	},
})

// Server: Hono + Better Auth
export const server = await Worker('server', {
	cwd: '../../apps/server',
	entrypoint: 'src/index.ts',
	compatibility: 'node',
	bindings: {
		DB: db,
		CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
		BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
		BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
		DATABASE_URL: alchemy.secret.env.DATABASE_URL!,
		STAGE: alchemy.env.STAGE!,
	},
	dev: {
		port: 3000,
	},
})

console.log(`Web    -> ${web.url}`)
console.log(`Server -> ${server.url}`)

await app.finalize()
```

Notes:

- Use `alchemy.env` for **non-sensitive** values and `alchemy.secret.env` for **secrets**.
- The Worker bindings (`DB`, `CORS_ORIGIN`, etc.) become part of `server.Env`, which you can re-export via `packages/env`.

### 5.2 Astro configuration for Workers

In `apps/web/astro.config.mjs`, use the Cloudflare adapter (for SSR) or static build:

```js
import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
	adapter: cloudflare({
		// e.g. sessionKVBindingName: 'SESSION'
	}),
	output: 'server', // on-demand rendering on Worker
})
```

Then Astro will emit `dist/_worker.js/index.js`, which matches the `entrypoint` used by Alchemy.

---

## 6. Type-Safe Bindings via `packages/env`

Following the Better-T-Stack env pattern:

### 6.1 `env.d.ts`

```ts
// packages/env/env.d.ts
import type { server } from '@my-app/infra/alchemy.run'

export type CloudflareEnv = typeof server.Env

declare global {
	type Env = CloudflareEnv
}

declare module 'cloudflare:workers' {
	namespace Cloudflare {
		interface Env extends CloudflareEnv {}
	}
}
```

### 6.2 Server env (Workers)

```ts
// packages/env/src/server.ts
/// <reference path="../env.d.ts" />
export { env } from 'cloudflare:workers'
```

In Hono code, you can then do:

```ts
import { env } from '@my-app/env/server'

const corsOrigin = env.CORS_ORIGIN
```

### 6.3 Web env (client)

```ts
// packages/env/src/web.ts
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	clientPrefix: 'VITE_',
	client: {
		VITE_SERVER_URL: z.string().url(),
	},
	runtimeEnv: import.meta.env,
	emptyStringAsUndefined: true,
})
```

---

## 7. Local Development in a Dev Container

Inside the dev container:

```bash
# Install deps if needed
pnpm install   # or npm/bun

# Start local dev
bun run dev    # or `pnpm dev` depending on your repo
```

Alchemy dev mode:

- Uses **Miniflare** to emulate Workers and D1 locally.
- Creates local SQLite DBs in `.alchemy/miniflare/v3/`.
- Hot-reloads on code changes.

Better Auth:

- Run migrations in the dev container (against local DB):

```bash
cd apps/server
bunx @better-auth/cli@latest migrate
```

Ensure your local DB connection (`DATABASE_URL` or D1) is reachable inside the container.

---

## 8. Deploying to Cloudflare (with API Token)

### 8.1 Set Cloudflare env in dev container

In dev container env (or a `.env` consumed by `wrangler`):

```bash
export CLOUDFLARE_API_TOKEN=your-token
export CLOUDFLARE_ACCOUNT_ID=your-account-id   # recommended
```

With this, any `wrangler` command (direct or invoked by Alchemy) authenticates via the token.

### 8.2 Build & deploy

From the repo root in the dev container:

```bash
# Default stage, typically "dev" or your username
bun run deploy

# Specific stage
bun run deploy --stage prod
```

On first deploy, Alchemy will:

1. Create the **web** and **server** Workers.
2. Create and migrate the **D1 database** (if configured).
3. Upload code and assets.
4. Print URLs for web/server to the dev container logs.

Update `.env` values using the printed URLs:

```bash
# apps/web/.env
VITE_SERVER_URL=https://my-app-server.your-subdomain.workers.dev

# apps/server/.env
CORS_ORIGIN=https://my-app-web.your-subdomain.workers.dev
BETTER_AUTH_URL=https://my-app-server.your-subdomain.workers.dev
```

Re-run `bun run deploy` so Alchemy updates bindings with the correct URLs.

---

## 9. Multi-Stage Environments

Alchemy stages let you isolate dev/staging/prod:

- Stage resolution order:
	1. `--stage` CLI flag
	2. `ALCHEMY_STAGE`
	3. `STAGE`
	4. `$USER`
	5. `"dev"`

Example stage-aware config:

```ts
const stage = process.env.STAGE || 'dev'
const app = await alchemy('my-app', { stage })
const isProd = app.stage === 'prod'

export const server = await Worker('server', {
	name: `${app.name}-${app.stage}-server`,
	url: !isProd,                        // workers.dev URL for non-prod
	domains: isProd ? ['api.myapp.com'] : undefined,
	bindings: {
		CORS_ORIGIN: isProd
			? 'https://myapp.com'
			: `https://${app.stage}.myapp.com`,
	},
})
```

Alchemy stores state per stage under `.alchemy/<stage>/…`, so each stage has isolated Workers, D1 DBs, and bindings.

---

## 10. Troubleshooting

- **Env var is undefined**
	- Confirm it’s set in the correct `.env` file (infra/web/server).
	- Confirm `dotenv.config` paths in `alchemy.run.ts` match actual locations inside the dev container.
	- For secrets, use `alchemy.secret.env.*` and ensure `ALCHEMY_PASSWORD` is set.
- **Secret decryption / password errors**
	- Ensure `ALCHEMY_PASSWORD` is present and identical across all deploy runs (including CI).
- **D1 migration failures**
	- Verify `migrationsDir` path.
	- Test migrations locally (`bun run db:push` or SQL) inside the dev container.
- **CORS errors**
	- Ensure `CORS_ORIGIN` matches **exactly** the web Worker URL (scheme + host + port).
	- Verify Hono CORS middleware matches those settings.
- **Auth / cookies not persisting**
	- Check Better Auth `advanced.useSecureCookies` and `advanced.crossSubDomainCookies.domain`.
	- Ensure your domain matches `.workers.dev` subdomain or custom domain.
	- Confirm `SameSite` settings are compatible with your cross-origin pattern.
- **Worker size too large**
	- Verify bundle size and tree-shake unused Better Auth plugins/adapters.
	- Import plugins from their dedicated paths (e.g. `better-auth/plugins/two-factor`).

---

## 11. Reference Code: `alchemy.run.ts`

```ts
// packages/infra/alchemy.run.ts
import alchemy from 'alchemy'
import { Worker, D1Database } from 'alchemy/cloudflare'
import { config } from 'dotenv'

// Load env from infra, web, server
config({ path: './.env' })
config({ path: '../../apps/web/.env' })
config({ path: '../../apps/server/.env' })

const app = await alchemy('my-app')

// Optional D1 database for auth + app data
const db = await D1Database('database', {
	migrationsDir: '../../packages/db/src/migrations',
})

// Astro web app on Cloudflare Workers
export const web = await Worker('web', {
	cwd: '../../apps/web',
	entrypoint: './dist/server/entry.mjs', // see dist/server/entry.mjs below
	assets: './dist',
	bindings: {
		VITE_SERVER_URL: alchemy.env.VITE_SERVER_URL!,
		STAGE: alchemy.env.STAGE!,
	},
})

// Hono + Better Auth API Worker
export const server = await Worker('server', {
	cwd: '../../apps/server',
	entrypoint: './src/index.ts',
	compatibility: 'node',
	bindings: {
		DB: db,
		CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
		BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
		BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
		DATABASE_URL: alchemy.secret.env.DATABASE_URL!,
		STAGE: alchemy.env.STAGE!,
	},
	dev: {
		port: 3000,
	},
})

console.log(`Web    -> ${web.url}`)
console.log(`Server -> ${server.url}`)

await app.finalize()
```

---

## 12. Reference Code: `apps/web/astro.config.mjs`

```js
import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'

// Astro on Cloudflare Workers with SSR
export default defineConfig({
	adapter: cloudflare({
		// Use Workers KV for sessions by default
		// sessionKVBindingName: 'SESSION',
	}),
	output: 'server',
})
```

---

## 13. Reference Code: `apps/web/dist/server/entry.mjs`

This is a minimal Worker entry module that forwards requests into the Astro adapter
output. In a real build, Astro generates this file, but the following shows the
shape expected by Cloudflare Workers and Wrangler:

```js
// apps/web/dist/server/entry.mjs
import worker from './_worker.js'

export default {
	async fetch(request, env, context) {
		// Delegate to the Astro-generated worker entry
		return worker.fetch(request, env, context)
	},
}
```

---

## 14. Reference Code: `apps/web/dist/server/wrangler.json`

A Wrangler configuration that targets the `dist/server/entry.mjs` Worker entry and
serves static assets from `dist`. This is adapted from the Cloudflare Astro guide
([Astro on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)).

```json
{
  "name": "my-astro-app",
  "main": "./dist/server/entry.mjs",
  "compatibility_date": "2026-03-17",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "binding": "ASSETS",
    "directory": "./dist"
  },
  "observability": {
    "enabled": true
  }
}
```

