# Monorepo Standards
## Core Stack
- **Frontend:** Astro 6 + Tailwind + DaisyUI + Shadcn UI
- **Backend:** Hono + Cloudflare Workers
- **Database:** Drizzle ORM + Cloudflare D1
- **Auth:** Better Auth (Drizzle Adapter)
## Tooling & Infrastructure
- **Package Manager:** Bun (Bun workspaces)
- **Monorepo Build:** Turborepo
- **Env Validation:** Zod / Alchemy (`@cornwall-ponds-gemini/env`)
- **Deployment:** Cloudflare / Wrangler
## Architectural Rules
1. **Frontend-Backend Contract:** Always export RPC types from Hono to be used by the Astro frontend for e2e type safety.
2. **Environment Variables:** Never use `process.env` directly. Always import validated variables from the `packages/env` workspace.
3. **Node.js Built-ins:** The backend runs on Cloudflare Workers (V8 isolates), not Node.js. Avoid modules like `fs`, `path`, or `child_process`.
4. **Strict Typing:** Always use strict TypeScript.