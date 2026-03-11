# VS Code Extensions in a Dev Container

## How extensions work in a dev container

When you open a project in a dev container, VS Code runs **inside the container** rather than on your local machine. This has an important consequence for extensions: **your locally-installed extensions are not available inside the container by default.**

Instead, extensions must be declared inside the project's `.devcontainer/devcontainer.json` file and are installed automatically when the container is first created. Any extension installed manually inside the container session (via the Extensions panel) is also **ephemeral** — it disappears when the container is rebuilt.

---

## Extensions included in this project

The following extensions are listed in `.devcontainer/devcontainer.json` and will be auto-installed when the container is created:

| Extension | ID | Purpose |
|---|---|---|
| **Astro** | `astro-build.astro-vscode` | Syntax highlighting, IntelliSense, and type checking for `.astro` files. **Required for coloured code in Astro components.** |
| **Tailwind CSS IntelliSense** | `bradlc.vscode-tailwindcss` | Autocomplete, hover previews, and linting for Tailwind classes |
| **Prettier** | `esbenp.prettier-vscode` | Code formatting |
| **ESLint** | `dbaeumer.vscode-eslint` | In-editor linting for `.ts`, `.tsx`, and `.astro` files |
| **Cloudflare Workers Bindings** | `cloudflare.cloudflare-workers-bindings-extension` | IntelliSense for Cloudflare D1, KV, and R2 bindings |
| **ENV** | `irongeek.vscode-env` | Syntax highlighting for `.dev.vars` and `.env` files |

---

## Why extensions might not be installed

Even though extensions are declared in `devcontainer.json`, they may be **missing** in two situations:

### 1. The container was already running when extensions were added
`devcontainer.json` extensions are only installed during **container creation**. If you add an extension to the list while the container is already running, it won't be picked up until the next rebuild.

### 2. The container was opened without the Dev Containers extension
If you connected to the container in a way that bypassed the Dev Containers workflow, the `devcontainer.json` customisations are never applied.

---

## How to install missing extensions

### Option A — Rebuild the container (recommended, installs everything automatically)

This reinstalls all extensions declared in `devcontainer.json` from scratch:

1. Open the Command Palette: `Ctrl+Shift+P` / `⇧⌘P`
2. Run **"Dev Containers: Rebuild Container"**
3. Wait for the container to restart — all extensions will be installed automatically

> [!WARNING]
> Rebuilding will re-run `postCreateCommand` (`bun install`). Any manual changes made inside the container that weren't committed to the repo will be lost.

### Option B — Install manually for the current session

If you don't want to rebuild right now, install individual extensions from the Extensions panel:

1. Open the Extensions panel: `Ctrl+Shift+X` / `⇧⌘X`
2. Search for the extension name (e.g. "Astro")
3. Click **Install**

> [!NOTE]
> Manually installed extensions are stored inside the running container. They **will be lost** on the next rebuild unless you also add their ID to `.devcontainer/devcontainer.json`.

### Option C — Use the workspace recommendation prompt

Because this project has a `.vscode/extensions.json` file, VS Code should show a notification:
> *"Do you want to install the recommended extensions for this repository?"*

Clicking **Install** will install all extensions listed in that file for the current session.

---

## Adding a new extension permanently

To ensure an extension is always available for every developer and every container rebuild:

1. Find the extension's ID in the VS Code marketplace (e.g. `astro-build.astro-vscode`)
2. Add it to **both** files:

**.devcontainer/devcontainer.json** — auto-installs on container creation:
```json
"customizations": {
  "vscode": {
    "extensions": [
      "your-publisher.your-extension"  // ← add here
    ]
  }
}
```

**.vscode/extensions.json** — prompts collaborators who open the project locally:
```json
{
  "recommendations": [
    "your-publisher.your-extension"  // ← and here
  ]
}
```

3. Rebuild the container so the change takes effect.
