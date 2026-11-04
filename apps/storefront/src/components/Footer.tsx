import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-decorative-border)] bg-[var(--color-charcoal)] text-[var(--color-ivory)]">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        {/* Tier 1: Symmetrical Brand Pavilion (Centered Anchor) */}
        <div className="flex flex-col items-center justify-center text-center pb-14 border-b border-[var(--color-muted-dark)]/20">
          <Link href="/" className="inline-block transition-opacity hover:opacity-85">
            <Image
              src="/logo-full-light.png"
              alt="Tavistra by VDesign"
              width={480}
              height={160}
              priority={false}
              className="h-24 md:h-28 w-auto object-contain mx-auto"
            />
          </Link>

          <p className="mt-6 text-sm md:text-base leading-relaxed text-[var(--color-canvas)]/90 max-w-lg font-serif">
            A design-led lifestyle and architectural décor sub-brand of VDesign.
          </p>

          <p className="mt-2 text-xs uppercase tracking-widest text-[var(--color-muted-dark)] font-medium">
            Master-crafted in India · Ready Stock · Made to Order · Bespoke
          </p>
        </div>

        {/* Tier 2: Symmetrical 3-Column Architectural Navigation */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-16 pt-14 items-start text-center sm:text-left">
          {/* Col 1: Objects & Living */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-canvas)] mb-4">
              Objects & Living
            </h4>
            <ul className="space-y-2.5 text-xs text-[var(--color-muted-dark)]">
              <li>
                <Link
                  href="/category/personal-accessories"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed block"
                >
                  Personal Accessories
                </Link>
              </li>
              <li>
                <Link
                  href="/category/home-decor-objects"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed block"
                >
                  Home Décor & Objects
                </Link>
              </li>
              <li>
                <Link
                  href="/category/desk-workspace"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed block"
                >
                  Desk & Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Spaces & Ambience */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-canvas)] mb-4">
              Spaces & Ambience
            </h4>
            <ul className="space-y-2.5 text-xs text-[var(--color-muted-dark)]">
              <li>
                <Link
                  href="/category/lighting-ambience"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed block"
                >
                  Lighting & Ambience
                </Link>
              </li>
              <li>
                <Link
                  href="/category/outdoor-balcony"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed block"
                >
                  Outdoor & Balcony
                </Link>
              </li>
              <li>
                <Link
                  href="/category/art-collectibles"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed block"
                >
                  Art & Collectibles
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Policies */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-canvas)] mb-4">
              Policies
            </h4>
            <ul className="space-y-2.5 text-xs text-[var(--color-muted-dark)]">
              <li>
                <Link
                  href="/shipping"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed block"
                >
                  Delivery & Shipping
                </Link>
              </li>
              <li>
                <Link
                  href="/returns-refunds"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed block"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed block"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed block"
                >
                  Privacy & Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Tier 3: Bottom Baseline Bar */}
        <div className="mt-16 pt-8 border-t border-[var(--color-muted-dark)]/20 flex flex-col md:flex-row justify-between items-center text-[11px] text-[var(--color-muted-dark)] gap-3">
          <p>© 2026 Tavistra by VDesign. All rights reserved.</p>
          <p className="tracking-wide text-center md:text-right">
            Tax-inclusive pricing · Independent mode fulfilment
          </p>
        </div>
      </div>
    </footer>
  );
}
