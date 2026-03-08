import { Suspense } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PortfolioGrid } from "@/components/portfolio-grid"

export const metadata = {
  title: "Our Work | Cornwall Ponds",
  description: "Browse our portfolio of stunning pond designs, natural swimming ponds, koi ponds and water features across Cornwall and Devon. Filter by service type and location.",
}

export default function OurWorkPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-24">
        {/* Page Header */}
        <section className="bg-primary py-16" aria-label="Page header">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <span className="text-xs font-medium tracking-widest uppercase text-primary-foreground/60">Portfolio</span>
            <h1 className="mt-3 font-serif text-4xl font-bold text-primary-foreground sm:text-5xl text-balance">
              Our Work
            </h1>
            <p className="mt-4 mx-auto max-w-2xl text-primary-foreground/70 leading-relaxed">
              Every project tells a story. Browse our portfolio to see the dramatic transformations we have delivered for clients across Cornwall and Devon.
            </p>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="py-16 bg-background">
          <div className="mx-auto max-w-7xl px-6">
            <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Loading projects...</div>}>
              <PortfolioGrid />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
