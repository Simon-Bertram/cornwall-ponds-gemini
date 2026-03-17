import alchemy from "alchemy";
import { Worker } from "alchemy/cloudflare";
import { D1Database } from "alchemy/cloudflare";
import { config } from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// 1. Load .env files (fallback if not already set by run-deploy.mjs wrapper)
config({ path: join(__dirname, ".env") });
config({ path: join(__dirname, "../../apps/web/.env") });
config({ path: join(__dirname, "../../apps/server/.env") });

// 2. Initialize the Alchemy app
const app = await alchemy("cornwall-ponds-gemini");

// 3. Provision a Cloudflare D1 Serverless Database and connect it to our Prisma/Drizzle migrations
const db = await D1Database("database", {
  migrationsDir: "../../packages/db/src/migrations",
});

// 4. Provision the Astro website (Frontend) as a Cloudflare Worker,
//    pointing directly to the built Worker entry produced by `astro build` in apps/web.
export const web = await Worker("web", {
  cwd: "../../apps/web",
  entrypoint: "dist/server/entry.mjs",
  compatibility: "node",
  bindings: {
    PUBLIC_SERVER_URL: alchemy.env.PUBLIC_SERVER_URL!,
  },
});

// 5. Provision the Hono API (Backend) as a Cloudflare Worker, and grant it access to the D1 Database and secret Auth variables
export const server = await Worker("server", {
  cwd: "../../apps/server",
  entrypoint: "src/index.ts",
  compatibility: "node",
  bindings: {
    DB: db,
    CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
    BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
  },
  dev: {
    port: 3000,
  },
});

console.log(`Web    -> ${web.url}`);
console.log(`Server -> ${server.url}`);

await app.finalize();
