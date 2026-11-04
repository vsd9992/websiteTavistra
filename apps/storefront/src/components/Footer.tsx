import Link from "next/link";
import Image from "next/image";
import { APPROVED_CATEGORIES } from "@/lib/taxonomy";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-decorative-border)] bg-[var(--color-charcoal)] text-[var(--color-ivory)]">
      <div className="mx-auto max-w-7xl px-6 py-20">
        {/* Symmetrical & Spacious Layout: 3 Major Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Wing (Span 4): Catalogue in 2 Balanced Sub-Columns */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-canvas)]">
              Catalogue & Taxonomy
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs text-[var(--color-muted-dark)] pt-1">
              {APPROVED_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="hover:text-[var(--color-canvas)] transition-colors leading-relaxed"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Centerpiece Anchor (Span 4): Logo + Brand Statement Integrated */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center px-4 space-y-4">
            <Link href="/" className="inline-block transition-opacity hover:opacity-85">
              <Image
                src="/logo-full-light.png"
                alt="Tavistra by VDesign"
                width={220}
                height={74}
                className="h-16 w-auto object-contain mx-auto"
              />
            </Link>

            <p className="text-xs leading-relaxed text-[var(--color-muted-dark)] max-w-sm mx-auto">
              A design-led lifestyle and architectural décor sub-brand of VDesign. Master-crafted in India across Ready Stock, Made to Order, and Bespoke editions.
            </p>

            <span className="text-[10px] uppercase tracking-widest text-[var(--color-muted-dark)]/70 font-medium">
              Tax-inclusive pricing · Independent mode fulfilment
            </span>
          </div>

          {/* Right Wing (Span 4): Policies & Studio in 2 Balanced Columns */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-6">
            {/* Policies */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-canvas)] mb-4">
                Policies
              </h4>
              <ul className="space-y-2.5 text-xs text-[var(--color-muted-dark)]">
                <li>
                  <Link href="/shipping" className="hover:text-[var(--color-canvas)] transition-colors">
                    Delivery & Shipping
                  </Link>
                </li>
                <li>
                  <Link href="/returns-refunds" className="hover:text-[var(--color-canvas)] transition-colors">
                    Returns & Refunds
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[var(--color-canvas)] transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-[var(--color-canvas)] transition-colors">
                    Privacy & Cookies
                  </Link>
                </li>
              </ul>
            </div>

            {/* Studio Info */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-canvas)] mb-4">
                Studio
              </h4>
              <div className="space-y-2 text-xs text-[var(--color-muted-dark)] leading-relaxed">
                <p className="text-[var(--color-canvas)] font-medium">VDesign Studio</p>
                <p>studio@vdesign.in</p>
                <p>support@tavistra.in</p>
                <p className="pt-1 text-[11px] text-[var(--color-muted-dark)]/60">
                  GST Invoicing on all confirmed orders.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Baseline Bar */}
        <div className="mt-16 pt-8 border-t border-[var(--color-muted-dark)]/20 flex flex-col md:flex-row justify-between items-center text-[11px] text-[var(--color-muted-dark)]">
          <p>© 2026 Tavistra by VDesign. All rights reserved.</p>
          <p className="mt-2 md:mt-0 tracking-wide">
            Crafted for endurance and timeless domestic living.
          </p>
        </div>
      </div>
    </footer>
  );
}
