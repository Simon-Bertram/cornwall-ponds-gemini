## Frontend Worker Deployment Incident Report

### 1. Problem summary

- **Initial symptom**: The production frontend URL  
  `https://cornwall-ponds-gemini-web-node.simonbertram.workers.dev/`  
  consistently returned a plain `Not Found` response (HTTP 404) instead of the Astro site.
- **Current symptom (after Worker fixes)**: The same URL now renders the Astro HTML (including the “Skip to main content” link and the phone number) but **styling is broken**:
  - Tailwind/DaisyUI styles are not applied.
  - Browser console shows CSS parsing warnings for `/_astro/Layout.*.css` such as  
    `Unknown descriptor 'font-named-instance' in @font-face rule` and  
    `Selector expected. Ruleset ignored due to bad selector. Layout.ywuUC9co.css:1:1`,  
    indicating the CSS is being fetched but not parsed as valid CSS.
- **Backend status**: The API Worker at  
  `https://cornwall-ponds-gemini-server-node.simonbertram.workers.dev/`  
  responds with `ok`, indicating the server Worker and D1 bindings are healthy.
- **Original key fact**: In the Cloudflare dashboard, the `web` Worker’s code was a tiny stub:

```js
export default {
  async fetch(request, env) {
    return new Response("Not Found", { status: 404 });
  },
};
```

even after successful Alchemy deploys.

### 2. Relevant implementation details

- **Infra definition** (`packages/infra/alchemy.run.ts`) – original vs. current:

```ts
const app = await alchemy("cornwall-ponds-gemini");

// ORIGINAL (via Astro helper)
// export const web = await Astro("web", {
//   cwd: "../../apps/web",
//   bindings: {
//     PUBLIC_SERVER_URL: alchemy.env.PUBLIC_SERVER_URL!,
//   },
// });

// CURRENT (explicit Worker entrypoint)
export const web = await Worker("web", {
  cwd: "../../apps/web",
  entrypoint: "dist/server/entry.mjs",
  compatibility: "node",
  bindings: {
    PUBLIC_SERVER_URL: alchemy.env.PUBLIC_SERVER_URL!,
  },
});

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
});
```

- **Astro config** (`apps/web/astro.config.mjs`):

```js
export default defineConfig({
  output: "server",
  adapter: isTest
    ? node({ mode: "standalone" })
    : isDev
      ? node({ mode: "standalone" })
      : alchemy(),
  env: {
    schema: {
      PUBLIC_SERVER_URL: envField.string({
        access: "public",
        context: "client",
        default: "http://localhost:3000",
      }),
    },
  },
});
```

- **Deploy log excerpt**:

```text
[updating]  web-build Updating Resource...
$ astro build
...
[build] output: "server"
[build] mode: "server"
[build] directory: /workspaces/.../apps/web/dist/
[build] adapter: @astrojs/cloudflare
...
[build] Server built in 32.10s
[build] Complete!
[updated]   web-build Updated Resource
[updating]  web Updating Resource...
[updated]   web Updated Resource
[updating]  server Updating Resource...
[updated]   server Updated Resource
Web    -> https://cornwall-ponds-gemini-web-node.simonbertram.workers.dev
Server -> https://cornwall-ponds-gemini-server-node.simonbertram.workers.dev
```

No errors or warnings are emitted during `web` update.

- **Astro build output**:
  - `apps/web/dist/server/entry.mjs`:

```js
globalThis.process ??= {};
globalThis.process.env ??= {};
import "cloudflare:workers";
import { B } from "./chunks/worker-entry_*.mjs";
export { B as default };
```

- `apps/web/dist/server/wrangler.json` has `"main": "entry.mjs"`.

### 3. Debugging steps performed

#### 3.1 Local build verification

- Added **unit tests** in `packages/infra/test/web-build-output.test.ts` to assert:
  - `apps/web/dist/server/entry.mjs` exists.
  - It exports a default handler and references a `worker-entry*.mjs` chunk.
  - `apps/web/dist/server/wrangler.json` exists and sets `"main": "entry.mjs"`.
- **Result**: All build-output tests pass.
- **Conclusion**: Astro + Alchemy correctly produce a Cloudflare Worker entry bundle for the frontend.

#### 3.2 Deployed behavior verification

- Added **integration tests** in `packages/infra/test/deployed-web.integration.test.ts` to call the live Workers:
  - `WEB_URL = https://cornwall-ponds-gemini-web-node.simonbertram.workers.dev`
  - `SERVER_URL = https://cornwall-ponds-gemini-server-node.simonbertram.workers.dev`

Tests:

- Web:
  - Expect `status === 200`.
  - Expect body to contain `"Cornwall Ponds"` and **not** equal `"Not Found"`.
- Server:
  - Expect `status === 200`.
  - Expect body `"ok"` (case-insensitive).

**Result**:

- Web test: **fails** – status is `404`, not `200`.
- Server test: **passes** – status `200`, body `"ok"`.

**Conclusion**:

- The **live web Worker URL returns HTTP 404**, consistent with the stub `worker.js`.
- The API Worker is healthy and correctly deployed.

#### 3.3 Config and docs alignment

- Verified that:
  - `output: "server"` + `adapter: alchemy()` in `apps/web/astro.config.mjs` matches Astro’s Cloudflare/SSR guidance.
  - The project is **not** using Astro as a purely static site builder (so the “no adapter needed” note does not apply).
  - The Alchemy docs for Cloudflare Workers (`Worker("id", { entrypoint, ... })`) conceptually match how `Astro("web", ...)` is being used as a resource.
- No misconfiguration found in:
  - Astro adapter selection for production.
  - Alchemy’s `Astro("web", { cwd, bindings })` call.

#### 3.4 Cloudflare-side inspection (manual)

- In the Cloudflare dashboard, for the Worker backing the `Web ->` URL (`cornwall-ponds-gemini-web-node.simonbertram.workers.dev`), the only code visible in the editor is:

```js
export default {
  async fetch(request, env) {
    return new Response("Not Found", { status: 404 });
  },
};
```

- This remains unchanged **even after** successful `bun run deploy` runs where Alchemy reports:
  - `[updated]   web Updated Resource`
  - And prints the `Web ->` URL above.

**Conclusion**:

- Cloudflare is **still running the stub script** for the web Worker name/hostname after deploy.
- The code built from `apps/web/dist/server/entry.mjs` is not what Cloudflare executes for that resource.

### 4. Hypotheses considered and ruled out

1. **Astro/SSR misconfiguration**
   - Ruled out: `output: "server"` + Alchemy Cloudflare adapter is correct for SSR on Workers.
   - Build-output tests and logs confirm SSR bundle is valid.

2. **Routing / hostname misconfiguration**
   - Ruled out: The web integration test hits the correct URL and gets a 404 from a Worker, not a DNS or “no Worker” error.
   - The server Worker URL behaves correctly, showing that Workers routing is functional.

3. **Missing or wrong entrypoint in `wrangler.json`**
   - Ruled out: `apps/web/dist/server/wrangler.json` has `"main": "entry.mjs"`, and the entry file re-exports the actual handler from `worker-entry_*.mjs`.

4. **“Using Astro as static site builder, no adapter needed” confusion**
   - Ruled out: this project is explicitly SSR (`output: "server"`). Static-only guidance does not apply.

5. **Local tooling issue (tests not hitting the real URL)**
   - Ruled out by hardcoding URLs in the integration test and running from the same environment, which reproduces the 404 and matches what you see in the browser.

### 5. Likely root cause (outside this repo)

Given:

- The SSR Worker bundle for the frontend is correct and present.
- Alchemy’s deploy logs show **successful updates** for both `web-build` and `web` resources, with no errors.
- The Worker script body for the `Web ->` URL remains the hard-coded `Not Found` stub **after deploy**.
- The deployed web integration test consistently sees HTTP 404 from the live URL.

The most probable root cause is:

> **Alchemy’s deployment for the `web` resource is not overwriting the existing Cloudflare Worker script body for that name/hostname, even though it reports “Updated Resource”.**

Possible mechanisms (speculative, require vendor insight):

- An **“adopt existing Worker”** behavior where Alchemy attaches bindings/routes to an existing Worker but does not replace its code when adopting.
- A **conflicting Cloudflare project** (e.g. a Git-connected Worker with the same name) that redeploys the stub `worker.js` after Alchemy deploys.
- A Cloudflare-side issue where the script version being executed is stale relative to what the API reports as updated.

These cannot be verified or fixed from this repo alone; they require visibility into:

- The exact Worker resource metadata in Cloudflare for the `web` Worker name.
- Any other projects or scripts in the same account using the same name/hostname.
- How Alchemy’s `Astro("web", ...)` implementation handles adoption and code upload for existing Workers.

### 6. Why this could not be fully solved here

- **All repo-local and build-time evidence** (tests, configs, dist output, deploy logs) point to a correct SSR build and a successful Alchemy deploy.
- The mismatch is **between what Alchemy says it updated** and **what Cloudflare actually runs** for the `web` Worker.
- The Cloudflare dashboard clearly shows a stub script for that Worker name even after deploy, which is outside the scope of code changes in this repository.
- Without:
  - Direct access to the Cloudflare account’s full Worker/project list and routes, and
  - Insight into Alchemy’s internal handling of `Astro("web", ...)` deployments and adoption behavior,
    any further “fixes” here would be guesswork rather than evidence-based.

### 7. Next steps / escalation

For a definitive fix, this should be escalated with the following artifacts:

- This report.
- Current versions of:
  - `packages/infra/alchemy.run.ts`
  - `apps/web/astro.config.mjs`
  - `apps/web/dist/server/entry.mjs`
  - `apps/web/dist/server/wrangler.json`
- A screenshot or code copy of the Cloudflare editor for the `web` Worker (showing the stub).
- The latest `bun run deploy` log, including the `Web ->` and `Server ->` URLs.
- The output of `bun run test:infra`, showing:
  - Build-output tests passing.
  - Deployed web integration test failing with 404.
  - Deployed server integration test passing with 200/`ok`.

With these, Alchemy/Cloudflare support can:

- Verify whether the `web` Worker name collides with any other project.
- Inspect the actual script versions and deployment history for that Worker.
- Confirm whether `Astro("web", ...)` is correctly pushing the new bundle or only updating bindings/routes.
