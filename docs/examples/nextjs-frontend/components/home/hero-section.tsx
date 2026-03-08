"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const heroSlides = [
  {
    image: "/images/hero-pond.jpg",
    title: "Bespoke Pond Design",
    subtitle: "for Cornwall & Devon",
  },
  {
    image: "/images/swimming-pond.jpg",
    title: "Natural Swimming Ponds",
    subtitle: "Chemical-free luxury",
  },
  {
    image: "/images/koi-pond.jpg",
    title: "Specialist Koi Ponds",
    subtitle: "Engineered for perfection",
  },
]

export function HeroSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden" aria-label="Hero">
      {/* Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.image}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: index === current ? 1 : 0 }}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/70" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <span className="mb-4 inline-block rounded-full border border-background/30 bg-background/10 px-4 py-1.5 text-xs font-medium tracking-widest uppercase text-background backdrop-blur-sm">
          Over 30 Years of Excellence
        </span>
        <h1 className="font-serif text-4xl font-bold leading-tight text-background sm:text-5xl md:text-6xl lg:text-7xl text-balance">
          {heroSlides[current].title}
        </h1>
        <p className="mt-3 font-serif text-xl text-background/80 italic sm:text-2xl">
          {heroSlides[current].subtitle}
        </p>
        <p className="mt-6 max-w-xl text-base text-background/70 leading-relaxed">
          Cornwall&rsquo;s premier pond specialists. We design, build and maintain stunning water features that transform outdoor spaces into living works of art.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-base">
            <Link href="/contact">
              Request a Free Quote
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-background/30 bg-background/10 text-background hover:bg-background/20 backdrop-blur-sm px-8 text-base">
            <Link href="/our-work">View Our Work</Link>
          </Button>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 flex gap-2" role="tablist" aria-label="Hero slides">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === current ? "w-8 bg-background" : "w-4 bg-background/40"
              }`}
              role="tab"
              aria-selected={index === current}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
