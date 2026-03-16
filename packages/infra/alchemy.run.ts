import alchemy from "alchemy";
import { Astro } from "alchemy/cloudflare";
import { Worker } from "alchemy/cloudflare";
import { D1Database } from "alchemy/cloudflare";
import { config } from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// #region agent log
fetch('http://localhost:7394/ingest/3a6fa6ae-ab2e-4b41-b117-15e08a86fbe0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d07c97'},body:JSON.stringify({sessionId:'d07c97',runId:'pre',hypothesisId:'H4',location:'packages/infra/alchemy.run.ts:14',message:'alchemy.run.ts starting',data:{dirname:__dirname,infraEnv:join(__dirname,'.env'),webEnv:join(__dirname,'../../apps/web/.env'),serverEnv:join(__dirname,'../../apps/server/.env'),hasPublicServerUrl:!!process.env.PUBLIC_SERVER_URL,hasCorsOrigin:!!process.env.CORS_ORIGIN,hasBetterAuthUrl:!!process.env.BETTER_AUTH_URL,hasBetterAuthSecret:!!process.env.BETTER_AUTH_SECRET,hasCloudflareAccountId:!!process.env.CLOUDFLARE_ACCOUNT_ID,hasCloudflareApiToken:!!process.env.CLOUDFLARE_API_TOKEN,hasAlchemyPassword:!!process.env.ALCHEMY_PASSWORD},timestamp:Date.now()})}).catch(()=>{});
// #endregion

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

// 4. Provision the Astro website (Frontend) and bind the server URL so the frontend knows where the API is
export const web = await Astro("web", {
  cwd: "../../apps/web",
  bindings: {
    PUBLIC_SERVER_URL: alchemy.env.PUBLIC_SERVER_URL!,
  },
});

// #region agent log
fetch('http://localhost:7394/ingest/3a6fa6ae-ab2e-4b41-b117-15e08a86fbe0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d07c97'},body:JSON.stringify({sessionId:'d07c97',runId:'pre',hypothesisId:'H1',location:'packages/infra/alchemy.run.ts:41',message:'Astro(web) provisioned',data:{webUrl:(web as any)?.url ?? null,webCwd:'../../apps/web',publicServerUrlConfigured:alchemy.env.PUBLIC_SERVER_URL ?? null},timestamp:Date.now()})}).catch(()=>{});
// #endregion

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

// #region agent log
fetch('http://localhost:7394/ingest/3a6fa6ae-ab2e-4b41-b117-15e08a86fbe0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d07c97'},body:JSON.stringify({sessionId:'d07c97',runId:'pre',hypothesisId:'H1',location:'packages/infra/alchemy.run.ts:66',message:'Worker(server) provisioned',data:{serverUrl:(server as any)?.url ?? null,serverCwd:'../../apps/server',corsOriginConfigured:alchemy.env.CORS_ORIGIN ?? null,betterAuthUrlConfigured:alchemy.env.BETTER_AUTH_URL ?? null},timestamp:Date.now()})}).catch(()=>{});
// #endregion

console.log(`Web    -> ${web.url}`);
console.log(`Server -> ${server.url}`);

await app.finalize();
