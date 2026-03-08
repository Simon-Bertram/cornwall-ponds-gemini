import { auth } from "@cornwall-ponds-gemini/auth";
import { env } from "@cornwall-ponds-gemini/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { contactRoute } from "./routes/contact";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/", (c) => {
  return c.text("OK");
});

// Chain routers for typed RPC
const routes = app
  .route("/api/contact", contactRoute);

export type AppType = typeof routes;
export default app;
