# Implementation Plan: Missing Homepage Sections & Footer

## Status
The original `frontend_adaptation_plan.md` covered Steps 1–7 (design system, data, nav, hero, core components, routing). The following 6 sections and the footer were **not implemented** and are the focus of this plan.

## Current homepage structure (what exists)
```
index.astro
  └── <HeroSlider />          ✅ Already adapted — NOT part of this plan
  └── Featured Projects       ✅ Done (inline in index.astro)
  └── <Testimonials />        ✅ Done
```

## Target homepage structure (after this plan)
```
index.astro
  └── <HeroSlider />          ✅ Already done — leave untouched
  └── <WhyChooseUs />         🔴 Step A — new
  └── <ServicesPreview />     🔴 Step B — new
  └── <BeforeAfter />         🔴 Step C — new
  └── Featured Projects       ✅ Exists (keep, reorder below BeforeAfter)
  └── <HowWeWork />           🔴 Step D — new
  └── <Testimonials />        ✅ Exists
  └── <GetStarted />          🔴 Step E — new
  └── <Footer />              🔴 Step F — new (in Layout.astro)
```

---

## TypeScript Interfaces (from `src/lib/projects.ts`)

All components in this plan draw from these types. **Do not redefine them** — import from `../lib/projects`.

```ts
export type ServiceType = "Garden Pond" | "Natural Swimming Pond" | "Koi Pond" | "Water Feature" | "Maintenance" | "Commercial"
export type Location = "Penzance" | "Bude" | "Fowey" | "Truro" | "Falmouth" | "St Ives"

export interface Project {
  id: string
  title: string
  slug: string
  serviceType: ServiceType
  location: Location
  thumbnail: string
  beforeImage: string
  afterImage: string
  shortDescription: string
  challenge: string
  solution: string
  result: string
  stats: { duration: string; volume?: string; area?: string; depth?: string }
  gallery: string[]
  featured: boolean
}

export interface Service {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  image: string
  features: string[]
}

export interface Testimonial {
  id: string
  name: string
  location: string
  quote: string
  project: string
  rating: number
}
```

## Custom Design Tokens Confirmation

All custom class names used in this plan (`bg-foreground`, `bg-base-100`, `bg-base-200`, `bg-base-content`, `text-background`, `text-primary`, `text-primary-content`, `pond-shape`, OKLCH values, `font-serif`, `font-sans`) **already exist** in `apps/web/src/styles/global.css`. **Do NOT modify `global.css` or `tailwind.config` when implementing these steps.** Read `global.css` to confirm token names if uncertain.

---

## Architectural Decisions

- **All sections are `.astro` files** — purely static, no interactivity needed, zero JS overhead.
- **Data source:** All data comes from `src/lib/projects.ts` (already exported: `services`, `projects`). No new data layer needed.
- **Before/After component:** The `<BeforeAfter>` slider IS interactive (drag to reveal), so it will be a **Preact island** with `client:visible`.
- **Footer:** Placed in `src/layouts/Layout.astro` (not index.astro) so it appears on every page.

---

## Step A: `WhyChooseUs.astro` — "Why Choose Us" Trust Section

**File:** `apps/web/src/components/WhyChooseUs.astro`  
**Type:** Pure Astro (static)

**Reference snippet** (from `docs/examples/nextjs-frontend/` — the Next.js `TrustSection` is not a standalone file in the example; the section is inline in `app/page.tsx` as `<TrustSection />`). Implement independently using the content spec below.

> [!NOTE]
> Read `docs/examples/nextjs-frontend/app/page.tsx` to see how TrustSection fits within the overall page flow.

### Content (from `content-strategist` profile: authoritative + eco-conscious tone)
Four trust pillars displayed in a 2×2 grid on mobile, 4-col on desktop:

| Icon | Heading | Body |
|---|---|---|
| 🏆 | 30+ Years Experience | Three decades designing and building bespoke water features across Cornwall and Devon. |
| 🌿 | Eco-First Design | Wildlife-friendly construction using natural materials, native planting, and chemical-free filtration. |
| 🎖️ | Certified & Insured | Fully qualified, insured, and members of the British Pond Trade Association. |
| 💬 | Lifetime Support | We don't disappear after build day. Every project includes ongoing aftercare advice. |

### Design Spec
- `bg-base-200` background to contrast with surrounding `bg-base-100` sections
- Icons: Lucide icons wrapped in a `pond-shape` blob with `bg-primary/10` fill
- Heading: `font-serif` in `text-primary`
- Subtle entry animation: `@keyframes fade-up` via Tailwind `animate-` class (pure CSS, no JS)
- WCAG: All icon blobs have `aria-hidden="true"`, section has `aria-labelledby`

---

## Step B: `ServicesPreview.astro` — "Our Services" Section

**File:** `apps/web/src/components/ServicesPreview.astro`  
**Type:** Pure Astro (static)  
**Data source:** `import { services } from '../lib/projects'` — use the `Service` interface above. Key props per card: `service.title`, `service.shortDescription`, `service.features` (show first 3 only), `service.slug`.

> [!NOTE]
> Read `docs/examples/nextjs-frontend/app/page.tsx` to see `<ServicesPreview />` in page context. The Next.js example does not include a standalone `ServicesPreview` component file — build from the spec below.

### Layout
- Section heading: **"What We Create"** (H2)
- Subheading: *"From intimate wildlife ponds to grand natural swimming pools — every project is bespoke."*
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — renders all 5 services as cards
- Each card:
  - Image placeholder (using `bg-gradient-to-br from-primary/20 to-accent/20` with a Lucide icon centred, since real images will come from Keystatic later)
  - Service title (`font-serif font-bold`)
  - `shortDescription` (from `services` data)
  - Feature list: first 3 features as `<ul>` with checkmark bullets
  - CTA link: `href="/contact"` — "Request a Quote →"

### Design Spec
- Cards: DaisyUI `card card-compact` with `shadow-sm hover:shadow-md transition-shadow`
- Hover: subtle `translate-y-(-1)` lift via `hover:-translate-y-1 transition-transform`
- `bg-base-100` background

---

## Step C: `BeforeAfter.tsx` — "Recent Transformations" Section

**File:** `apps/web/src/components/BeforeAfter.tsx`  
**Type:** **Preact island** — `client:visible`  
**Data:** Receives an array of `Project[]` as props from `index.astro`. Relevant fields: `project.title`, `project.location`, `project.beforeImage`, `project.afterImage`. Use the `Project` interface defined above — import it: `import type { Project } from '../lib/projects'`.

> [!NOTE]
> Read `docs/examples/nextjs-frontend/components/portfolio-grid.tsx` for React patterns to adapt. The before/after slider itself is not in the reference — implement from spec below.

### Section Structure (in `index.astro`)
```astro
<section>
  <h2>Recent Transformations</h2>
  <p>Drag the slider to reveal the before & after</p>
  <BeforeAfter projects={featuredProjects} client:visible />
</section>
```

### Component Behaviour
- Tabbed or scrollable carousel — shows one project at a time, with prev/next controls
- Each slide: a drag-reveal before/after image slider
  - Implementation: CSS `clip-path` controlled by a range `<input type="range">` overlay
  - "Before" label (bottom-left), "After" label (bottom-right)
  - Project title + location displayed below the slider
- Fallback (no-JS): show before image with a static "After →" thumbnail beside it
- Image error handling: use Preact/JSX camelCase `onError` (NOT `onerror`) on `<img>` elements to swap to a gradient placeholder

### Design Spec
- Dark overlay section: `bg-base-content` / `text-base-100` for dramatic contrast
- Project name in `font-serif`
- Slider handle: circular pill with `←→` icon, `bg-primary`, `text-white`
- WCAG: `role="img"` on images, `aria-label="Before: [title]"` / `aria-label="After: [title]"`

> [!NOTE]
> Real before/after images are referenced in `projects.ts` (e.g. `/images/before-1.jpg`, `/images/after-1.jpg`) but are placeholder paths. The component should gracefully render a `bg-gradient` placeholder if the image 404s. Use the JSX camelCase `onError` handler on `<img>` — **not** `onerror` — since this is a `.tsx` Preact component:
> ```tsx
> <img src={project.beforeImage} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
> ```

---

## Step D: `HowWeWork.astro` — "Our Process" Section

**File:** `apps/web/src/components/HowWeWork.astro`  
**Type:** Pure Astro (static)

> [!NOTE]
> Read `docs/examples/nextjs-frontend/app/page.tsx` to see `<ProcessSection />` in page context. The Next.js example does not include a standalone `ProcessSection` component file — build from the spec below.

### Content — 4-Step Process
| Step | Title | Description |
|---|---|---|
| 01 | Free Consultation | We visit your site, listen to your vision, and assess the landscape. No obligation. |
| 02 | Bespoke Design | Our designers create a detailed plan tailored to your garden, budget, and ecosystem goals. |
| 03 | Expert Build | Our experienced team constructs your pond with minimal disruption and maximum care. |
| 04 | Aftercare & Support | We provide a full handover, ongoing advice, and optional maintenance contracts. |

### Layout
- Horizontal stepped timeline on desktop (`flex` with connecting lines), vertical on mobile
- Each step: numbered badge (`01`, `02`, etc.) in `bg-primary text-primary-content rounded-full`, title, description
- Connecting line: CSS `border-t-2 border-primary/30 flex-1` (hidden on mobile)

### Design Spec
- `bg-base-100` background
- Step numbers: `font-serif text-5xl font-bold text-primary/20` (large decorative behind the badge)
- Alternating subtle `bg-base-200` backdrop on cards for visual separation

---

## Step E: `GetStarted.astro` — CTA Section

**File:** `apps/web/src/components/GetStarted.astro`  
**Type:** Pure Astro (static)

> [!NOTE]
> Read `docs/examples/nextjs-frontend/app/page.tsx` to see `<CtaSection />` in page context. The Next.js example does not include a standalone `CtaSection` component file — build from the spec below.

### Content
- **Heading:** "Ready to Transform Your Garden?"
- **Subheading:** *"Every project begins with a conversation. Tell us your vision — we'll handle the rest."*
- **Primary CTA:** `<a href="/contact" class="btn btn-primary btn-lg">Book a Free Consultation</a>`
- **Secondary CTA:** `<a href="/our-work" class="btn btn-outline btn-lg">Browse Our Work</a>`
- **Trust micro-copy below CTAs:** "✓ Free site visit &nbsp; ✓ No obligation quote &nbsp; ✓ Fully insured"

### Design Spec
- Full-bleed `bg-primary` dark green section with `text-primary-content`
- Background: subtle radial gradient from `oklch(0.35 0.08 160)` to `oklch(0.28 0.06 160)` for depth
- Primary CTA: `bg-white text-primary hover:bg-white/90` (inverted on coloured background for contrast)
- Secondary CTA: `border-white/40 text-white hover:bg-white/10`
- WCAG: Section has `aria-label="Get started with Cornwall Ponds"`, both CTAs labelled properly
- Mobile: stack buttons vertically with `flex-col sm:flex-row`

---

## Step F: `Footer.astro` — Site-wide Footer

**File:** `apps/web/src/components/Footer.astro`  
**Type:** Pure Astro (static)  
**Integration:** Import into `apps/web/src/layouts/Layout.astro` and insert **immediately before the closing `</body>` tag**.

> [!NOTE]
> Read `docs/examples/nextjs-frontend/components/site-footer.tsx` — this file exists and is the direct reference. Adapt it from Next.js (`Link`, `className`) to Astro (`<a>`, `class`).

The current `Layout.astro` body structure is:
```astro
<body class="min-h-screen bg-base-100 font-sans antialiased text-base-content overflow-x-hidden">
  <Header />
  <slot />
  <!-- ✅ INSERT <Footer /> HERE, before </body> -->
</body>
```

After the change it should read:
```astro
<body class="min-h-screen bg-base-100 font-sans antialiased text-base-content overflow-x-hidden">
  <Header />
  <slot />
  <Footer />
</body>
```

**Also add the import** to the frontmatter:
```astro
import Footer from "../components/Footer.astro";
```

### Structure (4-column grid)
| Column | Content |
|---|---|
| Brand (col-span-1) | Logo mark + "Cornwall Ponds / Design & Build", 30yr tagline, phone, email, location |
| Services | Links to `/contact` (each service type as anchor) |
| Company | Our Work, Contact Us, (Dashboard if logged in) |
| Areas We Cover | Links to `/our-work?location=X` for all 6 Cornish locations |

### Bottom Bar
- Copyright: `© {currentYear} Cornwall Ponds. All rights reserved.`
- Links: Privacy Policy, Terms of Service (both link to `/contact` as placeholder)

### Design Spec
- `bg-foreground text-background` — dark footer using existing OKLCH tokens (matches Next.js reference)
- Link hover: `opacity-70 hover:opacity-100 transition-opacity`
- Logo mark: SVG pond ripple icon (reuse from `Header.astro` if it exists, or inline a simple SVG)
- Bottom border: `border-t border-background/10`
- WCAG: `<footer role="contentinfo">`, all nav lists using `<nav aria-label="...">` + `<ul>`

---

## Step G: Wire Up `index.astro`

After Steps A–F are complete, update `index.astro` to import and arrange all sections in the correct order:

```astro
---
import Layout from "../layouts/Layout.astro";
// HeroSlider already imported and in place — do not modify
import WhyChooseUs from "../components/WhyChooseUs.astro";
import ServicesPreview from "../components/ServicesPreview.astro";
import BeforeAfter from "../components/BeforeAfter.tsx";
import HowWeWork from "../components/HowWeWork.astro";
import Testimonials from "../components/Testimonials.astro";
import GetStarted from "../components/GetStarted.astro";
import { projects } from "../lib/projects";

const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
---

<Layout title="Cornwall Ponds | Bespoke Pond Design & Building">
  <HeroSlider />  {/* ✅ Already exists — do not touch */}
  <WhyChooseUs />
  <ServicesPreview />
  <BeforeAfter projects={featuredProjects} client:visible />

  <!-- Existing Featured Projects section (keep as-is) -->
  <section ...>...</section>

  <HowWeWork />
  <Testimonials />
  <GetStarted />
</Layout>
```

`<Footer />` is added to `Layout.astro`, not `index.astro`.

---

## Execution Order

| # | Step | File | Assigned To |
|---|---|---|---|
| A | WhyChooseUs | `src/components/WhyChooseUs.astro` | `@frontend-engineer` |
| B | ServicesPreview | `src/components/ServicesPreview.astro` | `@frontend-engineer` |
| C | BeforeAfter slider | `src/components/BeforeAfter.tsx` | `@frontend-engineer` |
| D | HowWeWork | `src/components/HowWeWork.astro` | `@frontend-engineer` |
| E | GetStarted | `src/components/GetStarted.astro` | `@frontend-engineer` |
| F | Footer | `src/components/Footer.astro` + `Layout.astro` | `@frontend-engineer` |
| G | Wire up index.astro | `src/pages/index.astro` | `@frontend-engineer` |
| Review | WCAG & visual check | All sections | `@graphic-designer` |

> [!IMPORTANT]
> Build sections in order A → G. Each section is independent and doesn't require the others to be complete first. The `BeforeAfter` Preact component (Step C) will receive its data as props from `index.astro`, so its internal state is fully self-contained.

> [!TIP]
> The `services` array in `src/lib/projects.ts` already has all the data needed for Steps B and F. No new data work is required.
