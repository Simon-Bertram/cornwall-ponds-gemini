import { useState } from "preact/hooks";
import type { Project } from "../lib/projects";
import BeforeAfterSlider from "./before-and-after/BeforeAfterSlider.tsx";
import BeforeAfterProjectNav from "./before-and-after/BeforeAfterProjectNav.tsx";
import BeforeAfterDots from "./before-and-after/BeforeAfterDots.tsx";

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

  const project = projects[currentIndex];
  if (!project) return null;

  const handlePrev = () =>
    setCurrentIndex((currentIndex - 1 + projects.length) % projects.length);
  const handleNext = () =>
    setCurrentIndex((currentIndex + 1) % projects.length);

  const hasMultipleProjects = projects.length > 1;

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
          <p id="before-after-instructions" class="sr-only">
            Use left and right arrow keys or drag to compare the before and
            after images for this project.
          </p>

          <BeforeAfterSlider
            beforeImage={project.beforeImage}
            afterImage={project.afterImage}
            title={project.title}
          />

          <BeforeAfterProjectNav
            title={project.title}
            location={project.location}
            hasMultipleProjects={hasMultipleProjects}
            onPrev={handlePrev}
            onNext={handleNext}
          />

          {hasMultipleProjects && (
            <BeforeAfterDots
              projects={projects}
              currentIndex={currentIndex}
              onSelect={setCurrentIndex}
            />
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
