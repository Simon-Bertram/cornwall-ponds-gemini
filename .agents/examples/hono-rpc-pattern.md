# Hono RPC Pattern (Best Practices)

This guide serves as the standard for how the Backend and Frontend engineers should implement type-safe API communication using Hono and Zod.

## The Backend (Hono)
*   **Rule 1: Always use `zValidator`:** Every route with body, query, or params must have a Zod schema validating the input.
*   **Rule 2: Chain your routes:** Use `.route()` chaining so the final `.ts` export can infer the entire tree safely.
*   **Rule 3: Export `AppType`:** Only export the `typeof` the chained router, do not export the Hono instance logic to the frontend to prevent server code leaking.

```typescript
// apps/server/src/routes/users.ts
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

// 1. Chaining instead of redefining `const app =`
export const userRoute = new Hono()
  .get(
    '/:id',
    zValidator('param', z.object({ id: z.string() })),
    (c) => {
      const { id } = c.req.valid('param');
      return c.json({
        id,
        name: "Gemini",
        role: "AI Collaborator"
      }, 200); // 2. Explicit return status code helps type inference
    }
  );

// apps/server/src/index.ts
import { Hono } from 'hono';
import { userRoute } from './routes/users';

const app = new Hono()
  .route('/users', userRoute);

// 3. Export ONLY the typeof the routes tree
export type AppType = typeof app;
export default app;
```

## The Frontend (Astro)
*   **Rule 4: Server-Side Fetching First:** Always attempt to call the `hc` client inside the Server-Side frontmatter (`---`) of an Astro component before dropping down into a Client-Side framework (`Preact`). This creates a zero-JS experience and improves SEO.
*   **Rule 5: Dynamic Env Variables:** Never hardcode the API URL. Use Astro's `PUBLIC_SERVER_URL` config.

```astro
---
// apps/web/src/pages/user/[id].astro
import { hc } from 'hono/client';
import type { AppType } from 'server/src/index';

// 1. Use dynamic environment variables
const client = hc<AppType>(import.meta.env.PUBLIC_SERVER_URL);
const { id } = Astro.params;

// 2. Fetch on the Server (Astro Frontmatter) limits Client-Side JS!
const res = await client.users[':id'].$get({
  param: { id: id as string },
});

if (!res.ok) return Astro.redirect('/404');
const user = await res.json();
---

<!-- 3. Render directly or pass to a dumb Preact component as Props! -->
<div>
  <h1>User Profile</h1>
  <p>{user.name} - {user.role}</p>
</div>
```
