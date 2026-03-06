# Installation Report: cornwall-ponds-gemini

This document outlines the installation process for the `cornwall-ponds-gemini` project using the `better-t-stack` CLI, including the challenges faced and the workarounds applied.

## Project Specifications
- **Frontend**: Astro
- **Backend**: Hono
- **Runtime**: Cloudflare Workers
- **Database**: SQLite (via Drizzle ORM and Cloudflare D1)
- **Auth**: Better Auth
- **Addons**: MCP, Skills, Turborepo
- **Package Manager**: Bun

## Challenges Encountered

### 1. Interactive CLI Prompts
The `better-t-stack` CLI is designed to be interactive when certain addons are selected. Specifically, the `mcp` and `skills` addons trigger prompts for:
- Installation location (Project vs. Global)
- Selection of specific skills/servers
- Target AI agents (Cursor, Claude Code, etc.)

In an automated environment, these prompts caused the process to hang and eventually timeout.

### 2. `--yes` Flag Incompatibility
The `--yes` flag, which typically enables non-interactive mode, is incompatible with explicit configuration flags. Attempting to use both resulted in the following error:
`ERROR: Cannot combine --yes with core stack configuration flags`.

## Workarounds Applied

To successfully complete the installation, a **two-stage scaffolding approach** was used:

### Stage 1: Core Scaffolding (Non-Interactive)
The project was initially created without the problematic interactive addons. This allowed the core structure, dependencies, and Turborepo configuration to be established without manual intervention.

**Command used:**
```bash
bun create better-t-stack@latest cornwall-ponds-gemini \
  --frontend astro --backend hono --runtime workers \
  --api none --auth better-auth --payments none \
  --database sqlite --orm drizzle --db-setup d1 \
  --package-manager bun --git --web-deploy cloudflare \
  --server-deploy cloudflare --install --addons turborepo \
  --examples none --directory-conflict overwrite
```

### Stage 2: Addon Injection
After the core project was ready, the `mcp` and `skills` addons were added using the `add` subcommand. This subcommand handled the addition of files and dependency installation more gracefully in this context.

**Command used:**
```bash
bun create better-t-stack@latest add \
  --addons mcp skills --install \
  --project-dir cornwall-ponds-gemini --package-manager bun
```

## Final Status
The project is now fully scaffolded and matches the original request.
- **Web App**: `apps/web` (Astro)
- **Server App**: `apps/server` (Hono)
- **Shared Packages**: `packages/db`, `packages/auth`, `packages/env`, etc.
- **Addons**: MCP and Skills files are present in the root directory (`.mcp.json`, `skills-lock.json`).

## Next Steps
1. `cd cornwall-ponds-gemini`
2. `bun run db:generate` to initialize migrations.
3. `bun run dev` to start the Turborepo development environment.
