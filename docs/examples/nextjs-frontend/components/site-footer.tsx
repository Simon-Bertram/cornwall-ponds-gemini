import Link from "next/link"
import { Phone, Mail, MapPin } from "lucide-react"

const footerLinks = {
  services: [
    { href: "/services#garden-ponds", label: "Garden Ponds" },
    { href: "/services#natural-swimming-ponds", label: "Natural Swimming Ponds" },
    { href: "/services#koi-ponds", label: "Koi Ponds" },
    { href: "/services#water-features", label: "Water Features" },
    { href: "/services#maintenance", label: "Pond Maintenance" },
  ],
  company: [
    { href: "/our-work", label: "Our Work" },
    { href: "/expertise", label: "Our Expertise" },
    { href: "/contact", label: "Contact Us" },
  ],
  areas: [
    { href: "/our-work?location=Penzance", label: "Penzance" },
    { href: "/our-work?location=Bude", label: "Bude" },
    { href: "/our-work?location=Fowey", label: "Fowey" },
    { href: "/our-work?location=Truro", label: "Truro" },
    { href: "/our-work?location=Falmouth", label: "Falmouth" },
    { href: "/our-work?location=St+Ives", label: "St Ives" },
  ],
}

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background" role="contentinfo">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                  <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4" />
                  <path d="M6 16c1.5 1.5 3.5 2 6 2" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold tracking-tight leading-none">Cornwall Ponds</span>
                <span className="text-[11px] tracking-widest uppercase opacity-60">Design &amp; Build</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed opacity-70 mb-6">
              Over 30 years of experience creating stunning water features across Cornwall and Devon. From intimate garden ponds to grand natural swimming pools.
            </p>
            <div className="flex flex-col gap-3">
              <a href="tel:+441234567890" className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity">
                <Phone className="h-4 w-4" />
                01234 567 890
              </a>
              <a href="mailto:info@cornwallponds.co.uk" className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity">
                <Mail className="h-4 w-4" />
                info@cornwallponds.co.uk
              </a>
              <span className="flex items-center gap-2 text-sm opacity-70">
                <MapPin className="h-4 w-4 shrink-0" />
                Cornwall &amp; Devon, UK
              </span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-serif text-base font-semibold mb-4">Services</h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-serif text-base font-semibold mb-4">Company</h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas */}
          <div>
            <h3 className="font-serif text-base font-semibold mb-4">Areas We Cover</h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.areas.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-background/10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm opacity-50">
            &copy; {new Date().getFullYear()} Cornwall Ponds. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/contact" className="text-sm opacity-50 hover:opacity-100 transition-opacity">
              Privacy Policy
            </Link>
            <Link href="/contact" className="text-sm opacity-50 hover:opacity-100 transition-opacity">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
