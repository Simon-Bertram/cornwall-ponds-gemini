import { useState } from "preact/hooks";
import { SlidersHorizontal, X } from "lucide-preact";
import type { Project, ServiceType, Location } from "../../lib/projects";
import { serviceTypes, locations } from "../../lib/projects";
import { FilterChip } from "./FilterChip";
import { PortfolioCard } from "./PortfolioCard";

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
                <FilterChip label="All" active={activeService === "All"} onClick={() => setActiveService("All")} />
                {serviceTypes
                  .filter((st) => projects.some((p) => p.serviceType === st))
                  .map((st) => (
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
                <FilterChip label="All" active={activeLocation === "All"} onClick={() => setActiveLocation("All")} />
                {locations
                  .filter((loc) => projects.some((p) => p.location === loc))
                  .map((loc) => (
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
