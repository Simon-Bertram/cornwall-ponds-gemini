import { useState } from "preact/hooks";
import { Menu, X, Phone } from "lucide-preact";

export interface NavLink {
  href: string;
  label: string;
}

export interface MobileMenuProps {
  currentPath: string;
  navLinks: NavLink[];
}

export function MobileMenu({ currentPath, navLinks }: MobileMenuProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const normalizedPath = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '');

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        class="relative z-50 lg:hidden btn btn-ghost btn-circle text-base-content"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? <X class="h-6 w-6" /> : <Menu class="h-6 w-6" />}
      </button>

      {mobileOpen && (
        <div class="fixed inset-0 top-0 z-40 bg-base-100/95 backdrop-blur-xl lg:hidden transition-all duration-300 flex flex-col items-center justify-center p-6 pt-20">
          <div class="flex flex-col items-center gap-6 w-full max-w-sm">
            {navLinks.map((link) => {
              const isActive = link.href === '/' 
                ? normalizedPath === '/' 
                : normalizedPath.startsWith(link.href);
                
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  class={`text-xl md:text-2xl font-serif transition-all duration-300 w-full text-center py-2 ${isActive ? 'text-primary dark:text-white bg-primary/10 font-bold rounded-lg border border-primary/20' : 'text-base-content hover:text-primary font-medium'}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </a>
              );
            })}
            <div class="w-full pt-6 mt-2 border-t border-base-content/10 flex flex-col gap-4">
              <a href="tel:+441234567890" class="flex items-center justify-center gap-2 text-base md:text-lg font-medium text-base-content/80 hover:text-primary transition-colors">
                <Phone class="h-4 w-4 md:h-5 md:w-5" />
                <span>01234 567 890</span>
              </a>
              <a
                href="/contact"
                onClick={() => setMobileOpen(false)}
                class="btn bg-primary text-white dark:text-neutral-900 hover:bg-primary/90 border-none btn-md md:btn-lg w-full font-bold shadow-lg shadow-primary/20 focus-visible:ring-2 ring-primary ring-offset-2 ring-offset-base-100 outline-none"
              >
                Request a Quote
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
