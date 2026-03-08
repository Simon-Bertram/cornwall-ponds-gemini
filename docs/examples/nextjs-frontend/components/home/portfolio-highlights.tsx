"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { projects } from "@/lib/data"

export function PortfolioHighlights() {
  const featured = projects.filter((p) => p.featured).slice(0, 4)

  return (
    <section className="py-20 bg-card" aria-label="Featured projects">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-14">
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-primary">Portfolio</span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">
              Recent Transformations
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
              Explore our latest projects and see the dramatic before and after results of our work.
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <Link href="/our-work">
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectCard({ project }: { project: typeof projects[number] }) {
  const [showAfter, setShowAfter] = useState(false)

  return (
    <Link href={`/our-work/${project.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-lg aspect-[16/10]">
        {/* Before Image */}
        <Image
          src={project.beforeImage}
          alt={`Before: ${project.title}`}
          fill
          className={`object-cover transition-opacity duration-500 ${showAfter ? "opacity-0" : "opacity-100"}`}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {/* After Image */}
        <Image
          src={project.afterImage}
          alt={`After: ${project.title}`}
          fill
          className={`object-cover transition-opacity duration-500 ${showAfter ? "opacity-100" : "opacity-0"}`}
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Before/After Toggle */}
        <div className="absolute top-4 left-4 z-10 flex rounded-full bg-foreground/80 backdrop-blur-sm overflow-hidden">
          <button
            onClick={(e) => { e.preventDefault(); setShowAfter(false) }}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${!showAfter ? "bg-primary text-primary-foreground" : "text-background/70 hover:text-background"}`}
          >
            Before
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setShowAfter(true) }}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${showAfter ? "bg-primary text-primary-foreground" : "text-background/70 hover:text-background"}`}
          >
            After
          </button>
        </div>

        {/* Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
            {project.serviceType}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="font-serif text-lg font-bold text-background">{project.title}</h3>
          <p className="mt-1 text-sm text-background/70">{project.location} &mdash; {project.shortDescription}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-background/90 group-hover:text-background transition-colors">
            View Case Study
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}
