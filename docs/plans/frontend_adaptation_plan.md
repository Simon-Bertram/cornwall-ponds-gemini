# Implementation Plan: Adapting Next.js Frontend to Astro Monorepo

## Overview
This document outlines the step-by-step plan to migrate the Next.js example frontend (`docs/examples/nextjs-frontend`) into the Astro-based frontend (`apps/web`) within the Turborepo monorepo. It adheres to Clean Code and SOLID principles to ensure maintainability, testability, and a premium UX suitable for a high-end landscaping business.

## Principles Embedded in the Plan
*   **Single Responsibility (SRP):** Data fetching logic will be completely isolated from UI rendering components. (e.g., `src/components/ProjectCard.astro` only renders; `src/lib/projects.ts` fetches data).
*   **Open/Closed (OCP):** Core data types/interfaces (like `Project`) will be extensible without modifying existing rendering pipelines.
*   **Dependency Inversion (DIP):** Instead of components importing global state, data will purely and explicitly be passed down via `Astro Props`.

---

## Task Breakdown & Agent Assignments

### Step 1: Design System & Core Layout (Assigned to: `@design-system-engineer.md`)
**Objective:** Prepare the visual foundation of the Astro app based on the Next.js example's aesthetic.
*   **Action 1.1:** Update `apps/web/src/layouts/Layout.astro` and global styles to integrate DaisyUI's `emerald` or `forest` theme onto the `<html data-theme="...">` tag.
*   **Action 1.2:** Ensure Tailwind and Shadcn UI configurations are correctly mapped to support the new theme variables.
*   **Action 1.3:** Map the Next.js `app/layout.tsx` metadata into Astro's `<head>` element configuration dynamically in `Layout.astro`.

### Step 2: Data Architecture & Server Setup (Assigned to: `@backend-engineer.md`)
**Objective:** Migrate the placeholder data and set up API foundational contracts.
*   **Action 2.1:** Analyze `docs/examples/nextjs-frontend/lib/data.ts` (as the Source of Truth) and migrate the data structures to a pure module at `apps/web/src/lib/projects.ts` (or `packages/db` if a database schema is required).
*   **Action 2.2:** Ensure the `Project` type interfaces are exported cleanly in a way that respects the Open/Closed Principle.
*   **Action 2.3:** Create the initial Hono RPC endpoint for `api/contact` (migrating from `src/pages/api/contact.ts` equivalent) inside `apps/server/src/`.

### Step 3: Global Navigation & Mobile Menu (Assigned to: `@frontend-engineer.md`)
**Objective:** Build the header component, ensuring accessibility for mobile navigation.
*   **Action 3.1:** Adapt `components/site-header.tsx` to `apps/web/src/components/Header.astro`.
*   **Action 3.2:** For Desktop, implement the structure using standard DaisyUI navbar classes to ensure a light DOM.
*   **Action 3.3:** For Mobile, implement a Shadcn/UI `Sheet` (Drawer) React component inside the Astro Header to ensure proper ARIA labels and modern accessibility (a11y) compliance.

### Step 4: UI Components & Content Sections (Assigned to: `@frontend-engineer.md`)
**Objective:** Build out the reusable display sections using Astro and React where required.
*   **Action 4.1:** Refine the existing `src/components/Hero.astro` utilizing DaisyUI's hero and overlay classes for maximum LCP performance.
*   **Action 4.2:** Build `src/components/ProjectCard.astro` as a dumb component that strictly takes `Project` data via Astro Props and renders a DaisyUI card/figure.
*   **Action 4.3:** Build `src/components/Testimonials.astro` wrapping the existing Embla Carousel inside a Shadcn-like component for customer reviews.
*   **Action 4.4:** Migrate `components/portfolio-grid.tsx` into an interactive React component at `src/components/Portfolio.tsx` using Shadcn/UI Tabs or Select dropdowns for filtering projects by `ServiceType` and `Location`.

### Step 5: Page Assembly & Routing (Assigned to: `@frontend-engineer.md`)
**Objective:** Wire up the routes and assemble the components into full pages.
*   **Action 5.1:** Construct the Home Page at `apps/web/src/pages/index.astro` using `Hero`, `Testimonials`, and static content.
*   **Action 5.2:** Construct the Portfolio Listing Page at `apps/web/src/pages/our-work/index.astro` rendering the interactive React `Portfolio` grid component.
*   **Action 5.3:** Create the dynamic SSG routing for individual project pages at `apps/web/src/pages/our-work/[slug].astro` using Astro's `getStaticPaths()` function pulling from `lib/projects.ts`.

### Step 6: Visual & Conversion Review (Assigned to: `@graphic-designer.md` & `@content-strategist.md`)
**Objective:** Ensure the final product matches the premium brand standard.
### Step 7: Highly-Optimized Hero Slideshow Integration (Assigned to: `@frontend-engineer.md`)
**Objective:** Implement a lightning-fast, SEO-optimized image slider to replace the static `<Hero />`. It must include critical service keywords (Koi Ponds, Natural Swimming Ponds, Maintenance) in the DOM for SEO while maximizing Core Web Vitals (LCP).

*   **Action 7.1 (Architectural Choice):** Build the component as `apps/web/src/components/HeroSlider.astro` entirely in Astro using Vanilla JS inside a `<script>` tag. While Preact is incredibly lightweight, a simple CSS opacity transition driven by `setInterval` requires 0kb of framework overhead. Bypassing component hydration guarantees the absolute fastest First Contentful Paint.
*   **Action 7.2 (SEO Integration):** Append a 4th slide to the payload for **Pond Maintenance** to ensure this crucial keyword joins the "Koi Ponds" and "Natural Swimming Ponds" inside the server-rendered `<h1>` elements.
*   **Action 7.3 (LCP Optimization):** The first active slide's image MUST use `<img fetchpriority="high" loading="eager" decoding="sync">` to prioritize an immediate paint on the critical rendering path.
*   **Action 7.4 (Network Optimization):** The inactive slides (2, 3, and 4) MUST use `<img loading="lazy" decoding="async">`. Their text content will still live in the raw HTML payload so search engine crawlers index the keywords, but the heavy image assets will not block the initial page load.
*   **Action 7.5 (Integration):** Replace the static `<Hero />` import in `apps/web/src/pages/index.astro` with the new native `<HeroSlider />`.

---
## How to Proceed
The user should begin by "@" mentioning the specific assigned agent from Step 1 in the chat to kick off the development process.
