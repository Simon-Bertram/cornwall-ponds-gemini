# Alchemy Infrastructure Guide

In this project, **Alchemy** refers to the [alchemy.run](https://alchemy.run) Infrastructure-as-Code (IaC) framework, not the Web3 RPC provider. It is used to define, provision, and deploy cloud resources to Cloudflare directly from TypeScript.

Alchemy handles orchestrating our Cloudflare primitives (Workers, D1 databases, Astro static assets, environment variables, bindings) into a single cohesive development and deployment story.

---

## 🏗️ Architecture Overview

The core infrastructure definition lives in **`packages/infra/alchemy.run.ts`**.
If you need to add new Cloudflare resources (like a KV store, R2 bucket, or another Worker), this is the file to edit.

Currently, it provisions:
1. **D1 Database** (`database`): Automatically applies migrations from `packages/db/src/migrations`.
2. **Astro Web App** (`web`): The frontend, deployed as static site/SSR on Cloudflare.
3. **API Server Worker** (`server`): The backend, built using Hono.

Alchemy automatically wires up the necessary bindings (e.g., giving the server access to the `DB` database, and passing environment variables safely between apps).

---

## 💻 Commands and Where to Run Them

You can interact with Alchemy either from the **Project Root** (using Turborepo) or from inside the **Infrastructure Package** (`packages/infra`). 

### Running from the Project Root (Recommended)
You should generally run these from the root of the project to ensure proper monorepo caching and execution order via Turborepo.

| Command | Description | What it does |
|---|---|---|
| `bun run dev` | Local Development | Starts the Alchemy local dev server. It spins up the UI, the Backend API, and a local D1 SQLite database all at once, auto-reloading when you make code changes. |
| `bun run deploy` | Production Deployment | Bundles your entire application and deploys it to your Cloudflare account. **Note:** Requires you to have run `bunx wrangler login` first. |
| `bun run destroy` | Teardown | Destroys the Cloudflare resources deployed by Alchemy for this project. |

### Running from `packages/infra/`
If you need more granular control or want to use native `alchemy` CLI commands, navigate to `packages/infra/` first:

```bash
cd packages/infra
```

| Command | Description |
|---|---|
| `bun run dev` | Runs `alchemy dev`. Starts the dev server directly. |
| `bun run deploy` | Runs `alchemy deploy`. Deploys directly to Cloudflare. |
| `bun run destroy` | Runs `alchemy destroy`. Tears down resources. |

---

## 🪢 Environment Variables and Bindings

Alchemy reads environment variables from `.env` files and passes them across the stack.

In `packages/infra/alchemy.run.ts`, you will see code like:
```typescript
bindings: {
  PUBLIC_SERVER_URL: alchemy.env.PUBLIC_SERVER_URL!,
  BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
}
```

- **`alchemy.env`**: Used for normal environment variables.
- **`alchemy.secret.env`**: Used for sensitive secrets that Cloudflare encrypts at rest.

### Type-Safe Bindings

Because Alchemy generates the Cloudflare infrastructure, it also shares the types defining those bindings with the rest of the monorepo. 

In `packages/env/env.d.ts`, the types for the Cloudflare execution environment are inferred directly from your `alchemy.run.ts` file:
```typescript
import { type server } from "@cornwall-ponds-gemini/infra/alchemy.run";
```
This ensures your Hono server strictly types checks `env.DB` or `env.BETTER_AUTH_SECRET` without needing a manual Cloudflare `wrangler.toml` file!
