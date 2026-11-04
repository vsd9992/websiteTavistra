import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-decorative-border)] bg-[var(--color-charcoal)] text-[var(--color-ivory)]">
      <div className="mx-auto max-w-5xl px-6 py-14 md:py-18">
        {/* Tier 1: Symmetrical Brand Pavilion (Centered Anchor) */}
        <div className="flex flex-col items-center justify-center text-center pb-12 border-b border-[var(--color-muted-dark)]/20">
          <Link href="/" className="inline-block transition-opacity hover:opacity-85">
            <Image
              src="/logo-full-light.png"
              alt="Tavistra by VDesign"
              width={420}
              height={140}
              priority={false}
              className="h-20 md:h-24 w-auto object-contain mx-auto"
            />
          </Link>

          <p className="mt-6 font-serif text-lg md:text-xl text-[var(--color-canvas)] max-w-2xl leading-snug">
            Enduring objects for contemporary living, born from architectural craft.
          </p>

          <p className="mt-3 text-xs md:text-sm text-[var(--color-muted-dark)] max-w-2xl leading-relaxed">
            Tavistra draws its creative ethos from <em>Tvashtr</em>, the Vedic divine artisan who embodies the impulse to give harmonious form to raw matter. As the design-led lifestyle sub-brand of VDesign, we engineer standalone décor, weighted desk instruments, and atmospheric ambient editions—crafted in India with deep tactile respect for solid hardwood, architectural metals, and fine joinery.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] sm:text-[11px] uppercase tracking-widest text-[var(--color-bronze)] font-semibold">
            <span>Ready Stock</span>
            <span className="text-[var(--color-muted-dark)]/40">·</span>
            <span>Made to Order</span>
            <span className="text-[var(--color-muted-dark)]/40">·</span>
            <span>Bespoke & Quote Only</span>
            <span className="text-[var(--color-muted-dark)]/40">·</span>
            <span className="text-[var(--color-muted-dark)]">Small-Batch Discipline</span>
          </div>
        </div>

        {/* Tier 2: Symmetrical 3-Column Architectural Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pt-10 items-start">
          {/* Col 1: Objects & Living (Left Aligned) */}
          <div className="text-left">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-canvas)] mb-4">
              Objects & Living
            </h4>
            <ul className="space-y-3 text-xs text-[var(--color-muted-dark)]">
              <li>
                <Link
                  href="/category/personal-accessories"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed inline-block"
                >
                  Personal Accessories
                </Link>
              </li>
              <li>
                <Link
                  href="/category/home-decor-objects"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed inline-block"
                >
                  Home Décor & Objects
                </Link>
              </li>
              <li>
                <Link
                  href="/category/desk-workspace"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed inline-block"
                >
                  Desk & Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Spaces & Ambience (Center Aligned under Logo) */}
          <div className="text-left md:text-center">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-canvas)] mb-4">
              Spaces & Ambience
            </h4>
            <ul className="space-y-3 text-xs text-[var(--color-muted-dark)]">
              <li>
                <Link
                  href="/category/lighting-ambience"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed inline-block"
                >
                  Lighting & Ambience
                </Link>
              </li>
              <li>
                <Link
                  href="/category/outdoor-balcony"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed inline-block"
                >
                  Outdoor & Balcony
                </Link>
              </li>
              <li>
                <Link
                  href="/category/art-collectibles"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed inline-block"
                >
                  Art & Collectibles
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Policies (Right Aligned flush with Boundary) */}
          <div className="text-left md:text-right">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-canvas)] mb-4">
              Policies
            </h4>
            <ul className="space-y-3 text-xs text-[var(--color-muted-dark)]">
              <li>
                <Link
                  href="/shipping"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed inline-block"
                >
                  Delivery & Shipping
                </Link>
              </li>
              <li>
                <Link
                  href="/returns-refunds"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed inline-block"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed inline-block"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed inline-block"
                >
                  Privacy & Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Tier 3: Bottom Baseline Bar (Flush Alignment) */}
        <div className="mt-12 pt-6 border-t border-[var(--color-muted-dark)]/20 flex flex-col md:flex-row justify-between items-center text-[11px] text-[var(--color-muted-dark)] gap-3">
          <p>© 2026 Tavistra by VDesign. All rights reserved.</p>
          <p className="tracking-wide text-center md:text-right">
            Tax-inclusive pricing · Independent mode fulfilment
          </p>
        </div>
      </div>
    </footer>
  );
}
