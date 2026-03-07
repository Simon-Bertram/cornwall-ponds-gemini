# Complete Guide: Adding & Configuring the Docker MCP Toolkit

This guide explains how to properly configure your development environment to use the Docker MCP Toolkit for select language servers, while retaining `.mcp.json` for specific HTTP/SSE endpoints.

## 1. Prepare the Dev Container for Docker
The Docker MCP Toolkit requires the `docker` CLI. By default, VS Code Dev Containers do not have Docker installed inside of them. To allow the container to use your host machine's Docker engine (Docker-outside-of-Docker):

1. Open your `.devcontainer/devcontainer.json` file.
2. Add the `docker-outside-of-docker` feature to the `"features"` block:

```json
"features": {
  "ghcr.io/devcontainers/features/docker-outside-of-docker:1": {},
  "ghcr.io/devcontainers/features/github-cli:1": {},
  "ghcr.io/devcontainers/features/common-utils:1": {
    "configureZshAsDefaultShell": true
  }
}
```

3. **Rebuild the Container**: Open the Command Palette (`Cmd + Shift + P` or `Ctrl + Shift + P`), type **`Dev Containers: Rebuild Container`**, and press Enter.

## 2. Separate Your MCP Servers
You should logically split your MCP servers between the Docker Toolkit and your local `.mcp.json` file according to how they operate.

### HTTP / SSE Endpoints (`.mcp.json`)
Keep direct web endpoints (like APIs, webhooks, or cloud services that don't need a local binary to run) inside your `.mcp.json` file.

**Example `.mcp.json`:**
```json
{
  "mcpServers": {
    "better-auth": {
      "type": "http",
      "url": "https://mcp.inkeep.com/better-auth/mcp"
    }
  }
}
```

### CLI Packages / Local Environments (Docker MCP Toolkit)
For servers that execute commands (like `npx @upstash/context7-mcp` or `mpx`), use the Docker MCP Toolkit. This keeps your base system clean without needing to globally install node/python dependencies.

**Example setup for Docker MCP Toolkit:**
You can now safely pass servers like `context7`, `cloudflare-docs`, and `astro-docs` into your Docker toolkit following its specific launch instructions, as your container will successfully route the commands to your host's Docker engine.
