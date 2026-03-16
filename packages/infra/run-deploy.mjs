#!/usr/bin/env node
/**
 * Loads packages/infra/.env from this script's directory so CLOUDFLARE_* and
 * ALCHEMY_PASSWORD are set before Alchemy runs (avoids 401 when Alchemy runs
 * from a different cwd).
 */
import { config } from "dotenv";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const infraEnv = join(__dirname, ".env");
config({ path: infraEnv });
config({ path: join(__dirname, "../../apps/web/.env") });
config({ path: join(__dirname, "../../apps/server/.env") });

// #region agent log
fetch('http://localhost:7394/ingest/3a6fa6ae-ab2e-4b41-b117-15e08a86fbe0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d07c97'},body:JSON.stringify({sessionId:'d07c97',runId:'pre',hypothesisId:'H4',location:'packages/infra/run-deploy.mjs:21',message:'run-deploy wrapper env summary',data:{dirname:__dirname,infraEnv,hasCloudflareAccountId:!!process.env.CLOUDFLARE_ACCOUNT_ID,hasCloudflareApiToken:!!process.env.CLOUDFLARE_API_TOKEN,hasAlchemyPassword:!!process.env.ALCHEMY_PASSWORD,hasPublicServerUrl:!!process.env.PUBLIC_SERVER_URL,hasCorsOrigin:!!process.env.CORS_ORIGIN,hasBetterAuthUrl:!!process.env.BETTER_AUTH_URL},timestamp:Date.now()})}).catch(()=>{});
// #endregion

const out = spawnSync("bun", ["x", "alchemy", "deploy"], {
	stdio: "inherit",
	env: process.env,
	cwd: __dirname,
});
process.exit(out.status ?? 1);
