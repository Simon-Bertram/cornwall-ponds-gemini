"use client"

import { useState, useEffect } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { testimonials } from "@/lib/data"

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  const next = () => setCurrent((c) => (c + 1) % testimonials.length)

  return (
    <section className="py-20 bg-primary" aria-label="Testimonials">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <span className="text-xs font-medium tracking-widest uppercase text-primary-foreground/60">Testimonials</span>
        <h2 className="mt-3 font-serif text-3xl font-bold text-primary-foreground sm:text-4xl">
          What Our Clients Say
        </h2>

        <div className="relative mt-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`transition-all duration-500 ${
                index === current ? "opacity-100 translate-y-0" : "opacity-0 absolute inset-0 translate-y-4 pointer-events-none"
              }`}
            >
              {/* Stars */}
              <div className="flex items-center justify-center gap-1 mb-6">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
                ))}
              </div>

              <blockquote className="font-serif text-xl leading-relaxed text-primary-foreground/90 italic md:text-2xl text-pretty">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <div className="mt-8">
                <p className="font-semibold text-primary-foreground">{testimonial.name}</p>
                <p className="text-sm text-primary-foreground/60">{testimonial.location} &mdash; {testimonial.project}</p>
              </div>
            </div>
          ))}

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground/60 hover:text-primary-foreground hover:border-primary-foreground/50 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === current ? "w-6 bg-primary-foreground" : "w-2 bg-primary-foreground/30"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground/60 hover:text-primary-foreground hover:border-primary-foreground/50 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
