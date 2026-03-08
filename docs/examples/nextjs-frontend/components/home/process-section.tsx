import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ProcessSection() {
  return (
    <section className="py-20 bg-background" aria-label="Our process">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-lg aspect-[4/3]">
              <Image
                src="/images/process.jpg"
                alt="Cornwall Ponds team at work building a pond"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Floating stat */}
            <div className="absolute -bottom-6 -right-3 sm:right-6 rounded-lg bg-primary p-6 text-primary-foreground shadow-xl">
              <span className="block font-serif text-3xl font-bold">30+</span>
              <span className="text-sm text-primary-foreground/70">Years of Expertise</span>
            </div>
          </div>

          {/* Content */}
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-primary">How We Work</span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">
              From Vision to Reality
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Every project begins with a conversation. We listen to your ideas, assess your site, and create a tailored design that brings your vision to life.
            </p>

            <div className="mt-8 flex flex-col gap-6">
              {[
                { step: "01", title: "Consultation & Design", desc: "We visit your site, discuss your vision, and create detailed designs with accurate costings." },
                { step: "02", title: "Build & Construction", desc: "Our expert team brings the design to life, with meticulous attention to detail at every stage." },
                { step: "03", title: "Planting & Finishing", desc: "Carefully selected aquatic plants and finishing touches transform the build into a living feature." },
                { step: "04", title: "Aftercare & Support", desc: "We provide comprehensive aftercare plans and are always on hand for advice and maintenance." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-sm font-bold text-primary">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button asChild className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/expertise">
                Learn About Our Expertise
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
