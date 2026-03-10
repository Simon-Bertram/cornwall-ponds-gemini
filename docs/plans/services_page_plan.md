# Services Page — Implementation Plan

> **Roles:** orchestrator · content-strategist · tech-writer  
> **Date:** 2026-03-10  
> **Status:** Approved — Ready for implementation

---

## Site Audit Summary

### What currently exists

| Page | Status | Notes |
|---|---|---|
| `/` (Home) | ✅ Complete | HeroSlider, WhyChooseUs, ServicesPreview, BeforeAfter, Featured Projects, HowWeWork, Testimonials, GetStarted |
| `/our-work` | ✅ Complete | Portfolio filter component (Preact island) with all projects |
| `/our-work/[slug]` | ✅ Complete | SSR detail page with gallery, stats, challenge/solution/result |
| `/contact` | ✅ Complete | Multi-step form, sidebar with contact details |
| `/services` | ❌ **Missing** | No page exists; footer links to `/services#[slug]` which 404s |
| `/expertise` | ❌ Missing | Footer and nav link placeholder |
| `/login` · `/signup` | 🔧 Stub | Empty pages pending auth integration |

### Content-Strategist Analysis

**Hypothesis:** The primary conversion path for this business is:
> Browse → Understand services in depth → Trust company → Enquire

The *ServicesPreview* on the homepage is intentionally brief (3 features per service). Visitors who are genuinely interested need a **dedicated destination** where each service gets its full story — specific use cases, process notes, technical detail, and its own CTA. Without this, the conversion funnel has a missing middle.

**Target persona:** Affluent homeowners in Cornwall/Devon, 40-65, with gardens and budgets of £5k-£50k+. They research thoroughly before calling. They value ecological responsibility, craftsmanship, and trust. They are NOT impulse buyers.

**Key differentiators to reinforce on this page:**
1. Chemical-free / eco-conscious approach
2. 15+ years specifically in Cornwall (local knowledge, coastal conditions)
3. Bespoke (no two ponds the same) vs. off-the-shelf landscapers
4. Lifetime aftercare — they're not abandoned after handover

---

## Page Architecture (Orchestrator)

**Route:** `apps/web/src/pages/services/index.astro` — single-page layout, no sub-routes needed yet.

**Anchor links:** Each service has an `id` matching its `service.slug` so the footer's `/services#garden-ponds` links work correctly.

**Data source:** `apps/web/src/lib/projects.ts` → `services[]` array. No new data required.

**Infrastructure impact:** None. This is a pure static Astro page (SSR adaptor used but no dynamic data).

**New dependencies:** None.

---

## Page Section Plan

The page is structured as **7 sequential sections**. All implemented as a single `services/index.astro` file with inline scoped sections — no new sub-components needed unless a section becomes reusable.

---

### Section 1 — Hero

**Purpose:** Immediately orient and inspire; establish premium positioning.

**Layout:** Full-width with the brand dark `bg-foreground`, centered text, no image (rely on typography strength).

**Exact copy:**

```
LABEL (small caps): Our Expertise
H1:  Water. Transformed.
     Into Something Extraordinary.
P:   Every pond we build is unique — shaped by your landscape, your 
     vision, and Cornwall's exceptional natural environment. 
     Explore the full breadth of what we do.
CTA: View Our Portfolio  →  /our-work
CTA2 (ghost): Book a Consultation  →  /contact
```

**CRO rationale:** The headline is poetic and memorable rather than functional ("Our Services"). This suits the luxury persona — they respond to aspiration, not catalogs. The portfolio CTA is secondary here; the primary flow is reading down the page.

---

### Section 2 — Philosophy Strip

**Purpose:** Before listing services, establish *why* Cornwall Ponds exists. This is the emotional hook that differentiates from a commodity landscaper. Research confirms that luxury buyers want to believe in the company's values before they buy.

**Layout:** 3-column icon strip on light background `bg-base-200`. No animation needed.

**Content:**

| Icon | Heading | Body |
|---|---|---|
| Leaf/eco | Nature-First Design | Every feature is designed to work with your ecosystem, not against it. Wildlife, water quality, and longevity are embedded from day one. |
| Compass | Rooted in Cornwall | 15 years in Cornwall means we understand your soil, your coastline, and your weather — not just general landscaping principles. |
| Handshake | Built to Last | We don't hand over and disappear. Every project comes with full aftercare documentation and an optional lifetime support contract. |

---

### Section 3 — Services (one section per service, alternating layout)

**Purpose:** The main content of the page. Each service gets a dedicated section with full description, features, a project example pulled from live data, and its own CTA.

**Layout:** Alternating left/right image+content columns (image left on even, right on odd). On mobile, stacks vertically.

**Data:** Map over the `services[]` array. For the "example project" thumbnail, cross-reference the `projects[]` array by matching `serviceType`.

**Structure per service block:**

```
id="[service.slug]"   ← anchor target for footer links
│
├─ Badge (service category label, e.g. "Garden Ponds")
├─ H2 (service.title)
├─ Lead paragraph (service.description)
├─ Feature list (all service.features, not just 3)
├─ "Example Project" mini-card (latest project of that type — thumbnail + title + location)
└─ CTA: "Request a Quote for [service.title]" → /contact?service=[service.id]
```

**Alternating layout:** Even-indexed services → image on left. Odd-indexed → image on right. On mobile, image always top.

**Colour Lockdown:** Use `bg-base-100` for even rows, `bg-base-200` for odd rows (alternating rhythm). All brand tokens only.

---

### Section 4 — Pricing Transparency Strip

**Purpose:** Luxury clients are suspicious of companies that hide pricing completely. Showing guide ranges builds trust and pre-qualifies leads (preventing time-wasted enquiries from under-budget visitors).

**Layout:** 5-column card grid (one per service) on `bg-primary` background.

**Content:**

| Service | Guide Price |
|---|---|
| Garden Ponds | From £3,500 |
| Natural Swimming Ponds | From £18,000 |
| Koi Ponds | From £6,000 |
| Water Features | From £1,200 |
| Pond Maintenance | From £180/visit |

**Caveat copy:** *"All prices are indicative guide figures. Every project is bespoke — your exact quote will be provided after a free site visit."*

**CRO rationale:** Price anchoring at this stage serves two purposes: it reassures high-budget customers they're in the right place, and prevents low-intent visitors from wasting the team's time on enquiries they can't fulfill.

---

### Section 5 — Technical Credentials

**Purpose:** For Koi ponds and Natural Swimming Ponds especially, the buyer is making a large technical investment. They need to see evidence of professional credentials, not just aesthetics.

**Layout:** Dark `bg-foreground` section, 4-column grid of credential badges.

**Content (badges):**

- Fully Insured — Public Liability & Employer's Liability
- BALI Registered Member — British Association of Landscape Industries
- Water Quality Certified — Regular testing & documentation
- FCA-Registered references — Finance options available on request

**Copy beneath the grid:**
> *"We don't just build ponds. We engineer living ecosystems — and we back our work with professional standards you can verify."*

---

### Section 6 — Testimonials (Contextual)

**Purpose:** Place trust signals at the decision point, just before the final CTA. Use testimonials from `testimonials[]` in `projects.ts`.

**Layout:** 3-card horizontal grid. Cards use `bg-base-100` on `bg-base-200` background. Pull star rating from `testimonial.rating`.

**Selector:** Show first 3 testimonials from the data array.

---

### Section 7 — Final CTA

**Purpose:** Convert. After reading the full page, the visitor is at maximum intent.

**Layout:** Reuse the `<GetStarted />` component already built.

```astro
<GetStarted />
```

No new code required here.

---

## SEO Specification (Content-Strategist)

**Page title:** `Our Services | Bespoke Pond Design & Build | Cornwall Ponds`  
**Meta description:** `Discover our full range of bespoke pond design and build services in Cornwall. Garden ponds, natural swimming ponds, koi ponds, water features and expert maintenance. Free site visit.`  
**H1:** `Water. Transformed. Into Something Extraordinary.` (unique, memorable, keyword adjacent)  
**H2s (one per service):** `Garden Ponds`, `Natural Swimming Ponds`, `Koi Ponds`, `Water Features`, `Pond Maintenance`

**Long-tail keywords to embed naturally:**
- "bespoke pond design Cornwall"
- "natural swimming pond Cornwall"
- "chemical-free swimming pond"
- "koi pond installation Cornwall"
- "wildlife pond builders Cornwall"
- "garden pond maintenance Cornwall Devon"

**Canonical:** `/services`

---

## Implementation Steps (Orchestrator)

### Step A — Create `apps/web/src/pages/services/index.astro`
- Agent: **frontend-engineer**
- Implement all 7 sections as described above
- Alternate layout using `Array.map()` with index
- Cross-reference `projects[]` to find one example project per service matching `serviceType`
- Use `<GetStarted />` import for Section 7
- Strictly follow Colour Lockdown §7 (only `global.css` tokens)

### Step B — Fix anchor links throughout the site
- Agent: **frontend-engineer**
- Footer links: `/services#garden-ponds` → map `service.slug` to `id` attr ✓ (handled in Step A)
- ServicesPreview cards: Update "Request a Quote" CTAs to point to `/contact?service=[service.id]`
- HomepagePlan Step G verification: confirm all nav links resolve correctly

### Step C — SEO & meta tags
- Agent: **frontend-engineer** (following content-strategist spec above)
- Add `<Layout title="..." description="...">` per spec
- Verify canonical tag is set correctly

---

## Colour & Contrast Pre-Approval (Graphic-Designer)

All sections must use ONLY the following tokens (per Colour Lockdown §7):

| Section | Background | Heading Text | Body Text |
|---|---|---|---|
| Hero | `bg-foreground` | `text-background` | `text-background/80` |
| Philosophy Strip | `bg-base-200` | `text-base-content` | `text-base-content/70` |
| Services (even) | `bg-base-100` | `text-base-content` | `text-base-content/70` |
| Services (odd) | `bg-base-200` | `text-base-content` | `text-base-content/70` |
| Pricing | `bg-primary` | `text-primary-foreground` | `text-primary-foreground/80` |
| Credentials | `bg-foreground` | `text-background` | `text-background/80` |
| Testimonials | `bg-base-200` | `text-base-content` | `text-base-content/70` |

> [!CAUTION]
> Do NOT use `text-primary` on any dark background section (Hero, Credentials). The `text-primary` token is dark green — dark-on-dark = WCAG fail. Use `text-primary-foreground` or `text-background` instead.

---

## Tech-Writer Output

Once Step A is complete, update:
1. `docs/plans/homepage_missing_sections_plan.md` — mark Step G complete (services links verified)
2. `docs/agent-profiles-guide.md` — add Services page to the "Pages in the project" reference table
