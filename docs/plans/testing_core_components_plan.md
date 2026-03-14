## Plan: Testing Core Navigation & Before/After Experience

### Status

This plan defines **test skeletons** (Vitest + Playwright) for the five
most critical frontend components:

- `Header.astro`
- `MobileMenu.tsx`
- `NavLinks.astro`
- `BeforeAfter.tsx`
- `before-and-after/BeforeAfterSlider.tsx`

The goal is to cover core navigation, mobile UX, and the interactive
before/after slider with a mix of **component tests (Vitest)** and
**end‑to‑end tests (Playwright)**.

---

### 1. Vitest Component / Unit Test Skeletons

> All Vitest tests should live under `apps/web/`, use `bun test`, and
> prefer fast, deterministic DOM/component tests. Exact paths can be
> adjusted to match the existing test layout, but use the filenames
> below as the default convention.

#### 1.1 `Header.astro`

- **File:** `apps/web/src/components/__tests__/Header.test.tsx`

```ts
describe('Header', () => {
  it('renders logo and brand text', () => {
    // Arrange
    // Act
    // Assert
  });

  it('renders primary navigation links on desktop', () => {
    // mock desktop viewport / container
  });

  it('shows mobile CTA buttons only on small screens', () => {
    // assert responsive behaviour
  });

  it('includes accessible landmarks and labels', () => {
    // header / nav roles, aria attributes
  });
});
```

#### 1.2 `MobileMenu.tsx`

- **File:** `apps/web/src/components/__tests__/MobileMenu.test.tsx`

```ts
describe('MobileMenu', () => {
  it('is closed by default', () => {
    // initial render should not show overlay links
  });

  it('toggles open and closed when button is clicked', () => {
    // click menu button, assert nav links, then close again
  });

  it('marks the current route as active', () => {
    // pass currentPath + navLinks, expect aria-current="page" on active link
  });

  it('closes menu when a link is clicked', () => {
    // simulate click on a link, overlay should disappear
  });

  it('exposes correct a11y attributes on the toggle button', () => {
    // aria-label, aria-expanded values
  });
});
```

#### 1.3 `NavLinks.astro`

- **File:** `apps/web/src/components/__tests__/NavLinks.test.tsx`

```ts
describe('NavLinks', () => {
  it('renders all configured links', () => {
    // use navLinks config, assert labels + hrefs
  });

  it('sets aria-current on the active route', () => {
    // mock Astro.url.pathname / currentPath behaviour
  });

  it('applies active styling only to the active link', () => {
    // ensure correct class names for active vs inactive
  });
});
```

#### 1.4 `BeforeAfter.tsx`

- **File:** `apps/web/src/components/__tests__/BeforeAfter.test.tsx`

```ts
describe('BeforeAfter', () => {
  it('renders section heading and description', () => {
    // "Recent Transformations" and helper copy
  });

  it('renders the first project by default', () => {
    // projects[0] is selected
  });

  it('renders BeforeAfterSlider with correct props for current project', () => {
    // beforeImage / afterImage / title passed down
  });

  it('navigates to previous and next projects', () => {
    // call onPrev / onNext via controls, assert currentIndex / title
  });

  it('renders dots navigation when multiple projects exist', () => {
    // BeforeAfterDots visible when projects.length > 1
  });

  it('returns null when no projects are provided', () => {
    // defensive behaviour
  });
});
```

#### 1.5 `before-and-after/BeforeAfterSlider.tsx`

- **File:** `apps/web/src/components/before-and-after/__tests__/BeforeAfterSlider.test.tsx`

```ts
describe('BeforeAfterSlider', () => {
  it('renders before and after images with correct alt text', () => {
    // "Before: title" / "After: title"
  });

  it('initialises slider at 50 percent', () => {
    // default sliderValue state
  });

  it('updates slider position when range input changes', () => {
    // fire input event, assert style clipPath / divider position
  });

  it('clamps slider value between 0 and 100', () => {
    // ensure no out-of-range visual state
  });

  it('handles image load errors gracefully', () => {
    // trigger onError, expect gradient / fallback content
  });

  it('exposes accessible slider labelling and instructions', () => {
    // aria-label, aria-describedby pointing to instructions
  });
});
```

---

### 2. Playwright End‑to‑End Test Skeletons

> E2E tests should live alongside existing Playwright suites (for
> example under `apps/web/tests/e2e/`). The exact folder can be aligned
> with current convention; the filenames below assume a `navigation` and
> `before-after` grouping.

#### 2.1 Global Navigation & Header (desktop)

- **File:** `apps/web/tests/e2e/navigation-header.spec.ts`

```ts
test.describe('Header navigation (desktop)', () => {
  test('displays logo and main navigation on home page', async ({ page }) => {
    // go to home, assert header, logo, nav links
  });

  test('clicking logo navigates back to home', async ({ page }) => {
    // navigate away, click logo, expect "/"
  });

  test('desktop nav links navigate to correct pages', async ({ page }) => {
    // iterate through key nav links, assert URL + key content
  });

  test('active nav item updates based on current route', async ({ page }) => {
    // visit a subpage, assert aria-current / active styles
  });
});
```

#### 2.2 Mobile Navigation & MobileMenu

- **File:** `apps/web/tests/e2e/navigation-mobile-menu.spec.ts`

```ts
test.describe('Mobile navigation menu', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('shows mobile toggle and hides desktop nav on small screens', async ({ page }) => {
    // header should show menu button, not desktop nav
  });

  test('opens and closes the mobile menu via toggle button', async ({ page }) => {
    // click button, assert overlay + links; click again to close
  });

  test('navigates via mobile menu links', async ({ page }) => {
    // open menu, click a link, assert navigation and menu closed
  });

  test('provides accessible labelling for the menu button', async ({ page }) => {
    // aria-label text changes between "Open menu" / "Close menu"
  });
});
```

#### 2.3 Before/After Section & Project Navigation

- **File:** `apps/web/tests/e2e/before-after-section.spec.ts`

```ts
test.describe('BeforeAfter section', () => {
  test('renders the recent transformations section on the homepage', async ({ page }) => {
    // scroll / locate section by heading text
  });

  test('displays before and after content for the initial project', async ({ page }) => {
    // assert visible labels / title / location
  });

  test('navigates between projects using next/previous controls', async ({ page }) => {
    // click next / prev, confirm title / imagery changes
  });

  test('navigates to specific project via dots', async ({ page }) => {
    // click a dot indicator, assert project changes
  });

  test('CTA link below slider navigates to our work page', async ({ page }) => {
    // click "View All Projects", expect /our-work
  });
});
```

#### 2.4 Before/After Slider Interaction (desktop + mobile)

- **File:** `apps/web/tests/e2e/before-after-slider.spec.ts`

```ts
test.describe('BeforeAfter slider interaction', () => {
  test('allows dragging the slider handle on desktop', async ({ page }) => {
    // simulate drag on the slider area, assert handle position changes
  });

  test('updates visual split when slider value changes', async ({ page }) => {
    // check style / screenshot diff or DOM attribute
  });

  test('is keyboard accessible when focused', async ({ page }) => {
    // focus input, send arrow keys, check value / visual state
  });

  test('works on mobile viewport (touch interaction)', async ({ page }) => {
    // set mobile viewport, drag via touch, assert behaviour
  });
});
```

---

### 3. Execution Order & Ownership

| # | Area                            | File (suggested)                                                  | Type      |
|---|---------------------------------|-------------------------------------------------------------------|-----------|
| 1 | Header component tests          | `apps/web/src/components/__tests__/Header.test.tsx`              | Vitest    |
| 2 | Mobile menu component tests     | `apps/web/src/components/__tests__/MobileMenu.test.tsx`          | Vitest    |
| 3 | NavLinks component tests        | `apps/web/src/components/__tests__/NavLinks.test.tsx`            | Vitest    |
| 4 | BeforeAfter component tests     | `apps/web/src/components/__tests__/BeforeAfter.test.tsx`         | Vitest    |
| 5 | BeforeAfterSlider unit tests    | `apps/web/src/components/before-and-after/__tests__/BeforeAfterSlider.test.tsx` | Vitest |
| 6 | Desktop header E2E              | `apps/web/tests/e2e/navigation-header.spec.ts`                   | Playwright |
| 7 | Mobile navigation E2E           | `apps/web/tests/e2e/navigation-mobile-menu.spec.ts`              | Playwright |
| 8 | Before/After section E2E        | `apps/web/tests/e2e/before-after-section.spec.ts`                | Playwright |
| 9 | Before/After slider interaction | `apps/web/tests/e2e/before-after-slider.spec.ts`                 | Playwright |

> **Stop / pause criteria:** If any test exposes non‑deterministic
> behaviour (flaky timings, inconsistent layout), stabilise the
> component or introduce explicit waits/selectors before adding more
> scenarios. Focus first on making the above skeletons green and
> reliable, then expand with additional edge cases as bugs or new
> requirements appear.

