import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroSection } from "@/components/home/hero-section"
import { TrustSection } from "@/components/home/trust-section"
import { ServicesPreview } from "@/components/home/services-preview"
import { PortfolioHighlights } from "@/components/home/portfolio-highlights"
import { ProcessSection } from "@/components/home/process-section"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { CtaSection } from "@/components/home/cta-section"

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <TrustSection />
        <ServicesPreview />
        <PortfolioHighlights />
        <ProcessSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  )
}
