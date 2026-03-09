import { useState } from "preact/hooks";
import { ArrowRight, SlidersHorizontal, X } from "lucide-preact";
import type { Project, ServiceType, Location } from "../lib/projects";
import { serviceTypes, locations } from "../lib/projects";

export interface PortfolioProps {
  projects: Project[];
  initialLocation?: Location | null;
}

export function Portfolio({ projects, initialLocation = null }: PortfolioProps) {
  const [activeService, setActiveService] = useState<ServiceType | "All">("All");
  const [activeLocation, setActiveLocation] = useState<Location | "All">(initialLocation || "All");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = projects.filter((p) => {
    const matchService = activeService === "All" || p.serviceType === activeService;
    const matchLocation = activeLocation === "All" || p.location === activeLocation;
    return matchService && matchLocation;
  });

  const clearFilters = () => {
    setActiveService("All");
    setActiveLocation("All");
  };

  const hasFilters = activeService !== "All" || activeLocation !== "All";

  return (
    <div>
      {/* Filter Bar */}
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            class="flex items-center gap-2 text-sm font-medium text-base-content hover:text-primary transition-colors btn btn-ghost btn-sm"
          >
            <SlidersHorizontal class="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          
          {hasFilters && (
            <button
              onClick={clearFilters}
              class="flex items-center gap-1 text-sm text-base-content/70 hover:text-base-content transition-colors btn btn-ghost btn-sm"
            >
              <X class="h-4 w-4" />
              Clear filters
            </button>
          )}
        </div>

        {showFilters && (
          <div class="rounded-xl border border-base-content/10 bg-base-100 p-6 space-y-6 shadow-sm animate-in fade-in slide-in-from-top-2">
            {/* Service Type Filter */}
            <div>
              <h3 class="text-sm font-semibold text-base-content mb-3">Service Type</h3>
              <div class="flex flex-wrap gap-2">
                <FilterChip
                  label="All"
                  active={activeService === "All"}
                  onClick={() => setActiveService("All")}
                />
                {serviceTypes.filter(st => projects.some(p => p.serviceType === st)).map((st) => (
                  <FilterChip
                    key={st}
                    label={st}
                    active={activeService === st}
                    onClick={() => setActiveService(st)}
                  />
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <h3 class="text-sm font-semibold text-base-content mb-3">Location</h3>
              <div class="flex flex-wrap gap-2">
                <FilterChip
                  label="All"
                  active={activeLocation === "All"}
                  onClick={() => setActiveLocation("All")}
                />
                {locations.filter(loc => projects.some(p => p.location === loc)).map((loc) => (
                  <FilterChip
                    key={loc}
                    label={loc}
                    active={activeLocation === loc}
                    onClick={() => setActiveLocation(loc)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <p class="text-sm text-base-content/70 mb-6">
        Showing {filtered.length} {filtered.length === 1 ? "project" : "projects"}
        {hasFilters && " (filtered)"}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <PortfolioCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div class="text-center py-20 bg-base-200/50 rounded-xl border border-base-content/5 mt-4">
          <p class="text-lg text-base-content/70 font-medium">No projects match your current filters.</p>
          <button onClick={clearFilters} class="mt-6 btn btn-primary btn-outline">
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      class={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${
        active
          ? "bg-primary text-primary-content border-primary"
          : "bg-base-100 text-base-content border-base-content/20 hover:bg-base-200"
      }`}
    >
      {label}
    </button>
  );
}

function PortfolioCard({ project }: { project: Project }) {
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

        {/* Shadow gradient for text contrast if needed */}
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
