import { useState } from "preact/hooks";
import type { Project } from "../lib/projects";

// Only the fields we need — keeps prop surface minimal
type TransformationProject = Pick<
  Project,
  "title" | "location" | "beforeImage" | "afterImage" | "slug"
>;

interface Props {
  projects: TransformationProject[];
}

export default function BeforeAfter({ projects }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderValue, setSliderValue] = useState(50);
  const [beforeError, setBeforeError] = useState(false);
  const [afterError, setAfterError] = useState(false);

  const project = projects[currentIndex];
  if (!project) return null;

  // Reset state when switching projects
  const goTo = (index: number) => {
    setCurrentIndex(index);
    setSliderValue(50);
    setBeforeError(false);
    setAfterError(false);
  };

  const handlePrev = () =>
    goTo((currentIndex - 1 + projects.length) % projects.length);
  const handleNext = () =>
    goTo((currentIndex + 1) % projects.length);

  return (
    <section
      aria-labelledby="transformations-heading"
      class="py-24 sm:py-32 bg-base-content"
    >
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        {/* ── Section header ── */}
        <div class="mx-auto max-w-2xl text-center mb-12">
          <p class="text-sm font-semibold uppercase tracking-widest text-accent-foreground mb-3">
            Our Work
          </p>
          <h2
            id="transformations-heading"
            class="font-serif text-3xl font-bold tracking-tight text-base-100 sm:text-4xl"
          >
            Recent Transformations
          </h2>
          <p class="mt-4 text-base-100/75 text-lg leading-relaxed">
            Drag the slider to reveal the before &amp; after. Every image is
            from a real Cornwall Ponds project.
          </p>
        </div>

        {/* ── Slider area ── */}
        <div class="mx-auto max-w-4xl">
          <p
            id="before-after-instructions"
            class="sr-only"
          >
            Use left and right arrow keys or drag to compare the before and after
            images for this project.
          </p>

          {/* Image comparison widget */}
          <div
            class="relative rounded-2xl overflow-hidden shadow-2xl select-none"
            style={{ aspectRatio: "16 / 9" }}
          >
            {/* ── BEFORE image (base layer, always full width) ── */}
            {beforeError ? (
              <div class="absolute inset-0 bg-gradient-to-br from-base-content/90 to-base-content/70 flex items-center justify-center">
                <span class="text-base-100/60 font-serif text-lg">Before</span>
              </div>
            ) : (
              <img
                src={project.beforeImage}
                alt={`Before: ${project.title}`}
                role="img"
                class="absolute inset-0 w-full h-full object-cover"
                onError={() => setBeforeError(true)}
              />
            )}

            {/* ── AFTER image (clipped on top via clip-path) ── */}
            {afterError ? (
              <div
                class="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/60 flex items-center justify-center"
                style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}
              >
                <span class="text-white/70 font-serif text-lg">After</span>
              </div>
            ) : (
              <img
                src={project.afterImage}
                alt={`After: ${project.title}`}
                role="img"
                class="absolute inset-0 w-full h-full object-cover"
                style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}
                onError={() => setAfterError(true)}
              />
            )}

            {/* ── Divider line ── */}
            <div
              class="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)] pointer-events-none z-10"
              style={{ left: `${sliderValue}%` }}
              aria-hidden="true"
            />

            {/* ── Drag handle ── */}
            <div
              class="absolute top-1/2 z-20 pointer-events-none -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary border-2 border-white text-white flex items-center justify-center shadow-xl"
              style={{ left: `${sliderValue}%` }}
              aria-hidden="true"
            >
              {/* ←→ arrows */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8 9l-4 3 4 3M16 9l4 3-4 3"
                />
              </svg>
            </div>

            {/* ── Before / After corner labels ── */}
            <span
              class="absolute bottom-4 left-4 z-10 text-xs font-bold uppercase tracking-widest text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded"
              aria-hidden="true"
            >
              Before
            </span>
            <span
              class="absolute bottom-4 right-4 z-10 text-xs font-bold uppercase tracking-widest text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded"
              aria-hidden="true"
            >
              After
            </span>

            {/* ── Range input: invisible, covers whole area, captures drag ── */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onInput={(e) =>
                setSliderValue(Number((e.target as HTMLInputElement).value))
              }
              class="peer absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              aria-label={`Before/after comparison for ${project.title}. Slide left or right.`}
              aria-describedby="before-after-instructions"
            />
            <div
              class="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-accent-foreground/80 ring-offset-2 ring-offset-base-content opacity-0 transition-opacity duration-150 peer-focus-visible:opacity-100"
              aria-hidden="true"
            />
          </div>

          {/* ── Project info + nav ── */}
          <div class="flex items-center justify-between mt-6 gap-4">
            {/* Prev */}
            {projects.length > 1 && (
              <button
                onClick={handlePrev}
                class="flex items-center gap-1.5 text-base-100/75 hover:text-base-100 transition-colors duration-200 text-sm font-medium shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-content rounded-sm py-1"
                aria-label="Previous project transformation"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
                Prev
              </button>
            )}

            {/* Title + location */}
            <div class="text-center flex-1 min-w-0 px-2">
              <p class="font-serif text-xl font-bold text-base-100 truncate">
                {project.title}
              </p>
              <p class="text-base-100/70 text-sm mt-0.5">
                {project.location}, Cornwall
              </p>
            </div>

            {/* Next */}
            {projects.length > 1 && (
              <button
                onClick={handleNext}
                class="flex items-center gap-1.5 text-base-100/75 hover:text-base-100 transition-colors duration-200 text-sm font-medium shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-content rounded-sm py-1"
                aria-label="Next project transformation"
              >
                Next
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* ── Dot indicators ── */}
          {projects.length > 1 && (
            <div
              class="flex justify-center gap-2 mt-4"
              role="tablist"
              aria-label="Project transformations"
            >
              {projects.map((p, i) => (
                <button
                  key={p.slug}
                  role="tab"
                  aria-selected={i === currentIndex}
                  aria-label={`View transformation: ${p.title}`}
                  onClick={() => goTo(i)}
                  class={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-base-content ${
                    i === currentIndex
                      ? "bg-accent-foreground w-6"
                      : "bg-base-100/50 w-2 hover:bg-base-100/75"
                  }`}
                />
              ))}
            </div>
          )}

          {/* ── CTA ── */}
          <div class="text-center mt-12">
            <a
              href="/our-work"
              class="btn btn-outline border-base-100/30 text-base-100 hover:bg-base-100 hover:text-base-content hover:border-base-100 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-content"
            >
              View All Projects
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
