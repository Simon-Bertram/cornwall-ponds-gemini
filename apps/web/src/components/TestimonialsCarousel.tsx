import { useState, useEffect } from "preact/hooks";
import { Star, ChevronLeft, ChevronRight } from "lucide-preact";
import type { Testimonial } from "../lib/projects";

export interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <div class="relative mt-12 w-full max-w-3xl mx-auto flex flex-col items-center">
      <div class="relative w-full overflow-hidden min-h-[300px] flex items-center justify-center">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            class={`transition-all duration-700 w-full px-4 sm:px-12 flex flex-col items-center text-center ${
              index === current
                ? "opacity-100 translate-x-0 relative"
                : "opacity-0 absolute inset-0 translate-x-12 pointer-events-none"
            }`}
          >
            {/* Stars */}
            <div class="flex items-center justify-center gap-1.5 mb-8">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} class="h-6 w-6 fill-secondary text-secondary" />
              ))}
            </div>

            <blockquote class="font-serif text-2xl leading-relaxed text-primary-content/95 italic md:text-3xl lg:text-4xl text-balance max-w-2xl mx-auto relative">
              <span class="text-4xl text-primary/30 absolute -top-4 -left-6 font-sans">"</span>
              {testimonial.quote}
              <span class="text-4xl text-primary/30 absolute -bottom-8 -right-4 font-sans">"</span>
            </blockquote>

            <div class="mt-10">
              <p class="font-bold text-lg text-primary-content">{testimonial.name}</p>
              <p class="text-sm font-medium text-primary-content/60 mt-1 uppercase tracking-wider">
                {testimonial.location} &mdash; {testimonial.project}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div class="mt-12 flex items-center justify-center gap-6">
        <button
          onClick={prev}
          class="flex h-12 w-12 items-center justify-center rounded-full border border-primary-content/20 text-primary-content/70 hover:bg-base-100/10 hover:text-primary-content hover:border-primary-content/50 transition-all focus:outline-none focus-visible:ring-2 ring-secondary"
          aria-label="Previous testimonial"
        >
          <ChevronLeft class="h-6 w-6" />
        </button>
        
        <div class="flex gap-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              class={`h-2.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 ring-secondary ring-offset-2 ring-offset-primary ${
                index === current ? "w-8 bg-secondary" : "w-2.5 bg-primary-content/30 hover:bg-primary-content/50"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
        
        <button
          onClick={next}
          class="flex h-12 w-12 items-center justify-center rounded-full border border-primary-content/20 text-primary-content/70 hover:bg-base-100/10 hover:text-primary-content hover:border-primary-content/50 transition-all focus:outline-none focus-visible:ring-2 ring-secondary"
          aria-label="Next testimonial"
        >
          <ChevronRight class="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
