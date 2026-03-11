import { useState } from "preact/hooks";
import { ArrowRight } from "lucide-preact";
import type { Project } from "../../lib/projects";

interface PortfolioCardProps {
  project: Project;
}

export function PortfolioCard({ project }: PortfolioCardProps) {
  const [showAfter, setShowAfter] = useState(true);

  return (
    <div class="group flex flex-col h-full bg-base-100 rounded-xl overflow-hidden border border-base-content/10 shadow-sm hover:shadow-xl transition-all duration-300">
      <a href={`/our-work/${project.slug}`} class="block relative aspect-[4/3] overflow-hidden">
        {/* Before Image */}
        <img
          src={project.beforeImage}
          alt={`Before: ${project.title}`}
          class={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:scale-105 ${showAfter ? "opacity-0" : "opacity-100"}`}
          loading="lazy"
        />

        {/* After Image */}
        <img
          src={project.afterImage}
          alt={`After: ${project.title}`}
          class={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:scale-105 ${showAfter ? "opacity-100" : "opacity-0"}`}
          loading="lazy"
        />

        {/* Before/After Toggle */}
        <div class="absolute top-3 left-3 z-10 flex rounded-full bg-black/60 backdrop-blur-md overflow-hidden p-0.5 border border-white/10">
          <button
            onClick={(e) => { e.preventDefault(); setShowAfter(false); }}
            class={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${!showAfter ? "bg-primary text-primary-content" : "text-white/70 hover:text-white"}`}
          >
            Before
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setShowAfter(true); }}
            class={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${showAfter ? "bg-primary text-primary-content" : "text-white/70 hover:text-white"}`}
          >
            After
          </button>
        </div>

        {/* Badges */}
        <div class="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end">
          <span class="rounded-full bg-primary/95 text-primary-content px-2.5 py-0.5 text-[11px] font-bold tracking-wide shadow-sm">
            {project.serviceType}
          </span>
          <span class="rounded-full bg-neutral/80 text-neutral-content backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-medium shadow-sm">
            {project.location}
          </span>
        </div>

        {/* Shadow gradient for text contrast */}
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </a>

      <div class="p-5 flex flex-col flex-grow">
        <a href={`/our-work/${project.slug}`} class="group/link mb-2 outline-none focus-visible:ring-2 ring-primary rounded-sm">
          <h3 class="font-serif text-lg sm:text-xl font-bold text-base-content group-hover/link:text-primary transition-colors line-clamp-2">
            {project.title}
          </h3>
        </a>
        <p class="text-sm text-base-content/80 line-clamp-2 mb-4 flex-grow">
          {project.shortDescription}
        </p>
        <a
          href={`/our-work/${project.slug}`}
          class="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors w-fit group/btn outline-none focus-visible:ring-2 ring-primary rounded-sm py-1"
        >
          View Case Study
          <ArrowRight class="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
        </a>
      </div>
    </div>
  );
}
