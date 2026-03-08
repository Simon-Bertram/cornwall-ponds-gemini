import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { services } from "@/lib/data"

export function ServicesPreview() {
  return (
    <section className="py-20 bg-background" aria-label="Our services">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-14">
          <span className="text-xs font-medium tracking-widest uppercase text-primary">Our Services</span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">
            From Design to Completion
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-muted-foreground leading-relaxed">
            We offer a complete range of pond and water feature services, from initial design consultation through to ongoing maintenance.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 3).map((service) => (
            <Link
              key={service.id}
              href={`/services#${service.slug}`}
              className="group relative overflow-hidden rounded-lg aspect-[4/3]"
            >
              <Image
                src={service.image}
                alt={service.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-serif text-xl font-bold text-background">{service.title}</h3>
                <p className="mt-1 text-sm text-background/70 line-clamp-2">{service.shortDescription}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-background/90 group-hover:text-background transition-colors">
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom row - 2 cards */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {services.slice(3).map((service) => (
            <Link
              key={service.id}
              href={`/services#${service.slug}`}
              className="group relative overflow-hidden rounded-lg aspect-[16/9]"
            >
              <Image
                src={service.image}
                alt={service.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-serif text-xl font-bold text-background">{service.title}</h3>
                <p className="mt-1 text-sm text-background/70 line-clamp-2">{service.shortDescription}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-background/90 group-hover:text-background transition-colors">
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
