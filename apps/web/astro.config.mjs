// @ts-check
import tailwindcss from "@tailwindcss/vite";
import alchemy from "alchemy/cloudflare/astro";
import node from "@astrojs/node";
import { defineConfig, envField } from "astro/config";

import preact from "@astrojs/preact";

import react from "@astrojs/react";
import markdoc from "@astrojs/markdoc";
import keystatic from "@keystatic/astro";

const isDev = process.argv.includes("dev");
const isTest = process.env.VITEST === "true";

// https://astro.build/config
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

  server: {
    host: true,
    port: 4321,
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: [
        "virtual:keystatic-config",
        "picomatch",
        "lightningcss",
      ],
    },
  },

  integrations: [
    preact({ include: ["**/components/*.tsx", "**/components/**/*.tsx"] }),
    react({ include: ["**/@keystatic/**", "**/keystatic/**"] }),
    markdoc(),
    keystatic(),
  ],
});
