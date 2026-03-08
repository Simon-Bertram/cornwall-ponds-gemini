"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/our-work", label: "Our Work" },
  { href: "/services", label: "Services" },
  { href: "/expertise", label: "Expertise" },
  { href: "/contact", label: "Contact" },
]

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4" />
              <path d="M6 16c1.5 1.5 3.5 2 6 2" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-tight text-foreground leading-none">Cornwall Ponds</span>
            <span className="text-[11px] tracking-widest uppercase text-muted-foreground">Design &amp; Build</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors rounded-md",
                pathname === link.href
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <a href="tel:+441234567890" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Phone className="h-4 w-4" />
            <span>01234 567 890</span>
          </a>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/contact">Request a Quote</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="relative z-50 lg:hidden text-foreground"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 top-0 z-40 bg-background lg:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "text-2xl font-serif font-medium transition-colors",
                  pathname === link.href ? "text-primary" : "text-foreground hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild size="lg" className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/contact" onClick={() => setMobileOpen(false)}>
                Request a Quote
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
