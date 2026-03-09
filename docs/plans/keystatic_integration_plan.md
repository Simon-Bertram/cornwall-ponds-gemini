# Implementation Plan: Keystatic CMS Integration for Cornwall Ponds

## Overview
This document outlines the architectural plan to integrate [Keystatic](https://keystatic.com/) (a local/Git-based CMS) into the Astro frontend (`apps/web`). The goal is to empower the client to effortlessly manage rich content (Pages, Projects, Testimonials, and SEO-optimized Blog Posts) directly from a user-friendly admin dashboard, which then saves structured Markdown/JSON files directly into the GitHub repository.

## Principles Embedded in the Plan
*   **Git-Backed Truth:** All content will live as flat files (MDX/Markdoc/JSON) inside `apps/web/src/content/`, ensuring version control and zero database lock-in.
*   **Edge-Compatible Build:** Keystatic runs purely at build time (or in the browser for the admin UI), adding zero latency to the production Cloudflare Pages deployment.
*   **Structured SEO:** Collections will enforce strict schema validations (Zod) to guarantee that all Open Graph, Twitter Cards, and schema markup fields are populated by the client before publishing.

---

## Content Architecture (Schemas)

Before outlining the steps, here is the structured data architecture we will build in Keystatic to serve the client's needs:

### 1. Singletons (Global/Unique Pages)
*   **Settings/Global:** Site Title, Default OG Image, Contact Info (Phone, Email, Address - to sync across the site automatically).
*   **Landing Pages (Paid Ads):** Dedicated singletons where the client can quickly spin up a custom "Limited Time Offer" Hero, modify the copy, and direct Google/Meta ad traffic for maximum conversion.

### 2. Collections (Repeating Content)
*   **Featured Projects (`src/content/projects`):** 
    *   Fields: Title, Slug, Service Type, Location, Key Stats (Volume, Time), Before/After Image Arrays, Rich Text Case Study content.
*   **Testimonials (`src/content/testimonials`):**
    *   Fields: Client Name, Location, Star Rating, Review Text, Optional Project Link.
*   **Blog / Articles (`src/content/posts`):**
    *   *Core Fields:* Title, Slug, Publish Date, Author, Rich Text Content.
    *   *SEO Fields:* `ogImage`, `socialTitle`, `socialDescription` (powers the "Open Graph Automation" explicitly requested).
    *   *Marketing Automation:* `socialSnippets` (Array of short text strings for generating Twitter/Instagram hooks directly from the post data).

---

## Task Breakdown & Agent Assignments

### Step 1: Keystatic Installation & Setup (Assigned to: `@backend-engineer.md` or the Unified Assistant)
**Objective:** Install the Keystatic dependencies via Bun and configure the Astro integration.
*   **Action 1.1:** Build the foundation by installing React (required for the Keystatic admin UI) and Markdoc (the recommended rich-text markdown parser) via the Astro CLI: `bunx astro add react markdoc`
*   **Action 1.2:** Install the core Keystatic engine and Astro integration using Bun: `bun add @keystatic/core @keystatic/astro`
*   **Action 1.3:** Create the core configuration file at `apps/web/keystatic.config.ts`. Set the storage mode to `github` for production (or `local` for dev environment config).

### Step 2: Schema Definition (Assigned to: `@backend-engineer.md`)
**Objective:** Program the Keystatic collections and singletons to match the Content Architecture defined above.
*   **Action 2.1:** In `keystatic.config.ts`, define the `projects` collection using `fields.slug`, `fields.text`, `fields.image`, and `fields.document`.
*   **Action 2.2:** Define the `testimonials` collection.
*   **Action 2.3:** Define the `posts` collection, explicitly including the critical SEO arrays: `ogImage`, `socialTitle`, `socialDescription`, and `socialSnippets` to power the marketing automation.
*   **Action 2.4:** Define the `landing-page` Singleton for paid ad deep links.

### Step 3: Astro Content Collections Integration (Assigned to: `@backend-engineer.md`)
**Objective:** Wire up Astro's native Content Collections API to strictly type-check the markdown files Keystatic generates.
*   **Action 3.1:** Create/Update `apps/web/src/content/config.ts`.
*   **Action 3.2:** Define Zod schemas that perfectly mirror the Keystatic schema fields defined in Step 2. This ensures Astro provides TypeScript auto-completion when the frontend engineer renders the data.

### Step 4: Frontend Component Adaptation (Assigned to: `@frontend-engineer.md`)
**Objective:** Swap out the hard-coded dummy data (`lib/projects.ts`) for the live Keystatic Content Collections.
*   **Action 4.1:** Update `apps/web/src/pages/our-work/index.astro` and `[slug].astro` to fetch data using `getCollection('projects')`.
*   **Action 4.2:** Update `apps/web/src/pages/index.astro` to pull the top 3 featured projects via `getCollection` instead of the local array.
*   **Action 4.3:** Build the dynamic blog listing page (`src/pages/blog/index.astro`) and individual post pages (`src/pages/blog/[slug].astro`).
*   **Action 4.4:** In the Blog `[slug].astro` layout, dynamically inject the `ogImage`, `socialTitle`, and `socialDescription` fields directly into the `<head>` to execute the "Open Graph Automation" marketing strategy.

### Step 5: The "Promo" Marketing Engine (Assigned to: `@frontend-engineer.md`)
**Objective:** Build a hidden internal dashboard tool to execute the "Auto-Generating Social Media Snack Content" strategy.
*   **Action 5.1:** Create a protected page at `apps/web/src/pages/internal/promo-dashboard.astro`.
*   **Action 5.2:** Use the Astro/Keystatic Reader API to fetch all recent Blog Posts.
*   **Action 5.3:** Iterate through the `socialSnippets` arrays of the recent posts and display them in a clean "Copy-Paste" UI so the client can instantly grab pre-written tweets/hooks alongside the URL. *(Note: Hooking this to Zapier via Webhooks can be planned in a future DevOps phase)*.

### Step 6: Review & Deployment (Assigned to: `@devops-engineer.md` & `@graphic-designer.md`)
**Objective:** Ensure the Keystatic admin `/keystatic` UI looks cohesive and the GitHub OAuth app is correctly configured for production content editing.
*   **Action 6.1:** DevOps to configure the GitHub App credentials required for Keystatic's 'github' storage mode and inject them securely as environment variables in Cloudflare Pages.
*   **Action 6.2:** Graphic Designer to review the output of the new dynamic Blog templates and ensure they meet the WCAG and typography standards established in the Frontend Adaptation Plan.

---
## How to Proceed
While the strict `@agent` persona assignments are helpful for maintaining architectural discipline, **you do not need to explicitly summon the `@backend-engineer` or `@devops-engineer` for basic package installation.** As a unified AI assistant, I possess all capabilities natively. 

You can simply ask me to "Execute Step 1 of the Keystatic Plan" and I will seamlessly handle the terminal commands and configuration files across all required disciplines.
