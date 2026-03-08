import Link from "next/link"
import { ArrowRight, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="py-20 bg-card" aria-label="Call to action">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <span className="text-xs font-medium tracking-widest uppercase text-primary">Get Started</span>
        <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl md:text-5xl text-balance">
          Ready to Transform Your Garden?
        </h2>
        <p className="mt-4 mx-auto max-w-2xl text-muted-foreground leading-relaxed text-lg">
          Whether you have a clear vision or need inspiration, we would love to hear from you. Get in touch for a free, no-obligation consultation and quote.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-base">
            <Link href="/contact">
              Request a Free Quote
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 text-base">
            <a href="tel:+441234567890">
              <Phone className="mr-2 h-4 w-4" />
              Call 01234 567 890
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
