"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowRight, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { projects, serviceTypes, locations } from "@/lib/data"
import type { ServiceType, Location } from "@/lib/data"

export function PortfolioGrid() {
  const searchParams = useSearchParams()
  const initialLocation = searchParams.get("location") as Location | null

  const [activeService, setActiveService] = useState<ServiceType | "All">("All")
  const [activeLocation, setActiveLocation] = useState<Location | "All">(initialLocation || "All")
  const [showFilters, setShowFilters] = useState(false)

  const filtered = projects.filter((p) => {
    const matchService = activeService === "All" || p.serviceType === activeService
    const matchLocation = activeLocation === "All" || p.location === activeLocation
    return matchService && matchLocation
  })

  const clearFilters = () => {
    setActiveService("All")
    setActiveLocation("All")
  }

  const hasFilters = activeService !== "All" || activeLocation !== "All"

  return (
    <div>
      {/* Filter Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          )}
        </div>

        {showFilters && (
          <div className="rounded-lg border border-border bg-card p-6 space-y-6">
            {/* Service Type Filter */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Service Type</h3>
              <div className="flex flex-wrap gap-2">
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
              <h3 className="text-sm font-semibold text-foreground mb-3">Location</h3>
              <div className="flex flex-wrap gap-2">
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
      <p className="text-sm text-muted-foreground mb-6">
        Showing {filtered.length} {filtered.length === 1 ? "project" : "projects"}
        {hasFilters && " (filtered)"}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <PortfolioCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">No projects match your current filters.</p>
          <Button onClick={clearFilters} variant="outline" className="mt-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  )
}

function PortfolioCard({ project }: { project: typeof projects[number] }) {
  const [showAfter, setShowAfter] = useState(true)

  return (
    <div className="group">
      <Link href={`/our-work/${project.slug}`} className="block">
        <div className="relative overflow-hidden rounded-lg aspect-[4/3]">
          {/* Before Image */}
          <Image
            src={project.beforeImage}
            alt={`Before: ${project.title}`}
            fill
            className={`object-cover transition-opacity duration-500 ${showAfter ? "opacity-0" : "opacity-100"}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* After Image */}
          <Image
            src={project.afterImage}
            alt={`After: ${project.title}`}
            fill
            className={`object-cover transition-opacity duration-500 ${showAfter ? "opacity-100" : "opacity-0"}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Before/After Toggle */}
          <div className="absolute top-3 left-3 z-10 flex rounded-full bg-foreground/80 backdrop-blur-sm overflow-hidden">
            <button
              onClick={(e) => { e.preventDefault(); setShowAfter(false) }}
              className={`px-3 py-1 text-xs font-medium transition-colors ${!showAfter ? "bg-primary text-primary-foreground" : "text-background/70 hover:text-background"}`}
            >
              Before
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setShowAfter(true) }}
              className={`px-3 py-1 text-xs font-medium transition-colors ${showAfter ? "bg-primary text-primary-foreground" : "text-background/70 hover:text-background"}`}
            >
              After
            </button>
          </div>

          {/* Badges */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
            <span className="rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-medium text-primary-foreground backdrop-blur-sm">
              {project.serviceType}
            </span>
            <span className="rounded-full bg-foreground/70 px-2.5 py-0.5 text-[11px] font-medium text-background backdrop-blur-sm">
              {project.location}
            </span>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
        </div>
      </Link>

      <div className="mt-3">
        <Link href={`/our-work/${project.slug}`} className="group/link">
          <h3 className="font-serif text-lg font-bold text-foreground group-hover/link:text-primary transition-colors">
            {project.title}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{project.shortDescription}</p>
        <Link
          href={`/our-work/${project.slug}`}
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View Case Study
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
