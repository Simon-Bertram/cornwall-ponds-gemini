import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.ts",
  format: "esm",
  outDir: "./dist",
  clean: true,
  noExternal: [/@cornwall-ponds-gemini\/.*/],
  // Cloudflare Workers runtime provides this at runtime; do not bundle
  external: ["cloudflare:workers"],
});
