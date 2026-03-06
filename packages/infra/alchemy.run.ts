import alchemy from "alchemy";
import { Astro } from "alchemy/cloudflare";
import { Worker } from "alchemy/cloudflare";
import { D1Database } from "alchemy/cloudflare";
import { config } from "dotenv";

// 1. Initialise the environment and load secrets
config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env" });

// 2. Initialize the Alchemy app
const app = await alchemy("cornwall-ponds-gemini");

// 3. Provision a Cloudflare D1 Serverless Database and connect it to our Prisma/Drizzle migrations
const db = await D1Database("database", {
  migrationsDir: "../../packages/db/src/migrations",
});

// 4. Provision the Astro website (Frontend) and bind the server URL so the frontend knows where the API is
export const web = await Astro("web", {
  cwd: "../../apps/web",
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
